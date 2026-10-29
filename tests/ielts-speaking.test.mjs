import test from "node:test";
import assert from "node:assert/strict";
import {
  speakingSets,
  speakingQuestions,
} from "../artifacts/kambley-word-box/src/data/ielts-speaking.ts";
import { additionalChapters } from "../artifacts/kambley-word-box/src/data/additional-chapters.ts";
import { personalPrompts } from "../artifacts/kambley-word-box/src/data/personal-prompts.ts";

test("all 40 chapters have distinct three-part speaking sets and complete cue cards", () => {
  assert.deepEqual(
    speakingSets.map((s) => s.chapterId),
    Array.from({ length: 40 }, (_, i) => i + 1),
  );
  const seen = new Set();
  const ids = new Set();
  const normalize = (s) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  const reviewPrompts = new Set(
    [
      ...personalPrompts,
      ...additionalChapters.flatMap((c) => c.entries.map((e) => e[4])),
    ].map(normalize),
  );
  for (const set of speakingSets) {
    assert.equal(set.part1.length, 3);
    assert.equal(set.part3.length, 3);
    assert.equal(set.points.length, 3);
    assert.ok(set.cue.startsWith("Describe "));
    assert.ok(set.explanation.startsWith("explain "));
    assert.ok(set.languageFocus.length > 40);
    for (const prompt of [...set.part1, ...set.part3])
      assert.ok(prompt.endsWith("?"));
    const questions = speakingQuestions(set.chapterId);
    assert.equal(questions.length, 7);
    assert.ok(questions[3].guidance.includes("1–2 minutes"));
    for (const q of questions) {
      const normalized = normalize(q.prompt);
      assert.ok(!seen.has(normalized), `Repeated speaking prompt: ${q.prompt}`);
      assert.ok(
        !reviewPrompts.has(normalized),
        `Repeated word-review prompt: ${q.prompt}`,
      );
      assert.ok(!ids.has(q.id));
      assert.ok(!/role-play|ask your teacher|fill in|________/i.test(q.prompt));
      assert.equal(q.expectedAnswer, null);
      seen.add(normalized);
      ids.add(q.id);
    }
  }
  assert.equal(seen.size, 280);
  assert.ok(!/[\u0600-\u06ff]/.test(JSON.stringify(speakingSets)));
});
