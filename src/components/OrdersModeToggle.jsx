export default function OrdersModeToggle({ mode, onChange }) {
  return (
    <div className="inline-flex items-center rounded-full border border-[rgba(181,120,58,0.22)] bg-[rgba(250,246,240,0.9)] p-1">
      <button
        type="button"
        onClick={() => onChange("active")}
        className={`rounded-full px-4 py-2 text-[0.72rem] tracking-[0.18em] transition ${
          mode === "active"
            ? "bg-[rgba(181,120,58,0.14)] text-[color:var(--gold)]"
            : "text-[color:var(--ink-faint)]"
        }`}
      >
        運送中
      </button>
      <button
        type="button"
        onClick={() => onChange("delivered")}
        className={`rounded-full px-4 py-2 text-[0.72rem] tracking-[0.18em] transition ${
          mode === "delivered"
            ? "bg-[rgba(181,120,58,0.14)] text-[color:var(--gold)]"
            : "text-[color:var(--ink-faint)]"
        }`}
      >
        已實現
      </button>
    </div>
  );
}
