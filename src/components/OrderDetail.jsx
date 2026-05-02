import { useEffect, useMemo, useRef, useState } from "react";
import {
  daysSince,
  formatOrderMonth,
  getOrderTheme,
  getOrderStatusLabel,
} from "../lib/orderTheme";
import OrderCoverArt from "./OrderCoverArt";
import {
  getActionSummary,
  getSuggestedActionPrompts,
} from "../lib/orderActions";
import { getOrderQuestions } from "../lib/orderQuestions";
import { useI18n } from "../lib/i18n";

const statusActions = {
  "zh-TW": {
    packing: { label: "對準中，繼續投射", next: "aligning" },
    aligning: { label: "✨ 已實現，點此收貨", next: "delivered" },
  },
  en: {
    packing: { label: "Move into alignment", next: "aligning" },
    aligning: { label: "✨ It manifested. Mark delivered", next: "delivered" },
  },
};

function formatDate(timestamp, locale) {
  if (!timestamp?.toDate) return "";
  return timestamp.toDate().toLocaleString(locale === "en" ? "en-US" : "zh-TW");
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
  const [imageSaving, setImageSaving] = useState(false);
  const [imageError, setImageError] = useState("");
  const [actionSuggestionIndex, setActionSuggestionIndex] = useState(0);
  const imageInputRef = useRef(null);
  const statusCopy = statusActions[locale] || statusActions["zh-TW"];
  const action = statusCopy[order.status];
  const canSubmit = answers.every((answer) => answer.trim().length > 0);
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

  useEffect(() => {
    setAnswers(["", "", ""]);
    setStep(0);
    setCustomAction("");
    setJournalSent(false);
    setImageError("");
    setActionSuggestionIndex(0);
  }, [order.id]);

  const copy = locale === "en"
    ? {
      back: "Back to goals",
      changeImage: "Change goal image",
      journalKicker: "Journal Prompt",
      journalTitle: "Sensory projection",
      answerPlaceholder: "Write what this feels like...",
      sending: "Sending...",
      send: "Send to universe",
      actionKicker: "Inspired Action",
      actionTitle: "What is the next inspired action?",
      actionAfterJournal: "The universe received your projection. Now do one small real thing so the wish can enter reality.",
      actionBeforeJournal: "When you take one small real step, the path becomes easier for the universe to reveal.",
      suggestionSaved: "Added to your progress",
      suggestionSave: "Receive this prompt",
      nextSuggestion: "Next idea →",
      customActionLabel: "Write down the action you received",
      customActionPlaceholder: "For example: check snow pass and flight prices...",
      addAction: "Add to my progress",
      activeActions: "Small aligned actions",
      aligned: (done, total) => `Aligned ${done}/${total}`,
      noActions: "There are no action prompts saved yet. Choose the lightest one and let the wish have a first step.",
      statusKicker: "Manifest Status",
      statusTitle: "Status update",
      completed: "This goal has already been completed.",
      historyKicker: "Past Entries",
      historyTitle: "Journal history",
      noHistory: "There are no journal entries yet.",
      uploadFailed: "Image upload failed: ",
      linkedSignals: "Linked signals",
    }
    : {
      back: "返回目標列表",
      changeImage: "更換願景圖片",
      journalKicker: "Journal Prompt",
      journalTitle: "感官日記對話",
      answerPlaceholder: "寫下你的感受...",
      sending: "發送中...",
      send: "發送給宇宙",
      actionKicker: "Inspired Action",
      actionTitle: "你的下一個靈感行動是什麼？",
      actionAfterJournal: "宇宙收到你的投射了，現在邀請你做一件很小但很真的事，讓願望開始落進現實。",
      actionBeforeJournal: "當你願意為願望做一個微小而真實的動作，宇宙會更容易把路徑推到你面前。",
      suggestionSaved: "已收進你的進度",
      suggestionSave: "收下這個提示",
      nextSuggestion: "換一個靈感 →",
      customActionLabel: "把你收到的行動靈感寫下來",
      customActionPlaceholder: "例如：去看一下雪票和機票的價格...",
      addAction: "收進我的進度",
      activeActions: "顯化中的微小行動",
      aligned: (done, total) => `已對齊 ${done}/${total}`,
      noActions: "還沒有收進任何行動靈感。先挑一個最輕、最容易開始的提示，讓願望有第一步。",
      statusKicker: "Manifest Status",
      statusTitle: "狀態更新",
      completed: "這個目標已完成收貨。",
      historyKicker: "Past Entries",
      historyTitle: "過去的日記紀錄",
      noHistory: "還沒有日記紀錄。",
      uploadFailed: "圖片上傳失敗：",
      linkedSignals: "已連結訊號",
    };

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

  const handleSubmit = async () => {
    setSaving(true);
    await onSubmitJournal({
      q1: answers[0],
      q2: answers[1],
      q3: answers[2],
      prompts: questions,
    });
    setAnswers(["", "", ""]);
    setStep(0);
    setJournalSent(true);
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
              {order.angelNumber ? `#${order.angelNumber}` : "Manifest"}
            </span>
            <span className="status-pill">{getOrderStatusLabel(order.status, locale)}</span>
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

      <section className="paper-card px-5 py-5">
        <p className="section-label">{copy.journalKicker}</p>
        <h3 className="mt-2 font-display text-2xl text-[color:var(--navy-deep)]">{copy.journalTitle}</h3>
        {hasJournaledToday || journalSent ? (
          <div className="mt-4 rounded-xl bg-[rgba(181,120,58,0.06)] px-5 py-5 text-center">
            <p className="text-sm font-medium tracking-[0.1em] text-[color:var(--gold)]">
              ✦ {locale === "en" ? "Universe has received today's projection" : "宇宙已收到你今天的投射"}
            </p>
            <p className="mt-2 text-[0.8rem] leading-6 text-[color:var(--ink-soft)]">
              {locale === "en" ? "Come back tomorrow. The seed needs time to grow." : "明天再來吧，能量需要一點時間沉澱發芽。"}
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {questions.slice(0, step + 1).map((question, index) => (
              <div key={question} className="paper-card-soft px-4 py-4">
                <p className="text-sm font-medium leading-7 text-[color:var(--ink)]">{question}</p>
                <textarea
                  value={answers[index]}
                  onChange={(event) => handleAnswerChange(index, event.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={3}
                  className="cosmos-textarea mt-3"
                  placeholder={copy.answerPlaceholder}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || saving}
              className="primary-button w-full"
            >
              {saving ? copy.sending : copy.send}
            </button>
          </div>
        )}
      </section>

      <section className="paper-card px-5 py-5">
        <p className="section-label">{copy.actionKicker}</p>
        <h3 className="mt-2 font-display text-2xl text-[color:var(--navy-deep)]">{copy.actionTitle}</h3>
        <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">
          {journalSent || journalTimeline.length > 0
            ? copy.actionAfterJournal
            : copy.actionBeforeJournal}
        </p>

        <div className="mt-4 space-y-3">
          {activeSuggestion ? (
            <button
              type="button"
              onClick={() => handleAddActionItem(activeSuggestion)}
              disabled={
                actionSaving ||
                actionItems.some(
                  (item) => item.text.trim().toLowerCase() === activeSuggestion.toLowerCase(),
                )
              }
              className="paper-card-soft w-full px-4 py-4 text-left transition disabled:opacity-60"
            >
              <p className="text-sm leading-7 text-[color:var(--ink)]">
                {activeSuggestion}
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-[0.68rem] tracking-[0.16em] text-[color:var(--ink-faint)]">
                  {actionItems.some(
                    (item) => item.text.trim().toLowerCase() === activeSuggestion.toLowerCase(),
                  )
                    ? copy.suggestionSaved
                    : copy.suggestionSave}
                </p>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setActionSuggestionIndex((current) => (current + 1) % suggestedActions.length);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.stopPropagation();
                      setActionSuggestionIndex((current) => (current + 1) % suggestedActions.length);
                    }
                  }}
                  className="text-[0.72rem] tracking-[0.08em] text-[color:var(--gold)]"
                >
                  {copy.nextSuggestion}
                </span>
              </div>
            </button>
          ) : null}
        </div>

        <div className="mt-4 paper-card-soft px-4 py-4">
          <label className="text-sm font-medium text-[color:var(--ink)]">{copy.customActionLabel}</label>
          <input
            value={customAction}
            onChange={(event) => setCustomAction(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAddActionItem(customAction);
              }
            }}
            className="cosmos-input mt-3"
            placeholder={copy.customActionPlaceholder}
          />
          <button
            type="button"
            onClick={() => handleAddActionItem(customAction)}
            disabled={!customAction.trim() || actionSaving}
            className="secondary-button mt-3 w-full disabled:opacity-50"
          >
            {copy.addAction}
          </button>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[color:var(--ink)]">{copy.activeActions}</p>
            <p className="text-[0.68rem] tracking-[0.16em] text-[color:var(--ink-faint)]">
              {copy.aligned(actionSummary.completed, actionSummary.total)}
            </p>
          </div>

          {actionItems.length === 0 ? (
            <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">
              {copy.noActions}
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {actionItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggleActionItem(item.id)}
                  disabled={actionSaving}
                  className="paper-card-soft flex w-full items-start gap-3 px-4 py-4 text-left transition disabled:opacity-70"
                >
                  <span className="mt-1 text-lg leading-none text-[color:var(--gold)]">
                    {item.completed ? "✓" : "○"}
                  </span>
                  <span className="flex-1 text-sm leading-7 text-[color:var(--ink)]">
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="paper-card px-5 py-5">
        <p className="section-label">{copy.statusKicker}</p>
        <h3 className="mt-2 font-display text-2xl text-[color:var(--navy-deep)]">{copy.statusTitle}</h3>
        {action ? (
          <button
            type="button"
            onClick={() => onUpdateStatus(action.next)}
            className="primary-button mt-4 w-full"
          >
            {action.label}
          </button>
        ) : (
          <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">{copy.completed}</p>
        )}
      </section>

      <section className="paper-card px-5 py-5">
        <p className="section-label">{copy.historyKicker}</p>
        <h3 className="mt-2 font-display text-2xl text-[color:var(--navy-deep)]">{copy.historyTitle}</h3>
        <div className="timeline-rail mt-4 space-y-4">
          {journalTimeline.length === 0 ? (
            <p className="text-sm leading-7 text-[color:var(--ink-soft)]">{copy.noHistory}</p>
          ) : (
            journalTimeline.map((entry, index) => (
              <article key={`${entry.recordedAt?.seconds || "entry"}-${index}`} className="relative pl-10">
                <span className="timeline-dot absolute left-0 top-1">✦</span>
                <div className="paper-card-soft px-4 py-4">
                  <p className="text-xs tracking-[0.16em] text-[color:var(--ink-faint)]">{formatDate(entry.recordedAt, locale)}</p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--ink)]">
                    {entry.prompts?.[0] ? `1. ${entry.prompts[0]}` : "1."} {entry.q1}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--ink)]">
                    {entry.prompts?.[1] ? `2. ${entry.prompts[1]}` : "2."} {entry.q2}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--ink)]">
                    {entry.prompts?.[2] ? `3. ${entry.prompts[2]}` : "3."} {entry.q3}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
