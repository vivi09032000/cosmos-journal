import { useEffect, useMemo, useRef, useState } from "react";
import {
  daysSince,
  formatOrderMonth,
  getOrderTheme,
  getOrderStatusLabel,
  getOrderComputedStatus,
} from "../lib/orderTheme";
import OrderCoverArt from "./OrderCoverArt";
import {
  getActionSummary,
  getSuggestedActionPrompts,
} from "../lib/orderActions";
import { getOrderQuestions } from "../lib/orderQuestions";
import { useI18n } from "../lib/i18n";

const markDeliveredCopy = {
  "zh-TW": "✦ 標記為已實現",
  en: "✦ Mark as fulfilled",
};

function formatDate(timestamp, locale) {
  if (!timestamp?.toDate) return "";
  return timestamp.toDate().toLocaleDateString(locale === "en" ? "en-US" : "zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const PROJECTION_CHIPS = {
  "zh-TW": ["空氣的清涼", "心跳加速", "整個人放鬆了", "難以置信的真實"],
  en: ["Clear air", "Heart racing", "Body relaxed", "Almost too real"],
};

const MANIFEST_STAGES = {
  packing: 1,
  aligning: 2,
  resonating: 3,
  delivered: 4,
};

function getProjectionStats(journalTimeline) {
  const today = new Date();
  const last30Start = new Date(today);
  last30Start.setDate(today.getDate() - 29);
  last30Start.setHours(0, 0, 0, 0);

  const uniqueDates = new Set();
  const last30Dates = new Set();

  for (const entry of journalTimeline) {
    const rawTime = entry.recordedAt?.seconds
      ? entry.recordedAt.seconds * 1000
      : entry.date;
    if (!rawTime) continue;

    const date = new Date(rawTime);
    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
    uniqueDates.add(key);

    if (date >= last30Start) {
      last30Dates.add(key);
    }
  }

  let streak = 0;
  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);

  while (true) {
    const key = [
      cursor.getFullYear(),
      String(cursor.getMonth() + 1).padStart(2, "0"),
      String(cursor.getDate()).padStart(2, "0"),
    ].join("-");

    if (!uniqueDates.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    last30Count: last30Dates.size,
    streak,
  };
}

function getJournalLine(entry) {
  return [entry?.q1, entry?.q2, entry?.q3]
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter(Boolean)
    .join(" ");
}

export default function OrderDetail({
  order,
  linkedAngelLogs = [],
  onBack,
  onUpdateStatus,
  onSubmitJournal,
  onSaveActionItems,
  onUpdateOrderImage,
}) {
  const { locale } = useI18n();
  const [answers, setAnswers] = useState(["", "", ""]);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [customAction, setCustomAction] = useState("");
  const [actionSaving, setActionSaving] = useState(false);
  const [journalSent, setJournalSent] = useState(false);
  const [showProjectionNote, setShowProjectionNote] = useState(false);
  const [showActionComposer, setShowActionComposer] = useState(false);
  const [imageSaving, setImageSaving] = useState(false);
  const [imageError, setImageError] = useState("");
  const [actionSuggestionIndex, setActionSuggestionIndex] = useState(0);
  const imageInputRef = useRef(null);
  const computedStatus = getOrderComputedStatus(order);
  const canMarkDelivered = computedStatus !== "delivered";
  const canSubmit = answers.some((answer) => answer.trim().length > 0);
  const theme = getOrderTheme(order);
  const questions = useMemo(
    () => getOrderQuestions(order, locale),
    [locale, order.id],
  );
  const suggestedActions = useMemo(
    () => getSuggestedActionPrompts(order, locale),
    [locale, order.id],
  );
  const actionItems = order.actionItems || [];
  const linkedNumbers = [
    ...new Set(linkedAngelLogs.map((log) => log.number).filter(Boolean)),
  ];
  const actionSummary = useMemo(
    () => getActionSummary(order),
    [order],
  );

  const journalTimeline = useMemo(
    () =>
      [...(order.journal || [])].sort((left, right) => {
        const leftTime = left.recordedAt?.seconds || 0;
        const rightTime = right.recordedAt?.seconds || 0;
        return rightTime - leftTime;
      }),
    [order.journal],
  );

  const hasJournaledToday = useMemo(() => {
    if (!journalTimeline.length) return false;
    const latest = journalTimeline[0];
    const latestTime = latest.recordedAt?.seconds ? latest.recordedAt.seconds * 1000 : (latest.date || 0);
    if (!latestTime) return false;
    const today = new Date();
    const latestDate = new Date(latestTime);
    return latestDate.getFullYear() === today.getFullYear() &&
           latestDate.getMonth() === today.getMonth() &&
           latestDate.getDate() === today.getDate();
  }, [journalTimeline]);

  const projectionStats = useMemo(
    () => getProjectionStats(journalTimeline),
    [journalTimeline],
  );

  const [isEditingToday, setIsEditingToday] = useState(false);

  useEffect(() => {
    if (hasJournaledToday && journalTimeline[0]) {
      const todayEntry = journalTimeline[0];
      setAnswers([todayEntry.q1 || "", todayEntry.q2 || "", todayEntry.q3 || ""]);
      setStep(questions.length - 1);
    } else {
      setAnswers(["", "", ""]);
      setStep(0);
    }
    setIsEditingToday(false);
    setCustomAction("");
    setJournalSent(false);
    setShowProjectionNote(false);
    setShowActionComposer(false);
    setImageError("");
    setActionSuggestionIndex(0);
  }, [order.id, hasJournaledToday, journalTimeline.length, questions.length]);

  const copy = locale === "en"
    ? {
      back: "Back to goals",
      changeImage: "Change goal image",
      journalKicker: "Imagine",
      journalTitle: "Imagine today",
      journalCardTitle: "Imagine today",
      sensoryPrompt: "One question each day",
      projectionStreak: (days) => `✦ ${days} day streak`,
      moreNote: "Add one sentence?",
      projectionButton: "Save this reflection",
      projectedToday: "Today's reflection is saved",
      projectedTodayHint: "Come back tomorrow and imagine it again from a new angle.",
      answerPlaceholder: "Write what this feels like...",
      sending: "Sending...",
      send: "Save reflection",
      actionKicker: "Small Action",
      actionTitle: "Small action",
      actionAfterJournal: "Choose one small real step so this goal can move closer to real life.",
      actionBeforeJournal: "A small step makes this goal easier to approach.",
      suggestionSaved: "Added",
      suggestionSave: "Use this action",
      nextSuggestion: "Another idea →",
      customActionLabel: "Write one small action",
      customActionPlaceholder: "For example: check snow pass and flight prices...",
      addAction: "Add action",
      activeActions: "Small actions",
      aligned: (done, total) => `${done}/${total} done`,
      noActions: "No small actions yet. Add one easy step to make this goal feel closer.",
      statusKicker: "Goal Status",
      statusTitle: "Goal progress",
      stageIntent: "Started",
      stageAligning: "In progress",
      stageResonance: "Getting clearer",
      stageDelivered: "✦ Fulfilled",
      projectionFrequency: "Reflections in the last 30 days",
      continuedAlignment: (days) => `${days} day${days === 1 ? "" : "s"} in a row`,
      completed: "This goal has already been completed.",
      historyKicker: "Past Notes",
      historyTitle: "Past notes",
      noHistory: "No notes yet.",
      uploadFailed: "Image upload failed: ",
      linkedSignals: "Linked signals",
    }
    : {
      back: "返回目標列表",
      changeImage: "更換願景圖片",
      journalKicker: "想像",
      journalTitle: "今天想像一下",
      journalCardTitle: "今天想像一下",
      sensoryPrompt: "每天一題",
      projectionStreak: (days) => `✦ 連續 ${days} 天`,
      moreNote: "想多說一句話？",
      projectionButton: "記錄這次想像",
      projectedToday: "今天的想像已記錄",
      projectedTodayHint: "明天可以再回來，從新的角度想像一次。",
      answerPlaceholder: "寫下你的感受...",
      sending: "發送中...",
      send: "記錄想像",
      actionKicker: "小行動",
      actionTitle: "小行動",
      actionAfterJournal: "接著做一件很小但真實的事，讓這個願望更靠近現實。",
      actionBeforeJournal: "先做一件小事，這個目標會變得更容易靠近。",
      suggestionSaved: "已加入",
      suggestionSave: "使用這個小行動",
      nextSuggestion: "換一個建議 →",
      customActionLabel: "寫下一個小行動",
      customActionPlaceholder: "例如：去看一下雪票和機票的價格...",
      addAction: "加入小行動",
      activeActions: "小行動",
      aligned: (done, total) => `已完成 ${done}/${total}`,
      noActions: "還沒有小行動。先加一件最容易開始的事，讓目標更靠近一點。",
      statusKicker: "目標狀態",
      statusTitle: "目標進度",
      stageIntent: "意圖送出",
      stageAligning: "對齊中",
      stageResonance: "強烈共振中",
      stageDelivered: "✦ 已實現",
      projectionFrequency: "近 30 天想像次數",
      continuedAlignment: (days) => `連續 ${days} 天有紀錄`,
      completed: "這個目標已實現。",
      historyKicker: "過去紀錄",
      historyTitle: "過去紀錄",
      noHistory: "還沒有紀錄。",
      uploadFailed: "圖片上傳失敗：",
      linkedSignals: "已連結訊號",
    };



  const handleAnswerChange = (index, value) => {
    const nextAnswers = [...answers];
    nextAnswers[index] = value;
    setAnswers(nextAnswers);

    if (value.trim().length > 0 && index < questions.length - 1) {
      setStep(index + 1);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      setStep((current) => Math.min(current + 1, questions.length - 1));
    }
  };

  const handleProjectionChip = (value) => {
    const nextAnswers = [...answers];
    nextAnswers[step] = value;
    setAnswers(nextAnswers);
  };

  const handleSubmit = async () => {
    if (!canSubmit || saving) return;

    setSaving(true);
    await onSubmitJournal({
      q1: answers[0],
      q2: answers[1],
      q3: answers[2],
      prompts: questions,
    });
    setJournalSent(true);
    setIsEditingToday(false);
    setSaving(false);
  };

  const saveNextActionItems = async (nextActionItems) => {
    setActionSaving(true);
    await onSaveActionItems(nextActionItems);
    setActionSaving(false);
  };

  const handleAddActionItem = async (value) => {
    const text = value.trim();
    if (!text) return;

    const exists = actionItems.some(
      (item) => item.text.trim().toLowerCase() === text.toLowerCase(),
    );

    if (exists) {
      setCustomAction("");
      return;
    }

    const nextActionItems = [
      ...actionItems,
      {
        id: typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `action-${Date.now()}`,
        text,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ];

    await saveNextActionItems(nextActionItems);
    setCustomAction("");
  };

  const handleToggleActionItem = async (itemId) => {
    const nextActionItems = actionItems.map((item) => (
      item.id === itemId
        ? {
          ...item,
          completed: !item.completed,
          completedAt: item.completed ? null : new Date().toISOString(),
        }
        : item
    ));

    await saveNextActionItems(nextActionItems);
  };

  const activeSuggestion = suggestedActions[actionSuggestionIndex] || "";

  const handleImageChange = async (event) => {
    const imageFile = event.target.files?.[0];
    if (!imageFile) return;

    setImageSaving(true);
    setImageError("");

    try {
      await onUpdateOrderImage(imageFile);
    } catch (error) {
      console.error("Image upload failed:", error);
      setImageError(copy.uploadFailed + error.message);
    } finally {
      setImageSaving(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="ghost-button text-sm"
      >
        <span>‹</span>
        <span>{copy.back}</span>
      </button>

      <section
        className="relative overflow-hidden rounded-[1.8rem] px-5 pb-6 pt-24 text-[#fff7e6]"
        style={{ background: theme.background }}
      >
        <div className="absolute inset-0">
          <OrderCoverArt
            order={order}
            imageClassName="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 768px) 100vw, 720px"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0.55))]" />
        <div className="absolute -left-10 -top-12 h-32 w-32 rounded-full border border-[rgba(240,214,167,0.18)]" />
        <div className="absolute bottom-4 right-4 h-32 w-32 rounded-full border border-[rgba(240,214,167,0.16)]" />
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={imageSaving}
          className="absolute bottom-4 right-4 z-[2] flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(245,239,230,0.7)] text-base text-[color:var(--navy-deep)] backdrop-blur-sm transition disabled:opacity-70"
          aria-label={copy.changeImage}
        >
          <span aria-hidden="true">{imageSaving ? "…" : "📷"}</span>
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          disabled={imageSaving}
        />
        <div className="relative z-[1]">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[#f2ddbb]">
            <span className="status-pill">
              {order.angelNumber ? `#${order.angelNumber}` : locale === "en" ? "Goal" : "目標"}
            </span>
            <span className="status-pill">{getOrderStatusLabel(computedStatus, locale)}</span>
          </div>
          <p className="mt-4 text-[0.78rem] uppercase tracking-[0.24em] text-[#efd7b6]">
            {formatOrderMonth(order.createdAt)} · {locale === "en" ? `Day ${daysSince(order.createdAt)}` : `第 ${daysSince(order.createdAt)} 天`}
          </p>
          <h2 className="mt-2 font-display text-[2.25rem] leading-none">{order.title}</h2>
          {order.subtitle ? <p className="mt-3 max-w-[17rem] text-sm text-[#f7e9cf]/88">{order.subtitle}</p> : null}
          {linkedNumbers.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[0.68rem] tracking-[0.18em] text-[#efd7b6]/85">
                {copy.linkedSignals}
              </span>
              {linkedNumbers.map((number) => (
                <span key={`${order.id}-${number}`} className="status-pill">
                  {number}
                </span>
              ))}
            </div>
          ) : null}
          {imageError ? (
            <p className="mt-4 max-w-[24rem] rounded-xl border border-[rgba(239,215,182,0.35)] bg-[rgba(18,20,29,0.32)] px-3 py-2 text-sm leading-6 text-[#ffe8c2]">
              {imageError}
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-[2rem] bg-[rgba(250,246,240,0.82)] px-5 py-6 shadow-[0_14px_36px_rgba(46,35,24,0.06)]">
        <p className="gold-kicker">{copy.journalKicker}</p>
        <h3 className="mt-2 font-display text-[1.8rem] leading-none text-[color:var(--ink)]">{copy.journalCardTitle}</h3>

        <div className="mt-6 rounded-[1.55rem] bg-[linear-gradient(145deg,#203456,#1d2e4d)] px-5 py-5 text-[#f7ebd2] shadow-[0_16px_34px_rgba(31,41,72,0.18)]">
          {(hasJournaledToday || journalSent) && !isEditingToday ? (
            <div className="py-5 text-center">
              <p className="text-sm font-semibold tracking-[0.12em] text-[color:var(--gold-soft)]">
                ✦ {copy.projectedToday}
              </p>
              <p className="mx-auto mt-3 max-w-[22rem] text-sm leading-7 text-[#b9c6dc]">
                {copy.projectedTodayHint}
              </p>
              <button
                type="button"
                onClick={() => setIsEditingToday(true)}
                className="mt-5 rounded-full border border-[rgba(232,201,154,0.32)] px-4 py-2 text-xs tracking-[0.14em] text-[#f2d39c]"
              >
                {locale === "en" ? "Edit today's journal" : "修改今日日記"}
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-semibold tracking-[0.08em] text-[#8fa2c1]">{copy.sensoryPrompt}</p>
                <p className="shrink-0 text-sm font-semibold tracking-[0.06em] text-[color:var(--gold-soft)]">
                  {copy.projectionStreak(projectionStats.streak)}
                </p>
              </div>

              <p className="mt-7 font-display text-[1.65rem] leading-[1.5] text-[#fff2d2]">
                {questions[step]}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {(PROJECTION_CHIPS[locale] || PROJECTION_CHIPS["zh-TW"]).map((chip) => {
                  const selected = answers[step] === chip;
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleProjectionChip(chip)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        selected
                          ? "border-[rgba(232,201,154,0.8)] bg-[rgba(232,201,154,0.22)] text-[#ffe5ad]"
                          : "border-[rgba(221,232,255,0.18)] bg-[rgba(255,255,255,0.06)] text-[#d6e1f4]"
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setShowProjectionNote((current) => !current)}
                className="mt-6 text-sm tracking-[0.08em] text-[#89a3ca]"
              >
                ✎ {copy.moreNote}
              </button>

              {showProjectionNote ? (
                <textarea
                  value={answers[step]}
                  onChange={(event) => handleAnswerChange(step, event.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={3}
                  className="mt-4 w-full resize-none rounded-2xl border border-[rgba(221,232,255,0.16)] bg-[rgba(255,255,255,0.06)] px-4 py-3 text-sm leading-7 text-[#fff2d2] outline-none placeholder:text-[#8fa2c1]"
                  placeholder={copy.answerPlaceholder}
                />
              ) : null}

              <div className="mt-6 flex gap-2">
                {questions.map((question, index) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => setStep(index)}
                    className={`h-2 flex-1 rounded-full transition ${
                      index === step ? "bg-[color:var(--gold-soft)]" : "bg-[rgba(255,255,255,0.14)]"
                    }`}
                    aria-label={`${copy.journalTitle} ${index + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || saving}
                className="mt-5 w-full rounded-2xl border border-[rgba(232,201,154,0.18)] bg-[rgba(14,26,48,0.38)] px-4 py-3 font-display text-[1.2rem] text-[#f2d39c] transition disabled:opacity-45"
              >
                {saving ? copy.sending : copy.projectionButton}
              </button>
            </>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] bg-[rgba(250,246,240,0.82)] px-5 py-6 shadow-[0_14px_36px_rgba(46,35,24,0.06)]">
        <p className="gold-kicker">{copy.statusKicker}</p>
        <h3 className="mt-2 font-display text-[1.8rem] leading-none text-[color:var(--ink)]">{copy.statusTitle}</h3>

        <div className="mt-7 grid grid-cols-4 items-start gap-2">
          {[
            copy.stageIntent,
            copy.stageAligning,
            copy.stageResonance,
            copy.stageDelivered,
          ].map((label, index) => {
            const stage = index + 1;
            const isCurrent = MANIFEST_STAGES[computedStatus] === stage;
            const isPassed = MANIFEST_STAGES[computedStatus] >= stage;
            return (
              <div key={label} className="text-center">
                <div className="relative mb-3 flex items-center justify-center">
                  <span className={`relative z-[1] h-4 w-4 rounded-full border-2 ${
                    isCurrent
                      ? "border-[color:var(--gold)] bg-[color:var(--gold)] shadow-[0_0_0_8px_rgba(181,120,58,0.16)]"
                      : isPassed
                        ? "border-[color:var(--gold)] bg-[color:var(--gold)]"
                        : "border-[rgba(181,120,58,0.34)] bg-[rgba(250,246,240,0.8)]"
                  }`} />
                  {index < 3 ? (
                    <span className={`absolute left-1/2 top-1/2 h-[2px] w-full -translate-y-1/2 ${
                      isPassed ? "bg-[color:var(--gold)]" : "bg-[rgba(181,120,58,0.2)]"
                    }`} />
                  ) : null}
                </div>
                <p className={`text-[0.7rem] font-semibold leading-5 tracking-[0.06em] ${
                  isCurrent ? "text-[color:var(--gold)]" : "text-[color:var(--ink-faint)]"
                }`}>
                  {label}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-7 flex items-center justify-between gap-4 text-sm font-semibold text-[color:var(--ink-soft)]">
          <span>{copy.projectionFrequency}</span>
          <span className="text-[1.05rem] text-[color:var(--ink)]">{projectionStats.last30Count} / 30 天</span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-[rgba(181,120,58,0.18)]">
          <div
            className="h-full rounded-full bg-[linear-gradient(to_right,var(--gold),var(--gold-soft))]"
            style={{ width: `${Math.min(100, (projectionStats.last30Count / 30) * 100)}%` }}
          />
        </div>
        <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">
          {copy.continuedAlignment(projectionStats.streak)}
        </p>

        {canMarkDelivered ? (
          <button
            type="button"
            onClick={() => onUpdateStatus("delivered")}
            className="secondary-button mt-5 w-full"
          >
            {markDeliveredCopy[locale] || markDeliveredCopy["zh-TW"]}
          </button>
        ) : null}
      </section>

      <section className="rounded-[2rem] bg-[rgba(250,246,240,0.82)] px-5 py-6 shadow-[0_14px_36px_rgba(46,35,24,0.06)]">
        <p className="gold-kicker">{copy.actionKicker}</p>
        <h3 className="mt-2 font-display text-[1.8rem] leading-none text-[color:var(--ink)]">{copy.actionTitle}</h3>

        <div className="mt-6 divide-y divide-[rgba(181,120,58,0.14)]">
          {actionItems.length === 0 ? (
            <p className="py-2 text-sm leading-7 text-[color:var(--ink-soft)]">{copy.noActions}</p>
          ) : (
            actionItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleToggleActionItem(item.id)}
                disabled={actionSaving}
                className="flex w-full items-start gap-4 py-4 text-left transition disabled:opacity-60"
              >
                <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                  item.completed
                    ? "border-[color:var(--gold)] bg-[color:var(--gold)] text-white"
                    : "border-[color:var(--gold)] text-[color:var(--gold)]"
                }`}>
                  {item.completed ? "✓" : ""}
                </span>
                <span className={`text-base leading-7 ${
                  item.completed ? "text-[color:var(--ink-faint)] line-through" : "text-[color:var(--ink)]"
                }`}>
                  {item.text}
                </span>
              </button>
            ))
          )}
        </div>

        {showActionComposer ? (
          <div className="mt-5 space-y-4 rounded-2xl border border-[rgba(181,120,58,0.12)] bg-[rgba(250,246,240,0.4)] p-4">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-[0.8rem] text-[color:var(--gold)]">✦</span>
              <p className="text-sm leading-6 text-[color:var(--ink-soft)]">
                {activeSuggestion || copy.actionBeforeJournal}
              </p>
            </div>
            
            <div className="relative">
              <input
                value={customAction}
                onChange={(event) => setCustomAction(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && customAction.trim()) {
                    event.preventDefault();
                    handleAddActionItem(customAction);
                  }
                }}
                className="cosmos-input pr-16"
                placeholder={copy.customActionPlaceholder}
                autoFocus
              />
              <button
                type="button"
                onClick={() => handleAddActionItem(customAction)}
                disabled={!customAction.trim() || actionSaving}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[color:var(--gold)] px-3 py-1.5 text-xs font-medium tracking-wide text-white transition disabled:opacity-0"
              >
                {locale === "en" ? "ADD" : "加入"}
              </button>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setShowActionComposer((current) => !current)}
          className="secondary-button mt-5 w-full"
        >
          + {locale === "en" ? "Add a small action" : "新增一個小行動"}
        </button>
      </section>

      <section className="rounded-[2rem] bg-[rgba(250,246,240,0.82)] px-5 py-6 shadow-[0_14px_36px_rgba(46,35,24,0.06)]">
        <p className="gold-kicker">{copy.historyKicker}</p>
        <h3 className="mt-2 font-display text-[1.8rem] leading-none text-[color:var(--ink)]">{copy.historyTitle}</h3>
        <div className="timeline-rail mt-6 space-y-6">
          {journalTimeline.length === 0 ? (
            <p className="text-sm leading-7 text-[color:var(--ink-soft)]">{copy.noHistory}</p>
          ) : (
            journalTimeline.map((entry, index) => {
              const line = getJournalLine(entry);
              return (
                <article key={`${entry.recordedAt?.seconds || "entry"}-${index}`} className="relative pl-10">
                  <span className="timeline-dot absolute left-0 top-1">●</span>
                  <p className="text-sm font-semibold tracking-[0.08em] text-[color:var(--ink-soft)]">
                    {formatDate(entry.recordedAt, locale)}
                  </p>
                  <p className="mt-2 text-base leading-8 text-[color:var(--ink)]">
                    {line || copy.noHistory}
                  </p>
                  <span className="mt-3 inline-flex rounded-lg bg-[rgba(232,201,154,0.26)] px-3 py-1 text-xs tracking-[0.08em] text-[color:var(--ink-soft)]">
                    {locale === "en" ? "Reflection" : "想像紀錄"}
                  </span>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
