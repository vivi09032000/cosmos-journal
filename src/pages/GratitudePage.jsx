import GratitudeEntry from "../components/GratitudeEntry";
import { useI18n } from "../lib/i18n";

function formatDate(date, locale) {
  if (!date) return "";
  return new Date(date).toLocaleDateString(locale === "en" ? "en-US" : "zh-TW", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });
}

export default function GratitudePage({ todayEntry, entries, streak, onSave }) {
  const { locale } = useI18n();
  const timeline = [...entries]
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 6);

  return (
    <div className="space-y-5">
      <section>
        <p className="gold-kicker">Gratitude Record</p>
        <h1 className="page-title mt-2">{locale === "en" ? "Gratitude Journal" : "感恩日記"}</h1>
      </section>

      <GratitudeEntry entry={todayEntry} onSave={onSave} />

      <section>
        <p className="section-label">{locale === "en" ? "Gratitude milestones" : "感恩里程"}</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="paper-card-soft flex items-center gap-4 px-4 py-4">
            <div className="coin-badge">
              <span className="font-[var(--font-display)] text-2xl text-[color:var(--navy-deep)]">{streak}</span>
            </div>
            <div>
              <p className="font-[var(--font-display)] text-3xl text-[color:var(--navy-deep)]">{locale === "en" ? `${streak} days` : `${streak}天`}</p>
              <p className="mt-1 text-xs tracking-[0.14em] text-[color:var(--ink-soft)]">{locale === "en" ? "Current streak" : "持續感恩中"}</p>
            </div>
          </div>
          <div className="paper-card-soft flex items-center gap-4 px-4 py-4">
            <div className="coin-badge bg-[linear-gradient(145deg,rgba(223,215,242,0.94),rgba(176,164,214,0.92))]">
              <span className="font-[var(--font-display)] text-2xl text-[color:var(--navy-deep)]">{entries.length}</span>
            </div>
            <div>
              <p className="font-[var(--font-display)] text-3xl text-[color:var(--navy-deep)]">{locale === "en" ? `${entries.length} entries` : `${entries.length}次`}</p>
              <p className="mt-1 text-xs tracking-[0.14em] text-[color:var(--ink-soft)]">{locale === "en" ? "Journey total" : "感恩之旅"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="paper-card px-5 py-5">
        <p className="section-label">{locale === "en" ? "Gratitude timeline" : "感恩時間軸"}</p>
        <div className="timeline-rail mt-4 space-y-4">
          {timeline.length === 0 ? (
            <p className="text-sm text-[color:var(--ink-soft)]">{locale === "en" ? "No gratitude entries yet." : "還沒有感恩記錄。"}</p>
          ) : (
            timeline.map((entry, index) => (
              <article key={`${entry.date}-${index}`} className="relative pl-10">
                <span className="timeline-dot absolute left-0 top-1">✦</span>
                <div className="paper-card-soft px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs tracking-[0.16em] text-[color:var(--ink-faint)]">{formatDate(entry.date, locale)}</p>
                    <span className="text-[color:var(--ink-faint)]">⋯</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--ink)]">
                    {locale === "en" ? `Grateful for ${entry.item1 || "this day"}.` : `感謝 ${entry.item1 || "這一天"}。`}
                    {entry.item2 ? ` ${entry.item2}。` : ""}
                    {entry.item3 ? ` ${entry.item3}。` : ""}
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
