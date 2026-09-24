import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
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
} from 'lucide-react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import NotFound from '@/pages/not-found';
import { sourceChapterSpecs, sourceWordCatalog } from '@/content';

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
  kind: 'choice' | 'discussion' | 'fill';
  prompt: string;
  choices?: string[];
  answer?: number;
  explanation: string;
  sampleAnswer?: string;
};
type WritingEntry = { id: string; word: string; sentence: string; date: string };
type ImportEntry = { name: string; size: string; addedAt: string };
type Store = {
  viewed: string[];
  quizResults: Record<string, number>;
  writing: WritingEntry[];
  imports: ImportEntry[];
};

const chapterSpecs = [
  ['Daily routines', 'Small habits, clear conversations'],
  ['People & relationships', 'The words that connect us'],
  ['Work & study', 'Talk about your everyday progress'],
  ['Places in town', 'Move through your city with ease'],
  ['Food & choices', 'Order, describe, recommend'],
  ['Travel moments', 'Stay ready for the unexpected'],
  ['Health & energy', 'Listen to your body'],
  ['Opinions & feelings', 'Say what you really mean'],
  ['Plans & possibilities', 'Talk about what comes next'],
  ['Stories & memories', 'Make yesterday vivid'],
] as const;

const wordCatalog: [string, string, string, string, string, string][] = [
  ['routine', 'روتين', 'a regular way of doing things', 'My morning routine starts with a quiet cup of tea.', 'روتيني الصباحي يبدأ بفنجان شاي هادئ.', 'Think of something you do almost every day.'],
  ['reliable', 'موثوق', 'someone or something you can depend on', 'Maya is reliable, so I ask her to check my work.', 'مايا موثوقة، لذلك أطلب منها مراجعة عملي.', 'A reliable person keeps their promise.'],
  ['adjust', 'يعدّل', 'to change something slightly to make it better', 'I adjusted my study time to fit my new schedule.', 'عدّلت وقت دراستي ليتناسب مع جدولي الجديد.', 'You adjust a chair to make it comfortable.'],
  ['commute', 'يتنقل', 'to travel regularly between home and work', 'I listen to English lessons during my commute.', 'أستمع إلى دروس الإنجليزية أثناء تنقلي.', 'The journey to work can be a commute.'],
  ['priority', 'أولوية', 'something more important than other things', 'Speaking clearly is my first priority this month.', 'التحدث بوضوح هو أولويتي الأولى هذا الشهر.', 'A priority deserves your attention first.'],
  ['notice', 'يلاحظ', 'to see or become aware of something', 'I noticed that I speak more confidently now.', 'لاحظت أنني أتحدث بثقة أكبر الآن.', 'You notice a detail when it catches your attention.'],
  ['steady', 'ثابت', 'continuing at the same calm speed', 'A steady practice habit is better than a rare long session.', 'عادة التدريب الثابتة أفضل من جلسة طويلة نادرة.', 'Steady progress is calm and consistent.'],
  ['curious', 'فضولي', 'wanting to learn or know more', 'I am curious about how Americans use this phrase.', 'أشعر بالفضول لمعرفة كيف يستخدم الأمريكيون هذه العبارة.', 'A curious learner asks good questions.'],
  ['supportive', 'داعِم', 'helpful and encouraging', 'My teacher is supportive when I make a mistake.', 'معلمي داعم عندما أرتكب خطأ.', 'A supportive friend helps you continue.'],
  ['prefer', 'يفضّل', 'to like one thing more than another', 'I prefer studying in the evening.', 'أفضل الدراسة في المساء.', 'Use this when you choose between two things.'],
  ['schedule', 'جدول', 'a plan that shows when things happen', 'I wrote my English lesson on my weekly schedule.', 'كتبت درس الإنجليزية في جدولي الأسبوعي.', 'Your calendar is a kind of schedule.'],
  ['focus', 'يركّز', 'to give your full attention to something', 'I focus on one new word at a time.', 'أركّز على كلمة جديدة واحدة في كل مرة.', 'Focus means your attention stays in one place.'],
  ['deadline', 'موعد نهائي', 'the latest time something must be finished', 'I finished the report before the deadline.', 'أنهيت التقرير قبل الموعد النهائي.', 'A deadline is the last acceptable moment.'],
  ['improve', 'يحسّن', 'to become better or make something better', 'I want to improve my pronunciation this week.', 'أريد تحسين نطقي هذا الأسبوع.', 'Practice helps you improve.'],
  ['feedback', 'ملاحظات', 'helpful comments about your work', 'Her feedback helped me choose a clearer word.', 'ساعدتني ملاحظاتها على اختيار كلمة أوضح.', 'Feedback tells you what to keep or change.'],
  ['neighborhood', 'حيّ', 'an area of a town where people live', 'There is a small bakery in my neighborhood.', 'يوجد مخبز صغير في حيي.', 'Your neighborhood is close to your home.'],
  ['nearby', 'قريب', 'not far away', 'There is a quiet library nearby.', 'توجد مكتبة هادئة قريبة.', 'Nearby means close, not distant.'],
  ['crowded', 'مزدحم', 'full of people', 'The market is crowded on Friday evening.', 'السوق مزدحم مساء الجمعة.', 'A crowded place has many people.'],
  ['entrance', 'مدخل', 'a way into a place', 'Let us meet near the entrance.', 'لنلتقِ قرب المدخل.', 'You walk through an entrance to go inside.'],
  ['convenient', 'مناسب', 'easy and useful for your situation', 'The bus stop is convenient for my apartment.', 'موقف الحافلة مناسب لشقتي.', 'Convenient saves time or effort.'],
  ['flavor', 'نكهة', 'the particular taste of food', 'This soup has a fresh lemon flavor.', 'لهذا الحساء نكهة ليمون منعشة.', 'Flavor is what food tastes like.'],
  ['recommend', 'ينصح بـ', 'to suggest something as a good choice', 'Can you recommend a quiet restaurant?', 'هل يمكنك أن تنصحني بمطعم هادئ؟', 'You recommend something you think is good.'],
  ['portion', 'حصة', 'an amount of food for one person', 'The portion was generous, so I shared it.', 'كانت الحصة كبيرة، لذلك شاركتها.', 'A portion is one serving of food.'],
  ['fresh', 'طازج', 'recently made or picked', 'The bread is fresh every morning.', 'الخبز طازج كل صباح.', 'Fresh food has not been stored for long.'],
  ['satisfying', 'مُرضٍ', 'giving you a good feeling because a need is met', 'Finishing a difficult lesson feels satisfying.', 'إنهاء درس صعب شعور مُرضٍ.', 'A satisfying result feels worth the effort.'],
  ['journey', 'رحلة', 'an act of traveling from one place to another', 'The journey took three hours by train.', 'استغرقت الرحلة ثلاث ساعات بالقطار.', 'A journey is the whole trip.'],
  ['luggage', 'أمتعة', 'bags and suitcases you take when traveling', 'I left my luggage at the hotel.', 'تركت أمتعتي في الفندق.', 'Luggage travels with you.'],
  ['departure', 'مغادرة', 'the act of leaving a place', 'Our departure is at six in the morning.', 'مغادرتنا في السادسة صباحاً.', 'Departure is when a trip begins by leaving.'],
  ['delay', 'تأخير', 'a situation in which something happens later than planned', 'The flight had a short delay.', 'تأخرت الرحلة قليلاً.', 'A delay makes something later.'],
  ['explore', 'يستكشف', 'to travel around a place to learn about it', 'I want to explore the old part of the city.', 'أريد استكشاف الجزء القديم من المدينة.', 'Explore means look around with curiosity.'],
  ['comfort', 'راحة', 'a pleasant feeling of being relaxed', 'These shoes give me comfort on long walks.', 'هذه الأحذية تمنحني الراحة في المشي الطويل.', 'Comfort feels safe and easy.'],
  ['balance', 'توازن', 'a healthy relationship between different parts', 'I am trying to find a balance between work and rest.', 'أحاول إيجاد توازن بين العمل والراحة.', 'Balance means no part takes too much.'],
  ['symptom', 'عَرَض', 'a sign that you may have an illness', 'A headache was my first symptom.', 'كان الصداع أول أعراض مرضي.', 'A symptom is something your body shows you.'],
  ['recover', 'يتعافى', 'to become healthy again after illness', 'I need a quiet weekend to recover.', 'أحتاج إلى عطلة هادئة لأتعافى.', 'Recover means return to good health.'],
  ['energetic', 'نشيط', 'having a lot of energy', 'I feel energetic after a good night of sleep.', 'أشعر بالنشاط بعد نوم جيد.', 'An energetic person wants to move and do things.'],
  ['prevent', 'يمنع', 'to stop something from happening', 'Regular breaks can prevent eye strain.', 'يمكن للاستراحات المنتظمة منع إجهاد العين.', 'Prevent means stop before it happens.'],
  ['appointment', 'موعد', 'an arranged time to meet someone', 'I have a doctor’s appointment tomorrow.', 'لدي موعد مع الطبيب غداً.', 'An appointment is a planned meeting.'],
  ['honest', 'صادق', 'telling the truth and not hiding the facts', 'I try to be honest about my English level.', 'أحاول أن أكون صادقاً بشأن مستواي.', 'An honest answer tells the truth.'],
  ['disappointed', 'خائب الأمل', 'sad because something was not as good as expected', 'I was disappointed, but I decided to try again.', 'شعرت بخيبة أمل، لكنني قررت المحاولة مجدداً.', 'Disappointed is the feeling after an unmet hope.'],
  ['confident', 'واثق', 'sure about your ability or decision', 'I feel more confident speaking with my teacher.', 'أشعر بثقة أكبر عند التحدث مع معلمي.', 'Confidence helps you act without too much fear.'],
  ['grateful', 'ممتن', 'feeling thankful for something', 'I am grateful for the time to study.', 'أنا ممتن للوقت المتاح للدراسة.', 'Grateful means thankful.'],
  ['opinion', 'رأي', 'what you think or believe about something', 'In my opinion, quiet cafés are best for reading.', 'في رأيي، المقاهي الهادئة أفضل للقراءة.', 'An opinion is your personal view.'],
  ['agree', 'يوافق', 'to have the same opinion as someone', 'I agree that small steps make a difference.', 'أوافق على أن الخطوات الصغيرة تصنع فرقاً.', 'Agree means share the same view.'],
  ['disagree', 'يختلف', 'to have a different opinion', 'It is fine to disagree politely.', 'لا بأس أن تختلف بأدب.', 'Disagree means see something differently.'],
  ['matter', 'يهم', 'to be important', 'Every practice session matters.', 'كل جلسة تدريب مهمة.', 'If something matters, it is important to you.'],
  ['relieved', 'مرتاح', 'feeling happy because a worry has ended', 'I felt relieved after sending the email.', 'شعرت بالارتياح بعد إرسال البريد.', 'Relieved is the opposite of worried.'],
  ['ambitious', 'طموح', 'having a strong desire to achieve something', 'My ambitious goal is to speak naturally.', 'هدفي الطموح هو التحدث بشكل طبيعي.', 'An ambitious goal asks a lot from you.'],
  ['likely', 'محتمل', 'probably going to happen', 'It is likely that I will practice tonight.', 'من المحتمل أن أتدرب الليلة.', 'Likely means probably.'],
  ['opportunity', 'فرصة', 'a good chance to do something', 'This conversation is an opportunity to practice.', 'هذه المحادثة فرصة للتدرب.', 'An opportunity is a chance worth noticing.'],
  ['decision', 'قرار', 'a choice you make after thinking', 'My decision was to study for twenty minutes.', 'كان قراري أن أدرس عشرين دقيقة.', 'A decision is a considered choice.'],
  ['eventually', 'في النهاية', 'in the end, after some time', 'Eventually, the new phrase felt natural.', 'في النهاية، أصبحت العبارة الجديدة طبيعية.', 'Eventually describes a later result.'],
  ['memory', 'ذكرى', 'something you remember from the past', 'That song brings back a happy memory.', 'تلك الأغنية تعيد ذكرى سعيدة.', 'A memory lives in your mind.'],
  ['recently', 'مؤخراً', 'not long ago', 'I recently started speaking with an American teacher.', 'بدأت مؤخراً التحدث مع معلم أمريكي.', 'Recently means a short time ago.'],
  ['familiar', 'مألوف', 'well known from experience', 'This expression sounds familiar now.', 'تبدو هذه العبارة مألوفة الآن.', 'Familiar things feel known, not new.'],
  ['describe', 'يصف', 'to say what someone or something is like', 'Can you describe your favorite room?', 'هل يمكنك وصف غرفتك المفضلة؟', 'Describe means give details with words.'],
  ['remind', 'يذكّر', 'to make someone remember something', 'Please remind me to review this word tomorrow.', 'ذكّرني من فضلك بمراجعة هذه الكلمة غداً.', 'A reminder brings something back to your attention.'],
  ['meaningful', 'ذو معنى', 'important or valuable in a personal way', 'A meaningful conversation can change your day.', 'المحادثة ذات المعنى يمكن أن تغيّر يومك.', 'Meaningful things matter deeply.'],
  ['celebrate', 'يحتفل', 'to do something special for a happy event', 'I celebrate small wins in my English journey.', 'أحتفل بالانتصارات الصغيرة في رحلتي مع الإنجليزية.', 'Celebrate a happy moment or achievement.'],
  ['lesson', 'درس', 'a period of learning about something', 'Our lesson begins with a short conversation.', 'يبدأ درسنا بمحادثة قصيرة.', 'A lesson is time set aside to learn.'],
  ['practice', 'يتدرّب', 'to do something repeatedly to improve', 'I practice new vocabulary out loud.', 'أتدرب على المفردات الجديدة بصوت عالٍ.', 'Practice turns knowledge into skill.'],
  ['progress', 'تقدّم', 'movement toward a better or more advanced state', 'I can see progress when I review old notes.', 'أرى التقدم عندما أراجع ملاحظاتي القديمة.', 'Progress is movement forward.'],
  ['conversation', 'محادثة', 'a talk between two or more people', 'Our conversation was relaxed and useful.', 'كانت محادثتنا مريحة ومفيدة.', 'A conversation is shared speaking.'],
  ['express', 'يعبّر', 'to show a thought or feeling in words', 'I am learning to express my opinion clearly.', 'أتعلم التعبير عن رأيي بوضوح.', 'Express means put an idea into words.'],
  ['patient', 'صبور', 'able to wait without becoming upset', 'Be patient with yourself while you learn.', 'كن صبوراً مع نفسك أثناء التعلم.', 'Patient people allow time for growth.'],
  ['mistake', 'خطأ', 'something done incorrectly', 'A mistake is useful when I learn from it.', 'الخطأ مفيد عندما أتعلم منه.', 'A mistake is not the end of learning.'],
  ['natural', 'طبيعي', 'as if it is easy and normal', 'With practice, the phrase sounds natural.', 'مع التدريب، تبدو العبارة طبيعية.', 'Natural speech does not feel forced.'],
  ['continue', 'يستمر', 'to keep doing something', 'I will continue even on a busy week.', 'سأستمر حتى في الأسبوع المزدحم.', 'Continue means do not stop.'],
  ['reflect', 'يتأمل', 'to think carefully about something', 'I reflect on one new phrase after class.', 'أتأمل عبارة جديدة بعد الدرس.', 'Reflect means think back carefully.'],
];

