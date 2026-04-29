import { useEffect, useMemo, useState } from "react";
import {
  LeafDecor,
  SunRays,
  Tag,
  WaveDivider,
} from "../components/CosmosDecor";
import { getAngelData } from "../hooks/useAngelLogs";
import { useI18n } from "../lib/i18n";

function formatDate(timestamp, locale) {
  if (!timestamp?.toDate) return "";
  return timestamp.toDate().toLocaleDateString(locale === "en" ? "en-US" : "zh-TW", {
    month: "numeric",
    day: "numeric",
  });
}

const QUICK_NUMBERS = ["111", "222", "333", "444", "555", "777", "888", "999"];

export default function AngelPage({ orders, angelLogs, onCreateAngelLog }) {
  const { locale } = useI18n();
  const angelData = useMemo(() => getAngelData(locale), [locale]);
  const visibleOrders = useMemo(
    () => orders.filter((order) => order.status !== "delivered").slice(0, 5),
    [orders],
  );
  const [number, setNumber] = useState("");
  const [decoded, setDecoded] = useState(null);
  const [note, setNote] = useState("");
  const [showLink, setShowLink] = useState(false);
  const [linkedOrderId, setLinkedOrderId] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const copy = locale === "en"
    ? {
      kicker: "ANGEL DECODER · SIGNAL",
      title: "Signal Decoder",
      subtitle: "Enter the number you saw — the universe is speaking.",
      placeholder: "e.g. 111 · 444 · 1010",
      decode: "Decode signal ✦",
      commonTitle: "Common signals",
      relatedTitle: "Is this signal connected to a goal?",
      linkOpen: "Link to my goals",
      linkClose: "Collapse",
      linked: "Linked",
      choose: "Link →",
      noOrders: "No active goals yet.",
      notFound: "This number isn't in the database yet. Try 111, 222, 333, 444, 555, 777, 888, 999.",
      notePlaceholder: "How did you feel in that moment? (optional)",
      save: "Save this signal",
      saving: "Saving...",
      saved: "✓ Signal saved",
      historyTitle: "History",
      noHistory: "No decoded signals yet.",
    }
    : {
      kicker: "ANGEL DECODER · 天使訊號",
      title: "訊號解碼",
      subtitle: "輸入你看到的數字，宇宙正在說話",
      placeholder: "例如 111 · 444 · 1010",
      decode: "解碼訊息 ✦",
      commonTitle: "常見天使數字",
      relatedTitle: "這個訊號與你的願望有關嗎？",
      linkOpen: "連結到我的目標",
      linkClose: "收起",
      linked: "已連結",
      choose: "連結 →",
      noOrders: "目前還沒有進行中的目標。",
      notFound: "這組數字尚未收錄。目前支援：111、222、333、444、555、777、888、999。",
      notePlaceholder: "當下的感受是什麼？（選填）",
      save: "儲存這個訊號",
      saving: "儲存中...",
      saved: "✓ 已儲存訊號",
      historyTitle: "歷史紀錄",
      noHistory: "還沒有解碼紀錄。",
    };

  useEffect(() => {
    setSaved(false);
  }, [number, note, linkedOrderId]);

  const decodeNumber = (rawNumber) => {
    const trimmed = rawNumber.trim();
    if (!trimmed) return;
    const knownKey = Object.keys(angelData).find((key) => trimmed.includes(key));
    const result = knownKey ? angelData[knownKey] : null;
    setDecoded({ number: trimmed, result });
    setSaved(false);
    setNote("");
    setShowLink(false);
    setLinkedOrderId("");
  };

  const handleDecode = () => {
    decodeNumber(number);
  };

  const handleQuickDecode = (quickNumber) => {
    setNumber(quickNumber);
    decodeNumber(quickNumber);
  };

  const handleSave = async () => {
    if (!decoded) return;
    setSaving(true);
    try {
      await onCreateAngelLog({
        number: decoded.number,
        mood: "calm",
        note: note.trim(),
        linkedOrderId,
        decodedMessage: decoded.result?.message || "",
      });
      setSaved(true);
    } catch (err) {
      console.error("Save angel log error:", err);
    }
    setSaving(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleDecode();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <section>
        <p className="gold-kicker">{copy.kicker}</p>
        <h1 className="page-title mt-2">{copy.title}</h1>
        <p className="mt-2 text-[0.82rem] italic leading-6 text-[color:var(--ink-soft)]">
          {copy.subtitle}
        </p>
      </section>

      {/* Input area */}
      <section className="paper-card px-5 py-5">
        <input
          type="text"
          inputMode="numeric"
          value={number}
          onChange={(e) => setNumber(e.target.value.replace(/[^\d]/g, ""))}
          onKeyDown={handleKeyDown}
          placeholder={copy.placeholder}
          className="cosmos-input text-center text-[1.3rem] font-[var(--font-display)] tracking-[0.12em] placeholder:text-[0.88rem] placeholder:font-normal placeholder:tracking-[0.08em]"
        />
        <button
          type="button"
          onClick={handleDecode}
          disabled={!number.trim()}
          className="mt-4 w-full rounded-xl py-3.5 text-[0.88rem] font-medium tracking-[0.14em] transition disabled:opacity-40"
          style={{
            background: "linear-gradient(180deg, rgba(51,66,103,0.98), rgba(29,39,68,0.99))",
            color: "#fff4de",
            boxShadow: "0 4px 16px rgba(29,39,68,0.25)",
          }}
        >
          {copy.decode}
        </button>
      </section>

      {/* Decode result */}
      {decoded ? (
        <section className="space-y-3">
          {decoded.result ? (
            <>
              <div className="paper-card relative overflow-hidden px-5 py-5">
                <SunRays size={96} className="absolute -right-7 -top-7 opacity-[0.16]" />
                <LeafDecor className="absolute -bottom-2 -right-2" />
                <Tag>{decoded.result.energy}</Tag>
                <div className="mt-4 flex items-start gap-4">
                  <p className="font-[var(--font-display)] text-[3.8rem] leading-none tracking-[0.04em] text-[color:var(--gold)]">
                    {decoded.number}
                  </p>
                  <div className="min-w-0 flex-1 pt-1">
                    <h3 className="font-[var(--font-display)] text-[1.35rem] leading-[1.35] text-[color:var(--ink)]">
                      {decoded.result.title}
                    </h3>
                    <p className="mt-2 text-sm italic leading-7 text-[color:var(--ink-soft)]">
                      {decoded.result.message}
                    </p>
                  </div>
                </div>
                <WaveDivider className="mt-4 opacity-60" />
              </div>

              <div className="paper-card px-5 py-4">
                <Tag>{copy.relatedTitle}</Tag>
                <button
                  type="button"
                  onClick={() => setShowLink((current) => !current)}
                  className="text-action-button mt-3"
                >
                  {showLink ? `▾ ${copy.linkClose}` : `▸ ${copy.linkOpen}`}
                </button>
                {showLink ? (
                  <div className="mt-3 divide-y divide-[rgba(181,120,58,0.1)]">
                    {visibleOrders.length > 0 ? (
                      visibleOrders.map((order) => {
                        const isLinked = linkedOrderId === order.id;
                        return (
                          <button
                            key={order.id}
                            type="button"
                            onClick={() => setLinkedOrderId(order.id)}
                            className="flex w-full items-center gap-3 py-3 text-left"
                          >
                            <span className="w-12 shrink-0 text-[0.65rem] tracking-[0.14em] text-[color:var(--gold)]">
                              {order.angelNumber ? `#${order.angelNumber}` : "MANIFEST"}
                            </span>
                            <span className="min-w-0 flex-1 truncate font-[var(--font-display)] text-[0.98rem] text-[color:var(--ink)]">
                              {order.title}
                            </span>
                            <span className="shrink-0 text-[0.72rem] tracking-[0.12em] text-[color:var(--gold)]">
                              {isLinked ? copy.linked : copy.choose}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <p className="py-3 text-sm leading-6 text-[color:var(--ink-soft)]">
                        {copy.noOrders}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="paper-card px-5 py-4">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={copy.notePlaceholder}
                  rows={2}
                  className="cosmos-textarea"
                />
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || saved}
                  className="primary-button mt-3 w-full"
                >
                  {saving ? copy.saving : saved ? copy.saved : copy.save}
                </button>
              </div>
            </>
          ) : (
            <div className="paper-card px-5 py-5">
              <p className="text-sm leading-7 text-[color:var(--ink-soft)]">
                {copy.notFound}
              </p>
            </div>
          )}
        </section>
      ) : (
        <section className="paper-card px-5 py-5">
          <Tag>{copy.commonTitle}</Tag>
          <div className="mt-4 grid grid-cols-2 gap-3 min-[420px]:grid-cols-3">
            {QUICK_NUMBERS.map((quickNumber) => {
              const data = angelData[quickNumber];
              return (
                <button
                  key={quickNumber}
                  type="button"
                  onClick={() => handleQuickDecode(quickNumber)}
                  className="rounded-lg border border-[rgba(181,120,58,0.16)] bg-[rgba(237,228,216,0.54)] px-4 py-4 text-left transition hover:border-[rgba(181,120,58,0.36)]"
                >
                  <span className="block font-[var(--font-display)] text-[1.65rem] leading-none text-[color:var(--gold)]">
                    {quickNumber}
                  </span>
                  <span className="mt-2 block text-[0.62rem] tracking-[0.2em] text-[color:var(--ink-faint)]">
                    {data?.energy || "SIGNAL"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* History */}
      <section className="paper-card px-5 py-5">
        <p className="section-label">{copy.historyTitle}</p>
        {angelLogs.length === 0 ? (
          <p className="mt-3 text-sm text-[color:var(--ink-soft)]">
            {copy.noHistory}
          </p>
        ) : (
          <div className="mt-3 space-y-0">
            {angelLogs.slice(0, 20).map((log) => {
              const data = angelData[log.number];
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between gap-3 border-b border-[rgba(181,120,58,0.08)] py-3 last:border-b-0"
                >
                  <span className="text-[0.72rem] tracking-[0.12em] text-[color:var(--ink-faint)]">
                    {formatDate(log.recordedAt, locale)}
                  </span>
                  <span className="font-[var(--font-display)] text-[1.1rem] text-[color:var(--navy-deep)]">
                    {log.number}
                  </span>
                  <span className="text-[0.72rem] tracking-[0.12em] text-[color:var(--ink-soft)]">
                    {data?.energy || "·"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
