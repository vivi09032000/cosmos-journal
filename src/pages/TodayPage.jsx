import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSwipe } from "../hooks/useSwipe";
import { useNavigate } from "react-router-dom";
import { getMoonPhaseInfo } from "../angelEngine";
import {
  LeafDecor,
  SunRays,
  Tag,
  WaveDivider,
} from "../components/CosmosDecor";

import OrderCoverArt from "../components/OrderCoverArt";
import { useI18n } from "../lib/i18n";
import { getActionProgress } from "../lib/orderActions";
import { daysSince, getOrderTheme, getOrderStatusLabel } from "../lib/orderTheme";
import dayjs from "dayjs";

const calculateGoalStats = (order) => {
  const validJournal = order.journal || [];
  const thirtyDaysAgo = dayjs().subtract(30, 'day').startOf('day');
  
  const getEntryDate = (j) => {
    if (!j) return Date.now();
    if (j.recordedAt?.toDate) return j.recordedAt.toDate();
    if (j.recordedAt?.seconds) return j.recordedAt.seconds * 1000;
    if (j.createdAt?.toDate) return j.createdAt.toDate();
    return j.date || j;
  };
  
  const recentEntries = validJournal.filter(j => dayjs(getEntryDate(j)).isAfter(thirtyDaysAgo));
  const uniqueRecentDates = new Set(recentEntries.map(j => dayjs(getEntryDate(j)).startOf('day').valueOf()));
  const recentCount = uniqueRecentDates.size;
  
  const uniqueDates = [...new Set(validJournal.map(j => dayjs(getEntryDate(j)).startOf('day').valueOf()))].sort((a,b) => b - a);
  let streak = 0;
  const today = dayjs().startOf('day').valueOf();
  const yesterday = dayjs().subtract(1, 'day').startOf('day').valueOf();
  
  if (uniqueDates.includes(today)) {
    streak = 1;
    let checkDate = yesterday;
    while(uniqueDates.includes(checkDate)) {
      streak++;
      checkDate = dayjs(checkDate).subtract(1, 'day').valueOf();
    }
  } else if (uniqueDates.includes(yesterday)) {
    let checkDate = yesterday;
    while(uniqueDates.includes(checkDate)) {
      streak++;
      checkDate = dayjs(checkDate).subtract(1, 'day').valueOf();
    }
  }
  
  const createdAt = order.createdAt?.toDate ? order.createdAt.toDate() : (order.createdAt || Date.now());
  const dayN = dayjs().startOf('day').diff(dayjs(createdAt).startOf('day'), 'day') + 1;

  return { recentCount, streak, dayN };
};

const MOON_COPY = {
  "zh-TW": {
    new: {
      title: "今天適合種下新的意圖",
      description: "把注意力放回你最想實現的一件事，讓願望有一個清晰起點。",
    },
    waxCrescent: {
      title: "今天適合把願望說得更具體",
      description: "你的能量正在累積，愈清楚的畫面，愈容易被宇宙接住。",
    },
    firstQuarter: {
      title: "今天適合跨過心裡的小阻力",
      description: "有些遲疑不是退步，而是願望成形前必經的對準過程。",
    },
    waxGibbous: {
      title: "今天適合微調，靠近結果",
      description: "距離顯化高峰只差最後一段，把感受再校準一點點。",
    },
    full: {
      title: "今天適合接收與放大顯化",
      description: "滿月把情緒和意圖都照亮了，請打開雙手接住此刻的回應。",
    },
    waneGibbous: {
      title: "今天適合感謝已經開始的流動",
      description: "當你先感謝，豐盛更容易往你靠近，今天適合承認自己的進展。",
    },
    lastQuarter: {
      title: "今天適合清理舊有的卡點",
      description: "把不再適合你的念頭放下，願望才有新的空間長出來。",
    },
    waneCrescent: {
      title: "今天適合安靜蓄能",
      description: "先不用急著衝刺，休息與沉澱也是顯化的一部分。",
    },
  },
  en: {
    new: {
      title: "Today is for planting a new intention",
      description: "Bring your focus back to the one thing you most want to manifest and give it a clear beginning.",
    },
    waxCrescent: {
      title: "Today is for making the desire more specific",
      description: "Your energy is building. The clearer the scene becomes, the easier it is to catch.",
    },
    firstQuarter: {
      title: "Today is for moving through small inner resistance",
      description: "Some hesitation is not regression. It is part of how a desire aligns before it arrives.",
    },
    waxGibbous: {
      title: "Today is for fine-tuning and moving closer",
      description: "You are close to the peak. Small emotional adjustments matter now.",
    },
    full: {
      title: "Today is for receiving and amplifying",
      description: "The full moon brightens both feeling and intention. Stay open enough to receive the response.",
    },
    waneGibbous: {
      title: "Today is for gratitude toward what is already moving",
      description: "When you acknowledge progress first, abundance approaches more easily.",
    },
    lastQuarter: {
      title: "Today is for clearing old friction",
      description: "Release the thoughts that no longer fit so the next form of the wish has room to grow.",
    },
    waneCrescent: {
      title: "Today is for quiet restoration",
      description: "You do not need to push. Rest and stillness are part of manifestation too.",
    },
  },
};