const englishChapterSubtitles = [
  'Describe your home and the neighborhood around it',
  'Talk about your job, responsibilities, and routine',
  'Talk about your free time and favorite activities',
  'Describe your friends and the relationships you value',
  'Describe food, eating habits, and your preferences',
  'Talk about your routine and how you spend the weekend',
  'Talk about prices, products, and what you choose to buy',
  'Describe the weather and how it affects your life',
  'Describe trips, destinations, and travel experiences',
  'Talk about the music you enjoy and your preferences',
] as const;

const chapterPromptSpecs = [
  {
    discussion: ['What do you like most about the place where you live?', 'Describe your neighborhood to a new visitor.'],
    fillIn: 'My home is ______ because ______.',
    answer: 'My home is spacious because it has plenty of room.',
  },
  {
    discussion: ['What do you enjoy most about your work?', 'What makes a good working day for you?'],
    fillIn: 'My work is ______, but I enjoy ______.',
    answer: 'My work is challenging, but I enjoy learning new things.',
  },
  {
    discussion: ['What do you usually do in your free time?', 'Which hobby would you like to take up?'],
    fillIn: 'In my free time, I like to ______ because ______.',
    answer: 'In my free time, I like to paint because it helps me recharge.',
  },
  {
    discussion: ['What qualities do you value in a friend?', 'What do you and your closest friend have in common?'],
    fillIn: 'A good friend is ______ because ______.',
    answer: 'A good friend is reliable because they keep their promises.',
  },
  {
    discussion: ['What kind of food do you enjoy most?', 'How do you try to keep your diet balanced?'],
    fillIn: 'I prefer ______ because it tastes ______.',
    answer: 'I prefer fresh food because it tastes better.',
  },
  {
    discussion: ['How do you usually spend your weekend?', 'What helps you recharge after a busy week?'],
    fillIn: 'At the weekend, I usually ______ to make the most of my time.',
    answer: 'At the weekend, I usually explore my city to make the most of my time.',
  },
  {
    discussion: ['What do you look for when you buy something?', 'When is an expensive product worth it?'],
    fillIn: 'I look for ______ when I choose a product.',
    answer: 'I look for good quality when I choose a product.',
  },
  {
    discussion: ['Which season do you enjoy most?', 'How does the weather affect your mood?'],
    fillIn: 'When the weather is ______, I usually ______.',
    answer: 'When the weather is pleasant, I usually go for a walk.',
  },
  {
    discussion: ['What makes a holiday memorable for you?', 'Which destination would you like to explore?'],
    fillIn: 'My ideal holiday would be ______ because ______.',
    answer: 'My ideal holiday would be adventurous because I enjoy exploring new places.',
  },
  {
    discussion: ['What kind of music do you enjoy?', 'Which song or artist reminds you of a special memory?'],
    fillIn: 'I enjoy ______ music because it makes me feel ______.',
    answer: 'I enjoy relaxing music because it makes me feel calm.',
  },
] as const;

