import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import syllabus from "@/data/istoria-syllabus.json";
import { istoriaWorkshops } from "@/data/istoria-workshops";
import { useLearningStore } from "@/learning-store";
import { SkippableQuestion } from "./skippable-question";

type Session = (typeof syllabus)[number];

function SessionWork({ session }: { session: Session }) {
  const workshop = istoriaWorkshops[session.id];
  const { store, updateStore } = useLearningStore();
  const label = `iStoria W${session.week} S${session.session}: ${session.title}`;
  const savedEntries = store.writing.filter((entry) => entry.word === label);
  const [notes, setNotes] = useState(savedEntries[0]?.sentence ?? "");
  const [saved, setSaved] = useState(false);
  const save = () => {
    if (!notes.trim()) return;
    updateStore((current) => ({
      ...current,
      writing: [
        {
          id: `${Date.now()}-${crypto.randomUUID()}`,
          word: label,
          sentence: notes.trim(),
          date: new Date().toLocaleDateString("en-US"),
        },
        ...current.writing,
      ],
    }));
    setSaved(true);
  };
  return (
    <div data-question-list>
      <div className="card section-card">
        <span className="eyebrow">
          WEEK {session.week} · SESSION {session.session}
        </span>
        <h2>{session.title}</h2>
        <p className="section-caption">
          Syllabus pages {session.pages.join(", ")} · source topic and homework,
          with added practice below.
        </p>
        <h3>Focus from the syllabus</h3>
        <ul>
          {session.sourceFocus.map((focus) => (
            <li key={focus}>{focus}</li>
          ))}
        </ul>
        <div className="pronunciation-actions">
          <Link
            className="button button-ghost"
            href={`/learn?chapter=${session.chapterId}`}
          >
            Chapter {session.chapterId} · Learn vocabulary
          </Link>
          <Link
            className="button button-ghost"
            href={`/practice?chapter=${session.chapterId}`}
          >
            IELTS-style speaking
          </Link>
        </div>
        <p className="section-caption">
          The syllabus lists topics, not a vocabulary bank. The linked
          vocabulary and IELTS questions are independently authored practice.
        </p>
      </div>
      <div className="card section-card">
        <h3>Grammar workshop · added guidance</h3>
        <p>{workshop.note}</p>
        <p className="section-caption">
          These are grammar exercises, not IELTS Speaking test questions.
        </p>
      </div>
      {workshop.drills.map((drill, index) => (
        <div className="card section-card" key={index}>
          <SkippableQuestion>
            <span className="eyebrow">GRAMMAR PRACTICE {index + 1}</span>
            <h3>{drill.prompt}</h3>
            <details>
              <summary>Check grammar answer</summary>
              <p>{drill.answer}</p>
              <p>{drill.reason}</p>
            </details>
          </SkippableQuestion>
        </div>
      ))}
      <div className="card section-card">
        <SkippableQuestion>
          <span className="eyebrow">ADDED CONVERSATION PRACTICE</span>
          <h3>{workshop.speaking}</h3>
          <p>
            Use your own ideas. Discuss your language choices with your teacher
            after speaking.
          </p>
        </SkippableQuestion>
      </div>
      <div className="card section-card">
        <h3>Homework from the syllabus</h3>
        <p className="section-caption">
          Wording lightly normalized for readability. Writing tasks and
          invitations are practice tasks; this page does not send messages or
          submit work to other services.
        </p>
        {session.homework.map((task, index) => (
          <SkippableQuestion key={index}>
            <p>
              {index + 1}. {task}
            </p>
          </SkippableQuestion>
        ))}
        {session.id === 15 && (
          <p className="section-caption">
            For the audio option, use your own recorder and review it with your
            teacher. Audio recording and upload are not built into this page.
          </p>
        )}
        {session.resources.length > 0 && (
          <>
            <h3>Resources linked in the PDF</h3>
            <p className="section-caption">
              External resources were retained from the source. Their content
              and current availability have not been checked; some may require
              sign-in. Linked Canva lesson slides are not included in this
              import.
            </p>
            <ul>
              {session.resources.map((resource) => (
                <li key={resource.url}>
                  <a href={resource.url} target="_blank" rel="noreferrer">
                    {resource.label} · {new URL(resource.url).hostname}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div className="card section-card">
        <h3>Your homework or teacher notes</h3>
        <label className="review-response-label" htmlFor="coach-notes">
          Optional writing · save a copy to your shared progress
        </label>
        <textarea
          id="coach-notes"
          className="text-input"
          maxLength={8000}
          rows={8}
          value={notes}
          onChange={(event) => {
            setNotes(event.target.value);
            setSaved(false);
          }}
          placeholder="Write your own response, corrections, or next steps here…"
        />
        <p className="section-caption">
          {notes.trim() ? notes.trim().split(/\s+/).length : 0} words · Save
          before switching sessions. Saved copies also appear under Write a
          Sentence.
        </p>
        <button
          className="button button-primary"
          onClick={save}
          disabled={!notes.trim() || saved}
        >
          Save a copy
        </button>
        {saved && (
          <p role="status">
            Copy saved on this device; the sync bar shows cloud status.
          </p>
        )}
        {savedEntries.length > 0 && (
          <details style={{ marginTop: 12 }}>
            <summary>Saved copies ({savedEntries.length})</summary>
            {savedEntries.map((entry) => (
              <div key={entry.id}>
                <p className="section-caption">{entry.date}</p>
                <p style={{ whiteSpace: "pre-wrap" }}>{entry.sentence}</p>
              </div>
            ))}
          </details>
        )}
      </div>
    </div>
  );
}

export function IstoriaPlan() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const id = Number(new URLSearchParams(search).get("session")) || 1;
  const session = syllabus.find((s) => s.id === id) ?? syllabus[0];
  return (
    <div className="content-wrap fade-in">
      <span className="eyebrow">ISTORIA COACH SYLLABUS · GENERAL</span>
      <h1 className="page-title">Your five-week study plan.</h1>
      <p className="page-intro">
        15 sessions from your PDF, connected to your course chapters. Follow the
        suggested order or revisit any session with your teacher.
      </p>
      <details className="card section-card">
        <summary>Source plan, study goals & all sessions</summary>
        <p>
          The source recommends 8–10 hours of practice per week and 2–3 chapters
          in the iStoria app each day. Those daily chapters refer to iStoria,
          not this site's chapters. Adapt the workload with your teacher.
        </p>
        <p>
          The introduction recommends a study plan, active exercises and
          real-world tasks, and feedback to your teacher about pace, homework,
          speaking, and writing. Discuss what is helping and what needs
          adjustment.
        </p>
        <p>
          This is a general-English syllabus, not an official IELTS course. Its
          topics, homework, and public resource links are retained. Grammar
          explanations, drills, and conversation practice are added learning
          material. Private editable Canva links are not published, and linked
          slides or videos have not been imported as lesson content.
        </p>
        {[1, 2, 3, 4, 5].map((week) => (
          <div key={week}>
            <h3>Week {week}</h3>
            <ol>
              {syllabus
                .filter((s) => s.week === week)
                .map((s) => (
                  <li key={s.id}>
                    <Link href={`/coach?session=${s.id}`}>{s.title}</Link> ·
                    Chapter {s.chapterId}
                  </li>
                ))}
            </ol>
          </div>
        ))}
      </details>
      <label className="review-response-label" htmlFor="coach-session">
        Study session
      </label>
      <select
        id="coach-session"
        className="chapter-select"
        value={session.id}
        onChange={(e) => navigate(`/coach?session=${e.target.value}`)}
      >
        {syllabus.map((s) => (
          <option key={s.id} value={s.id}>
            Week {s.week} · Session {s.session}: {s.title}
          </option>
        ))}
      </select>
      <SessionWork key={session.id} session={session} />
      <div className="pronunciation-actions" style={{ marginTop: 16 }}>
        {session.id > 1 && (
          <Link
            className="button button-ghost"
            href={`/coach?session=${session.id - 1}`}
          >
            Previous session
          </Link>
        )}
        {session.id < syllabus.length && (
          <Link
            className="button button-primary"
            href={`/coach?session=${session.id + 1}`}
          >
            Next session
          </Link>
        )}
      </div>
    </div>
  );
}
