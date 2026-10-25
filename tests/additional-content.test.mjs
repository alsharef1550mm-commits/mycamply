import test from "node:test";
import assert from "node:assert/strict";
import {
  additionalChapters,
  additionalExercises,
} from "../artifacts/kambley-word-box/src/data/additional-chapters.ts";
import {
  mergeProgress,
  normalizeStore,
} from "../artifacts/kambley-word-box/src/progress-model.ts";

test("eight appended chapters have complete English-only words and answerable exercises", () => {
  assert.deepEqual(
    additionalChapters.map((c) => c.id),
    [11, 12, 13, 14, 15, 16, 17, 18],
  );
  assert.equal(additionalChapters.flatMap((c) => c.entries).length, 56);
  assert.equal(additionalExercises.flatMap((c) => c.questions).length, 136);
  const wordPrompts = new Set();
  const questionIds = new Set();
  for (const chapter of additionalChapters) {
    assert.equal(chapter.entries.length, 7);
    const exercises = additionalExercises.find((c) => c.id === chapter.id);
    assert.equal(exercises.questions.length, 17);
    for (const [word, pos, definition, example, prompt] of chapter.entries) {
      for (const value of [word, pos, definition, example, prompt])
        assert.ok(value.trim());
      assert.ok(!wordPrompts.has(prompt));
      wordPrompts.add(prompt);
      const fill = exercises.questions.find((q) => q.expectedAnswer === word);
      assert.ok(
        fill.prompt.includes("__________"),
        `Missing blank for ${word}`,
      );
      assert.equal(
        fill.prompt.replace("__________", word).toLowerCase(),
        example.toLowerCase(),
      );
      assert.ok(exercises.questions.some((q) => q.prompt === prompt));
    }
    for (const q of exercises.questions) {
      assert.ok(!questionIds.has(q.id));
      questionIds.add(q.id);
      assert.equal(q.origin, "supplemental");
    }
  }
  assert.ok(
    !/[\u0600-\u06ff]/u.test(
      JSON.stringify([additionalChapters, additionalExercises]),
    ),
  );
});

test("existing and appended word progress coexist without marking new words complete", () => {
  const old = normalizeStore({
    viewed: ["1-1", "10-7"],
    quizResults: { 10: 80 },
  });
  const next = normalizeStore({ viewed: ["11-1"], quizResults: { 11: 60 } });
  const merged = mergeProgress(old, next);
  assert.deepEqual(new Set(merged.viewed), new Set(["1-1", "10-7", "11-1"]));
  assert.equal(merged.quizResults[10], 80);
  assert.equal(merged.quizResults[11], 60);
  assert.ok(!merged.viewed.includes("18-7"));
  assert.deepEqual(normalizeStore({}).viewed, []);
});
