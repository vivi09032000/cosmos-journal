import { useState, useCallback, useEffect, useRef } from "react";
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
  const sheetRef = useRef(null);
  const titleId = "number-signal-sheet-title";
  const [closing, setClosing] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState("");
  const [customNumber, setCustomNumber] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedMood, setSelectedMood] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const copy = locale === "en"
    ? {
      title: "What number did you see today?",
      close: "Close",
      customPlaceholder: "Enter a number...",
      moodTitle: "How did it feel?",
      notePlaceholder: "What were you thinking?",
      save: "Record this moment",
      saving: "Saving...",
      error: "This moment could not be saved. Please try again.",
    }
    : {
      title: "今天看到什麼數字？",
      close: "關閉",
      customPlaceholder: "自己輸入數字...",
      moodTitle: "當下的感覺？",
      notePlaceholder: "當下在想什麼？",
      save: "記錄這個時刻",
      saving: "儲存中...",
      error: "這個時刻儲存失敗，請再試一次。",
    };

  useEffect(() => {
    if (open) {
      setSelectedNumber("");
      setCustomNumber("");
      setShowCustomInput(false);
      setSelectedMood("");
      setNote("");
      setSaving(false);
      setError("");
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
    setError("");
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
      setError(err?.message || copy.error);
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!open) return undefined;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.setTimeout(() => {
      const firstFocusable = sheetRef.current?.querySelector(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
      );
      firstFocusable?.focus();
    }, 0);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
        return;
      }

      if (event.key !== "Tab" || !sheetRef.current) return;

      const focusable = [...sheetRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )];

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [handleClose, open]);

  if (!open) return null;

  const finalNumber = showCustomInput ? customNumber.trim() : selectedNumber;

  return (
    <>
      <div
        className={`bottom-sheet-overlay ${closing ? "closing" : ""}`}
        onClick={handleClose}
      />
      <div
        ref={sheetRef}
        className={`bottom-sheet ${closing ? "closing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="bottom-sheet-handle" />
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(181,120,58,0.16)] bg-[rgba(250,246,240,0.76)] text-[1.1rem] text-[color:var(--ink-soft)]"
          aria-label={copy.close}
        >
          ×
        </button>

        <h2 id={titleId} className="pr-12 font-[var(--font-display)] text-[1.55rem] leading-[1.3] text-[color:var(--navy-deep)]">
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
              className={`soft-choice-button ${
                selectedNumber === num && !showCustomInput
                  ? "soft-choice-button-selected"
                  : ""
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
            className={`soft-choice-button ${
              showCustomInput
                ? "soft-choice-button-selected"
                : ""
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
              className={`soft-choice-button shrink-0 ${
                selectedMood === mood.value
                  ? "soft-choice-button-selected"
                  : ""
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

        {error ? (
          <p className="mt-3 text-sm leading-6 text-[color:var(--danger)]" role="alert">
            {error}
          </p>
        ) : null}

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