const DAILY_QUESTION_BANK = {
  "zh-TW": [
    "此刻，你最期待發生的一件事是什麼？",
    "如果今天有一個小奇蹟，你希望它長什麼樣子？",
    "現在的你，最需要被安撫的是哪一部分？",
    "今天哪個瞬間最值得你停下來深呼吸？",
    "如果今天有一種顏色，它會是什麼？",
    "你現在最想靠近的感受，是平靜、自由還是喜悅？",
    "今天有哪件小事，已經在默默支持你？",
    "如果把今天想成一段旅程，你現在走到哪裡了？",
    "你心裡最想實現的畫面，今天有沒有更清楚一點？",
    "此刻，你身體哪個部位是完全放鬆的？",
    "你最想為今天留下一句什麼樣的註解？",
    "今天有沒有一個念頭，值得你溫柔地相信？",
    "如果宇宙正在回應你，你希望它提醒你什麼？",
    "哪一個小細節，讓你覺得今天其實很有希望？",
    "如果今天只做一件對自己好的事，那會是什麼？",
    "你今天最想感謝自己的哪一個選擇？",
    "你現在的心，比昨天更接近哪一種狀態？",
    "今天最適合你放慢的，是哪一件事？",
    "此刻的你，最值得被珍惜的是哪個感受？",
    "如果今天的風景是一張照片，主角會是什麼？",
    "你今天最不想辜負的是哪一個願望？",
    "什麼樣的畫面，能讓你馬上想起未來的自己？",
    "今天有沒有一個訊號，在提醒你繼續相信？",
    "如果把今天說成一句短短的咒語，會是什麼？",
    "你今天最渴望被看見的是哪一面？",
    "有哪件事正在變好，只是你還沒完全發現？",
    "如果今天是一封信，你希望宇宙在最後寫什麼？",
    "今天最適合你靠近的，是哪種生活感？",
    "你現在最想把注意力放回哪一件重要的事？",
    "什麼樣的回答，會讓今天的你感到更安心？",
  ],
  en: [
    "What are you most looking forward to right now?",
    "If a small miracle happened today, what would it look like?",
    "What part of you needs the most gentleness today?",
    "Which moment today is worth pausing for one deep breath?",
    "If today had a color, what would it be?",
    "Which feeling do you most want to move closer to right now?",
    "What small thing is already supporting you quietly today?",
    "If today were a journey, where do you feel you are on it?",
    "Has the picture you most want to live become clearer today?",
    "Which part of your body feels completely relaxed right now?",
    "What sentence would you want to leave behind for today?",
    "Is there a thought worth trusting more softly today?",
    "If the universe were answering you now, what would you hope to hear?",
    "What small detail makes today feel more hopeful than it looks?",
    "If you only did one good thing for yourself today, what would it be?",
    "Which choice of yours deserves gratitude today?",
    "What state is your heart closer to than it was yesterday?",
    "What would be best to slow down today?",
    "What feeling in you deserves more care right now?",
    "If today became a photo, what would be at the center of it?",
    "Which wish do you most not want to let down today?",
    "What scene instantly reminds you of your future self?",
    "Is there a signal today telling you to keep trusting?",
    "If today were a short spell, what would it say?",
    "What part of you most wants to be seen today?",
    "What is already getting better, even if you have not named it yet?",
    "If today were a letter, what would you want the universe to write at the end?",
    "What kind of life feeling do you most want to step toward today?",
    "What important thing do you want to return your attention to now?",
    "What answer would make you feel steadier today?",
  ],
};

const MOON_LABELS = {
  new: { "zh-TW": "新月", en: "New Moon" },
  waxCrescent: { "zh-TW": "眉月", en: "Waxing Crescent" },
  firstQuarter: { "zh-TW": "上弦月", en: "First Quarter" },
  waxGibbous: { "zh-TW": "盈凸月", en: "Waxing Gibbous" },
  full: { "zh-TW": "滿月", en: "Full Moon" },
  waneGibbous: { "zh-TW": "虧凸月", en: "Waning Gibbous" },
  lastQuarter: { "zh-TW": "下弦月", en: "Last Quarter" },
  waneCrescent: { "zh-TW": "殘月", en: "Waning Crescent" },
};

const MOOD_OPTIONS = [
  { value: "calm", labels: { "zh-TW": "平靜", en: "Calm" } },
  { value: "hopeful", labels: { "zh-TW": "期待", en: "Hopeful" } },
  { value: "light", labels: { "zh-TW": "輕盈", en: "Light" } },
  { value: "tired", labels: { "zh-TW": "疲憊", en: "Tired" } },
  { value: "anxious", labels: { "zh-TW": "焦慮", en: "Anxious" } },
  { value: "grateful", labels: { "zh-TW": "感謝", en: "Grateful" } },
];

const DAILY_QUESTION_PROMPTS = {
  "zh-TW": [
    { category: "氛圍", question: "今天的節奏感覺像什麼音樂？", chips: ["輕爵士", "Lo-fi", "靜默無聲", "熱血搖滾"] },
    { category: "氛圍", question: "今天最想去哪裡待著？", chips: ["咖啡廳角落", "戶外透透氣", "自己房間", "哪都不想去"] },
    { category: "宇宙", question: "宇宙今天給你的關鍵字是？", chips: ["流動", "沉澱", "發光", "等待"] },
    { category: "宇宙", question: "此刻你想接收還是釋放？", chips: ["接收能量", "釋放煩躁", "兩個都要", "靜靜就好"] },
    { category: "行動", question: "今天適合快還是慢？", chips: ["衝一下", "穩穩來", "先發呆", "走一步算一步"] },
    { category: "行動", question: "今天最想喝什麼？", chips: ["熱咖啡", "冰拿鐵", "花草茶", "白開水就好"] },
    { category: "自我", question: "今天想對自己說什麼？", chips: ["你辛苦了", "繼續加油", "放輕鬆", "你很好"] },
  ],
  en: [
    { category: "氛圍", categoryLabel: "Atmosphere", question: "What music does today feel like?", chips: ["Soft jazz", "Lo-fi", "Quiet silence", "Rock anthem"] },
    { category: "氛圍", categoryLabel: "Atmosphere", question: "Where do you want to be today?", chips: ["Cafe corner", "Fresh air", "My room", "Nowhere"] },
    { category: "宇宙", categoryLabel: "Cosmos", question: "What keyword is the universe giving you?", chips: ["Flow", "Settle", "Glow", "Wait"] },
    { category: "宇宙", categoryLabel: "Cosmos", question: "Do you want to receive or release now?", chips: ["Receive energy", "Release tension", "Both", "Stay quiet"] },
    { category: "行動", categoryLabel: "Action", question: "Does today want speed or slowness?", chips: ["Push a little", "Steady pace", "Zone out first", "One step at a time"] },
    { category: "行動", categoryLabel: "Action", question: "What do you want to drink today?", chips: ["Hot coffee", "Iced latte", "Herbal tea", "Just water"] },
    { category: "自我", categoryLabel: "Self", question: "What do you want to tell yourself today?", chips: ["You worked hard", "Keep going", "Relax", "You are enough"] },
  ],
};

function formatToday(locale) {
  return new Date().toLocaleDateString(locale === "en" ? "en-US" : "zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 44 44" className="h-12 w-12 shrink-0">
      <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(181,120,58,0.2)" strokeWidth="0.5" />
      <path d="M22 6A16 16 0 0 1 22 38A10 16 0 0 1 22 6" fill="#e8c99a" opacity="0.6" />
      <circle cx="22" cy="22" r="14" fill="none" stroke="#b5783a" strokeWidth="0.5" />
      <circle cx="16" cy="18" r="1.5" fill="#b5783a" opacity="0.4" />
      <circle cx="26" cy="26" r="1" fill="#b5783a" opacity="0.3" />
      <line x1="8" y1="22" x2="36" y2="22" stroke="rgba(181,120,58,0.15)" strokeWidth="0.5" />
    </svg>
  );
}