const adjectiveWords = new Set([
  'spacious', 'convenient', 'peaceful', 'lively', 'suitable', 'demanding', 'flexible', 'efficient',
  'motivated', 'challenging', 'creative', 'active', 'passionate', 'entertaining', 'productive',
  'exhausted', 'energetic', 'spontaneous', 'typical', 'affordable', 'reasonable', 'practical',
  'essential', 'humid', 'mild', 'freezing', 'pleasant', 'unpredictable', 'memorable',
  'adventurous', 'crowded', 'catchy', 'relaxing', 'live', 'talented',
]);
const verbWords = new Set([
  'take up', 'recharge', 'affect', 'explore', 'get away', 'remind',
]);

const buildChapters = (): Chapter[] =>
  sourceChapterSpecs.map(([title], chapterIndex) => {
    const words = sourceWordCatalog.slice(chapterIndex * 7, chapterIndex * 7 + 7).map((item, wordIndex) => ({
      id: `${chapterIndex + 1}-${wordIndex + 1}`,
      word: item[0],
      meaning: item[2],
      definition: item[5],
      partOfSpeech: verbWords.has(item[0]) ? 'verb' : adjectiveWords.has(item[0]) ? 'adjective' : 'noun',
      phonetic: `/${item[0].replace(/[aeiou]/g, 'ə')}/`,
      example: item[3],
      exampleAr: '',
      hint: item[5],
      reviewQuestions: [
        `What does “${item[0]}” mean?`,
        `Which sentence uses “${item[0]}” naturally?`,
      ],
    }));
    const anchor = words[chapterIndex % words.length];
    const chapterPrompts = chapterPromptSpecs[chapterIndex];
    const questions: Question[] = [
      {
        id: `${chapterIndex + 1}-q1`,
        kind: 'choice',
        prompt: `Which word means “${anchor.meaning}”?`,
        choices: [anchor.word, words[(chapterIndex + 1) % 7].word, words[(chapterIndex + 2) % 7].word, words[(chapterIndex + 3) % 7].word],
        answer: 0,
        explanation: `${anchor.word} means ${anchor.meaning}.`,
      },
      {
        id: `${chapterIndex + 1}-q2`,
        kind: 'choice',
        prompt: `Which sentence uses “${words[1].word}” correctly?`,
        choices: [words[1].example, words[2].example, words[3].example, words[4].example],
        answer: 0,
        explanation: `The correct example shows the natural use of “${words[1].word}”.`,
      },
      {
        id: `${chapterIndex + 1}-q3`,
        kind: 'discussion',
        prompt: chapterPrompts.discussion[0],
        explanation: 'Speak for 20–30 seconds. Use at least two words from this chapter.',
        sampleAnswer: `For me, ${chapterPrompts.answer.toLowerCase()}`,
      },
      {
        id: `${chapterIndex + 1}-q4`,
        kind: 'discussion',
        prompt: chapterPrompts.discussion[1],
        explanation: 'Answer in your own words and try to include a new chapter word.',
        sampleAnswer: chapterPrompts.answer,
      },
      {
        id: `${chapterIndex + 1}-q5`,
        kind: 'fill',
        prompt: chapterPrompts.fillIn,
        explanation: 'Complete the sentence with your own idea, then compare it with the sample.',
        sampleAnswer: chapterPrompts.answer,
      },
    ];
    return {
      id: chapterIndex + 1,
      title,
      subtitle: englishChapterSubtitles[chapterIndex],
      words,
      questions,
    };
  });

