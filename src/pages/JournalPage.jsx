import { useEffect, useMemo, useState } from "react";
import { getMoonPhaseInfo } from "../angelEngine";
import NumberSignalSheet from "../components/NumberSignalSheet";
import { useI18n } from "../lib/i18n";

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

const MOOD_LABELS = {
  "zh-TW": {
    calm: "平靜", hopeful: "期待", light: "輕盈",
    tired: "疲憊", anxious: "焦慮", grateful: "感謝",
    sad: "難過", confused: "迷惘", excited: "期待", touched: "感動",
  },
  en: {
    calm: "Calm", hopeful: "Hopeful", light: "Light",
    tired: "Tired", anxious: "Anxious", grateful: "Grateful",
    sad: "Sad", confused: "Confused", excited: "Hopeful", touched: "Moved",
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

function getDailyQuestion(locale, date = new Date()) {
  const questionBank = DAILY_QUESTION_BANK[locale] || DAILY_QUESTION_BANK["zh-TW"];
  const start = new Date("2026-01-01T00:00:00");
  const diffDays = Math.floor((date - start) / (1000 * 60 * 60 * 24));
  const index = ((diffDays % questionBank.length) + questionBank.length) % questionBank.length;
  return { index, question: questionBank[index] };
}

function getTodayKey() {
  return new Date().toLocaleDateString("sv-SE");
}

function formatCardDate(dateStr, locale) {
  const date = new Date(dateStr + "T00:00:00");
  if (locale === "en") {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  }
  return date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

function getMoonLabelForDate(dateStr, locale) {
  const date = new Date(dateStr + "T12:00:00");
  const info = getMoonPhaseInfo(date);
  return MOON_LABELS[info.phase]?.[locale] || info.label;
}

function timestampToDateKey(ts) {
  if (!ts) return null;
  if (ts.toDate) return ts.toDate().toLocaleDateString("sv-SE");
  if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleDateString("sv-SE");
  if (typeof ts === "string") return ts.slice(0, 10);
  return null;
}

/**
 * Merge data from multiple collections by date key.
 */
function buildTimeline(allDailyLogs, gratitudeEntries, orders, angelLogs) {
  const dayMap = new Map();

  function ensureDay(dateKey) {
    if (!dayMap.has(dateKey)) {
      dayMap.set(dateKey, {
        date: dateKey,
        mood: null,
        questionAnswer: null,
        questionPrompt: null,
        numberSignal: null,
        numberNote: null,
        gratitude: null,
        projections: [],
        angelSignals: [],
      });
    }
    return dayMap.get(dateKey);
  }

  // dailyLogs
  for (const log of allDailyLogs) {
    if (!log.date) continue;
    const day = ensureDay(log.date);
    day.mood = log.mood || day.mood;
    day.questionAnswer = log.questionAnswer || day.questionAnswer;
    day.questionPrompt = log.questionPrompt || day.questionPrompt;
    day.numberSignal = log.numberSignal || day.numberSignal;
    day.numberNote = log.numberNote || day.numberNote;
  }

  // gratitude
  for (const entry of gratitudeEntries) {
    if (!entry.date) continue;
    const day = ensureDay(entry.date);
    const items = [entry.item1, entry.item2, entry.item3].filter(Boolean);
    if (items.length > 0) {
      day.gratitude = items;
    }
  }

  // orders → journal entries
  for (const order of orders) {
    if (!Array.isArray(order.journal)) continue;
    for (const journalEntry of order.journal) {
      const dateKey = timestampToDateKey(journalEntry.recordedAt);
      if (!dateKey) continue;
      const day = ensureDay(dateKey);
      day.projections.push({
        orderTitle: order.title,
        orderId: order.id,
      });
    }
  }

  // angelLogs
  for (const log of angelLogs) {
    const dateKey = timestampToDateKey(log.recordedAt);
    if (!dateKey) continue;
    const day = ensureDay(dateKey);
    day.angelSignals.push({
      number: log.number,
      mood: log.mood,
      note: log.note,
    });
  }

  return [...dayMap.values()].sort((a, b) => b.date.localeCompare(a.date));
}

export default function JournalPage({
  allDailyLogs,
  gratitudeEntries,
  orders,
  angelLogs,
  dailyLogEntry,
  onSaveQuestionAnswer,
  onCreateAngelLog,
  onSaveNumberSignal,
}) {
  const { locale } = useI18n();
  const todayKey = getTodayKey();
  const { index: questionIndex, question: dailyQuestion } = useMemo(
    () => getDailyQuestion(locale, new Date()),
    [locale],
  );

  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionAnswer, setQuestionAnswer] = useState("");
  const [questionSaving, setQuestionSaving] = useState(false);
  const [showNumberSheet, setShowNumberSheet] = useState(false);

  const savedAnswer = dailyLogEntry?.questionAnswer || "";

  useEffect(() => {
    setQuestionAnswer(savedAnswer);
    setShowQuestionForm(false);
  }, [savedAnswer]);

  const timeline = useMemo(
    () => buildTimeline(allDailyLogs, gratitudeEntries, orders, angelLogs),
    [allDailyLogs, gratitudeEntries, orders, angelLogs],
  );

  const copy = locale === "en"
    ? {
      title: "Daily Journey",
      kicker: "COSMOS JOURNAL",
      todaySection: "Today's check-in",
      dailyQuestion: "Daily question",
      writeAnswer: "Write your answer →",
      editAnswer: "Edit →",
      answerPlaceholder: "Write what is true for you right now...",
      cancel: "Cancel",
      saving: "Saving...",
      saveAnswer: "Save",
      numberSignal: "Record a number signal ✦",
      timeline: "Past entries",
      gratitudeTitle: "Grateful for",
      projectionTitle: "Projection",
      noEntries: "Start recording your journey. Each day will appear here.",
      moodLabel: "Mood",
      signalLabel: "Soul code",
    }
    : {
      title: "每日歷程",
      kicker: "COSMOS JOURNAL",
      todaySection: "今日紀錄",
      dailyQuestion: "今日一問",
      writeAnswer: "寫下回答 →",
      editAnswer: "編輯 →",
      answerPlaceholder: "寫下你此刻的回答...",
      cancel: "取消",
      saving: "儲存中...",
      saveAnswer: "存下回答",
      numberSignal: "記錄數字訊號 ✦",
      timeline: "歷史紀錄",
      gratitudeTitle: "感恩",
      projectionTitle: "投射",
      noEntries: "開始記錄你的旅程，每一天都會在這裡出現。",
      moodLabel: "情緒",
      signalLabel: "心靈密碼",
    };

  const handleSaveQuestion = async () => {
    if (!questionAnswer.trim()) return;
    setQuestionSaving(true);
    try {
      await onSaveQuestionAnswer(questionIndex, dailyQuestion, questionAnswer.trim());
      setShowQuestionForm(false);
    } catch (err) {
      console.error("Save question error:", err);
    }
    setQuestionSaving(false);
  };

  const moodLabels = MOOD_LABELS[locale] || MOOD_LABELS["zh-TW"];

  return (
    <div className="space-y-5">
      {/* Header */}
      <section>
        <p className="gold-kicker">{copy.kicker}</p>
        <h1 className="page-title mt-2">{copy.title}</h1>
      </section>

      {/* Today quick entry area */}
      <section className="paper-card px-5 py-5">
        <p className="section-label">{copy.todaySection}</p>

        {/* Daily question */}
        <div className="mt-4">
          <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-[color:var(--ink-faint)] uppercase">
            {copy.dailyQuestion}
          </p>

          {!showQuestionForm && !savedAnswer ? (
            <>
              <p className="mt-3 font-[var(--font-display)] text-[1.35rem] leading-[1.5] text-[color:var(--ink)]">
                {dailyQuestion}
              </p>
              <button
                type="button"
                onClick={() => setShowQuestionForm(true)}
                className="mt-3 text-[0.88rem] tracking-[0.12em] text-[color:var(--gold)]"
              >
                {copy.writeAnswer}
              </button>
            </>
          ) : showQuestionForm ? (
            <>
              <p className="mt-3 font-[var(--font-display)] text-[1.2rem] leading-[1.5] text-[color:var(--ink)]">
                {dailyQuestion}
              </p>
              <textarea
                value={questionAnswer}
                onChange={(e) => setQuestionAnswer(e.target.value)}
                rows={3}
                className="cosmos-textarea mt-3"
                placeholder={copy.answerPlaceholder}
                autoFocus
              />
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuestionForm(false);
                    setQuestionAnswer(savedAnswer);
                  }}
                  className="secondary-button flex-1"
                >
                  {copy.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuestion}
                  disabled={!questionAnswer.trim() || questionSaving}
                  className="primary-button flex-1"
                >
                  {questionSaving ? copy.saving : copy.saveAnswer}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-3 font-[var(--font-display)] text-[1.2rem] leading-[1.5] text-[color:var(--ink)]">
                {dailyQuestion}
              </p>
              <p className="mt-3 text-sm italic leading-7 text-[color:var(--ink-soft)]">
                {savedAnswer}
              </p>
              <button
                type="button"
                onClick={() => setShowQuestionForm(true)}
                className="mt-2 text-[0.88rem] tracking-[0.12em] text-[color:var(--gold)]"
              >
                {copy.editAnswer}
              </button>
            </>
          )}
        </div>

        {/* Number signal quick entry */}
        <div className="mt-5 border-t border-[rgba(181,120,58,0.12)] pt-4">
          <button
            type="button"
            onClick={() => setShowNumberSheet(true)}
            className="primary-button w-full"
          >
            {copy.numberSignal}
          </button>
        </div>
      </section>

      {/* Timeline */}
      <section className="paper-card px-5 py-5">
        <p className="section-label">{copy.timeline}</p>

        {timeline.length === 0 ? (
          <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">
            {copy.noEntries}
          </p>
        ) : (
          <div className="mt-4 space-y-0">
            {timeline.map((day) => {
              const moonLabel = getMoonLabelForDate(day.date, locale);
              const isToday = day.date === todayKey;
              const hasContent = day.mood || day.gratitude || day.questionAnswer
                || day.projections.length > 0 || day.angelSignals.length > 0
                || day.numberSignal;

              if (!hasContent) return null;

              return (
                <article key={day.date} className="journal-day-card">
                  {/* Date header */}
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[0.82rem] font-semibold tracking-[0.06em] text-[color:var(--ink)]">
                      {isToday
                        ? (locale === "en" ? "Today" : "今天")
                        : formatCardDate(day.date, locale)}
                      {" · "}
                      <span className="font-normal text-[color:var(--ink-soft)]">{moonLabel}</span>
                    </p>
                    {day.mood ? (
                      <span className="journal-tag">
                        {moodLabels[day.mood] || day.mood}
                      </span>
                    ) : null}
                  </div>

                  {/* Gratitude */}
                  {day.gratitude ? (
                    <div className="mt-3">
                      <p className="text-[0.66rem] tracking-[0.2em] text-[color:var(--ink-faint)] uppercase">
                        {copy.gratitudeTitle}
                      </p>
                      <div className="mt-1 space-y-1">
                        {day.gratitude.map((item, i) => (
                          <p key={`g-${i}`} className="text-sm leading-6 text-[color:var(--ink-soft)]">
                            「{item}」
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Daily question answer */}
                  {day.questionAnswer ? (
                    <div className="mt-3">
                      <p className="text-[0.66rem] tracking-[0.2em] text-[color:var(--ink-faint)] uppercase">
                        {copy.dailyQuestion}
                      </p>
                      {day.questionPrompt ? (
                        <p className="mt-1 text-xs text-[color:var(--ink-faint)]">
                          {day.questionPrompt}
                        </p>
                      ) : null}
                      <p className="mt-1 text-sm italic leading-7 text-[color:var(--ink-soft)]">
                        {day.questionAnswer}
                      </p>
                    </div>
                  ) : null}

                  {/* Projections */}
                  {day.projections.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-[0.66rem] tracking-[0.2em] text-[color:var(--ink-faint)] uppercase">
                        {copy.projectionTitle}
                      </p>
                      <div className="mt-1 space-y-1">
                        {[...new Map(day.projections.map((p) => [p.orderId, p])).values()].map((p) => (
                          <p key={p.orderId} className="text-sm leading-6 text-[color:var(--ink-soft)]">
                            ✦ {p.orderTitle}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Number signals */}
                  {(day.numberSignal || day.angelSignals.length > 0) ? (
                    <div className="mt-3">
                      <p className="text-[0.66rem] tracking-[0.2em] text-[color:var(--ink-faint)] uppercase">
                        {copy.signalLabel}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {day.numberSignal ? (
                          <span className="journal-tag">{day.numberSignal}</span>
                        ) : null}
                        {day.angelSignals.map((sig, i) => (
                          <span key={`as-${i}`} className="journal-tag">
                            {sig.number}
                          </span>
                        ))}
                      </div>
                      {day.numberNote ? (
                        <p className="mt-1 text-xs leading-5 text-[color:var(--ink-faint)]">
                          {day.numberNote}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Number signal bottom sheet */}
      <NumberSignalSheet
        open={showNumberSheet}
        onClose={() => setShowNumberSheet(false)}
        onSave={onCreateAngelLog}
        onSaveNumberSignal={onSaveNumberSignal}
      />
    </div>
  );
}
