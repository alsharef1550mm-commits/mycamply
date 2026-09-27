import { useEffect, useMemo, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error-boundary";
import { SkippableQuestion } from "@/components/skippable-question";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookMarked,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clock3,
  FileText,
  Flame,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  LockKeyhole,
  PenLine,
  Play,
  RotateCcw,
  Target,
  Trophy,
  UploadCloud,
  X,
} from "lucide-react";
import {
  Link,
  Route,
  Switch,
  useLocation,
  useSearch,
  Router as WouterRouter,
} from "wouter";
import NotFound from "@/pages/not-found";
import { sourceChapterSpecs, sourceWordCatalog } from "@/content";
import course from "@/data/course-exercises.json";
import { personalPrompts } from "@/data/personal-prompts";
import {
  useLearningStore,
  useSyncStatus,
  syncNow,
  sharedLink,
} from "@/learning-store";
import { scheduleReview, type WritingEntry } from "@/progress-model";

type Word = {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  definition: string;
  partOfSpeech: string;
  example: string;
  exampleAr: string;
  hint: string;
  reviewQuestions: string[];
};
type Chapter = {
  id: number;
  title: string;
  subtitle: string;
  words: Word[];
  questions: Question[];
};
type Question = {
  id: string;
  kind: "choice" | "discussion" | "fill";
  prompt: string;
  choices?: string[];
  answer?: number;
  explanation: string;
  sampleAnswer?: string;
};
const adjectiveWords = new Set([
  "spacious",
  "convenient",
  "peaceful",
  "lively",
  "suitable",
  "demanding",
  "flexible",
  "efficient",
  "motivated",
  "challenging",
  "creative",
  "active",
  "passionate",
  "entertaining",
  "productive",
  "exhausted",
  "energetic",
  "spontaneous",
  "typical",
  "affordable",
  "reasonable",
  "practical",
  "essential",
  "humid",
  "mild",
  "freezing",
  "pleasant",
  "unpredictable",
  "memorable",
  "adventurous",
  "crowded",
  "catchy",
  "relaxing",
  "live",
  "talented",
  "sincere",
  "reliable",
  "supportive",
  "considerate",
  "outgoing",
  "reserved",
  "filling",
  "fresh",
  "balanced",
  "traditional",
  "tempting",
]);
const verbWords = new Set([
  "take up",
  "recharge",
  "affect",
  "explore",
  "get away",
  "remind",
  "have in common",
  "make the most of",
]);

const buildChapters = (): Chapter[] =>
  sourceChapterSpecs.map(([title, subtitle], chapterIndex) => {
    const source = course.chapters[chapterIndex];
    const words = sourceWordCatalog
      .slice(chapterIndex * 7, chapterIndex * 7 + 7)
      .map((item, wordIndex) => ({
        id: `${chapterIndex + 1}-${wordIndex + 1}`,
        word: item[0],
        meaning: item[2],
        definition: item[2],
        partOfSpeech:
          item[0] === "occasionally"
            ? "adverb"
            : item[0] === "worth it"
              ? "phrase"
              : verbWords.has(item[0])
                ? "verb / phrase"
                : adjectiveWords.has(item[0])
                  ? "adjective"
                  : "noun",
        phonetic: "",
        example: item[3],
        exampleAr: item[4],
        hint: item[5],
        reviewQuestions: [
          personalPrompts[chapterIndex * 7 + wordIndex],
          `Explain “${item[0]}” to your teacher without using the word itself.`,
          `Make a true sentence about your life using “${item[0]}”, then ask your teacher a follow-up question.`,
        ],
      }));
    const questions: Question[] = source.questions.map((q) => {
      if (q.expectedAnswer) {
        const answerWord = q.expectedAnswer;
        const choices = shuffled([
          answerWord,
          ...words
            .map((w) => w.word)
            .filter(
              (w) =>
                w !== answerWord &&
                !(answerWord === "responsibilities" && w === "responsibility"),
            )
            .slice(0, 3),
        ]);
        return {
          id: q.id,
          kind: "choice",
          prompt: q.prompt,
          choices,
          answer: choices.indexOf(answerWord),
          explanation: `Answer: ${answerWord}.`,
        };
      }
      return {
        id: q.id,
        kind: "discussion",
        prompt: q.prompt,
        explanation:
          "Answer in 2–3 sentences using a chapter word. Discuss your answer with your teacher.",
        sampleAnswer: "Personal answer — there is no single correct response.",
      };
    });
    return { id: chapterIndex + 1, title, subtitle, words, questions };
  });

const chapters = buildChapters();
function allWords() {
  return chapters.flatMap((chapter) => chapter.words);
}
function shuffled<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

const navItems = [
  { href: "/practice", label: "With my teacher", icon: GraduationCap },
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/quiz", label: "Quiz", icon: Target },
  { href: "/review", label: "Quick Review", icon: RotateCcw },
  { href: "/writing", label: "Write a Sentence", icon: PenLine },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/import", label: "Course library", icon: UploadCloud },
];

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const activeHref = location === "/" ? "/" : `/${location.split("/")[1]}`;
  return (
    <div className="app-shell">
      <aside className="study-sidebar">
        <Link href="/" className="wordmark" data-testid="link-wordmark">
          <span className="wordmark-mark">
            <BookOpen size={19} />
          </span>
          <span>
            <span className="wordmark-title">My Word Box</span>
            <span className="wordmark-sub">KAMBLEY / ENGLISH</span>
          </span>
        </Link>
        <p className="nav-label">Study space</p>
        <nav>
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${activeHref === href ? "active" : ""}`}
              data-testid={`link-nav-${href.slice(1) || "home"}`}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-note">
          <p>Twice a week, one word at a time. This box is yours.</p>
        </div>
      </aside>
      <main className="study-main">
        <div className="mobile-top">
          <span className="mobile-title">
            My Word Box <small>KAMBLEY / ENGLISH</small>
          </span>
          <BookMarked size={19} color="hsl(var(--primary))" />
        </div>
        <nav className="mobile-nav">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={activeHref === href ? "active" : ""}
              data-testid={`link-mobile-${href.slice(1) || "home"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <SyncBar />
        {children}
      </main>
    </div>
  );
}