const chapters = buildChapters();
const initialStore: Store = { viewed: [], quizResults: {}, writing: [], imports: [] };
const storeKey = 'kambley-word-box-store-v1';

function readStore(): Store {
  try {
    const saved = localStorage.getItem(storeKey);
    return saved ? { ...initialStore, ...JSON.parse(saved) } : initialStore;
  } catch {
    return initialStore;
  }
}
function saveStore(next: Store) {
  localStorage.setItem(storeKey, JSON.stringify(next));
}
function allWords() { return chapters.flatMap((chapter) => chapter.words); }
function shuffled<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

const navItems = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/learn', label: 'Learn', icon: GraduationCap },
  { href: '/quiz', label: 'Quiz', icon: Target },
  { href: '/review', label: 'Quick Review', icon: RotateCcw },
  { href: '/writing', label: 'Write a Sentence', icon: PenLine },
  { href: '/progress', label: 'Progress', icon: BarChart3 },
  { href: '/import', label: 'Add Lesson', icon: UploadCloud },
];

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const activeHref = location === '/' ? '/' : `/${location.split('/')[1]}`;
  return (
    <div className="app-shell">
      <aside className="study-sidebar">
        <Link href="/" className="wordmark" data-testid="link-wordmark">
          <span className="wordmark-mark"><BookOpen size={19} /></span>
          <span>
            <span className="wordmark-title">My Word Box</span>
            <span className="wordmark-sub">KAMBLEY / ENGLISH</span>
          </span>
        </Link>
        <p className="nav-label">Study space</p>
        <nav>
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`nav-link ${activeHref === href ? 'active' : ''}`} data-testid={`link-nav-${href.slice(1) || 'home'}`}>
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
          <span className="mobile-title">My Word Box <small>KAMBLEY / ENGLISH</small></span>
          <BookMarked size={19} color="hsl(var(--primary))" />
        </div>
        <nav className="mobile-nav">
          {navItems.map(({ href, label }) => (
            <Link key={href} href={href} className={activeHref === href ? 'active' : ''} data-testid={`link-mobile-${href.slice(1) || 'home'}`}>{label}</Link>
          ))}
        </nav>
        {children}
      </main>
    </div>
  );
}

function useLearningStore() {
  const [store, setStore] = useState<Store>(() => readStore());
  const updateStore = (updater: (current: Store) => Store) => {
    setStore((current) => {
      const next = updater(current);
      saveStore(next);
      return next;
    });
  };
  return { store, updateStore };
}

function Toast({ text }: { text: string }) {
  return <div className="toast-note" role="status" data-testid="status-toast"><CircleCheck size={15} /> {text}</div>;
}

