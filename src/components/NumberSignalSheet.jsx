import { useState, useCallback, useEffect } from "react";
import { useI18n } from "../lib/i18n";

const QUICK_NUMBERS = [
  "111", "222", "333", "444", "555",
  "777", "888", "999", "1010", "1111", "1212",
];

const MOOD_OPTIONS = [
  { value: "calm", labels: { "zh-TW": "平靜", en: "Calm" } },
  { value: "hopeful", labels: { "zh-TW": "期待", en: "Hopeful" } },
  { value: "light", labels: { "zh-TW": "輕盈", en: "Light" } },
  { value: "tired", labels: { "zh-TW": "疲憊", en: "Tired" } },
  { value: "anxious", labels: { "zh-TW": "焦慮", en: "Anxious" } },
  { value: "grateful", labels: { "zh-TW": "感謝", en: "Grateful" } },
];

export default function NumberSignalSheet({
  open,
  onClose,
  onSave,
  onSaveNumberSignal,
}) {
  const { locale } = useI18n();
  const [closing, setClosing] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState("");
  const [customNumber, setCustomNumber] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedMood, setSelectedMood] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const copy = locale === "en"
    ? {
      title: "What number did you see today?",
      customPlaceholder: "Enter a number...",
      moodTitle: "How did it feel?",
      notePlaceholder: "What were you thinking?",
      save: "Record this moment",
      saving: "Saving...",
    }
    : {
      title: "今天看到什麼數字？",
      customPlaceholder: "自己輸入數字...",
      moodTitle: "當下的感覺？",
      notePlaceholder: "當下在想什麼？",
      save: "記錄這個時刻",
      saving: "儲存中...",
    };

  useEffect(() => {
    if (open) {
      setSelectedNumber("");
      setCustomNumber("");
      setShowCustomInput(false);
      setSelectedMood("");
      setNote("");
      setSaving(false);
      setClosing(false);
    }
  }, [open]);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 220);
  }, [onClose]);

  const handleSave = async () => {
    const number = showCustomInput ? customNumber.trim() : selectedNumber;
    if (!number) return;

    setSaving(true);
    try {
      // Save to angelLogs
      if (onSave) {
        await onSave({
          number,
          mood: selectedMood || "calm",
          note: note.trim(),
          linkedOrderId: "",
          decodedMessage: "",
        });
      }

      // Also save to dailyLogs
      if (onSaveNumberSignal) {
        await onSaveNumberSignal(number, note.trim());
      }

      handleClose();
    } catch (err) {
      console.error("NumberSignalSheet save error:", err);
      setSaving(false);
    }
  };

  if (!open) return null;

  const finalNumber = showCustomInput ? customNumber.trim() : selectedNumber;

  return (
    <>
      <div
        className={`bottom-sheet-overlay ${closing ? "closing" : ""}`}
        onClick={handleClose}
      />
      <div className={`bottom-sheet ${closing ? "closing" : ""}`}>
        <div className="bottom-sheet-handle" />

        <h2 className="font-[var(--font-display)] text-[1.55rem] leading-[1.3] text-[color:var(--navy-deep)]">
          {copy.title}
        </h2>

        {/* Quick select grid */}
        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_NUMBERS.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => {
                setSelectedNumber(num);
                setShowCustomInput(false);
                setCustomNumber("");
              }}
              className={`rounded-full border px-4 py-2 text-sm tracking-[0.08em] transition ${
                selectedNumber === num && !showCustomInput
                  ? "border-[rgba(181,120,58,0.5)] bg-[rgba(181,120,58,0.13)] text-[color:var(--gold)]"
                  : "border-[rgba(181,120,58,0.18)] bg-[rgba(250,246,240,0.62)] text-[color:var(--ink-soft)]"
              }`}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setShowCustomInput(true);
              setSelectedNumber("");
            }}
            className={`rounded-full border px-4 py-2 text-sm tracking-[0.08em] transition ${
              showCustomInput
                ? "border-[rgba(181,120,58,0.5)] bg-[rgba(181,120,58,0.13)] text-[color:var(--gold)]"
                : "border-[rgba(181,120,58,0.18)] bg-[rgba(250,246,240,0.62)] text-[color:var(--ink-soft)]"
            }`}
          >
            {locale === "en" ? "Custom" : "自己輸入"}
          </button>
        </div>

        {showCustomInput ? (
          <input
            type="text"
            inputMode="numeric"
            value={customNumber}
            onChange={(e) => setCustomNumber(e.target.value.replace(/[^\d]/g, ""))}
            placeholder={copy.customPlaceholder}
            className="cosmos-input mt-3"
            autoFocus
          />
        ) : null}

        {/* Mood select */}
        <p className="mt-5 section-label">{copy.moodTitle}</p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {MOOD_OPTIONS.map((mood) => (
            <button
              key={mood.value}
              type="button"
              onClick={() => setSelectedMood(mood.value)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm tracking-[0.08em] transition ${
                selectedMood === mood.value
                  ? "border-[rgba(181,120,58,0.5)] bg-[rgba(181,120,58,0.13)] text-[color:var(--gold)]"
                  : "border-[rgba(181,120,58,0.18)] bg-[rgba(250,246,240,0.62)] text-[color:var(--ink-soft)]"
              }`}
            >
              {mood.labels[locale] || mood.labels["zh-TW"]}
            </button>
          ))}
        </div>

        {/* Note */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={copy.notePlaceholder}
          rows={3}
          className="cosmos-textarea mt-4"
        />

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          disabled={!finalNumber || saving}
          className="primary-button mt-4 w-full"
        >
          {saving ? copy.saving : copy.save}
        </button>
      </div>
    </>
  );
}
