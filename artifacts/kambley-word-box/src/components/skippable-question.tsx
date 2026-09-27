import { useState, type ReactNode } from "react";

/** Session-only skipping never changes learning or review progress. */
export function SkippableQuestion({ children }: { children: ReactNode }) {
  const [skipped, setSkipped] = useState(false);
  return (
    <div className="skippable-question" data-skippable-question>
      {skipped ? (
        <p role="status" className="section-caption">
          Question skipped
        </p>
      ) : (
        children
      )}
      <button
        className="button button-ghost question-skip"
        type="button"
        onClick={(event) => {
          setSkipped(!skipped);
          if (skipped) return;
          const card = event.currentTarget.closest("[data-skippable-question]");
          const list = card?.closest("[data-question-list]");
          const cards = Array.from(
            list?.querySelectorAll("[data-skippable-question]") ?? [],
          );
          const next = cards[cards.indexOf(card!) + 1];
          next
            ?.querySelector<HTMLButtonElement>("button.question-skip")
            ?.focus({ preventScroll: true });
          next?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }}
      >
        {skipped ? "Restore question" : "Skip question"}
      </button>
    </div>
  );
}