function Dashboard() {
  const { store, updateStore } = useLearningStore();
  const viewed = store.viewed.length;
  const total = allWords().length;
  const percentage = Math.round((viewed / total) * 100);
  const learnedChapters = chapters.filter((chapter) => chapter.words.every((word) => store.viewed.includes(word.id))).length;
  return (
    <div className="content-wrap fade-in">
      <div className="top-row">
        <div>
          <span className="eyebrow">WEEKLY STUDY / 02</span>
          <h1 className="page-title">Your quiet space to make progress.</h1>
          <p className="page-intro">Welcome back. Open the box, take one word, and let it stay with you today.</p>
        </div>
        <Link href="/learn" className="button button-primary" data-testid="button-start-learning"><Play size={15} /> Start a short session</Link>
      </div>
      <div className="stat-grid">
        <div className="card stat-card"><div className="stat-label"><BookOpen size={15} /> Words learned</div><div className="stat-value">{viewed}<span style={{ color: 'hsl(var(--muted-foreground))', fontSize: 14 }}> / {total}</span></div><div className="stat-foot">{percentage}% of the box</div></div>
        <div className="card stat-card"><div className="stat-label"><Flame size={15} /> Sessions this week</div><div className="stat-value">{Math.min(2, Math.ceil(viewed / 7))}</div><div className="stat-foot">Goal: 2 sessions</div></div>
        <div className="card stat-card"><div className="stat-label"><Trophy size={15} /> Chapters complete</div><div className="stat-value">{learnedChapters}<span style={{ color: 'hsl(var(--muted-foreground))', fontSize: 14 }}> / 10</span></div><div className="stat-foot">Slow and steady</div></div>
        <div className="card stat-card"><div className="stat-label"><PenLine size={15} /> Saved sentences</div><div className="stat-value">{store.writing.length}</div><div className="stat-foot">Your voice is growing</div></div>
      </div>
      <div className="dashboard-grid">
        <div>
          <div className="card hero-card">
            <span className="eyebrow">CURRENT CHAPTER / CHAPTER 01</span>
            <h2>Everyday words start with your habits.</h2>
            <p>Seven useful words from everyday life. See the meaning and example, then use each word in your own voice.</p>
            <div className="hero-meta">
              <span className="chip"><Clock3 size={13} /> 12 min</span>
              <span className="chip"><BookOpen size={13} /> <strong>{chapters[0].words.length}</strong> words</span>
              <Link href="/learn?chapter=1" className="button button-primary" data-testid="button-open-current-chapter">Open chapter <ArrowRight size={15} /></Link>
            </div>
          </div>
          <div className="card section-card" style={{ marginTop: 17 }}>
            <div className="section-head"><div><h2 className="section-title">Chapter map</h2><span className="section-caption">Your progress is saved on this device</span></div><span className="eyebrow">{learnedChapters}/10</span></div>
            <div className="chapter-list">
              {chapters.map((chapter) => {
                const done = chapter.words.filter((word) => store.viewed.includes(word.id)).length;
                const completed = done === chapter.words.length;
                const restartChapter = (event: React.MouseEvent<HTMLButtonElement>) => {
                  event.preventDefault();
                  event.stopPropagation();
                  updateStore((current) => {
                    const quizResults = { ...current.quizResults };
                    delete quizResults[chapter.id];
                    return {
                      ...current,
                      viewed: current.viewed.filter((wordId) => !chapter.words.some((word) => word.id === wordId)),
                      quizResults,
                    };
                  });
                };
                return <div key={chapter.id} className={`chapter-row ${completed ? 'complete' : ''}`} data-testid={`chapter-row-${chapter.id}`}>
                  <Link href={`/learn?chapter=${chapter.id}`} className="chapter-row-main" data-testid={`link-chapter-${chapter.id}`}>
                    <span className="chapter-num">{String(chapter.id).padStart(2, '0')}</span>
                    <span className="chapter-info"><span className="chapter-name">{chapter.title}</span><span className="chapter-count">{chapter.subtitle} · {done}/7</span></span>
                    <span className="mini-progress"><i style={{ width: `${(done / 7) * 100}%` }} /></span>
                    {completed ? <span className="chapter-complete-badge">Completed</span> : null}
                    <ChevronRight size={15} color="hsl(var(--muted-foreground))" />
                  </Link>
                  {completed ? <button className="chapter-restart" onClick={restartChapter} data-testid={`button-restart-chapter-${chapter.id}`}><RotateCcw size={13} /> Restart</button> : null}
                </div>;
              })}
            </div>
          </div>
        </div>
        <div className="card section-card">
          <div className="section-head"><div><h2 className="section-title">What do you want to do now?</h2><span className="section-caption">A session for your mood</span></div></div>
          <div className="quick-grid">
            <Link href="/review" className="quick-action" data-testid="link-quick-review"><RotateCcw size={18} /><span>Quick review<small>Retrieve a word from memory</small></span><ArrowRight size={14} style={{ marginInlineStart: 'auto' }} /></Link>
            <Link href="/writing" className="quick-action" data-testid="link-quick-writing"><PenLine size={18} /><span>Write a sentence<small>Turn a word into your voice</small></span><ArrowRight size={14} style={{ marginInlineStart: 'auto' }} /></Link>
            <Link href="/quiz" className="quick-action" data-testid="link-quick-quiz"><Target size={18} /><span>Test yourself<small>Three short questions</small></span><ArrowRight size={14} style={{ marginInlineStart: 'auto' }} /></Link>
          </div>
          <div style={{ marginTop: 27, paddingTop: 19, borderTop: '1px solid hsl(var(--border))' }}>
            <span className="eyebrow">NOTE OF THE DAY</span>
            <p style={{ margin: '11px 0 0', color: 'hsl(var(--muted-foreground))', fontSize: 13, lineHeight: 1.9 }}>You do not need to memorize the whole word today. Notice it, hear it, and try using it once.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LearnPage() {
  const { store, updateStore } = useLearningStore();
  const [, setLocation] = useLocation();
  const chapterNumber = Number(new URLSearchParams(window.location.search).get('chapter') || '1');
  const chapter = chapters[Math.min(Math.max(chapterNumber - 1, 0), chapters.length - 1)];
  const [index, setIndex] = useState(0);
  const [showExample, setShowExample] = useState(false);
  const word = chapter.words[index];
  const viewedCount = chapter.words.filter((item) => store.viewed.includes(item.id)).length;
  const isChapterComplete = viewedCount === chapter.words.length;

  useEffect(() => {
    setIndex(0);
    setShowExample(false);
  }, [chapter.id]);
  const markViewed = () => {
    updateStore((current) => current.viewed.includes(word.id) ? current : { ...current, viewed: [...current.viewed, word.id] });
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
          <div><span className="eyebrow">CHAPTER {String(chapter.id).padStart(2, '0')} / WORD {index + 1}</span><h1 className="page-title">{chapter.title}</h1><p className="page-intro">{chapter.subtitle}</p></div>
          <div className="lesson-header-actions">
            <select className="chapter-select" value={chapter.id} onChange={(event) => setLocation(`/learn?chapter=${event.target.value}`)} aria-label="Choose a chapter" data-testid="select-chapter">
              {chapters.map((item) => <option key={item.id} value={item.id}>{String(item.id).padStart(2, '0')} · {item.title}</option>)}
            </select>
            <Link href="/" className="button button-ghost" data-testid="button-back-dashboard"><ArrowLeft size={15} /> Back to dashboard</Link>
          </div>
        </div>
        <div className="lesson-progress"><i style={{ width: `${((index + 1) / chapter.words.length) * 100}%` }} /></div>
        <div className="card word-card">
          <span className="word-kicker">WORD {String(index + 1).padStart(2, '0')} / {String(chapter.words.length).padStart(2, '0')}</span>
          <h2 className="word-title" data-testid={`text-word-${word.id}`}>{word.word}</h2>
          <span className="word-phonetic">{word.phonetic}</span>
           <span className="word-pos">{word.partOfSpeech}</span>
           <div className="meaning-label">English meaning</div>
          <p className="meaning" data-testid={`text-meaning-${word.id}`}>{word.meaning}</p>
             <div className="definition-box" data-testid={`text-definition-${word.id}`}>
               <span>Simple English definition</span>
             <p>{word.definition}</p>
           </div>
           {showExample ? <div className="example-box fade-in"><p>{word.example}</p></div> : <div className="locked-note" style={{ marginTop: 25 }}><Lightbulb size={16} color="hsl(var(--primary))" /> See the example before moving to the next word.</div>}
          <div className="lesson-actions">
             <button className="button button-ghost" onClick={() => { setIndex((current) => Math.max(0, current - 1)); setShowExample(true); }} disabled={index === 0} data-testid="button-previous-word"><ChevronLeft size={15} /> Previous</button>
              {!showExample ? <button className="button button-primary" onClick={() => { markViewed(); setShowExample(true); }} data-testid="button-show-example">See the example <ArrowRight size={15} /></button> : index < chapter.words.length - 1 ? <button className="button button-primary" onClick={advance} data-testid="button-next-word">Next <ArrowRight size={15} /></button> : <button className="button button-primary" onClick={() => { markViewed(); setLocation(`/quiz?chapter=${chapter.id}`); }} data-testid="button-chapter-quiz" disabled={!isChapterComplete && viewedCount < chapter.words.length - 1}>Go to chapter quiz <ArrowRight size={15} /></button>}
          </div>
        </div>
         <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, color: 'hsl(var(--muted-foreground))', fontSize: 11 }}><span>{viewedCount} of 7 words seen</span><span>{isChapterComplete ? 'Chapter ready for the quiz' : 'The definition and example build memory'}</span></div>
      </div>
    </div>
  );
}

