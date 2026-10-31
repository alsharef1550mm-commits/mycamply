import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { istoriaWorkshops } from "../artifacts/kambley-word-box/src/data/istoria-workshops.ts";
import { istoriaChapters } from "../artifacts/kambley-word-box/src/data/istoria-chapters.ts";
import { speakingQuestions } from "../artifacts/kambley-word-box/src/data/ielts-speaking.ts";
import {
  normalizeStore,
  mergeProgress,
} from "../artifacts/kambley-word-box/src/progress-model.ts";

const read = (path) =>
  JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
const syllabus = read(
  "../artifacts/kambley-word-box/src/data/istoria-syllabus.json",
);
const pages = read("../docs/istoria-source-pages.json");
const manifest = read("../docs/istoria-import-manifest.json");
const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, "");

test("all fifteen source sessions retain their sequence, focus, homework and public resources", () => {
  assert.equal(pages.length, 12);
  assert.equal(syllabus.length, 15);
  const expected = [
    "Requests",
    "Fake News",
    "Well-being & Self-Help",
    "Rules",
    "Choices & Dilemmas",
    "Science and Discoveries",
    "Social Plans",
    "Traditions",
    "Storytelling",
    "Social Campaigns",
    "In Your Element",
    "Product Reviews",
    "Workplace and Interviews",
    "Public Speaking & Debate",
    "Revision",
  ];
  const speaking = new Set();
  for (const [i, session] of syllabus.entries()) {
    assert.equal(session.id, i + 1);
    assert.equal(session.week, Math.floor(i / 3) + 1);
    assert.equal(session.session, (i % 3) + 1);
    assert.equal(session.title, expected[i]);
    assert.ok(session.pages.every((p) => p >= 1 && p <= 12));
    assert.ok(
      normalize(session.pages.map((p) => pages[p - 1]).join(" ")).includes(
        normalize(session.title),
      ),
    );
    assert.equal(session.sourceFocus.length, 2);
    assert.ok(session.homework.length >= 2);
    assert.equal(speakingQuestions(session.chapterId).length, 7);
    const practice = istoriaWorkshops[session.id];
    assert.ok(practice.note.length > 90);
    assert.equal(practice.drills.length, 2);
    practice.drills.forEach((q) => {
      assert.ok(q.prompt && q.answer && q.reason);
    });
    assert.ok(!speaking.has(practice.speaking));
    speaking.add(practice.speaking);
  }
  assert.deepEqual(
    istoriaChapters.map((c) => c.id),
    [50, 51, 52, 53, 54],
  );
  const links = syllabus.flatMap((s) => s.resources.map((r) => r.url)).sort();
  assert.deepEqual(links, manifest.publicResources.map((r) => r.url).sort());
  assert.equal(links.length, 25);
  assert.ok(
    links.every(
      (url) => url.startsWith("https://") && !url.includes("canva.com"),
    ),
  );
  assert.ok(!JSON.stringify(pages).includes("https://www.canva.com"));
  assert.ok(
    !/[\u0600-\u06ff]/.test(JSON.stringify([syllabus, istoriaWorkshops])),
  );
  assert.ok(syllabus[8].homework.some((t) => t.includes("100–120")));
  assert.ok(
    syllabus[14].homework.some(
      (t) => t.includes("200-word") && t.includes("2-minute"),
    ),
  );
  for (const term of [
    "modal",
    "conditional",
    "comparative",
    "reported",
    "cleft",
  ])
    assert.ok(syllabus[14].homework.some((t) => t.includes(term)));
});

test("syllabus homework copies survive device merges without granting completion", () => {
  const first = {
    id: "1-local",
    word: "iStoria W1 S1: Requests",
    sentence: "My own homework draft",
    date: "10/31/2026",
  };
  const second = { ...first, id: "2-other", sentence: "My revised homework" };
  const merged = mergeProgress(
    normalizeStore({ writing: [first], viewed: ["1-1"] }),
    normalizeStore({ writing: [second], viewed: ["49-1"] }),
  );
  assert.equal(merged.writing.length, 2);
  assert.deepEqual(merged.viewed, ["1-1", "49-1"]);
  assert.deepEqual(merged.quizResults, {});
});
