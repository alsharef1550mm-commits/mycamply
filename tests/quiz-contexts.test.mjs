import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { quizContexts } from "../artifacts/kambley-word-box/src/data/quiz-contexts.ts";
import { additionalChapters } from "../artifacts/kambley-word-box/src/data/additional-chapters.ts";
import { sourceWordCatalog } from "../artifacts/kambley-word-box/src/content.ts";

const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const words = [
  ...sourceWordCatalog.map(([word, , example]) => ({ word, example })),
  ...additionalChapters.flatMap((c) =>
    c.entries.map(([word, , , example]) => ({ word, example })),
  ),
];
const original = JSON.parse(
  readFileSync(
    new URL(
      "../artifacts/kambley-word-box/src/data/course-exercises.json",
      import.meta.url,
    ),
  ),
);

test("343 quiz contexts use the correct stable word and never reuse a learning example or another question", () => {
  const examples = new Set(words.map((w) => normalize(w.example)));
  assert.equal(examples.size, words.length, "Repeated Learn example");
  const sourceBlanks = new Set(
    original.chapters.flatMap((c) =>
      c.questions
        .filter((q) => q.expectedAnswer)
        .map((q) => normalize(q.prompt)),
    ),
  );
  const sentences = new Set();
  const prompts = new Set();
  assert.equal(Object.keys(quizContexts).length, 49);
  words.forEach(({ word }, i) => {
    const chapter = Math.floor(i / 7) + 1;
    assert.equal(quizContexts[chapter].length, 7);
    const q = quizContexts[chapter][i % 7];
    assert.equal(q.answer, word, `Wrong answer at ${chapter}-${(i % 7) + 1}`);
    assert.equal(q.prompt.split("__________").length, 2);
    assert.equal(q.prompt.replace("__________", q.answer), q.sentence);
    assert.ok(!/[{}\u0600-\u06ff]/.test(q.sentence));
    assert.ok(
      !examples.has(normalize(q.sentence)),
      `Quiz copied example: ${q.sentence}`,
    );
    assert.ok(
      !sourceBlanks.has(normalize(q.prompt)),
      `Quiz copied source blank: ${q.prompt}`,
    );
    assert.ok(
      !sentences.has(normalize(q.sentence)),
      `Repeated quiz sentence: ${q.sentence}`,
    );
    assert.ok(
      !prompts.has(normalize(q.prompt)),
      `Repeated quiz prompt: ${q.prompt}`,
    );
    sentences.add(normalize(q.sentence));
    prompts.add(normalize(q.prompt));
  });
  assert.equal(sentences.size, 343);
});