function QuizPage() {
  const { store, updateStore } = useLearningStore();
  const [, setLocation] = useLocation();
  const chapterNumber = Number(new URLSearchParams(window.location.search).get('chapter') || '1');
  const chapter = chapters[Math.min(Math.max(chapterNumber - 1, 0), chapters.length - 1)];
  const unlocked = chapter.words.every((word) => store.viewed.includes(word.id));
  const questions = useMemo(() => shuffled(chapter.questions), [chapter.id]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [response, setResponse] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const question = questions[questionIndex];

  useEffect(() => {
    setQuestionIndex(0);
    setSelected(null);
    setResponse('');
    setRevealed(false);
    setScore(0);
    setFinished(false);
  }, [chapter.id]);

  const submitChoice = (choice: number) => {
    if (selected !== null) return;
    setSelected(choice);
    if (choice === question.answer) setScore((current) => current + 1);
  };

  const nextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((current) => current + 1);
      setSelected(null);
      setResponse('');
      setRevealed(false);
    } else {
      const finalScore = score;
      updateStore((current) => ({ ...current, quizResults: { ...current.quizResults, [chapter.id]: finalScore } }));
      setFinished(true);
    }
  };
  if (!unlocked) return <div className="content-wrap fade-in"><div className="quiz-layout"><div className="top-row"><div><span className="eyebrow">QUIZ / LOCKED</span><h1 className="page-title">The quiz is waiting.</h1><p className="page-intro">See the definition and example for all seven words, then come back when you are ready.</p></div></div><div className="card empty-state"><LockKeyhole size={30} /><p>This chapter is not unlocked for the quiz yet.</p><Link href={`/learn?chapter=${chapter.id}`} className="button button-primary" data-testid="button-unlock-quiz">Continue learning <ArrowRight size={15} /></Link></div></div></div>;
  if (finished) return <div className="content-wrap fade-in"><div className="quiz-layout"><div className="card empty-state" style={{ padding: 55 }}><Trophy size={42} /><span className="eyebrow">CHAPTER COMPLETE</span><h1 className="page-title" style={{ marginTop: 13 }}>Nice work, you finished the chapter.</h1><p className="page-intro">You scored {score} choice questions correctly. Keep speaking to make the words yours.</p><div className="card" style={{ padding: 17, margin: '22px auto 0', maxWidth: 520, textAlign: 'start', background: 'hsl(var(--muted) / .3)', boxShadow: 'none' }}><span className="eyebrow">SPEAKING PRACTICE</span>{chapter.questions.filter((item) => item.kind !== 'choice').map((item) => <div key={item.id} style={{ marginTop: 12 }}><p style={{ margin: 0, fontSize: 13, lineHeight: 1.7 }}>{item.prompt}</p><p style={{ margin: '5px 0 0', color: 'hsl(var(--secondary-foreground))', fontSize: 12 }}>{item.sampleAnswer}</p></div>)}</div><div style={{ display: 'flex', justifyContent: 'center', gap: 9, marginTop: 23 }}><button className="button button-ghost" onClick={() => { setFinished(false); setQuestionIndex(0); setSelected(null); setResponse(''); setRevealed(false); setScore(0); }} data-testid="button-retry-quiz"><RotateCcw size={15} /> Retry quiz</button><Link href="/review" className="button button-primary" data-testid="button-after-quiz">Review words <ArrowRight size={15} /></Link></div></div></div></div>;
  const isChoiceQuestion = question.kind === 'choice';
  const canContinue = isChoiceQuestion ? selected !== null : revealed;
  return <div className="content-wrap fade-in"><div className="quiz-layout"><div className="top-row"><div><span className="eyebrow">CHAPTER {String(chapter.id).padStart(2, '0')} / CHECK-IN</span><h1 className="page-title">Practice this chapter.</h1><p className="page-intro">{chapter.title} · Question {questionIndex + 1} of {questions.length}</p></div><Link href={`/learn?chapter=${chapter.id}`} className="button button-ghost" data-testid="button-return-lesson"><ArrowLeft size={15} /> Lesson</Link></div><div className="lesson-progress"><i style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div><div className="card question-card"><span className="question-number">{question.kind === 'discussion' ? 'SPEAKING QUESTION' : question.kind === 'fill' ? 'FILL IN THE BLANK' : `QUESTION ${String(questionIndex + 1).padStart(2, '0')}`}</span><h2 className="question-text">{question.prompt}</h2>{isChoiceQuestion ? <div className="choices">{(question.choices ?? []).map((choice, index) => <button key={choice} className={`choice ${selected !== null && index === question.answer ? 'correct' : ''} ${selected === index && index !== question.answer ? 'wrong' : ''}`} onClick={() => submitChoice(index)} disabled={selected !== null} data-testid={`button-choice-${questionIndex}-${index}`}><span className="choice-letter">{String.fromCharCode(65 + index)}</span>{choice}{selected !== null && index === question.answer ? <Check size={16} style={{ marginInlineStart: 'auto' }} /> : null}{selected === index && index !== question.answer ? <X size={16} style={{ marginInlineStart: 'auto' }} /> : null}</button>)}</div> : <textarea className="text-input" value={response} onChange={(event) => { setResponse(event.target.value); setRevealed(false); }} placeholder={question.kind === 'fill' ? 'Complete the sentence...' : 'Write a short answer or prepare to say it aloud...'} data-testid="input-chapter-response" />}{isChoiceQuestion && selected !== null && <div className={`feedback ${selected === question.answer ? 'good' : 'bad'}`}><strong>{selected === question.answer ? 'Good answer.' : 'Not this time.'}</strong> {question.explanation}</div>}{!isChoiceQuestion && revealed && <div className="feedback good"><strong>Sample answer:</strong> {question.sampleAnswer} <br />{question.explanation}</div>}{!isChoiceQuestion && !revealed && <button className="button button-ghost" style={{ marginTop: 18, width: '100%' }} onClick={() => setRevealed(true)} disabled={!response.trim()} data-testid="button-reveal-chapter-answer">Show sample answer</button>}{canContinue && <button className="button button-primary" style={{ marginTop: 18, width: '100%' }} onClick={nextQuestion} data-testid="button-next-question">{questionIndex === questions.length - 1 ? 'Show result' : 'Next question'} <ArrowRight size={15} /></button>}</div></div></div>;
}

