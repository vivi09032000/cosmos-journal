import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n";
import { Tag } from "./CosmosDecor";

export default function GratitudeEntry({ entry, onSave }) {
  const { locale } = useI18n();
  const [form, setForm] = useState({
    item1: "",
    item2: "",
    item3: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({
      item1: entry?.item1 || "",
      item2: entry?.item2 || "",
      item3: entry?.item3 || "",
    });
    setSaved(Boolean(entry?.item1 || entry?.item2 || entry?.item3));
  }, [entry]);

  const updateField = (key, value) => {
    setSaved(false);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
    setSaved(true);
  };

  const copy = locale === "en"
    ? {
      title: "Three things I am grateful for today",
      placeholders: [
        "What are you most grateful for right now?",
        "One small good thing from today...",
        "One thing that made you smile...",
      ],
      saving: "Sent. The universe has received it.",
      saved: "✓ Logged",
      save: "Log gratitude",
    }
    : {
      title: "今天，我感謝的三件事",
      placeholders: [
        "此刻最想感謝的是...",
        "今天一個小小的美好...",
        "一件讓你微笑的事...",
      ],
      saving: "感恩已送出，宇宙已收到",
      saved: "✓ 已記錄",
      save: "記錄感恩",
    };

  return (
    <form onSubmit={handleSubmit} className="paper-card space-y-4 px-5 py-5">
      <Tag color="var(--olive)">{copy.title}</Tag>
      <div className="paper-card-soft flex items-center gap-3 px-3 py-3">
        <span className="timeline-dot shrink-0">1</span>
        <input
          value={form.item1}
          onChange={(event) => updateField("item1", event.target.value)}
          className="w-full border-none bg-transparent text-sm text-[color:var(--ink)] outline-none"
          placeholder={copy.placeholders[0]}
        />
      </div>
      <div className="paper-card-soft flex items-center gap-3 px-3 py-3">
        <span className="timeline-dot shrink-0">2</span>
        <input
          value={form.item2}
          onChange={(event) => updateField("item2", event.target.value)}
          className="w-full border-none bg-transparent text-sm text-[color:var(--ink)] outline-none"
          placeholder={copy.placeholders[1]}
        />
      </div>
      <div className="paper-card-soft flex items-center gap-3 px-3 py-3">
        <span className="timeline-dot shrink-0">3</span>
        <input
          value={form.item3}
          onChange={(event) => updateField("item3", event.target.value)}
          className="w-full border-none bg-transparent text-sm text-[color:var(--ink)] outline-none"
          placeholder={copy.placeholders[2]}
        />
      </div>
      <button
        type="submit"
        disabled={!form.item1.trim() || saving}
        className="primary-button w-full"
      >
        {saving ? copy.saving : saved ? copy.saved : copy.save}
      </button>
    </form>
  );
}
