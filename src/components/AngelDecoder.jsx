import { useEffect, useMemo, useState } from "react";
import { LeafDecor, Tag, WaveDivider } from "../components/CosmosDecor";
import { getAngelData } from "../hooks/useAngelLogs";
import { useI18n } from "../lib/i18n";

const quickNumbers = ["111", "222", "333", "444", "555", "777", "888", "999"];

export default function AngelDecoder({ orders, onSave }) {
  const { locale } = useI18n();
  const [number, setNumber] = useState("444");
  const [mood, setMood] = useState("calm");
  const [note, setNote] = useState("");
  const [linkedOrderId, setLinkedOrderId] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const angelData = useMemo(() => getAngelData(locale), [locale]);
  const result = useMemo(() => angelData[number], [angelData, number]);
  const linkedOrder = useMemo(
    () => orders.find((order) => order.id === linkedOrderId) || null,
    [linkedOrderId, orders],
  );
  const moods = locale === "en"
    ? [
      { label: "Calm", value: "calm" },
      { label: "Sad", value: "sad" },
      { label: "Anxious", value: "anxious" },
      { label: "Confused", value: "confused" },
      { label: "Hopeful", value: "excited" },
      { label: "Moved", value: "touched" },
    ]
    : [
      { label: "平靜", value: "calm" },
      { label: "難過", value: "sad" },
      { label: "焦慮", value: "anxious" },
      { label: "迷惘", value: "confused" },
      { label: "期待", value: "excited" },
      { label: "感動", value: "touched" },
    ];

  const copy = locale === "en"
    ? {
      title: "Angel number decoder",
      subtitle: "When the universe speaks to you through numbers",
      inputLabel: "Enter the number you saw",
      inputPlaceholder: "For example 444",
      supported: "Supported numbers: 111, 222, 333, 444, 555, 777, 888, 999.",
      energyPrefix: (energy) => `This number carries the energy of “${energy}.”`,
      decodeFallback: "Decode",
      invalidTitle: "Enter a supported number",
      invalidMessage: "Only the fixed numbers from the spec are supported right now.",
      moodLabel: "Current mood",
      noteLabel: "Mood note",
      notePlaceholder: "Write anything you want to keep from this moment...",
      orderLabel: "Which goal does this signal remind you of?",
      noOrders: "There are no goals to link yet.",
      noLink: "Do not link a goal yet",
      linkedTo: (title) => `This signal will be linked to “${title}.”`,
      saving: "Saving...",
      saved: "✓ This moment is saved",
      save: "Save this moment",
    }
    : {
      title: "天使數字解碼",
      subtitle: "當宇宙透過數字與你說話",
      inputLabel: "輸入你看到的數字",
      inputPlaceholder: "例如 444",
      supported: "目前支援 111、222、333、444、555、777、888、999。",
      energyPrefix: (energy) => `這組數字帶來的是「${energy}」能量。`,
      decodeFallback: "解碼",
      invalidTitle: "請先輸入有效數字",
      invalidMessage: "目前只支援 spec 中的固定數字。",
      moodLabel: "此刻心情",
      noteLabel: "心情筆記",
      notePlaceholder: "想記下這一刻，可以寫在這裡...",
      orderLabel: "這個訊號讓你想到哪個目標？",
      noOrders: "目前還沒有目標可連結。",
      noLink: "先不連結目標",
      linkedTo: (title) => `這則訊號會連結到「${title}」。`,
      saving: "記錄中...",
      saved: "✓ 已記錄這個時刻",
      save: "記錄這個時刻",
    };

  useEffect(() => {
    setSaved(false);
  }, [number, mood, note, linkedOrderId]);

  const handleNumberChange = (event) => {
    const nextValue = event.target.value.replace(/\D/g, "").slice(0, 3);
    setNumber(nextValue);
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    await onSave({
      number,
      mood,
      note,
      linkedOrderId,
      decodedMessage: result?.message || "",
    });
    setSaving(false);
    setSaved(true);
    setNote("");
    setLinkedOrderId("");
  };

  return (
    <section className="space-y-5">
      <div className="screen-header">
        <p className="gold-kicker">Angel Numbers</p>
        <h1 className="section-title mt-2 text-[2rem]">{copy.title}</h1>
        <p className="mt-2 text-sm italic text-[color:var(--ink-soft)]">{copy.subtitle}</p>
        <WaveDivider className="wave-divider" />
      </div>

      <div className="paper-card px-4 py-4">
        <label className="text-sm font-medium text-[color:var(--ink-soft)]">{copy.inputLabel}</label>
        <input
          value={number}
          onChange={handleNumberChange}
          className="cosmos-input mt-2 text-lg"
          inputMode="numeric"
          placeholder={copy.inputPlaceholder}
        />
        <div className="mt-3 grid grid-cols-5 gap-2">
          {quickNumbers.map((quickNumber) => (
            <button
              key={quickNumber}
              type="button"
              onClick={() => setNumber(quickNumber)}
              className={`secondary-button min-h-[2.7rem] rounded-[0.95rem] px-0 text-sm ${
                number === quickNumber
                  ? "bg-[linear-gradient(180deg,rgba(51,66,103,0.98),rgba(29,39,68,0.99))] text-[#fff4de]"
                  : ""
              }`}
            >
              {quickNumber}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs leading-6 text-[color:var(--ink-faint)]">
          {result
            ? copy.energyPrefix(result.energy)
            : copy.supported}
        </p>
      </div>

      <div className="paper-card relative overflow-hidden px-5 py-5">
        <LeafDecor className="absolute bottom-0 right-0" />
        <Tag color={number === "222" ? "var(--olive)" : "var(--gold)"}>
          {result?.energy || copy.decodeFallback}
        </Tag>
        <p className="mt-4 font-display text-[3.5rem] leading-none text-[color:var(--gold)]">{number}</p>
        <p className="mt-3 font-display text-[1.35rem] text-[color:var(--ink)]">{result?.title || copy.invalidTitle}</p>
        <WaveDivider className="wave-divider" />
        <p className="mt-3 text-sm italic leading-8 text-[color:var(--ink-soft)]">{result?.message || copy.invalidMessage}</p>
      </div>

      <div className="paper-card px-4 py-4">
        <p className="text-sm font-medium text-[color:var(--ink-soft)]">{copy.moodLabel}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {moods.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setMood(item.value)}
              className={`secondary-button min-h-[2.6rem] px-4 text-sm ${
                mood === item.value
                  ? "bg-[linear-gradient(180deg,rgba(51,66,103,0.98),rgba(29,39,68,0.99))] text-[#fff4de]"
                  : ""
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="paper-card px-4 py-4">
        <label className="text-sm font-medium text-[color:var(--ink-soft)]">{copy.noteLabel}</label>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={4}
          className="cosmos-textarea mt-2"
          placeholder={copy.notePlaceholder}
        />
      </div>

      <div className="paper-card px-4 py-4">
        <label className="text-sm font-medium text-[color:var(--ink-soft)]">{copy.orderLabel}</label>
        <div className="mt-2 space-y-2">
          {orders.length === 0 ? (
            <p className="text-sm text-[color:var(--ink-soft)]">{copy.noOrders}</p>
          ) : (
            <>
              <label className="paper-card-soft flex items-center gap-3 px-4 py-3">
                <input
                  type="radio"
                  name="linkedOrder"
                  checked={linkedOrderId === ""}
                  onChange={() => setLinkedOrderId("")}
                />
                <span className="text-sm text-[color:var(--ink)]">{copy.noLink}</span>
              </label>
              {orders.map((order) => (
                <label key={order.id} className="paper-card-soft flex items-center gap-3 px-4 py-3">
                  <input
                    type="radio"
                    name="linkedOrder"
                    checked={linkedOrderId === order.id}
                    onChange={() => setLinkedOrderId(order.id)}
                  />
                  <span className="text-sm text-[color:var(--ink)]">{order.title}</span>
                </label>
              ))}
            </>
          )}
        </div>
        {linkedOrder ? (
          <p className="mt-3 text-xs leading-6 text-[color:var(--ink-faint)]">
            {copy.linkedTo(linkedOrder.title)}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={!result || saving}
        className="primary-button w-full"
      >
        {saving ? copy.saving : saved ? copy.saved : copy.save}
      </button>
    </section>
  );
}
