import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { localStore } from "../scripts/local-blobs-store.mjs";
import { BlobsServer } from "@netlify/blobs/server";
import { createHandler } from "../netlify/functions/progress.mjs";
import {
  initialStore,
  normalizeStore,
  mergeProgress,
  scheduleReview,
} from "../artifacts/kambley-word-box/src/progress-model.ts";

test("first use starts empty and normalization never adds completed words", () => {
  assert.equal(initialStore.viewed.length, 0);
  assert.deepEqual(normalizeStore({}).viewed, []);
  assert.deepEqual(normalizeStore({ viewed: ["1-1"] }).viewed, ["1-1"]);
  assert.deepEqual(initialStore.quizResults, {}); // No invented test scores.
});
test("offline merges keep both devices, best score, newest review, and are idempotent", () => {
  const a = normalizeStore({
    viewed: ["6-1"],
    quizResults: { 1: 3 },
    writing: [{ id: "a", word: "x", sentence: "A", date: "today" }],
    reviews: { "1-1": scheduleReview(undefined, "again", 1000) },
  });
  const b = normalizeStore({
    viewed: ["6-2"],
    quizResults: { 1: 4 },
    writing: [{ id: "b", word: "y", sentence: "B", date: "today" }],
    reviews: { "1-1": scheduleReview(undefined, "easy", 2000) },
  });
  const merged = mergeProgress(a, b);
  assert.equal(merged.viewed.length, 2);
  assert.equal(merged.writing.length, 2);
  assert.equal(merged.quizResults["1"], 4);
  assert.equal(merged.reviews["1-1"].rating, "easy");
  assert.deepEqual(mergeProgress(merged, merged), merged);
  assert.deepEqual(mergeProgress(b, a), merged);
});
test("difficult words return sooner and successful recall increases the interval", () => {
  const again = scheduleReview(undefined, "again", 0);
  const good = scheduleReview(undefined, "good", 0);
  assert.equal(again.due, 60000);
  assert.equal(good.due, 86400000);
  assert.equal(scheduleReview(good, "good", 0).interval, 2);
  assert.equal(scheduleReview(good, "easy", 0).interval, 4);
});
test("real Blobs client: two devices, stale write protection, restart durability, isolation and validation", async () => {
  const directory = await mkdtemp(join(tmpdir(), "mycamply-blobs-"));
  let server = new BlobsServer({ directory, token: "test-only-token" });
  let address = await server.start();
  const open = () =>
    localStore({
      name: "test-progress",
      siteID: "test-site",
      token: "test-only-token",
      apiURL: `http://localhost:${address.port}`,
      consistency: "strong",
    });
  const handle = createHandler(open);
  const key = "a".repeat(64);
  const call = (method, body, token = key) =>
    handle(
      new Request("http://localhost/api/progress", {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Progress-Version": "2",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    );
  try {
    assert.equal((await call("GET", undefined, "bad")).status, 401);
    assert.equal(
      (
        await handle(
          new Request("http://localhost/api/progress", {
            method: "PUT",
            headers: { Authorization: `Bearer ${key}` },
            body: JSON.stringify({
              revision: null,
              state: { ...initialStore, viewed: ["5-7"] },
            }),
          }),
        )
      ).status,
      426,
    );
    assert.equal((await call("POST")).status, 405);
    const first = await (await call("GET")).json();
    assert.equal(first.revision, null);
    assert.equal(
      (await call("PUT", { revision: null, state: initialStore })).status,
      200,
    );
    const deviceA = await (await call("GET")).json();
    const deviceB = await (await call("GET")).json();
    const a = mergeProgress(
      normalizeStore(deviceA.state),
      normalizeStore({ viewed: ["6-1"] }),
    );
    assert.equal(
      (await call("PUT", { revision: deviceA.revision, state: a })).status,
      200,
    );
    assert.equal(
      (await call("PUT", { revision: deviceB.revision, state: deviceB.state }))
        .status,
      409,
    );
    const latest = await (await call("GET")).json();
    const b = mergeProgress(
      normalizeStore(latest.state),
      normalizeStore({ viewed: ["6-2"] }),
    );
    assert.equal(
      (await call("PUT", { revision: latest.revision, state: b })).status,
      200,
    );
    await server.stop();
    server = new BlobsServer({ directory, token: "test-only-token" });
    address = await server.start();
    const restored = await (await call("GET")).json();
    assert.equal(restored.state.viewed.length, 2);
    const other = await (await call("GET", undefined, "b".repeat(64))).json();
    assert.equal(other.revision, null);
    assert.equal(
      (
        await call("PUT", {
          revision: restored.revision,
          state: { viewed: "bad" },
        })
      ).status,
      400,
    );
    assert.equal(
      (await call("PUT", { revision: null, state: initialStore })).status,
      409,
    );
  } finally {
    await server.stop();
  }
});