function ReviewPage() {
  const { store, updateStore } = useLearningStore();
  const learnedWords = useMemo(() => allWords().filter((word) => store.viewed.includes(word.id)), [store.viewed]);
  const [round, setRound] = useState(0);
  const [hintVisible, setHintVisible] = useState(false);
  const [answered, setAnswered] = useState(false);
  const word = learnedWords.length ? learnedWords[round % learnedWords.length] : null;
  useEffect(() => { setHintVisible(false); setAnswered(false); }, [round, store.viewed.length]);
  if (!word) return <div className="content-wrap fade-in"><div className="review-card"><div className="top-row"><div><span className="eyebrow">REVIEW / MEMORY</span><h1 className="page-title">Review comes after the first encounter.</h1><p className="page-intro">Learn your first word and it will appear here automatically for review.</p></div></div><div className="card empty-state"><RotateCcw size={32} /><p>No previous words yet.</p><Link href="/learn" className="button button-primary" data-testid="button-review-start-learning">Go to the first lesson <ArrowRight size={15} /></Link></div></div></div>;
  return <div className="content-wrap fade-in"><div className="review-card"><div className="top-row"><div><span className="eyebrow">REVIEW / MEMORY</span><h1 className="page-title">Pull a word from memory.</h1><p className="page-intro">A random word, followed by questions that belong to that word. Try before you reveal the answer.</p></div><span className="chip"><BookOpen size={13} /> {learnedWords.length} words ready</span></div><div className="card review-prompt"><span className="word-kicker">WORD REVIEW</span><h2 className="word-title">{word.word}</h2><span className="word-phonetic">{word.phonetic} · {word.partOfSpeech}</span><div className="review-question-list">{word.reviewQuestions.map((question, index) => <div className="review-question" key={question}><span>0{index + 1}</span><p>{question}</p></div>)}</div>{hintVisible && <div className="hint-box fade-in"><Lightbulb size={14} /> Hint: {word.hint}</div>}{answered && <div className="feedback good" style={{ maxWidth: 500, marginInline: 'auto', textAlign: 'left' }}><strong>Meaning:</strong> {word.meaning}<br /><strong>Definition:</strong> {word.definition}<br /><strong>Example:</strong> {word.example}</div>}<div className="review-answer">{!hintVisible && !answered && <button className="button button-ghost" onClick={() => setHintVisible(true)} data-testid="button-show-review-hint"><Lightbulb size={15} /> I need a hint</button>}{hintVisible && !answered && <button className="button button-ghost" onClick={() => setHintVisible(false)} data-testid="button-cancel-review-hint"><X size={15} /> Cancel hint</button>}{!answered && <button className="button button-primary" onClick={() => { setAnswered(true); updateStore((current) => current); }} data-testid="button-reveal-review-answer">Show answers <ArrowRight size={15} /></button>}{answered && <button className="button button-primary" onClick={() => setRound((current) => current + 1)} data-testid="button-next-review">Another word <ArrowRight size={15} /></button>}</div></div></div></div>;
}

function WritingPage() {
  const { store, updateStore } = useLearningStore();
  const learnedWords = useMemo(() => allWords().filter((word) => store.viewed.includes(word.id)), [store.viewed]);
  const [round, setRound] = useState(0);
  const [sentence, setSentence] = useState('');
  const [hintVisible, setHintVisible] = useState(false);
  const [saved, setSaved] = useState(false);
  const word = (learnedWords.length ? learnedWords : allWords())[round % (learnedWords.length || allWords().length)];
  const saveSentence = () => {
    if (!sentence.trim()) return;
    const entry: WritingEntry = { id: `${Date.now()}`, word: word.word, sentence: sentence.trim(), date: new Date().toLocaleDateString('en-US') };
    updateStore((current) => ({ ...current, writing: [entry, ...current.writing].slice(0, 20) }));
    setSaved(true);
  };
  const next = () => { setRound((current) => current + 1); setSentence(''); setHintVisible(false); setSaved(false); };
  return <div className="content-wrap fade-in"><div className="top-row"><div><span className="eyebrow">WRITING / YOUR VOICE</span><h1 className="page-title">Put the word in a sentence.</h1><p className="page-intro">A sentence from your life lasts longer than a definition you memorize.</p></div><span className="chip"><PenLine size={13} /> {store.writing.length} saved</span></div><div className="writing-grid"><div className="card writing-card"><span className="word-kicker">Write an English sentence using</span><div className="writing-prompt"><small>YOUR WORD</small><strong>{word.word}</strong><em>{word.meaning}</em></div>{hintVisible && <div className="hint-box fade-in" style={{ margin: '0 0 13px', maxWidth: 'none' }}><Lightbulb size={14} /> Hint: {word.hint}</div>}<textarea className="text-input" value={sentence} onChange={(event) => { setSentence(event.target.value); setSaved(false); }} placeholder="Write a sentence from your own life..." dir="ltr" data-testid="input-writing-sentence" />{saved && <div className="feedback good"><strong>Your sentence was saved.</strong> Come back later, or try a new word.</div>}<div className="lesson-actions" style={{ marginTop: 14 }}>{!hintVisible && !saved && <button className="button button-ghost" onClick={() => setHintVisible(true)} data-testid="button-show-writing-hint"><Lightbulb size={15} /> Hint</button>}{hintVisible && !saved && <button className="button button-ghost" onClick={() => setHintVisible(false)} data-testid="button-cancel-writing-hint"><X size={15} /> Cancel hint</button>}{!saved ? <button className="button button-primary" onClick={saveSentence} disabled={!sentence.trim()} data-testid="button-save-sentence"><Check size={15} /> Save sentence</button> : <button className="button button-primary" onClick={next} data-testid="button-next-writing-word">New word <ArrowRight size={15} /></button>}</div></div><div className="card section-card"><div className="section-head"><div><h2 className="section-title">Sentence notebook</h2><span className="section-caption">Your latest writing</span></div></div>{store.writing.length ? <div className="history-list">{store.writing.slice(0, 5).map((entry) => <div key={entry.id} className="history-item" data-testid={`item-sentence-${entry.id}`}><strong>{entry.word}</strong><p>{entry.sentence}</p><small style={{ color: 'hsl(var(--muted-foreground))', fontSize: 9 }}>{entry.date}</small></div>)}</div> : <div className="empty-state" style={{ padding: '20px 6px' }}><PenLine size={24} /><p>Your sentences will appear here.</p></div>}</div></div></div>;
}

