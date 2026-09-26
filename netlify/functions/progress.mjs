import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";

const empty = {
  viewed: [],
  quizResults: {},
  writing: [],
  imports: [],
  reviews: {},
};
export function validState(s) {
  const str = (v, limit = 10000) => typeof v === "string" && v.length <= limit;
  const object = (v) =>
    !!v &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    Object.keys(v).length <= 20000;
  return (
    object(s) &&
    Array.isArray(s.viewed) &&
    s.viewed.length <= 20000 &&
    s.viewed.every((v) => str(v, 100)) &&
    object(s.quizResults) &&
    Object.values(s.quizResults).every(
      (v) => Number.isInteger(v) && v >= 0 && v <= 10000,
    ) &&
    Array.isArray(s.writing) &&
    s.writing.length <= 20000 &&
    s.writing.every(
      (e) =>
        object(e) &&
        str(e.id, 100) &&
        str(e.word, 200) &&
        str(e.sentence) &&
        str(e.date, 100),
    ) &&
    Array.isArray(s.imports) &&
    s.imports.length <= 2000 &&
    s.imports.every(
      (e) =>
        object(e) &&
        str(e.name, 500) &&
        str(e.size, 100) &&
        str(e.addedAt, 100),
    ) &&
    object(s.reviews) &&
    Object.values(s.reviews).every(
      (e) =>
        object(e) &&
        ["again", "good", "easy"].includes(e.rating) &&
        [e.updatedAt, e.due, e.interval].every(
          (v) => typeof v === "number" && Number.isFinite(v) && v >= 0,
        ),
    )
  );
}
const json = (body, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export function createHandler(openStore) {
  return async (request) => {
    const token = request.headers
      .get("authorization")
      ?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
    if (!token) return json({ error: "A private box key is required." }, 401);
    if (!["GET", "PUT"].includes(request.method))
      return json({ error: "Method not allowed." }, 405);
    const key = createHash("sha256").update(token).digest("hex");
    try {
      const store = openStore();
      if (request.method === "GET") {
        const entry = await store.getWithMetadata(key, { type: "json" });
        if (entry && !entry.etag)
          return json({ error: "Storage did not return a revision." }, 503);
        return json({
          state: entry?.data ?? empty,
          revision: entry?.etag ?? null,
        });
      }
      const text = await request.text();
      if (text.length > 2000000)
        return json({ error: "Progress is too large." }, 413);
      let input;
      try {
        input = JSON.parse(text);
      } catch {
        return json({ error: "Invalid JSON." }, 400);
      }
      if (
        !input ||
        !validState(input.state) ||
        !(
          input.revision === null ||
          (typeof input.revision === "string" && input.revision.length <= 200)
        )
      ) {
        return json({ error: "Invalid progress data." }, 400);
      }
      const result = await store.setJSON(
        key,
        input.state,
        input.revision === null
          ? { onlyIfNew: true }
          : { onlyIfMatch: input.revision },
      );
      if (!result.modified)
        return json({ error: "Progress changed. Merge and retry." }, 409);
      // An ETag is required before acknowledging a durable write.
      if (!result.etag)
        return json({ error: "Storage did not confirm the write." }, 503);
      return json({ revision: result.etag });
    } catch {
      return json(
        { error: "Progress storage is temporarily unavailable." },
        503,
      );
    }
  };
}
export default createHandler(() =>
  getStore({ name: "mycamply-progress-v1", consistency: "strong" }),
);
export const config = { path: "/api/progress" };
