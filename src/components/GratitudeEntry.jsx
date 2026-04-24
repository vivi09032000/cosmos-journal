import { useEffect, useState } from "react";
import { Tag } from "./CosmosDecor";

export default function GratitudeEntry({ entry, onSave }) {
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

  return (
    <form onSubmit={handleSubmit} className="paper-card space-y-4 px-5 py-5">
      <Tag color="var(--olive)">今天，我感謝的三件事</Tag>
      <div className="paper-card-soft flex items-center gap-3 px-3 py-3">
        <span className="timeline-dot shrink-0">1</span>
        <input
          value={form.item1}
          onChange={(event) => updateField("item1", event.target.value)}
          className="w-full border-none bg-transparent text-sm text-[color:var(--ink)] outline-none"
          placeholder="此刻最想感謝的是..."
        />
      </div>
      <div className="paper-card-soft flex items-center gap-3 px-3 py-3">
        <span className="timeline-dot shrink-0">2</span>
        <input
          value={form.item2}
          onChange={(event) => updateField("item2", event.target.value)}
          className="w-full border-none bg-transparent text-sm text-[color:var(--ink)] outline-none"
          placeholder="今天一個小小的美好..."
        />
      </div>
      <div className="paper-card-soft flex items-center gap-3 px-3 py-3">
        <span className="timeline-dot shrink-0">3</span>
        <input
          value={form.item3}
          onChange={(event) => updateField("item3", event.target.value)}
          className="w-full border-none bg-transparent text-sm text-[color:var(--ink)] outline-none"
          placeholder="一件讓你微笑的事..."
        />
      </div>
      <button
        type="submit"
        disabled={!form.item1.trim() || saving}
        className="primary-button w-full"
      >
        {saving ? "感恩已送出，宇宙已收到" : saved ? "✓ 已記錄" : "記錄感恩"}
      </button>
    </form>
  );
}