function ProgressPage() {
  const { store } = useLearningStore();
  const total = allWords().length;
  const bars = chapters.map((chapter) => chapter.words.filter((word) => store.viewed.includes(word.id)).length);
  const difficult = allWords().filter((word) => store.viewed.includes(word.id)).slice().reverse().slice(0, 5);
  return <div className="content-wrap fade-in"><div className="top-row"><div><span className="eyebrow">PROGRESS / A QUIET RECORD</span><h1 className="page-title">Your steps, recorded.</h1><p className="page-intro">We do not measure speed. We keep what you revisit and what becomes yours.</p></div><span className="chip"><BarChart3 size={13} /> {Math.round((store.viewed.length / total) * 100)}% complete</span></div><div className="analytics-grid"><div className="card chart-card"><div className="section-head"><div><h2 className="section-title">Words across chapters</h2><span className="section-caption">Each bar represents one chapter</span></div><span className="eyebrow">{store.viewed.length}/{total}</span></div><div className="bars">{bars.map((value, index) => <div className="bar-col" key={index}><i className="bar-value" style={{ height: `${Math.max(4, (value / 7) * 100)}%` }} /><span>{String(index + 1).padStart(2, '0')}</span></div>)}</div></div><div className="card chart-card"><div className="section-head"><div><h2 className="section-title">Words to revisit</h2><span className="section-caption">The latest words you met</span></div><RotateCcw size={17} color="hsl(var(--primary))" /></div>{difficult.length ? <div className="difficult-list">{difficult.map((word, index) => <div className="difficult-row" key={word.id}><span className="difficult-rank">0{index + 1}</span><div><strong>{word.word}</strong><small>{word.meaning}</small></div><Link href="/review" className="button button-ghost" style={{ minHeight: 30, padding: '0 9px', marginInlineStart: 'auto' }} data-testid={`button-review-word-${word.id}`}>Review</Link></div>)}</div> : <div className="empty-state"><BarChart3 size={27} /><p>Start learning to see your map here.</p></div>}</div></div><div className="card section-card" style={{ marginTop: 17 }}><div className="section-head"><div><h2 className="section-title">A small reminder</h2><span className="section-caption">Learning is not a constant exam</span></div></div><p style={{ color: 'hsl(var(--muted-foreground))', margin: 0, fontSize: 13, lineHeight: 1.9 }}>Forgetting a word is not going backward. Returning to it is part of the path.</p></div></div>;
}

function ImportPage() {
  const { store, updateStore } = useLearningStore();
  const [toast, setToast] = useState('');
  const onFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const entry: ImportEntry = { name: file.name, size: `${Math.max(1, Math.round(file.size / 1024))} KB`, addedAt: new Date().toLocaleDateString('en-US') };
    updateStore((current) => ({ ...current, imports: [entry, ...current.imports].slice(0, 8) }));
    setToast('File information added to your box');
    window.setTimeout(() => setToast(''), 2800);
  };
  return <div className="content-wrap fade-in"><div className="top-row"><div><span className="eyebrow">IMPORT / YOUR MATERIAL</span><h1 className="page-title">Add a lesson from your library.</h1><p className="page-intro">A quiet place for materials from your lessons. This version saves file metadata only and does not claim to read its content.</p></div></div><div className="card import-card"><div className="drop-zone"><div className="drop-icon"><UploadCloud size={25} /></div><h2>Upload PDF or DOCX</h2><p>Choose a file to add its name and size to your lesson log. Word analysis will come in a later step.</p><label className="button button-primary" htmlFor="lesson-file" data-testid="button-choose-file"><UploadCloud size={15} /> Choose file</label><input className="file-input" id="lesson-file" type="file" accept=".pdf,.docx" onChange={onFile} data-testid="input-lesson-file" /></div>{store.imports.length > 0 && <div className="import-list"><div className="section-head"><div><h2 className="section-title">Your added files</h2><span className="section-caption">Saved on this device</span></div><FileText size={17} color="hsl(var(--primary))" /></div>{store.imports.map((item, index) => <div className="import-item" key={`${item.name}-${index}`} data-testid={`item-import-${index}`}><FileText size={17} /><div><strong>{item.name}</strong><small>{item.size} · added on {item.addedAt}</small></div><CircleCheck size={15} color="hsl(var(--accent))" /></div>)}</div>}</div>{toast && <Toast text={toast} />}</div>;
}

function Router() {
  return <RoutedErrorBoundary><Shell><Switch><Route path="/" component={Dashboard} /><Route path="/learn" component={LearnPage} /><Route path="/quiz" component={QuizPage} /><Route path="/review" component={ReviewPage} /><Route path="/writing" component={WritingPage} /><Route path="/progress" component={ProgressPage} /><Route path="/import" component={ImportPage} /><Route component={NotFound} /></Switch></Shell></RoutedErrorBoundary>;
}
function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}
const queryClient = new QueryClient();
function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}
export default App;