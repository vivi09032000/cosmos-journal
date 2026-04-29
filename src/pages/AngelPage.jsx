import { useEffect, useMemo, useState } from "react";
import { getAngelData } from "../hooks/useAngelLogs";
import { useI18n } from "../lib/i18n";

function formatDate(timestamp, locale) {
  if (!timestamp?.toDate) return "";
  return timestamp.toDate().toLocaleDateString(locale === "en" ? "en-US" : "zh-TW", {
    month: "numeric",
    day: "numeric",
  });
}

export default function AngelPage({ orders, angelLogs, onCreateAngelLog }) {
  const { locale } = useI18n();
  const angelData = useMemo(() => getAngelData(locale), [locale]);
  const [number, setNumber] = useState("");
  const [decoded, setDecoded] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const copy = locale === "en"
    ? {
      kicker: "ANGEL DECODER · SIGNAL",
      title: "Signal Decoder",
      subtitle: "Enter the number you saw — the universe is speaking.",
      placeholder: "e.g. 111 · 444 · 1010",
      decode: "Decode signal ✦",
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
  }, [number, note]);

  const handleDecode = () => {
    const trimmed = number.trim();
    if (!trimmed) return;
    const result = angelData[trimmed] || null;
    setDecoded({ number: trimmed, result });
    setSaved(false);
    setNote("");
  };

  const handleSave = async () => {
    if (!decoded) return;
    setSaving(true);
    try {
      await onCreateAngelLog({
        number: decoded.number,
        mood: "calm",
        note: note.trim(),
        linkedOrderId: "",
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
        <section>
          {decoded.result ? (
            <>
              <div className="decode-result-card">
                <p className="decode-number">{decoded.number}</p>
                <h3 className="mt-3 font-[var(--font-display)] text-[1.25rem] leading-[1.4]">
                  {decoded.result.title}
                </h3>
                <p className="mt-3 text-[0.85rem] leading-7 opacity-85">
                  {decoded.result.message}
                </p>
                <span className="decode-energy-tag">
                  {decoded.result.energy}
                </span>
              </div>

              {/* Save section */}
              <div className="paper-card mt-3 px-5 py-4">
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
      ) : null}

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
