import { useRef, useState } from "react";
import {
  makeRandomReview,
  countReviewWords,
  historyKey,
  sameAnswer,
  type ReviewChapter,
  type RandomCard,
  type QuestionHistory,
} from "../random-review";
import { quizContexts } from "../data/quiz-contexts";
import { Pronunciation } from "./pronunciation";

export function RandomReview({ chapters }: { chapters: ReviewChapter[] }) {
  const [selected, setSelected] = useState<number[]>(() => {
    const id = Number(new URLSearchParams(location.search).get("chapter"));
    return chapters.some((c) => c.id === id) ? [id] : [];
  });
  const history = useRef<QuestionHistory>(
    (() => {
      try {
        const parsed = JSON.parse(
          localStorage.getItem("kambley-random-question-history") || "{}",
        );
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? (Object.fromEntries(
              Object.entries(parsed).filter(
                ([, value]) =>
                  typeof value === "number" &&
                  Number.isFinite(value) &&
                  value >= 0,
              ),
            ) as QuestionHistory)
          : {};
      } catch {
        return {};
      }
    })(),
  );
  const record = (card?: RandomCard) => {
    if (!card) return;
    const key = historyKey(card.word.word, card.kind, card.prompt);
    history.current[key] = (history.current[key] ?? 0) + 1;
    try {
      localStorage.setItem(
        "kambley-random-question-history",
        JSON.stringify(history.current),
      );
    } catch {
      /* Practice still works without storage. */
    }
  };
  const [cards, setCards] = useState<RandomCard[]>([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [active, setActive] = useState(false);
  const start = () => {
    const round = makeRandomReview(
      chapters,
      selected,
      quizContexts,
      Math.random,
      history.current,
    );
    setCards(round);
    record(round[0]);
    setIndex(0);
    setInput("");
    setChecked(false);
    setResults([]);
    setActive(true);
  };
  const next = (result: string) => {
    record(cards[index + 1]);
    setResults((r) => [...r, result]);
    setIndex((i) => i + 1);
    setInput("");
    setChecked(false);
  };
  const card = cards[index];
  return (
    <div className="content-wrap random-review">
      <h1 className="page-title">Random Review</h1>
      <p className="page-intro">
        Choose your chapters. Each round draws 15 different words and mixes
        discussion questions with fill-in-the-blank practice. If fewer than 15
        words are available, all are used. Alternative questions rotate on this
        device.
      </p>
      {!active ? (
        <>
          <div className="random-start-bar">
            <p role="status">
              {selected.length} chapters selected ·{" "}
              {countReviewWords(chapters, selected)} words available ·{" "}
              {Math.min(15, countReviewWords(chapters, selected))} this round
            </p>
            <button
              className="button button-primary"
              disabled={!selected.length}
              onClick={start}
            >
              Start random review
            </button>
          </div>
          <div className="review-actions">
            <button
              className="button button-ghost"
              onClick={() => setSelected(chapters.map((c) => c.id))}
            >
              Select all
            </button>
            <button
              className="button button-ghost"
              onClick={() => setSelected([])}
            >
              Clear selection
            </button>
          </div>
          <fieldset className="random-chapters">
            <legend>Chapters to review</legend>
            {chapters.map((c) => (
              <label key={c.id}>
                <input
                  type="checkbox"
                  checked={selected.includes(c.id)}
                  onChange={() =>
                    setSelected((s) =>
                      s.includes(c.id)
                        ? s.filter((id) => id !== c.id)
                        : [...s, c.id],
                    )
                  }
                />{" "}
                <span>
                  {c.id}. {c.title}
                </span>
              </label>
            ))}
          </fieldset>
        </>
      ) : !card ? (
        <section className="random-card">
          <h2>Round complete</h2>
          <p>
            {results.filter((r) => r === "correct").length} correct blanks ·{" "}
            {results.filter((r) => r === "incorrect").length} blanks to revisit
            · {results.filter((r) => r === "discussion").length} discussions
            completed · {results.filter((r) => r === "skipped").length} skipped
          </p>
          <p>Review practice does not mark chapters as completed.</p>
          <div className="review-actions">
            <button className="button button-primary" onClick={start}>
              Shuffle a new round
            </button>
            <button
              className="button button-ghost"
              onClick={() => setActive(false)}
            >
              Choose chapters
            </button>
          </div>
        </section>
      ) : (
        <section className="random-card" key={index}>
          <p>
            Question {index + 1} of {cards.length} · Chapter {card.chapterId}:{" "}
            {card.chapterTitle}
          </p>
          <h2>
            {card.kind === "discussion"
              ? `Discuss: ${card.word.word}`
              : "Fill in the blank"}
          </h2>
          <p className="random-prompt">{card.prompt}</p>
          {card.kind === "discussion" ? (
            <>
              <Pronunciation
                word={card.word.word}
                example={card.word.example}
              />
              <p>
                Speak with your teacher. Give a reason and a specific example.
                There is no model answer.
              </p>
              <button
                className="button button-primary"
                onClick={() => next("discussion")}
              >
                Discussion complete · Next
              </button>
            </>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) setChecked(true);
              }}
            >
              <label htmlFor="random-answer">Your answer</label>
              <input
                id="random-answer"
                className="text-input"
                autoComplete="off"
                value={input}
                disabled={checked}
                onChange={(e) => setInput(e.target.value)}
              />
              {!checked ? (
                <button
                  className="button button-primary"
                  disabled={!input.trim()}
                  type="submit"
                >
                  Check answer
                </button>
              ) : (
                <div role="status">
                  <p>
                    {sameAnswer(input, card.answer)
                      ? "Correct!"
                      : `Expected word: ${card.answer}`}
                  </p>
                  <p>English meaning: {card.word.meaning}</p>
                  <button
                    className="button button-primary"
                    type="button"
                    onClick={() =>
                      next(
                        sameAnswer(input, card.answer)
                          ? "correct"
                          : "incorrect",
                      )
                    }
                  >
                    Next question
                  </button>
                </div>
              )}
            </form>
          )}
          <div className="review-actions">
            {!checked && (
              <button
                className="button button-ghost"
                onClick={() => next("skipped")}
              >
                Skip question
              </button>
            )}
            <button
              className="button button-ghost"
              onClick={() => setActive(false)}
            >
              End round · Choose chapters
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
