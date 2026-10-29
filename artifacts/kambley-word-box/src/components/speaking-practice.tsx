import { useEffect, useState } from "react";
import { speakingQuestions, speakingSets } from "@/data/ielts-speaking";
import { SkippableQuestion } from "./skippable-question";

function SpeakingTimer() {
  const [end, setEnd] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [phase, setPhase] = useState("");
  useEffect(() => {
    if (end === null) return;
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setRemaining(seconds);
      if (!seconds) setEnd(null);
    };
    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [end]);
  const start = (seconds: number, label: string) => {
    setPhase(label);
    setRemaining(seconds);
    setEnd(Date.now() + seconds * 1000);
  };
  return (
    <div className="speaking-timer">
      <div className="pronunciation-actions">
        <button
          className="button button-ghost"
          onClick={() => start(60, "Preparation")}
        >
          Start 1-minute preparation
        </button>
        <button
          className="button button-ghost"
          onClick={() => start(120, "Speaking")}
        >
          Start 2-minute speaking
        </button>
        <button
          className="button button-ghost"
          onClick={() => {
            setEnd(null);
            setRemaining(0);
            setPhase("");
          }}
        >
          Reset timer
        </button>
      </div>
      <p role="status">
        {phase
          ? `${phase}: ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}${!end && !remaining ? " — time is up" : ""}`
          : "Optional Part 2 timer. Start each stage when you are ready."}
      </p>
    </div>
  );
}

export function SpeakingPractice({ chapterId }: { chapterId: number }) {
  const set = speakingSets.find((s) => s.chapterId === chapterId)!;
  const questions = speakingQuestions(chapterId);
  return (
    <div key={chapterId} data-question-list>
      <div className="card section-card">
        <h2>IELTS Speaking practice</h2>
        <p>
          Original practice questions, not official exam questions. These topic
          sets are practice selections, not complete timed mock tests.
        </p>
        <p>
          Part 1: familiar experiences. Part 2: an individual long turn. Part 3:
          broader discussion connected to the long turn. In the real test, the
          examiner asks the questions; you do not role-play or interview the
          examiner.
        </p>
        <p>
          <a
            href="https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-speaking"
            target="_blank"
            rel="noreferrer"
          >
            Official IELTS format and assessment criteria
          </a>
        </p>
      </div>
      {questions.map((q) => (
        <div className="card section-card source-question" key={q.id}>
          <SkippableQuestion>
            <span className="eyebrow">{q.section}</span>
            <h2 style={{ whiteSpace: "pre-line" }}>{q.prompt}</h2>
            <p className="section-caption">{q.guidance}</p>
            {q.id.endsWith("-p2") && <SpeakingTimer />}
          </SkippableQuestion>
        </div>
      ))}
      <div className="card section-card">
        <h2>Build a stronger answer</h2>
        <p>{set.languageFocus}</p>
        <p>
          Use chapter vocabulary only when it fits your meaning. Accurate,
          natural language matters more than inserting difficult words.
        </p>
        <h3>Teacher feedback · after speaking</h3>
        <ul>
          <li>
            <strong>Fluency and coherence:</strong> Which idea needed a clearer
            explanation or a better connection?
          </li>
          <li>
            <strong>Lexical resource:</strong> Which repeated or vague
            expression could be replaced more precisely?
          </li>
          <li>
            <strong>Grammatical range and accuracy:</strong> Correct one
            recurring error, then try one appropriate longer sentence.
          </li>
          <li>
            <strong>Pronunciation:</strong> Identify one phrase that was
            difficult to understand; practice its word stress and rhythm.
          </li>
        </ul>
        <p>
          Try the same answer again after feedback. Keep your own ideas and
          improve one feature at a time. This checklist does not calculate an
          IELTS band score.
        </p>
      </div>
    </div>
  );
}
