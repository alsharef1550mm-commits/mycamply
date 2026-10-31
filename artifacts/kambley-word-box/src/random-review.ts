export type ReviewWord = {
  id: string;
  word: string;
  meaning: string;
  example: string;
  reviewQuestions: string[];
};
export type ReviewChapter = { id: number; title: string; words: ReviewWord[] };
export type RandomCard = {
  word: ReviewWord;
  chapterId: number;
  chapterTitle: string;
  kind: "discussion" | "fill";
  prompt: string;
  answer: string;
};
export type QuestionHistory = Record<string, number>;
const wordKey = (word: string) => word.trim().toLowerCase();
export const historyKey = (word: string, kind: string, prompt: string) =>
  `${wordKey(word)}:${kind}:${prompt}`;
export function countReviewWords(
  chapters: ReviewChapter[],
  selected: number[],
) {
  return new Set(
    chapters
      .filter((c) => selected.includes(c.id))
      .flatMap((c) => c.words.map((w) => wordKey(w.word))),
  ).size;
}
export function questionVariants(
  word: ReviewWord,
  context: { prompt: string; answer: string; sentence?: string },
) {
  const fill = [
    { prompt: context.prompt, answer: context.answer },
    {
      prompt: `Recall the word from this meaning: ${word.meaning}\nThe missing word or phrase is __________.`,
      answer: word.word,
    },
  ];
  const scene =
    context.sentence ?? context.prompt.replace("__________", context.answer);
  const discussion = [
    ...word.reviewQuestions,
    `Consider this situation: “${scene}” What could have led to it? Use “${word.word}” while explaining two possible reasons.`,
    `“${scene}” What could happen next? Use “${word.word}” in your prediction and explain your reasoning.`,
    `Think of a real experience connected with “${word.word}”. What happened, and how did it affect you or someone you know?`,
    `Create a different situation where “${word.word}” would be useful. Explain it to your teacher, then ask a follow-up question.`,
    `Without saying “${word.word}”, explain its meaning through a specific example. Can your teacher guess it? Then use the word in a new sentence.`,
  ];
  return {
    fill: [...new Map(fill.map((q) => [q.prompt, q])).values()],
    discussion: [...new Set(discussion)],
  };
}
export function makeRandomReview(
  chapters: ReviewChapter[],
  selected: number[],
  contexts: Record<
    number,
    { prompt: string; answer: string; sentence?: string }[]
  >,
  random = Math.random,
  history: QuestionHistory = {},
): RandomCard[] {
  const shuffle = <T>(items: T[]) => {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  };
  const seenWords = new Set<string>();
  const words = shuffle(
    chapters
      .filter((c) => selected.includes(c.id))
      .flatMap((c) =>
        c.words.map((word, i) => ({
          word,
          chapterId: c.id,
          chapterTitle: c.title,
          fill: contexts[c.id][i],
        })),
      ),
  )
    .filter((entry) => {
      const key = wordKey(entry.word.word);
      if (seenWords.has(key)) return false;
      seenWords.add(key);
      return true;
    })
    .slice(0, 15);
  const kinds = shuffle(
    words.map((_, i) => (i % 2 ? ("fill" as const) : ("discussion" as const))),
  );
  return words.map((entry, i) => {
    const variants = questionVariants(entry.word, entry.fill);
    const kind = kinds[i];
    const choices =
      kind === "fill"
        ? variants.fill
        : variants.discussion.map((prompt) => ({ prompt, answer: "" }));
    const leastSeen = Math.min(
      ...choices.map(
        (q) => history[historyKey(entry.word.word, kind, q.prompt)] ?? 0,
      ),
    );
    const available = choices.filter(
      (q) =>
        (history[historyKey(entry.word.word, kind, q.prompt)] ?? 0) ===
        leastSeen,
    );
    const question = available[Math.floor(random() * available.length)];
    return { ...entry, kind, ...question };
  });
}
export function sameAnswer(input: string, answer: string) {
  const clean = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ")
      .replace(/[.!?]+$/, "");
  return clean(input) === clean(answer);
}
