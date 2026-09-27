export type WritingEntry = {
  id: string;
  word: string;
  sentence: string;
  date: string;
};
export type ImportEntry = { name: string; size: string; addedAt: string };
export type ReviewRecord = {
  updatedAt: number;
  due: number;
  interval: number;
  rating: "again" | "good" | "easy";
};
export type Store = {
  viewed: string[];
  quizResults: Record<string, number>;
  writing: WritingEntry[];
  imports: ImportEntry[];
  reviews: Record<string, ReviewRecord>;
};
export const initialStore: Store = {
  viewed: [],
  quizResults: {},
  writing: [],
  imports: [],
  reviews: {},
};
export function normalizeStore(value: Partial<Store>): Store {
  return {
    ...initialStore,
    ...value,
    viewed: [...new Set(value.viewed ?? [])],
  };
}
// Merge independent devices without dropping offline learning, sentences or best scores.
export function mergeProgress(left: Store, right: Store): Store {
  const quizResults = { ...left.quizResults };
  for (const [id, score] of Object.entries(right.quizResults))
    quizResults[id] = Math.max(quizResults[id] ?? 0, score);
  const reviews = { ...left.reviews };
  for (const [id, record] of Object.entries(right.reviews)) {
    if (
      !reviews[id] ||
      record.updatedAt > reviews[id].updatedAt ||
      (record.updatedAt === reviews[id].updatedAt &&
        record.due > reviews[id].due)
    )
      reviews[id] = record;
  }
  return {
    viewed: [...new Set([...left.viewed, ...right.viewed])].sort(),
    quizResults,
    reviews,
    writing: [
      ...new Map(
        [...left.writing, ...right.writing].map((e) => [e.id, e]),
      ).values(),
    ].sort((a, b) => b.id.localeCompare(a.id)),
    imports: [
      ...new Map(
        [...left.imports, ...right.imports].map((e) => [
          `${e.name}:${e.addedAt}`,
          e,
        ]),
      ).values(),
    ],
  };
}
export function scheduleReview(
  previous: ReviewRecord | undefined,
  rating: ReviewRecord["rating"],
  now = Date.now(),
): ReviewRecord {
  const interval =
    rating === "again"
      ? 0
      : rating === "easy"
        ? Math.max(4, (previous?.interval || 1) * 3)
        : Math.max(1, (previous?.interval || 0) * 2);
  return {
    rating,
    interval,
    updatedAt: now,
    due: now + (interval ? interval * 86400000 : 60000),
  };
}