function getMoonRhythm(moonAge, locale) {
  const roundedAge = Math.round(moonAge);
  const daysUntilFull = Math.max(0, Math.round(14.77 - moonAge));
  const daysUntilNew = moonAge <= 14.77
    ? Math.round(29.53 - moonAge)
    : Math.round(29.53 - moonAge);

  return {
    ageLabel: locale === "en" ? `Moon age ${moonAge.toFixed(1)}` : `月齡 ${moonAge.toFixed(1)}`,
    rhythmLabel: locale === "en"
      ? (moonAge <= 14.77 ? `${daysUntilFull} days to full moon` : `${Math.max(0, daysUntilNew)} days to new moon`)
      : (moonAge <= 14.77 ? `距滿月 ${daysUntilFull} 天` : `距新月 ${Math.max(0, daysUntilNew)} 天`),
    shortLabel: `Day ${roundedAge + 1}`,
  };
}

function getDailyQuestion(locale, date = new Date()) {
  const questionBank = DAILY_QUESTION_PROMPTS[locale] || DAILY_QUESTION_PROMPTS["zh-TW"];
  const yearStart = new Date(date.getFullYear(), 0, 0);
  const diffDays = Math.floor((date - yearStart) / (1000 * 60 * 60 * 24));
  const index = ((diffDays % questionBank.length) + questionBank.length) % questionBank.length;
  return { ...questionBank[index], index };
}

function getDailyQuestions(locale) {
  return DAILY_QUESTION_PROMPTS[locale] || DAILY_QUESTION_PROMPTS["zh-TW"];
}

function RitualBackCard({ id, label, status, offset, onClick }) {
  const isDone = status.startsWith("✓");
  const icons = { mood: "☁", question: "✎", gratitude: "♡" };
  const doneIcons = { mood: "☁", question: "✎", gratitude: "♥" };
  const icon = isDone ? doneIcons[id] : icons[id];

  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute inset-x-3 top-0 h-[18.5rem] overflow-hidden rounded-[1.35rem] border border-[rgba(181,120,58,0.22)] bg-[linear-gradient(135deg,rgba(250,246,240,0.96),rgba(240,232,220,0.9))] text-left shadow-[0_10px_30px_rgba(46,35,24,0.08)] transition hover:-translate-y-0.5"
      style={{
        transform: `translateY(${offset}px) scale(${1 - offset * 0.001})`,
        zIndex: 10 - Math.floor(offset / 32),
      }}
    >
      <div className="absolute inset-x-0 bottom-0 flex h-[3.2rem] items-center justify-between px-5 text-sm font-semibold tracking-[0.12em] text-[color:var(--ink-soft)]">
        <div className="flex items-center gap-2">
          <span className={`text-[1.1rem] ${isDone ? "text-[color:var(--gold)]" : "text-[color:var(--ink-faint)]"}`}>
            {icon}
          </span>
          <span className="font-display text-[0.95rem] tracking-[0.08em] text-[color:var(--ink-soft)]">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {!isDone && status && <span className="h-2.5 w-2.5 rounded-full border border-[rgba(181,120,58,0.3)]" />}
          {status && (
            <span className={`text-[0.65rem] tracking-[0.12em] ${isDone ? "text-[color:var(--gold)]" : "text-[color:var(--ink-faint)]"}`}>
              {status}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function RitualDots({ items, activeId, onSelect }) {
  return (
    <div className="mt-5 flex items-center justify-center gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          aria-label={item.label}
          className={`h-2.5 rounded-full transition-all duration-300 ${
            item.id === activeId
              ? "w-6 bg-[color:var(--gold)]"
              : "w-2.5 bg-[rgba(181,120,58,0.28)] hover:bg-[rgba(181,120,58,0.45)]"
          }`}
        />
      ))}
    </div>
  );
}

