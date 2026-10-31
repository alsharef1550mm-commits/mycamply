import test from "node:test";
import assert from "node:assert/strict";
import {
  makeRandomReview,
  historyKey,
  questionVariants,
  sameAnswer,
} from "../artifacts/kambley-word-box/src/random-review.ts";
import {
  sourceChapterSpecs,
  sourceWordCatalog,
} from "../artifacts/kambley-word-box/src/content.ts";
import { additionalChapters } from "../artifacts/kambley-word-box/src/data/additional-chapters.ts";
import { personalPrompts } from "../artifacts/kambley-word-box/src/data/personal-prompts.ts";
import { quizContexts } from "../artifacts/kambley-word-box/src/data/quiz-contexts.ts";
const chapters = [
  ...sourceChapterSpecs.map(([title], i) => ({
    id: i + 1,
    title,
    words: sourceWordCatalog
      .slice(i * 7, i * 7 + 7)
      .map(([word, meaning, example], j) => ({
        id: `${i + 1}-${j + 1}`,
        word,
        meaning,
        example,
        reviewQuestions: [personalPrompts[i * 7 + j]],
      })),
  })),
  ...additionalChapters.map((c) => ({
    id: c.id,
    title: c.title,
    words: c.entries.map(([word, , meaning, example, prompt], j) => ({
      id: `${c.id}-${j + 1}`,
      word,
      meaning,
      example,
      reviewQuestions: [prompt],
    })),
  })),
];
test("nine selected chapters yield 15 distinct words, both task types, and no unselected content", () => {
  const selected = [1, 5, 9, 16, 23, 33, 49, 50, 54];
  const first = makeRandomReview(chapters, selected, quizContexts, () => 0.1);
  const second = makeRandomReview(chapters, selected, quizContexts, () => 0.9);
  assert.equal(first.length, 15);
  assert.equal(new Set(first.map((c) => c.word.word)).size, 15);
  assert.ok(first.every((c) => selected.includes(c.chapterId)));
  assert.equal(first.filter((c) => c.kind === "fill").length, 7);
  assert.equal(makeRandomReview(chapters, [1], quizContexts).length, 7);
  const overlapping = makeRandomReview(chapters, [3, 6], quizContexts);
  assert.equal(overlapping.length, 13);
  assert.equal(
    overlapping.filter((c) => c.word.word === "productive").length,
    1,
  );
  assert.notDeepEqual(
    first.map((c) => c.word.id),
    second.map((c) => c.word.id),
  );
  assert.deepEqual(makeRandomReview(chapters, [], quizContexts), []);
});
test("all words have multiple distinct questions; seen prompts are rotated before reuse", () => {
  for (const chapter of chapters)
    for (const [i, word] of chapter.words.entries()) {
      const variants = questionVariants(word, quizContexts[chapter.id][i]);
      assert.ok(variants.discussion.length >= 6, word.id);
      assert.equal(
        variants.fill.length,
        2,
        `Missing alternative blank: ${word.id} ${word.word}`,
      );
      assert.ok(
        variants.fill.every((q) => q.prompt.includes("__________") && q.answer),
      );
    }
  const history = {};
  const seen = new Set();
  const chapter = { ...chapters[0], words: [chapters[0].words[0]] };
  for (let i = 0; i < 6; i++) {
    const [card] = makeRandomReview(
      [chapter],
      [1],
      quizContexts,
      () => 0.1,
      history,
    );
    assert.ok(!seen.has(card.prompt));
    seen.add(card.prompt);
    history[historyKey(card.word.word, card.kind, card.prompt)] = 1;
  }
  assert.equal(sameAnswer("  HAVE   IN COMMON. ", "have in common"), true);
  assert.equal(sameAnswer("flexible", "efficient"), false);
});