function SyncBar() {
  const status = useSyncStatus();
  const [copied, setCopied] = useState(false);
  const [linkVisible, setLinkVisible] = useState(false);
  return (
    <div className="sync-bar">
      <span role="status">{status}</span>
      <button className="button button-ghost" onClick={() => void syncNow()}>
        Sync now
      </button>
      <button
        className="button button-ghost"
        onClick={async () => {
          setLinkVisible(true);
          try {
            await navigator.clipboard.writeText(sharedLink());
            setCopied(true);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? "Private link copied" : "Use on another device"}
      </button>
      {linkVisible && (
        <div className="sync-details">
          <p>
            Open this same private link on each device. Anyone with it can view
            and update your progress. Save it somewhere safe.
          </p>
          <input
            aria-label="Private progress link"
            className="text-input"
            readOnly
            value={sharedLink()}
            onFocus={(e) => e.target.select()}
          />
        </div>
      )}
    </div>
  );
}

function Toast({ text }: { text: string }) {
  return (
    <div className="toast-note" role="status" data-testid="status-toast">
      <CircleCheck size={15} /> {text}
    </div>
  );
}

function Dashboard() {
  const { store, updateStore } = useLearningStore();
  const viewed = store.viewed.length;
  const total = allWords().length;
  const percentage = Math.round((viewed / total) * 100);
  const learnedChapters = chapters.filter((chapter) =>
    chapter.words.every((word) => store.viewed.includes(word.id)),
  ).length;
  const nextChapter = chapters.find((c) =>
    c.words.some((w) => !store.viewed.includes(w.id)),
  );
  const currentChapter = nextChapter ?? chapters[chapters.length - 1];
  return (
    <div className="content-wrap fade-in">
      <div className="top-row">
        <div>
          <span className="eyebrow">WEEKLY STUDY / 02</span>
          <h1 className="page-title">
            {nextChapter
              ? `Continue: ${nextChapter.title}`
              : "Every chapter completed — keep practicing."}
          </h1>
          <p className="page-intro" dir="rtl" lang="ar">
            {nextChapter
              ? `أكمل من الفصل ${nextChapter.id} — ${nextChapter.title}. كلمات الفصول المنجزة متاحة للمراجعة في أي وقت.`
              : "أنجزت الفصول كلها. ارجع للمراجعة مع مدرسك متى شئت."}
          </p>
        </div>
        <Link
          href={nextChapter ? `/learn?chapter=${nextChapter.id}` : "/review"}
          className="button button-primary"
          data-testid="button-start-learning"
        >
          <Play size={15} />{" "}
          {nextChapter ? `Continue Chapter ${nextChapter.id}` : "Review words"}
        </Link>
      </div>
      <div className="stat-grid">
        <div className="card stat-card">
          <div className="stat-label">
            <BookOpen size={15} /> Words learned
          </div>
          <div className="stat-value">
            {viewed}
            <span
              style={{ color: "hsl(var(--muted-foreground))", fontSize: 14 }}
            >
              {" "}
              / {total}
            </span>
          </div>
          <div className="stat-foot">{percentage}% of the box</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">
            <Flame size={15} /> Words reviewed
          </div>
          <div className="stat-value">{Object.keys(store.reviews).length}</div>
          <div className="stat-foot">Your recorded memory checks</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">
            <Trophy size={15} /> Chapters complete
          </div>
          <div className="stat-value">
            {learnedChapters}
            <span
              style={{ color: "hsl(var(--muted-foreground))", fontSize: 14 }}
            >
              {" "}
              / {chapters.length}
            </span>
          </div>
          <div className="stat-foot">Slow and steady</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">
            <PenLine size={15} /> Saved sentences
          </div>
          <div className="stat-value">{store.writing.length}</div>
          <div className="stat-foot">Your voice is growing</div>
        </div>
      </div>
      <div className="dashboard-grid">
        <div>
          <div className="card hero-card">
            <span className="eyebrow">
              {nextChapter ? "NEXT LESSON" : "LATEST CHAPTER"} / CHAPTER{" "}
              {String(currentChapter.id).padStart(2, "0")}
            </span>
            <h2>{currentChapter.title}</h2>
            <p>{currentChapter.subtitle}</p>
            <div className="hero-meta">
              <span className="chip">
                <Clock3 size={13} /> 12 min
              </span>
              <span className="chip">
                <BookOpen size={13} />{" "}
                <strong>{currentChapter.words.length}</strong> words
              </span>
              <Link
                href={`/learn?chapter=${currentChapter.id}`}
                className="button button-primary"
                data-testid="button-open-current-chapter"
              >
                Continue here <ArrowRight size={15} />
              </Link>
            </div>
          </div>
          <div className="card section-card" style={{ marginTop: 17 }}>
            <div className="section-head">
              <div>
                <h2 className="section-title">Chapter map</h2>
                <span className="section-caption">
                  Use your private link for the same progress on every device
                </span>
              </div>
              <span className="eyebrow">
                {learnedChapters}/{chapters.length}
              </span>
            </div>
            <div className="chapter-list">
              {chapters.map((chapter) => {
                const done = chapter.words.filter((word) =>
                  store.viewed.includes(word.id),
                ).length;
                const completed = done === chapter.words.length;
                const restartChapter = (
                  event: React.MouseEvent<HTMLButtonElement>,
                ) => {
                  event.preventDefault();
                  event.stopPropagation();
                  window.location.href = `${import.meta.env.BASE_URL}learn?chapter=${chapter.id}`;
                };
                return (
                  <div
                    key={chapter.id}
                    className={`chapter-row ${completed ? "complete" : ""}`}
                    data-testid={`chapter-row-${chapter.id}`}
                  >
                    <Link
                      href={`/learn?chapter=${chapter.id}`}
                      className="chapter-row-main"
                      data-testid={`link-chapter-${chapter.id}`}
                    >
                      <span className="chapter-num">
                        {String(chapter.id).padStart(2, "0")}
                      </span>
                      <span className="chapter-info">
                        <span className="chapter-name">{chapter.title}</span>
                        <span className="chapter-count">
                          {chapter.subtitle} · {done}/{chapter.words.length}
                        </span>
                      </span>
                      <span className="mini-progress">
                        <i
                          style={{
                            width: `${(done / chapter.words.length) * 100}%`,
                          }}
                        />
                      </span>
                      {completed ? (
                        <span className="chapter-complete-badge">
                          Completed
                        </span>
                      ) : null}
                      <ChevronRight
                        size={15}
                        color="hsl(var(--muted-foreground))"
                      />
                    </Link>
                    {completed ? (
                      <button
                        className="chapter-restart"
                        onClick={restartChapter}
                        data-testid={`button-restart-chapter-${chapter.id}`}
                      >
                        <RotateCcw size={13} /> Practice again
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="card section-card">
          <div className="section-head">
            <div>
              <h2 className="section-title">What do you want to do now?</h2>
              <span className="section-caption">A session for your mood</span>
            </div>
          </div>
          <div className="quick-grid">
            <Link
              href="/review"
              className="quick-action"
              data-testid="link-quick-review"
            >
              <RotateCcw size={18} />
              <span>
                Quick review<small>Retrieve a word from memory</small>
              </span>
              <ArrowRight size={14} style={{ marginInlineStart: "auto" }} />
            </Link>
            <Link
              href="/writing"
              className="quick-action"
              data-testid="link-quick-writing"
            >
              <PenLine size={18} />
              <span>
                Write a sentence<small>Turn a word into your voice</small>
              </span>
              <ArrowRight size={14} style={{ marginInlineStart: "auto" }} />
            </Link>
            <Link
              href="/quiz"
              className="quick-action"
              data-testid="link-quick-quiz"
            >
              <Target size={18} />
              <span>
                Test yourself<small>All original chapter exercises</small>
              </span>
              <ArrowRight size={14} style={{ marginInlineStart: "auto" }} />
            </Link>
          </div>
          <div
            style={{
              marginTop: 27,
              paddingTop: 19,
              borderTop: "1px solid hsl(var(--border))",
            }}
          >
            <span className="eyebrow">NOTE OF THE DAY</span>
            <p
              style={{
                margin: "11px 0 0",
                color: "hsl(var(--muted-foreground))",
                fontSize: 13,
                lineHeight: 1.9,
              }}
            >
              You do not need to memorize the whole word today. Notice it, hear
              it, and try using it once.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LearnPage() {
  useSearch();
  const { store, updateStore } = useLearningStore();
  const [, setLocation] = useLocation();
  const nextChapter =
    chapters.find((c) => c.words.some((w) => !store.viewed.includes(w.id)))
      ?.id ?? 1;
  const parsedChapter = Number(
    new URLSearchParams(window.location.search).get("chapter") || nextChapter,
  );
  const chapterNumber = Number.isInteger(parsedChapter) ? parsedChapter : 1;
  const chapter =
    chapters[Math.min(Math.max(chapterNumber - 1, 0), chapters.length - 1)];
  const [index, setIndex] = useState(() =>
    Math.max(
      0,
      chapter.words.findIndex((w) => !store.viewed.includes(w.id)),
    ),
  );
  const [showExample, setShowExample] = useState(false);
  const word = chapter.words[index];
  const viewedCount = chapter.words.filter((item) =>
    store.viewed.includes(item.id),
  ).length;
  const isChapterComplete = viewedCount === chapter.words.length;

  useEffect(() => {
    setIndex(
      Math.max(
        0,
        chapter.words.findIndex((w) => !store.viewed.includes(w.id)),
      ),
    );
    setShowExample(false);
  }, [chapter.id]);
  const markViewed = () => {
    updateStore((current) =>
      current.viewed.includes(word.id)
        ? current
        : { ...current, viewed: [...current.viewed, word.id] },
    );
  };
  const advance = () => {
    markViewed();
    if (index < chapter.words.length - 1) {
      setIndex((current) => current + 1);
      setShowExample(false);
    } else {
      setShowExample(true);
    }
  };
  return (
    <div className="content-wrap fade-in">
      <div className="lesson-shell">
        <div className="top-row" style={{ marginBottom: 0 }}>
          <div>
            <span className="eyebrow">
              CHAPTER {String(chapter.id).padStart(2, "0")} / WORD {index + 1}
            </span>
            <h1 className="page-title">{chapter.title}</h1>
            <p className="page-intro">{chapter.subtitle}</p>
          </div>
          <div className="lesson-header-actions">
            <select
              className="chapter-select"
              value={chapter.id}
              onChange={(event) =>
                setLocation(`/learn?chapter=${event.target.value}`)
              }
              aria-label="Choose a chapter"
              data-testid="select-chapter"
            >
              {chapters.map((item) => (
                <option key={item.id} value={item.id}>
                  {String(item.id).padStart(2, "0")} · {item.title}
                </option>
              ))}
            </select>
            <Link
              href="/"
              className="button button-ghost"
              data-testid="button-back-dashboard"
            >
              <ArrowLeft size={15} /> Back to dashboard
            </Link>
          </div>
        </div>
        <div className="lesson-progress">
          <i
            style={{ width: `${((index + 1) / chapter.words.length) * 100}%` }}
          />
        </div>
        <div className="card word-card">
          <span className="word-kicker">
            WORD {String(index + 1).padStart(2, "0")} /{" "}
            {String(chapter.words.length).padStart(2, "0")}
          </span>
          <h2 className="word-title" data-testid={`text-word-${word.id}`}>
            {word.word}
          </h2>
          <span className="word-phonetic">{word.phonetic}</span>
          <span className="word-pos">{word.partOfSpeech}</span>
          <div className="meaning-label">English meaning</div>
          <p className="meaning" data-testid={`text-meaning-${word.id}`}>
            {word.meaning}
          </p>
          <div
            className="definition-box"
            data-testid={`text-definition-${word.id}`}
          >
            <span>Simple English definition</span>
            <p>{word.definition}</p>
          </div>
          {showExample ? (
            <div className="example-box fade-in">
              <p>{word.example}</p>
            </div>
          ) : (
            <div className="locked-note" style={{ marginTop: 25 }}>
              <Lightbulb size={16} color="hsl(var(--primary))" /> See the
              example before moving to the next word.
            </div>
          )}
          <div className="lesson-actions">
            <button
              className="button button-ghost"
              onClick={() => {
                setIndex((current) => Math.max(0, current - 1));
                setShowExample(true);
              }}
              disabled={index === 0}
              data-testid="button-previous-word"
            >
              <ChevronLeft size={15} /> Previous
            </button>
            {!showExample ? (
              <button
                className="button button-primary"
                onClick={() => {
                  markViewed();
                  setShowExample(true);
                }}
                data-testid="button-show-example"
              >
                See the example <ArrowRight size={15} />
              </button>
            ) : index < chapter.words.length - 1 ? (
              <button
                className="button button-primary"
                onClick={advance}
                data-testid="button-next-word"
              >
                Next <ArrowRight size={15} />
              </button>
            ) : (
              <button
                className="button button-primary"
                onClick={() => {
                  markViewed();
                  setLocation(`/quiz?chapter=${chapter.id}`);
                }}
                data-testid="button-chapter-quiz"
                disabled={
                  !isChapterComplete && viewedCount < chapter.words.length - 1
                }
              >
                Go to chapter quiz <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 12,
            color: "hsl(var(--muted-foreground))",
            fontSize: 11,
          }}
        >
          <span>
            {viewedCount} of {chapter.words.length} words seen
          </span>
          <span>
            {isChapterComplete
              ? "Chapter ready for the quiz"
              : "The definition and example build memory"}
          </span>
        </div>
      </div>
    </div>
  );
}

function QuizPage() {
  useSearch();
  const { store, updateStore } = useLearningStore();
  const [, setLocation] = useLocation();
  const parsedChapter = Number(
    new URLSearchParams(window.location.search).get("chapter") || "1",
  );
  const chapterNumber = Number.isInteger(parsedChapter) ? parsedChapter : 1;
  const chapter =
    chapters[Math.min(Math.max(chapterNumber - 1, 0), chapters.length - 1)];
  const unlocked = chapter.words.every((word) =>
    store.viewed.includes(word.id),
  );
  const questions = chapter.questions;
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [response, setResponse] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [skippedQuestions, setSkippedQuestions] = useState<string[]>([]);
  const question = questions[questionIndex];

  useEffect(() => {
    setQuestionIndex(0);
    setSelected(null);
    setResponse("");
    setRevealed(false);
    setScore(0);
    setFinished(false);
    setSkippedQuestions([]);
  }, [chapter.id]);

  const submitChoice = (choice: number) => {
    if (selected !== null) return;
    setSelected(choice);
    if (choice === question.answer) setScore((current) => current + 1);
  };

  const nextQuestion = (skip = false) => {
    const skipped = skip
      ? [...skippedQuestions, question.id]
      : skippedQuestions;
    if (skip) setSkippedQuestions(skipped);
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((current) => current + 1);
      setSelected(null);
      setResponse("");
      setRevealed(false);
    } else {
      const finalScore = score;
      if (questions.some((q) => q.kind === "choice" && !skipped.includes(q.id)))
        updateStore((current) => ({
          ...current,
          quizResults: {
            ...current.quizResults,
            [chapter.id]: Math.max(
              current.quizResults[chapter.id] ?? 0,
              finalScore,
            ),
          },
        }));
      setFinished(true);
    }
  };
  if (!unlocked)
    return (
      <div className="content-wrap fade-in">
        <div className="quiz-layout">
          <div className="top-row">
            <div>
              <span className="eyebrow">QUIZ / LOCKED</span>
              <h1 className="page-title">The quiz is waiting.</h1>
              <p className="page-intro">
                See the definition and example for all seven words, then come
                back when you are ready.
              </p>
            </div>
          </div>
          <div className="card empty-state">
            <LockKeyhole size={30} />
            <p>This chapter is not unlocked for the quiz yet.</p>
            <Link
              href={`/learn?chapter=${chapter.id}`}
              className="button button-primary"
              data-testid="button-unlock-quiz"
            >
              Continue learning <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    );
  if (finished)
    return (
      <div className="content-wrap fade-in">
        <div className="quiz-layout">
          <div className="card empty-state" style={{ padding: 55 }}>
            <Trophy size={42} />
            <span className="eyebrow">SESSION FINISHED</span>
            <h1 className="page-title" style={{ marginTop: 13 }}>
              Your practice session is finished.
            </h1>
            <p className="page-intro">
              You scored {score} choice questions correctly. Keep speaking to
              make the words yours.
            </p>
            <p role="status">
              {skippedQuestions.length} questions skipped — no points awarded
              for skipped questions.
            </p>
            <div
              className="card"
              style={{
                padding: 17,
                margin: "22px auto 0",
                maxWidth: 520,
                textAlign: "start",
                background: "hsl(var(--muted) / .3)",
                boxShadow: "none",
              }}
            >
              <span className="eyebrow">SPEAKING PRACTICE</span>
              {chapter.questions
                .filter((item) => item.kind !== "choice")
                .map((item) => (
                  <div key={item.id} style={{ marginTop: 12 }}>
                    <SkippableQuestion>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7 }}>
                        {item.prompt}
                      </p>
                      <p
                        style={{
                          margin: "5px 0 0",
                          color: "hsl(var(--secondary-foreground))",
                          fontSize: 12,
                        }}
                      >
                        {item.sampleAnswer}
                      </p>
                    </SkippableQuestion>
                  </div>
                ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 9,
                marginTop: 23,
              }}
            >
              <button
                className="button button-ghost"
                onClick={() => {
                  setFinished(false);
                  setQuestionIndex(0);
                  setSelected(null);
                  setResponse("");
                  setRevealed(false);
                  setScore(0);
                  setSkippedQuestions([]);
                }}
                data-testid="button-retry-quiz"
              >
                <RotateCcw size={15} /> Retry quiz
              </button>
              <Link
                href="/review"
                className="button button-primary"
                data-testid="button-after-quiz"
              >
                Review words <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  const isChoiceQuestion = question.kind === "choice";
  const canContinue = isChoiceQuestion ? selected !== null : revealed;
  return (
    <div className="content-wrap fade-in">
      <div className="quiz-layout">
        <div className="top-row">
          <div>
            <span className="eyebrow">
              CHAPTER {String(chapter.id).padStart(2, "0")} / CHECK-IN
            </span>
            <h1 className="page-title">Practice this chapter.</h1>
            <p className="page-intro">
              {chapter.title} · Question {questionIndex + 1} of{" "}
              {questions.length}
            </p>
          </div>
          <Link
            href={`/learn?chapter=${chapter.id}`}
            className="button button-ghost"
            data-testid="button-return-lesson"
          >
            <ArrowLeft size={15} /> Lesson
          </Link>
        </div>
        <div className="lesson-progress">
          <i
            style={{
              width: `${((questionIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
        <div className="card question-card">
          <span className="question-number">
            {question.kind === "discussion"
              ? "SPEAKING QUESTION"
              : question.kind === "fill"
                ? "FILL IN THE BLANK"
                : `QUESTION ${String(questionIndex + 1).padStart(2, "0")}`}
          </span>
          <h2 className="question-text">{question.prompt}</h2>
          {isChoiceQuestion ? (
            <div className="choices">
              {(question.choices ?? []).map((choice, index) => (
                <button
                  key={choice}
                  className={`choice ${selected !== null && index === question.answer ? "correct" : ""} ${selected === index && index !== question.answer ? "wrong" : ""}`}
                  onClick={() => submitChoice(index)}
                  disabled={selected !== null}
                  data-testid={`button-choice-${questionIndex}-${index}`}
                >
                  <span className="choice-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {choice}
                  {selected !== null && index === question.answer ? (
                    <Check size={16} style={{ marginInlineStart: "auto" }} />
                  ) : null}
                  {selected === index && index !== question.answer ? (
                    <X size={16} style={{ marginInlineStart: "auto" }} />
                  ) : null}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              className="text-input"
              value={response}
              onChange={(event) => {
                setResponse(event.target.value);
                setRevealed(false);
              }}
              placeholder={
                question.kind === "fill"
                  ? "Complete the sentence..."
                  : "Write a short answer or prepare to say it aloud..."
              }
              data-testid="input-chapter-response"
            />
          )}
          {isChoiceQuestion && selected !== null && (
            <div
              className={`feedback ${selected === question.answer ? "good" : "bad"}`}
            >
              <strong>
                {selected === question.answer
                  ? "Good answer."
                  : "Not this time."}
              </strong>{" "}
              {question.explanation}
            </div>
          )}
          {!isChoiceQuestion && revealed && (
            <div className="feedback good">
              <strong>Sample answer:</strong> {question.sampleAnswer} <br />
              {question.explanation}
            </div>
          )}
          {!isChoiceQuestion && !revealed && (
            <button
              className="button button-ghost"
              style={{ marginTop: 18, width: "100%" }}
              onClick={() => setRevealed(true)}
              disabled={!response.trim()}
              data-testid="button-reveal-chapter-answer"
            >
              Show sample answer
            </button>
          )}
          {canContinue && (
            <button
              className="button button-primary"
              style={{ marginTop: 18, width: "100%" }}
              onClick={() => nextQuestion()}
              data-testid="button-next-question"
            >
              {questionIndex === questions.length - 1
                ? "Show result"
                : "Next question"}{" "}
              <ArrowRight size={15} />
            </button>
          )}
          {!canContinue && (
            <button
              className="button button-ghost"
              style={{ marginTop: 14, width: "100%" }}
              onClick={() => nextQuestion(true)}
              data-testid="button-skip-question"
            >
              {questionIndex === questions.length - 1
                ? "Skip question & finish · تخطي وإنهاء"
                : "Skip question · تخطي السؤال"}{" "}
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewPage() {
  useSearch();
  const { store, updateStore } = useLearningStore();
  const [chapterFilter, setChapterFilter] = useState("all");
  const requested = new URLSearchParams(location.search).get("word");
  const [wordId, setWordId] = useState(requested || "");
  const [hintVisible, setHintVisible] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [response, setResponse] = useState("");
  const [rated, setRated] = useState(false);
  const pool = allWords().filter(
    (w) => chapterFilter === "all" || w.id.startsWith(`${chapterFilter}-`),
  );
  const ordered = [...pool].sort(
    (a, b) => (store.reviews[a.id]?.due ?? 0) - (store.reviews[b.id]?.due ?? 0),
  );
  const word =
    pool.find((w) => w.id === wordId) ??
    ordered.find((w) => store.viewed.includes(w.id)) ??
    ordered[0];
  useEffect(() => {
    if (!wordId) setWordId(word.id);
  }, [word.id, wordId]);
  const source = course.chapters[Number(word.id.split("-")[0]) - 1];
  const stem =
    word.word === "responsibility"
      ? "responsibilit"
      : word.word === "remind"
        ? "remind"
        : word.word;
  const related = source.questions.filter(
    (q) =>
      q.expectedAnswer?.startsWith(stem) ||
      q.prompt.toLowerCase().includes(stem),
  );
  const due = pool.filter(
    (w) =>
      store.viewed.includes(w.id) &&
      (!store.reviews[w.id] || store.reviews[w.id].due <= Date.now()),
  ).length;
  const reset = () => {
    setAnswered(false);
    setHintVisible(false);
    setResponse("");
    setRated(false);
  };
  const choose = (id: string) => {
    setWordId(id);
    reset();
  };
  const rate = (rating: "again" | "good" | "easy") => {
    updateStore((current) => ({
      ...current,
      viewed: [...new Set([...current.viewed, word.id])],
      reviews: {
        ...current.reviews,
        [word.id]: scheduleReview(current.reviews[word.id], rating),
      },
      writing: response.trim()
        ? [
            {
              id: `${Date.now()}-${crypto.randomUUID()}`,
              word: word.word,
              sentence: response.trim(),
              date: new Date().toLocaleDateString("en-US"),
            },
            ...current.writing,
          ]
        : current.writing,
    }));
    setWordId(word.id);
    setRated(true);
  };
  const blankExample = word.example.replace(
    new RegExp(word.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
    "__________",
  );
  return (
    <div className="content-wrap fade-in">
      <div className="review-card">
        <div className="top-row">
          <div>
            <span className="eyebrow">REVIEW / SPEAK WITH YOUR TEACHER</span>
            <h1 className="page-title">Make this word yours.</h1>
            <p className="page-intro">
              Recall the meaning, use the word, then rate your memory. Difficult
              words return sooner.
            </p>
          </div>
          <span className="chip">{due} learned words due</span>
        </div>
        <div className="review-filters">
          <select
            className="chapter-select"
            aria-label="Review chapter"
            value={chapterFilter}
            onChange={(e) => {
              setChapterFilter(e.target.value);
              setWordId("");
              reset();
            }}
          >
            <option value="all">All chapters</option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id}. {c.title}
              </option>
            ))}
          </select>
          <select
            className="chapter-select"
            aria-label="Review word"
            value={word.id}
            onChange={(e) => choose(e.target.value)}
          >
            {pool.map((w) => (
              <option key={w.id} value={w.id}>
                {w.word} · Chapter {w.id.split("-")[0]}
              </option>
            ))}
          </select>
        </div>
        <div className="card review-prompt">
          <span className="word-kicker">
            CHAPTER {source.id} · {source.title}
          </span>
          <h2 className="word-title">{word.word}</h2>
          <span className="word-phonetic">{word.partOfSpeech}</span>
          <div
            className="review-question-list"
            data-question-list
            key={word.id}
          >
            <h3>Extra practice — created for this word</h3>
            {word.reviewQuestions.map((question, index) => (
              <SkippableQuestion key={question}>
                <div className="review-question">
                  <span>{index + 1}</span>
                  <p>{question}</p>
                </div>
              </SkippableQuestion>
            ))}
            <SkippableQuestion>
              <div className="review-question">
                <span>4</span>
                <p>
                  {blankExample !== word.example
                    ? `Complete the example: ${blankExample}`
                    : `Change this example to describe yourself: ${word.example}`}
                </p>
              </div>
            </SkippableQuestion>
            {related.length > 0 && (
              <>
                <h3>From your course PDF</h3>
                {related.map((q) => (
                  <SkippableQuestion key={q.id}>
                    <div className="review-question">
                      <p>
                        {q.prompt}
                        {answered && q.expectedAnswer && (
                          <strong className="answer-key">
                            Answer: {q.expectedAnswer}
                          </strong>
                        )}
                      </p>
                    </div>
                  </SkippableQuestion>
                ))}
              </>
            )}
          </div>
          <label className="review-response-label" htmlFor="review-response">
            Your practice answer (optional — saved when you rate the word)
          </label>
          <textarea
            id="review-response"
            className="text-input"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            disabled={rated}
            placeholder="Speak aloud with your teacher, or write your answer here…"
          />
          {hintVisible && <div className="hint-box">{word.hint}</div>}
          {answered && (
            <div className="feedback good">
              <strong>Meaning:</strong> {word.meaning}
              <br />
              <strong>Example / completion:</strong> {word.example}
              <p>
                Personal questions have many valid answers. Ask your teacher to
                check your meaning and word choice.
              </p>
            </div>
          )}
          <div className="review-answer">
            {!rated && (
              <button
                className="button button-ghost"
                onClick={() =>
                  choose(
                    pool[
                      (pool.findIndex((w) => w.id === word.id) + 1) %
                        pool.length
                    ].id,
                  )
                }
                data-testid="button-skip-review-word"
              >
                Skip this word · تخطي الكلمة <ArrowRight size={15} />
              </button>
            )}
            {!answered && (
              <>
                <button
                  className="button button-ghost"
                  onClick={() => setHintVisible(!hintVisible)}
                >
                  {hintVisible ? "Hide hint" : "I need a hint"}
                </button>
                <button
                  className="button button-primary"
                  onClick={() => setAnswered(true)}
                >
                  Reveal meaning & answers
                </button>
              </>
            )}
            {answered && !rated && (
              <div className="rating-buttons">
                <button
                  className="button button-ghost"
                  onClick={() => rate("again")}
                >
                  Again · 1 minute
                </button>
                <button
                  className="button button-primary"
                  onClick={() => rate("good")}
                >
                  Remembered
                </button>
                <button
                  className="button button-ghost"
                  onClick={() => rate("easy")}
                >
                  Easy
                </button>
              </div>
            )}
            {rated && (
              <>
                <p role="status">
                  Review recorded. Next review:{" "}
                  {new Date(store.reviews[word.id].due).toLocaleString()}.
                </p>
                <button
                  className="button button-primary"
                  onClick={() =>
                    choose(ordered.find((w) => w.id !== word.id)?.id ?? word.id)
                  }
                >
                  Next word <ArrowRight size={15} />
                </button>
              </>
            )}
          </div>
          <Link
            href={`/practice?chapter=${source.id}`}
            className="button button-ghost"
          >
            All questions in this chapter
          </Link>
        </div>
      </div>
    </div>
  );
}

function WritingPage() {
  const { store, updateStore } = useLearningStore();
  const learnedWords = useMemo(
    () => allWords().filter((word) => store.viewed.includes(word.id)),
    [store.viewed],
  );
  const [round, setRound] = useState(0);
  const [sentence, setSentence] = useState("");
  const [hintVisible, setHintVisible] = useState(false);
  const [saved, setSaved] = useState(false);
  const word = (learnedWords.length ? learnedWords : allWords())[
    round % (learnedWords.length || allWords().length)
  ];
  const saveSentence = () => {
    if (!sentence.trim()) return;
    const entry: WritingEntry = {
      id: `${Date.now()}-${crypto.randomUUID()}`,
      word: word.word,
      sentence: sentence.trim(),
      date: new Date().toLocaleDateString("en-US"),
    };
    updateStore((current) => ({
      ...current,
      writing: [entry, ...current.writing],
    }));
    setSaved(true);
  };
  const next = () => {
    setRound((current) => current + 1);
    setSentence("");
    setHintVisible(false);
    setSaved(false);
  };
  return (
    <div className="content-wrap fade-in">
      <div className="top-row">
        <div>
          <span className="eyebrow">WRITING / YOUR VOICE</span>
          <h1 className="page-title">Put the word in a sentence.</h1>
          <p className="page-intro">
            A sentence from your life lasts longer than a definition you
            memorize.
          </p>
        </div>
        <span className="chip">
          <PenLine size={13} /> {store.writing.length} saved
        </span>
      </div>
      <div className="writing-grid">
        <div className="card writing-card">
          <span className="word-kicker">Write an English sentence using</span>
          <div className="writing-prompt">
            <small>YOUR WORD</small>
            <strong>{word.word}</strong>
            <em>{word.meaning}</em>
          </div>
          {hintVisible && (
            <div
              className="hint-box fade-in"
              style={{ margin: "0 0 13px", maxWidth: "none" }}
            >
              <Lightbulb size={14} /> Hint: {word.hint}
            </div>
          )}
          <textarea
            className="text-input"
            value={sentence}
            onChange={(event) => {
              setSentence(event.target.value);
              setSaved(false);
            }}
            placeholder="Write a sentence from your own life..."
            dir="ltr"
            data-testid="input-writing-sentence"
          />
          {saved && (
            <div className="feedback good">
              <strong>Your sentence was saved.</strong> Come back later, or try
              a new word.
            </div>
          )}
          <div className="lesson-actions" style={{ marginTop: 14 }}>
            {!saved && (
              <button
                className="button button-ghost"
                onClick={next}
                data-testid="button-skip-writing"
              >
                Skip exercise · تخطي التمرين
              </button>
            )}
            {!hintVisible && !saved && (
              <button
                className="button button-ghost"
                onClick={() => setHintVisible(true)}
                data-testid="button-show-writing-hint"
              >
                <Lightbulb size={15} /> Hint
              </button>
            )}
            {hintVisible && !saved && (
              <button
                className="button button-ghost"
                onClick={() => setHintVisible(false)}
                data-testid="button-cancel-writing-hint"
              >
                <X size={15} /> Cancel hint
              </button>
            )}
            {!saved ? (
              <button
                className="button button-primary"
                onClick={saveSentence}
                disabled={!sentence.trim()}
                data-testid="button-save-sentence"
              >
                <Check size={15} /> Save sentence
              </button>
            ) : (
              <button
                className="button button-primary"
                onClick={next}
                data-testid="button-next-writing-word"
              >
                New word <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
        <div className="card section-card">
          <div className="section-head">
            <div>
              <h2 className="section-title">Sentence notebook</h2>
              <span className="section-caption">Your latest writing</span>
            </div>
          </div>
          {store.writing.length ? (
            <div className="history-list">
              {store.writing.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="history-item"
                  data-testid={`item-sentence-${entry.id}`}
                >
                  <strong>{entry.word}</strong>
                  <p>{entry.sentence}</p>
                  <small
                    style={{
                      color: "hsl(var(--muted-foreground))",
                      fontSize: 9,
                    }}
                  >
                    {entry.date}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "20px 6px" }}>
              <PenLine size={24} />
              <p>Your sentences will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressPage() {
  const { store } = useLearningStore();
  const total = allWords().length;
  const bars = chapters.map(
    (chapter) =>
      chapter.words.filter((word) => store.viewed.includes(word.id)).length,
  );
  const difficult = allWords()
    .filter((word) => store.viewed.includes(word.id))
    .slice()
    .reverse()
    .slice(0, 5);
  return (
    <div className="content-wrap fade-in">
      <div className="top-row">
        <div>
          <span className="eyebrow">PROGRESS / A QUIET RECORD</span>
          <h1 className="page-title">Your steps, recorded.</h1>
          <p className="page-intro">
            We do not measure speed. We keep what you revisit and what becomes
            yours.
          </p>
        </div>
        <span className="chip">
          <BarChart3 size={13} />{" "}
          {Math.round((store.viewed.length / total) * 100)}% complete
        </span>
      </div>
      <div className="analytics-grid">
        <div className="card chart-card">
          <div className="section-head">
            <div>
              <h2 className="section-title">Words across chapters</h2>
              <span className="section-caption">
                Each bar represents one chapter
              </span>
            </div>
            <span className="eyebrow">
              {store.viewed.length}/{total}
            </span>
          </div>
          <div className="bars">
            {bars.map((value, index) => (
              <div className="bar-col" key={index}>
                <i
                  className="bar-value"
                  style={{ height: `${Math.max(4, (value / 7) * 100)}%` }}
                />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card chart-card">
          <div className="section-head">
            <div>
              <h2 className="section-title">Words to revisit</h2>
              <span className="section-caption">The latest words you met</span>
            </div>
            <RotateCcw size={17} color="hsl(var(--primary))" />
          </div>
          {difficult.length ? (
            <div className="difficult-list">
              {difficult.map((word, index) => (
                <div className="difficult-row" key={word.id}>
                  <span className="difficult-rank">0{index + 1}</span>
                  <div>
                    <strong>{word.word}</strong>
                    <small>{word.meaning}</small>
                  </div>
                  <Link
                    href={`/review?word=${word.id}`}
                    className="button button-ghost"
                    style={{
                      minHeight: 30,
                      padding: "0 9px",
                      marginInlineStart: "auto",
                    }}
                    data-testid={`button-review-word-${word.id}`}
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <BarChart3 size={27} />
              <p>Start learning to see your map here.</p>
            </div>
          )}
        </div>
      </div>
      <div className="card section-card" style={{ marginTop: 17 }}>
        <div className="section-head">
          <div>
            <h2 className="section-title">A small reminder</h2>
            <span className="section-caption">
              Learning is not a constant exam
            </span>
          </div>
        </div>
        <p
          style={{
            color: "hsl(var(--muted-foreground))",
            margin: 0,
            fontSize: 13,
            lineHeight: 1.9,
          }}
        >
          Forgetting a word is not going backward. Returning to it is part of
          the path.
        </p>
      </div>
    </div>
  );
}

function ImportPage() {
  return (
    <div className="content-wrap fade-in">
      <span className="eyebrow">COURSE LIBRARY</span>
      <h1 className="page-title">Your lessons, kept together.</h1>
      <p className="page-intro">
        {course.title} · {chapters.length} chapters · {allWords().length}{" "}
        vocabulary entries ·{" "}
        {course.chapters.reduce((n, c) => n + c.questions.length, 0)} original
        questions.
      </p>
      <div className="card section-card">
        <h2 className="section-title">Adding your next file</h2>
        <p>
          Send your next PDF in our project conversation. Its words, examples,
          exercises and discussion questions can be added as new chapters, while
          keeping your existing progress and this layout.
        </p>
        <p dir="rtl" lang="ar">
          أرسل الملف الجديد في محادثة المشروع لإضافته كفصول جديدة بنفس ترتيب
          الصفحة، مع الحفاظ على تقدمك السابق.
        </p>
        <p>
          Original source exercises and extra review prompts are labeled
          separately. Answer keys and extra prompts are learning aids added to
          the app.
        </p>
      </div>
      <details className="card section-card" style={{ marginTop: 16 }}>
        <summary>
          Full course introduction & speaking guide (from the PDF)
        </summary>
        {course.introduction.map((page, i) => (
          <div key={i} className="source-page">
            <h3>Source page {i + 1}</h3>
            <p style={{ whiteSpace: "pre-line" }}>{page}</p>
          </div>
        ))}
      </details>
      <div className="card section-card" style={{ marginTop: 16 }}>
        <h2 className="section-title">Study with your Cambly teacher</h2>
        <p>
          Read the word and its example, answer its review questions aloud, then
          do the chapter exercises together. Aim for 2–3 sentences and one new
          vocabulary word in each speaking answer.
        </p>
        {chapters.map((c) => (
          <p key={c.id}>
            <Link href={`/practice?chapter=${c.id}`}>
              {c.id}. {c.title} — all exercises & speaking questions
            </Link>
          </p>
        ))}
      </div>
    </div>
  );
}

function PracticePage() {
  useSearch();
  const [, navigate] = useLocation();
  const id = Number(new URLSearchParams(location.search).get("chapter")) || 1;
  const chapter = chapters.find((c) => c.id === id) ?? chapters[0];
  const source = course.chapters[chapter.id - 1];
  return (
    <div className="content-wrap fade-in">
      <span className="eyebrow">TEACHER SESSION / ORIGINAL PDF</span>
      <h1 className="page-title">{chapter.title}</h1>
      <p className="page-intro">
        All original exercises, in source order. Answer aloud together; open an
        answer only when ready.
      </p>
      <select
        className="chapter-select"
        aria-label="Practice chapter"
        value={chapter.id}
        onChange={(e) => navigate(`/practice?chapter=${e.target.value}`)}
      >
        {chapters.map((c) => (
          <option key={c.id} value={c.id}>
            {c.id}. {c.title}
          </option>
        ))}
      </select>
      <div key={chapter.id} data-question-list>
        {source.questions.map((q, i) => (
          <div className="card section-card source-question" key={q.id}>
            <SkippableQuestion>
              <span className="eyebrow">{q.section}</span>
              <h2>
                {i + 1}. {q.prompt}
              </h2>
              {q.expectedAnswer ? (
                <details>
                  <summary>Check answer</summary>
                  <p>{q.expectedAnswer}</p>
                </details>
              ) : (
                <p className="section-caption">
                  Personal answer · use a chapter word in 2–3 sentences.
                </p>
              )}
            </SkippableQuestion>
          </div>
        ))}
      </div>
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Shell>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/learn" component={LearnPage} />
          <Route path="/quiz" component={QuizPage} />
          <Route path="/review" component={ReviewPage} />
          <Route path="/writing" component={WritingPage} />
          <Route path="/progress" component={ProgressPage} />
          <Route path="/import" component={ImportPage} />
          <Route path="/practice" component={PracticePage} />
          <Route component={NotFound} />
        </Switch>
      </Shell>
    </RoutedErrorBoundary>
  );
}
function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}
const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
export default App;