export default function TodayPage({
  orders,
  todayEntry,
  dailyLogEntry,
  onSaveDailyMood,
  onSaveQuestionAnswer,
  onCreateAngelLog,
  onSaveNumberSignal,
  userId,
}) {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const moonPhase = useMemo(() => getMoonPhaseInfo(new Date()), []);
  const moonCopyMap = MOON_COPY[locale] || MOON_COPY["zh-TW"];
  const moonCopy = moonCopyMap[moonPhase.phase] || moonCopyMap.new;
  const moonLabel = MOON_LABELS[moonPhase.phase]?.[locale] || moonPhase.label;
  const moonRhythm = useMemo(() => getMoonRhythm(moonPhase.moonAge, locale), [locale, moonPhase.moonAge]);
  const activeOrders = useMemo(
    () => orders.filter((order) => order.status !== "delivered"),
    [orders],
  );
  const deliveredCount = useMemo(
    () => orders.filter((order) => order.status === "delivered").length,
    [orders],
  );
  const gratitudeItems = [todayEntry?.item1, todayEntry?.item2, todayEntry?.item3].filter(Boolean);
  const dailyQuestions = useMemo(() => getDailyQuestions(locale), [locale]);
  const defaultDailyQuestion = useMemo(() => getDailyQuestion(locale, new Date()), [locale]);
  const savedQuestionAnswer = dailyLogEntry?.questionAnswer || "";
  const parsedSavedQuestionIndex = Number(dailyLogEntry?.questionIndex ?? dailyLogEntry?.questionId);
  const savedQuestionIndex = Number.isInteger(parsedSavedQuestionIndex)
    ? parsedSavedQuestionIndex
    : (savedQuestionAnswer ? defaultDailyQuestion.index : undefined);
  const savedQuestionNote = dailyLogEntry?.questionNote || "";
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(
    Number.isInteger(savedQuestionIndex) && savedQuestionIndex >= 0 && savedQuestionIndex < dailyQuestions.length
      ? savedQuestionIndex
      : defaultDailyQuestion.index,
  );
  const safeActiveQuestionIndex = activeQuestionIndex >= 0 && activeQuestionIndex < dailyQuestions.length
    ? activeQuestionIndex
    : defaultDailyQuestion.index;
  const activeQuestion = {
    ...dailyQuestions[safeActiveQuestionIndex],
    index: safeActiveQuestionIndex,
  };
  const [questionState, setQuestionState] = useState(savedQuestionAnswer ? "done" : "idle");
  const [selectedQuestionAnswer, setSelectedQuestionAnswer] = useState(savedQuestionAnswer);
  const [questionNote, setQuestionNote] = useState(savedQuestionNote);
  const [questionNoteOpen, setQuestionNoteOpen] = useState(false);
  const [questionSaving, setQuestionSaving] = useState(false);
  const [questionError, setQuestionError] = useState("");
  const questionDoneTimerRef = useRef(null);
  const [moodSaving, setMoodSaving] = useState("");
  const [moodError, setMoodError] = useState("");
  const getDefaultRitual = () => {
    if (!dailyLogEntry?.mood) return "mood";
    if (!savedQuestionAnswer) return "question";
    if (!todayEntry) return "gratitude";
    return "mood";
  };
  const [activeRitual, setActiveRitual] = useState(getDefaultRitual);
  const [ritualAnimState, setRitualAnimState] = useState("idle"); // 'idle' | 'exiting' | 'entering'
  const ritualAnimTimerRef = useRef(null);
  const [activeOrderIndex, setActiveOrderIndex] = useState(0);
  const activeOrder = activeOrders[activeOrderIndex] || activeOrders[0] || null;
  const activeOrderTheme = activeOrder ? getOrderTheme(activeOrder) : null;
  const ritualProgress = [
    dailyLogEntry?.mood,
    savedQuestionAnswer,
    todayEntry,
  ].filter(Boolean).length;
  const autoAdvanceTimerRef = useRef(null);


  const copy = locale === "en"
    ? {
      title: "What is the universe saying today?",
      moodTitle: "How are you arriving today?",
      moodHint: "",
      moodSaved: "Saved",
      moodError: "Mood could not be saved. Please try again.",
      moonCard: "Moon phase",
      projectionTag: "Today's projection",
      noOrderTitle: "There is no goal to move today",
      noOrderDescription: "Create a new manifest goal and tell the universe what you want most right now.",
      goOrders: "Go to goals",
      dailyQuestion: "Daily question",
      questionHint: "Tap once. You can add one short note after.",
      recordedAnswer: "Logged",
      addQuestionNote: "Add one short note?",
      hideQuestionNote: "Hide note",
      questionNotePlaceholder: "For example: I am still holding up today...",
      questionError: "Daily question could not be saved. Please try again.",
      ritualTitle: "Daily rituals to complete",
      ritualProgress: (count) => `${count}/3 logged`,
      moodCardTitle: "Mood check-in",
      questionCardTitle: "Daily question",
      gratitudeCardTitle: "Gratitude",
      complete: "Logged",
      pending: "",
      skipRitual: "See another ritual →",
      goalStackTitle: "Today's projection",
      achievedBanner: (count) => `You have manifested ${count} wish${count === 1 ? "" : "es"} →`,
      gratitude: "Today's gratitude",
      recorded: "✓ Logged",
      notLogged: "What tiny moment is worth thanking today?",
      goGratitude: "Write three small things →",
      projectToday: "✦ Project today",
      moonProgressPrefix: (label) => `${label} energy is supporting this goal today. It is a good day to project once more.`,
      angelLink: "✦ Seeing a number today? Decode it →",
      day: "Day",
    }
    : {
      title: "今天宇宙說什麼？",
      moodTitle: "今天的你，是什麼狀態？",
      moodHint: "",
      moodSaved: "已記錄",
      moodError: "心情儲存失敗，請再試一次。",
      moonCard: "今日月相",
      projectionTag: "今日投射",
      noOrderTitle: "今天還沒有可以推進的目標",
      noOrderDescription: "建立一個新的顯化目標，讓宇宙知道你此刻最想實現的是什麼。",
      goOrders: "前往目標",
      dailyQuestion: "今日一問",
      questionHint: "點一下就完成，想說更多再補一句。",
      recordedAnswer: "已記錄",
      addQuestionNote: "想補充一句話？",
      hideQuestionNote: "收起補充",
      questionNotePlaceholder: "例如：今天還算撐得住...",
      questionError: "今日一問儲存失敗，請再試一次。",
      ritualTitle: "今日待完成的儀式",
      ritualProgress: (count) => `${count}/3 已記錄`,
      moodCardTitle: "心情紀錄",
      questionCardTitle: "今日一問",
      gratitudeCardTitle: "今日感恩",
      complete: "已記錄",
      pending: "",
      skipRitual: "先看下一張 →",
      goalStackTitle: "今日投射",
      achievedBanner: (count) => `你已實現了 ${count} 個願望 →`,
      gratitude: "今日感恩",
      recorded: "✓ 已記錄",
      notLogged: "今天有哪個小瞬間，值得被謝謝？",
      goGratitude: "寫三件小事 →",
      projectToday: "✦ 今日投射",
      moonProgressPrefix: (label) => `${label}的能量正在推著這個目標往前，很適合今天再投射一次。`,
      angelLink: "✦ 今天看到什麼數字？查看天使訊號 →",
      day: "第",
    };

  useEffect(() => {
    setSelectedQuestionAnswer(savedQuestionAnswer);
    setQuestionNote(savedQuestionNote);
    if (questionState !== "selected") {
      setQuestionState(savedQuestionAnswer ? "done" : "idle");
      setQuestionNoteOpen(false);
      setActiveQuestionIndex(
        Number.isInteger(savedQuestionIndex) && savedQuestionIndex >= 0 && savedQuestionIndex < dailyQuestions.length
          ? savedQuestionIndex
          : defaultDailyQuestion.index,
      );
    }
  }, [dailyQuestions.length, defaultDailyQuestion.index, savedQuestionAnswer, savedQuestionIndex, savedQuestionNote]);

  useEffect(() => () => {
    if (questionDoneTimerRef.current) {
      window.clearTimeout(questionDoneTimerRef.current);
    }
  }, []);

  useEffect(() => {
    setActiveOrderIndex((index) => {
      if (!activeOrders.length) return 0;
      return Math.min(index, activeOrders.length - 1);
    });
  }, [activeOrders.length]);

  const handleSelectQuestionAnswer = async (answer) => {
    if (!onSaveQuestionAnswer || questionSaving) return;

    if (questionDoneTimerRef.current) {
      window.clearTimeout(questionDoneTimerRef.current);
    }

    setSelectedQuestionAnswer(answer);
    setQuestionNoteOpen(false);
    setQuestionState("selected");
    setQuestionSaving(true);
    setQuestionError("");

    try {
      await onSaveQuestionAnswer(
        activeQuestion.index,
        activeQuestion.question,
        answer,
        questionNote.trim() || null,
        activeQuestion.category,
      );
      questionDoneTimerRef.current = window.setTimeout(() => {
        setQuestionState("done");
        setQuestionSaving(false);
      }, 400);
    } catch (err) {
      console.error("Save question error:", err);
      setQuestionError(err.message || copy.questionError);
      setQuestionState(savedQuestionAnswer ? "done" : "idle");
      setSelectedQuestionAnswer(savedQuestionAnswer);
      setQuestionSaving(false);
    }
  };

  const saveQuestionNote = async (nextNote = questionNote) => {
    if (!onSaveQuestionAnswer || !selectedQuestionAnswer) return;

    try {
      await onSaveQuestionAnswer(
        activeQuestion.index,
        activeQuestion.question,
        selectedQuestionAnswer,
        nextNote.trim() || null,
        activeQuestion.category,
      );
      setQuestionError("");
    } catch (err) {
      console.error("Save question note error:", err);
      setQuestionError(err.message || copy.questionError);
    }
  };

  const toggleQuestionNote = async () => {
    if (questionNoteOpen) {
      await saveQuestionNote();
    }
    setQuestionNoteOpen((open) => !open);
  };

  const handleQuestionDotSelect = (index) => {
    if (questionSaving || index === safeActiveQuestionIndex) return;

    if (questionDoneTimerRef.current) {
      window.clearTimeout(questionDoneTimerRef.current);
    }

    const isSavedQuestion = savedQuestionAnswer
      && (Number.isInteger(savedQuestionIndex) ? savedQuestionIndex === index : index === safeActiveQuestionIndex);

    setActiveQuestionIndex(index);
    setQuestionNoteOpen(false);
    setQuestionError("");

    if (isSavedQuestion) {
      setSelectedQuestionAnswer(savedQuestionAnswer);
      setQuestionNote(savedQuestionNote);
      setQuestionState("done");
    } else {
      setSelectedQuestionAnswer("");
      setQuestionNote("");
      setQuestionState("idle");
    }
  };

  const handleMoodSelect = async (mood) => {
    if (!onSaveDailyMood || moodSaving) return;

    setMoodSaving(mood);
    setMoodError("");

    try {
      await onSaveDailyMood(mood);
    } catch (error) {
      setMoodError(error.message || copy.moodError);
    } finally {
      setMoodSaving("");
    }
  };

  const ritualItems = [
    {
      id: "mood",
      label: copy.moodCardTitle,
      status: dailyLogEntry?.mood ? `✓ ${copy.complete}` : copy.pending,
    },
    {
      id: "question",
      label: copy.questionCardTitle,
      status: savedQuestionAnswer ? `✓ ${copy.complete}` : copy.pending,
    },
    {
      id: "gratitude",
      label: copy.gratitudeCardTitle,
      status: todayEntry ? `✓ ${copy.complete}` : copy.pending,
    },
  ];
  const backRituals = ritualItems.filter((item) => item.id !== activeRitual);
  const maxBackCards = 4;
  const numBackCards = Math.min(Math.max(activeOrders.length - 1, 0), maxBackCards);
  const totalBackCards = Math.max(1, numBackCards);
  const displayedOrders = [];
  
  if (activeOrder) {
    displayedOrders.push({
      order: activeOrder,
      isActive: true,
      offsetIndex: 0,
      totalBackCards
    });
  }
  
  if (activeOrders.length > 1) {
    for (let i = numBackCards; i >= 1; i--) {
      displayedOrders.push({
        order: activeOrders[(activeOrderIndex + i) % activeOrders.length],
        isActive: false,
        offsetIndex: i,
        totalBackCards
      });
    }
  }
  const switchRitual = useCallback((nextId) => {
    if (ritualAnimTimerRef.current) window.clearTimeout(ritualAnimTimerRef.current);
    setRitualAnimState("exiting");
    ritualAnimTimerRef.current = window.setTimeout(() => {
      setActiveRitual(nextId);
      setRitualAnimState("entering");
      ritualAnimTimerRef.current = window.setTimeout(() => {
        setRitualAnimState("idle");
      }, 360);
    }, 220);
  }, []);

  const handleNextRitual = useCallback(() => {
    const currentIndex = ritualItems.findIndex((item) => item.id === activeRitual);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % ritualItems.length : 0;
    switchRitual(ritualItems[nextIndex].id);
  }, [ritualItems, activeRitual, switchRitual]);
  const handlePrevRitual = useCallback(() => {
    const currentIndex = ritualItems.findIndex((item) => item.id === activeRitual);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : ritualItems.length - 1;
    switchRitual(ritualItems[prevIndex].id);
  }, [ritualItems, activeRitual, switchRitual]);
  const openOrderProjection = (order) => {
    navigate("/orders", {
      state: { selectedOrderId: order.id },
    });
  };
  const handleOrderSwipeLeft = useCallback(() => {
    if (activeOrders.length <= 1) return;
    setActiveOrderIndex((i) => (i + 1) % activeOrders.length);
  }, [activeOrders.length]);
  const handleOrderSwipeRight = useCallback(() => {
    if (activeOrders.length <= 1) return;
    setActiveOrderIndex((i) => (i - 1 + activeOrders.length) % activeOrders.length);
  }, [activeOrders.length]);

  // Auto-advance ritual after completing the current one
  const prevMood = useRef(dailyLogEntry?.mood);
  const prevAnswer = useRef(savedQuestionAnswer);
  const prevGratitude = useRef(todayEntry);
  useEffect(() => {
    const moodJustSet = !prevMood.current && dailyLogEntry?.mood;
    const answerJustSet = !prevAnswer.current && savedQuestionAnswer;
    const gratitudeJustSet = !prevGratitude.current && todayEntry;
    prevMood.current = dailyLogEntry?.mood;
    prevAnswer.current = savedQuestionAnswer;
    prevGratitude.current = todayEntry;

    let shouldAdvance = false;
    if (activeRitual === "mood" && moodJustSet) shouldAdvance = true;
    if (activeRitual === "question" && answerJustSet) shouldAdvance = true;
    if (activeRitual === "gratitude" && gratitudeJustSet) shouldAdvance = true;

    if (shouldAdvance) {
      if (autoAdvanceTimerRef.current) window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = window.setTimeout(() => {
        handleNextRitual();
      }, 800);
    }
    return () => {
      if (autoAdvanceTimerRef.current) window.clearTimeout(autoAdvanceTimerRef.current);
    };
  }, [dailyLogEntry?.mood, savedQuestionAnswer, todayEntry, activeRitual, handleNextRitual]);

  // Swipe handlers
  const ritualSwipe = useSwipe({ onSwipeLeft: handleNextRitual, onSwipeRight: handlePrevRitual });
  const orderSwipe = useSwipe({ onSwipeLeft: handleOrderSwipeLeft, onSwipeRight: handleOrderSwipeRight });

  return (
    <div className="today-page">
      <div className="today-first-screen">
      <section className="screen-header today-header">
        <SunRays size={78} className="absolute -right-3 -top-4" />
        <div>
          <p className="gold-kicker">Cosmos Journal</p>
          <h1 className="section-title mt-2 text-[2rem] leading-[1.28]">
            {copy.title}
          </h1>
          <p className="mt-2 text-[0.68rem] tracking-[0.22em] text-[color:var(--ink-faint)]">{formatToday(locale)}</p>
        </div>
        <WaveDivider className="wave-divider" />
      </section>

      <section className="today-moon-card relative overflow-hidden rounded-[1.25rem] bg-[#1a233b] px-6 py-6 text-[#f6ead1] shadow-[0_20px_40px_rgba(15,23,42,0.3)]">
        {/* Deep space starlight texture */}
        <div className="absolute inset-0 opacity-40" style={{ 
          backgroundImage: `
            radial-gradient(circle at 12% 24%, #fff 0.5px, transparent 1px),
            radial-gradient(circle at 32% 18%, #fff 0.5px, transparent 1px),
            radial-gradient(circle at 78% 22%, #fff 0.5px, transparent 1px),
            radial-gradient(circle at 90% 10%, #fff 0.5px, transparent 1px),
            radial-gradient(circle at 45% 65%, #fff 0.5px, transparent 1px),
            radial-gradient(circle at 15% 85%, #fff 0.5px, transparent 1px)
          `,
          backgroundSize: '100% 100%'
        }} />
        
        {/* Subtle glow */}
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-400/5 blur-[60px]" />
        
        <div className="relative flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[rgba(232,201,154,0.15)] bg-[rgba(255,255,255,0.03)] shadow-inner">
            <MoonIcon />
          </div>
          
          <div className="min-w-0 flex-1">
            <p className="text-[0.62rem] font-medium tracking-[0.25em] text-[#8e9bb3] uppercase">
              {copy.moonCard}
            </p>
            <h2 className="mt-1 font-display text-[2.2rem] leading-none text-[#fff3dd]">
              {moonLabel}
            </h2>
            <p className="mt-2 text-[0.82rem] leading-relaxed text-[#b4bdcf] tracking-[0.02em]">
              {moonCopy.title}
            </p>
          </div>
          
          <div className="shrink-0 text-right">
            <p className="font-display text-[2.4rem] leading-none text-[#fff3dd]">
              {moonRhythm.shortLabel.replace("Day ", "")}
            </p>
            <p className="mt-1 text-[0.65rem] font-medium tracking-[0.1em] text-[#8e9bb3]">
              {moonRhythm.shortLabel}
            </p>
            <p className="mt-1 text-[0.6rem] tracking-[0.08em] text-[#6b7a99]">
              {moonRhythm.rhythmLabel}
            </p>
          </div>
        </div>
      </section>

      <section className="today-ritual-section">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[color:var(--gold)]">✦</span>
            <h3 className="section-label !mb-0">{copy.ritualTitle}</h3>
          </div>
          <p className="text-[0.76rem] font-medium tracking-[0.15em] text-[color:var(--ink-faint)]">
            {ritualProgress} / 3
          </p>
        </div>
        <div
          className="today-ritual-stack relative pb-28"
          {...ritualSwipe}
        >
          {backRituals.map((item, index) => (
            <RitualBackCard
              key={item.id}
              id={item.id}
              label={item.label}
              status={item.status}
              offset={(index + 1) * 36}
              onClick={() => switchRitual(item.id)}
            />
          ))}
          <article className={`paper-card today-ritual-card relative z-10 h-[18.5rem] overflow-hidden px-5 py-5 shadow-[0_8px_30px_rgba(46,35,24,0.08)]${ritualAnimState !== "idle" ? ` ritual-${ritualAnimState}` : ""}`}>
            <div className="h-full overflow-y-auto pr-1">
            {activeRitual === "mood" ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="section-label">{copy.moodCardTitle}</p>
                    <h2 className="mt-4 font-display text-[1.75rem] leading-[1.35] text-[color:var(--ink)]">
                      {copy.moodTitle}
                    </h2>
                  </div>
                  {dailyLogEntry?.mood ? (
                    <span className="rounded-full border border-[rgba(181,120,58,0.26)] px-3 py-1 text-[0.68rem] tracking-[0.14em] text-[color:var(--gold)]">
                      ✓ {copy.moodSaved}
                    </span>
                  ) : null}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2 min-[420px]:grid-cols-3">
                  {MOOD_OPTIONS.map((mood) => {
                    const isSelected = dailyLogEntry?.mood === mood.value;
                    return (
                      <button
                        key={mood.value}
                        type="button"
                        onClick={() => handleMoodSelect(mood.value)}
                        disabled={Boolean(moodSaving)}
                        className={`soft-choice-button min-w-0 justify-center ${
                          isSelected ? "soft-choice-button-selected" : ""
                        } ${moodSaving ? "opacity-60" : ""}`}
                      >
                        {moodSaving === mood.value ? "..." : mood.labels[locale] || mood.labels["zh-TW"]}
                      </button>
                    );
                  })}
                </div>
                {moodError ? (
                  <p className="mt-3 text-xs leading-6 text-[color:var(--danger)]">
                    {moodError}
                  </p>
                ) : null}
              </>
            ) : null}

            {activeRitual === "question" ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="section-label">{copy.questionCardTitle}</p>
                    <span className="mt-3 inline-flex rounded-lg bg-[rgba(232,201,154,0.28)] px-2.5 py-1 text-xs font-semibold tracking-[0.08em] text-[color:var(--ink-soft)]">
                      {activeQuestion.categoryLabel || activeQuestion.category}
                    </span>
                  </div>
                  <span className="text-xs tracking-[0.18em] text-[color:var(--ink-faint)]">
                    {activeQuestion.index + 1}/7
                  </span>
                </div>
                <p className="mt-5 font-display text-[1.65rem] leading-[1.45] text-[color:var(--ink)]">
                  {activeQuestion.question}
                </p>
                {questionState === "done" ? (
                  <>
                    <div className="mt-4 rounded-2xl border border-[rgba(181,120,58,0.24)] bg-[rgba(240,232,220,0.6)] px-4 py-3 text-sm font-semibold tracking-[0.08em] text-[color:var(--gold)]">
                      ✓ {copy.recordedAnswer}：{selectedQuestionAnswer}
                    </div>
                    {questionNote ? (
                      <p className="mt-3 text-sm italic leading-7 text-[color:var(--ink-soft)]">
                        「{questionNote}」
                      </p>
                    ) : null}
                  </>
                ) : (
                  <div className="mt-5 flex flex-wrap gap-2.5">
                    {activeQuestion.chips.map((option) => {
                      const isSelected = selectedQuestionAnswer === option && questionState === "selected";
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleSelectQuestionAnswer(option)}
                          disabled={questionSaving}
                          className={`soft-choice-button justify-center transition-all duration-300 ${
                            isSelected ? "soft-choice-button-selected scale-[0.98]" : ""
                          } ${questionSaving && !isSelected ? "opacity-50" : ""}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                )}
                <button
                  type="button"
                  onClick={toggleQuestionNote}
                  className="text-action-button mt-5"
                >
                  {questionNoteOpen ? copy.hideQuestionNote : copy.addQuestionNote}
                </button>
                {questionNoteOpen ? (
                  <textarea
                    value={questionNote}
                    onChange={(event) => setQuestionNote(event.target.value)}
                    onBlur={(event) => saveQuestionNote(event.target.value)}
                    rows={3}
                    className="cosmos-textarea mt-3"
                    placeholder={copy.questionNotePlaceholder}
                  />
                ) : null}
                {questionError ? (
                  <p className="mt-3 text-xs leading-6 text-[color:var(--danger)]">
                    {questionError}
                  </p>
                ) : null}
                <div className="mt-5 flex items-center justify-center gap-2">
                  {dailyQuestions.map((question, index) => {
                    const isActive = index === safeActiveQuestionIndex;
                    return (
                      <button
                        key={`${question.category}-${question.question}`}
                        type="button"
                        onClick={() => handleQuestionDotSelect(index)}
                        disabled={questionSaving}
                        aria-label={`${copy.dailyQuestion} ${index + 1}`}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          isActive
                            ? "w-6 bg-[color:var(--gold)]"
                            : "w-2.5 bg-[rgba(181,120,58,0.28)] hover:bg-[rgba(181,120,58,0.45)]"
                        }`}
                      />
                    );
                  })}
                </div>
              </>
            ) : null}

            {activeRitual === "gratitude" ? (
              <div className="relative">
                <LeafDecor className="absolute -bottom-2 -right-2" />
                {todayEntry ? (
                  <>
                    <p className="section-label">{copy.gratitudeCardTitle}</p>
                    <h2 className="mt-4 font-display text-[1.7rem] leading-[1.35] text-[color:var(--ink)]">
                      {copy.recorded}
                    </h2>
                    <div className="mt-4 space-y-2">
                      {gratitudeItems.map((item, index) => (
                        <p key={`${item}-${index}`} className="text-[1.02rem] italic leading-[1.85] text-[color:var(--ink-soft)]">
                          「{item}」
                        </p>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="section-label">{copy.gratitudeCardTitle}</p>
                    <h2 className="mt-4 font-display text-[1.65rem] leading-[1.45] text-[color:var(--ink)]">
                      {copy.notLogged}
                    </h2>
                    <button
                      type="button"
                      onClick={() => navigate("/gratitude")}
                      className="text-action-button mt-4"
                    >
                      {copy.goGratitude}
                    </button>
                  </>
                )}
              </div>
            ) : null}
            </div>
          </article>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleNextRitual}
            className="text-action-button"
          >
            {copy.skipRitual}
          </button>
        </div>
        <RitualDots items={ritualItems} activeId={activeRitual} onSelect={switchRitual} />
      </section>

      <div className="today-angel-strip flex items-center justify-center py-1">
        <button
          type="button"
          onClick={() => navigate("/angel")}
          className="text-[0.88rem] tracking-[0.14em] text-[color:var(--gold)] opacity-80 transition-opacity hover:opacity-100"
        >
          {copy.angelLink}
        </button>
      </div>
      </div>

      <section className="today-goal-section">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[color:var(--gold)]">✦</span>
            <h3 className="section-label !mb-0">{copy.goalStackTitle}</h3>
          </div>
          {activeOrders.length > 0 && (
            <p className="text-[0.76rem] font-medium tracking-[0.15em] text-[color:var(--ink-faint)]">
              {activeOrderIndex + 1} / {activeOrders.length}
            </p>
          )}
        </div>

        <div
          className="relative overflow-visible pb-7 pt-2 flex items-stretch"
          {...orderSwipe}
        >
          {activeOrder ? (
            <>
              {/* Invisible spacer for dynamic container height */}
              <div className="opacity-0 pointer-events-none relative z-0 block w-[72%] px-0 py-0 pb-2">
                <div className="relative h-40"></div>
                <div className="px-5 py-5">
                  <h2 className="font-display text-[1.65rem] leading-[1.25]">
                    {activeOrder.title}
                  </h2>
                  <p className="mt-1 text-[11px] leading-relaxed italic opacity-0">
                    {activeOrder.keywords?.length ? activeOrder.keywords.join(' · ') : activeOrder.subtitle || " "}
                  </p>
                  <div className="mt-5 flex items-center justify-between text-[0.75rem]">
                    <span>近 30 天投射</span>
                    <span>18 / 30 天</span>
                  </div>
                  <div className="mt-2 h-[5px] w-full"></div>
                  <div className="mt-4 flex items-center justify-between border-t border-[rgba(181,120,58,0.15)] pt-3">
                    <span className="text-[0.75rem]">✦ 連續 8 天</span>
                    <span className="text-[0.8rem]">›</span>
                  </div>
                </div>
              </div>

              {/* Shared DOM for all animating cards */}
              {displayedOrders.map(({ order, isActive, offsetIndex, totalBackCards }) => {
                const f = offsetIndex / totalBackCards;
                const maxScaleDown = 0.05;
                const cardWidth = 72; // Narrower width to expose more back cards
                const scaleAmount = 1 - (f * maxScaleDown);
                // Shift percent formula ensures exact right-edge alignment at 100% of container
                const shiftPercent = (100 - cardWidth) * f + (cardWidth * (1 - scaleAmount));

                const { recentCount, streak, dayN } = calculateGoalStats(order);

                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => isActive ? openOrderProjection(order) : handleOrderSwipeLeft()}
                    className={`absolute top-2 bottom-7 w-[72%] overflow-hidden rounded-[1.4rem] border border-[rgba(181,120,58,0.2)] bg-[rgba(250,246,240,0.95)] text-left shadow-[0_15px_35px_rgba(46,35,24,0.12)] transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isActive ? 'z-20 cursor-pointer' : ''}`}
                    style={{ 
                      zIndex: 20 - offsetIndex,
                      left: `${shiftPercent}%`,
                      transformOrigin: 'left center',
                      transform: `scale(${scaleAmount})`,
                    }}
                  >
                    <div className="relative h-40 overflow-hidden shrink-0">
                      {isActive && <div className="absolute inset-0" style={{ background: activeOrderTheme?.background }} />}
                      <OrderCoverArt
                        order={order}
                        loading={isActive ? "eager" : "lazy"}
                        fetchPriority={isActive ? "high" : "auto"}
                        sizes="(max-width: 768px) 100vw, 680px"
                      />
                      <div className={`absolute inset-0 transition-opacity duration-500 ${isActive ? 'opacity-80' : 'bg-[linear-gradient(180deg,rgba(20,28,45,0.08),rgba(20,28,45,0.55))]'}`} style={isActive ? { backgroundImage: "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.35) 0 1px, transparent 1.4px), radial-gradient(circle at 68% 10%, rgba(255,255,255,0.3) 0 1px, transparent 1.5px), radial-gradient(circle at 85% 24%, rgba(255,255,255,0.45) 0 1px, transparent 1.5px), radial-gradient(circle at 38% 34%, rgba(255,255,255,0.28) 0 0.8px, transparent 1.4px), radial-gradient(circle at 72% 41%, rgba(255,255,255,0.34) 0 1.2px, transparent 1.6px)" } : {}} />
                      {isActive && <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(245,239,230,0),rgba(245,239,230,0.98))]" />}
                      
                      {/* Active Card Top Tags */}
                      <div className={`absolute left-3 top-3 rounded-full bg-[rgba(20,28,45,0.85)] px-3 py-1 text-[0.7rem] tracking-[0.1em] text-white transition-opacity duration-500 backdrop-blur-md flex items-center gap-1.5 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                        <span className="inline-block h-[5px] w-[5px] rounded-full border-[1.5px] border-white"></span>
                        {order.category || order.tags?.[0] || 'Manifest'}
                      </div>
                      <div className={`absolute right-3 top-3 rounded-full bg-[rgba(20,28,45,0.85)] px-3 py-1.5 text-[0.7rem] tracking-[0.1em] text-white transition-opacity duration-500 backdrop-blur-md ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                        第 {dayN} 天
                      </div>

                      <div className={`absolute top-0 right-0 bg-[rgba(240,232,220,0.95)] px-3 py-1.5 backdrop-blur-md rounded-bl-xl transition-opacity duration-500 ${!isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <p className="font-display text-[0.7rem] font-medium tracking-[0.1em] text-[color:var(--ink)]">
                          {order.title}
                        </p>
                      </div>
                    </div>

                    <div className="bg-[rgba(250,246,240,0.9)] px-5 py-4 h-[calc(100%-10rem)] relative">
                      <div className={`transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                        <h2 className="font-display text-[1.65rem] leading-[1.25] text-[color:var(--ink)]">
                          {order.title}
                        </h2>
                        <p className="mt-1 text-[11px] leading-relaxed text-[#8a7f76] italic">
                          {order.keywords?.length ? order.keywords.join(' · ') : (order.subtitle || "\u00A0")}
                        </p>
                        
                        <div className="mt-5 flex items-center justify-between text-[0.75rem] text-[#8a7f76]">
                          <span>近 30 天投射</span>
                          <span className="font-medium text-[color:var(--ink)]">{recentCount >= 30 ? "✦ 本月能量滿格" : `${recentCount} / 30 天`}</span>
                        </div>
                        <div className="mt-2 h-[5px] w-full rounded-full bg-[rgba(181,120,58,0.2)] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#dda365] transition-all duration-700"
                            style={{ width: `${Math.min(100, (recentCount / 30) * 100)}%` }}
                          />
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between border-t border-[rgba(181,120,58,0.15)] pt-3">
                          <span className="text-[0.75rem] text-[#8a7f76] flex items-center gap-1 font-medium tracking-wide">
                            <span className="text-[#a48464] text-xs">✦</span> 連續 {streak} 天
                          </span>
                          <span className="text-[0.8rem] text-[#a48464]">›</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </>
          ) : (
            <article className="paper-card relative z-10 mx-auto block w-[88%] overflow-hidden px-0 py-0 text-left">
                <div className="px-5 py-5">
                  <Tag>今日投射</Tag>
                  <h2 className="mt-3 font-display text-[1.7rem] leading-[1.35] text-[color:var(--ink)]">
                    {copy.noOrderTitle}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">
                    {copy.noOrderDescription}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/orders")}
                  className="primary-button mx-5 mb-5 w-[calc(100%-2.5rem)]"
                >
                  {copy.goOrders}
                </button>
            </article>
          )}
        </div>

        {activeOrders.length > 1 ? (
          <div className="mt-1 flex items-center justify-center gap-2">
            {activeOrders.map((order, index) => (
              <button
                key={order.id}
                type="button"
                onClick={() => setActiveOrderIndex(index)}
                aria-label={order.title}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === activeOrderIndex
                    ? "w-6 bg-[color:var(--gold)]"
                    : "w-2.5 bg-[rgba(181,120,58,0.28)] hover:bg-[rgba(181,120,58,0.45)]"
                }`}
              />
            ))}
          </div>
        ) : null}
      </section>

      {deliveredCount > 0 ? (
        <div className="px-1 mt-6">
          <button
            type="button"
            onClick={() => navigate("/wall")}
            className="group relative flex w-full items-center justify-between overflow-hidden rounded-[1.35rem] border border-[rgba(181,120,58,0.25)] bg-[linear-gradient(145deg,rgba(250,246,240,0.8),rgba(244,236,224,0.9))] px-6 py-5 text-left shadow-[0_10px_30px_rgba(46,35,24,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_15px_35px_rgba(46,35,24,0.1)] active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] -translate-x-full transition-transform duration-1000 group-hover:translate-x-full" />
            
            <div className="relative flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(181,120,58,0.12)] text-xl">
                ✨
              </div>
              <div>
                <p className="font-display text-[1.15rem] leading-tight text-[color:var(--ink)]">
                  {copy.achievedBanner(deliveredCount)}
                </p>
                <p className="mt-1 text-[0.68rem] tracking-[0.14em] text-[color:var(--gold)]">
                  View your universe collection →
                </p>
              </div>
            </div>
            
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--gold)] text-white shadow-sm transition-transform group-hover:translate-x-1">
              →
            </div>
          </button>
        </div>
      ) : null}

    </div>
  );
}
