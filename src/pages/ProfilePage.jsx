import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import OrderCoverArt from "../components/OrderCoverArt";
import { useI18n } from "../lib/i18n";
import { getOrderTheme } from "../lib/orderTheme";

const LIFE_PATH_KEYWORDS = {
  "zh-TW": {
    1: { theme: "領導與開創", desc: "天生的先行者" },
    2: { theme: "平衡與合作", desc: "直覺引導著你" },
    3: { theme: "創意與表達", desc: "創造力是天賦" },
    4: { theme: "穩定與建構", desc: "根基帶來力量" },
    5: { theme: "自由與變化", desc: "為改變而生" },
    6: { theme: "愛與責任", desc: "心是最強的磁場" },
    7: { theme: "智慧與靈性", desc: "與宇宙的頻率相通" },
    8: { theme: "豐盛與成就", desc: "能量吸引豐盛" },
    9: { theme: "完成與慈悲", desc: "走向更高的使命" },
    11: { theme: "靈感與覺醒", desc: "宇宙的傳遞者" },
    22: { theme: "宏大藍圖", desc: "有能力建造奇蹟" },
    33: { theme: "療癒與光", desc: "存在本身就是禮物" },
  },
  en: {
    1: { theme: "Leadership & Creation", desc: "Born to lead the way" },
    2: { theme: "Balance & Cooperation", desc: "Guided by intuition" },
    3: { theme: "Creativity & Expression", desc: "Your creativity is a gift" },
    4: { theme: "Stability & Building", desc: "Your foundation is strength" },
    5: { theme: "Freedom & Change", desc: "Born for transformation" },
    6: { theme: "Love & Responsibility", desc: "Your heart is the strongest field" },
    7: { theme: "Wisdom & Spirit", desc: "Tuned to the universe" },
    8: { theme: "Abundance & Achievement", desc: "Your energy attracts abundance" },
    9: { theme: "Completion & Compassion", desc: "Walking toward a higher mission" },
    11: { theme: "Inspiration & Awakening", desc: "A channel for the universe" },
    22: { theme: "Grand Vision", desc: "The power to build miracles" },
    33: { theme: "Healing & Light", desc: "Your existence is a gift" },
  },
};

const MOOD_LABELS = {
  "zh-TW": {
    calm: "平靜", hopeful: "期待", light: "輕盈",
    tired: "疲憊", anxious: "焦慮", grateful: "感謝",
    sad: "難過", confused: "迷惘", excited: "期待", touched: "感動",
  },
  en: {
    calm: "Calm", hopeful: "Hopeful", light: "Light",
    tired: "Tired", anxious: "Anxious", grateful: "Grateful",
    sad: "Sad", confused: "Confused", excited: "Hopeful", touched: "Moved",
  },
};

function daysSinceTimestamp(timestamp) {
  if (!timestamp) return 0;
  const created = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
  return Math.max(0, Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)));
}

function MoodBarChart({ allDailyLogs, locale }) {
  const moodLabels = MOOD_LABELS[locale] || MOOD_LABELS["zh-TW"];

  const { moodCounts, maxCount } = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoff = sevenDaysAgo.toLocaleDateString("sv-SE");

    const counts = {};
    for (const log of allDailyLogs) {
      if (!log.mood || !log.date || log.date < cutoff) continue;
      counts[log.mood] = (counts[log.mood] || 0) + 1;
    }

    const max = Math.max(1, ...Object.values(counts));
    return { moodCounts: counts, maxCount: max };
  }, [allDailyLogs]);

  const sortedMoods = Object.entries(moodCounts).sort(([, a], [, b]) => b - a);

  if (sortedMoods.length === 0) {
    return (
      <p className="mt-3 text-sm text-[color:var(--ink-soft)]">
        {locale === "en" ? "No mood data in the last 7 days" : "近 7 天還沒有情緒紀錄"}
      </p>
    );
  }

  return (
    <div className="mt-3 space-y-1">
      {sortedMoods.map(([mood, count]) => (
        <div key={mood} className="bar-chart-row">
          <span className="bar-chart-label">{moodLabels[mood] || mood}</span>
          <div className="bar-chart-track">
            <div
              className="bar-chart-bar"
              style={{ width: `${Math.round((count / maxCount) * 100)}%` }}
            />
          </div>
          <span className="bar-chart-count">{count}</span>
        </div>
      ))}
    </div>
  );
}

function TopSignals({ angelLogs, locale }) {
  const top3 = useMemo(() => {
    const counts = {};
    for (const log of angelLogs) {
      if (!log.number) continue;
      counts[log.number] = (counts[log.number] || 0) + 1;
    }

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
  }, [angelLogs]);

  if (top3.length === 0) {
    return (
      <p className="mt-3 text-sm text-[color:var(--ink-soft)]">
        {locale === "en" ? "No signal records yet" : "還沒有數字訊號紀錄"}
      </p>
    );
  }

  return (
    <div className="mt-3 flex gap-3">
      {top3.map(([number, count], i) => (
        <div key={number} className="flex flex-col items-center gap-1">
          <span className="font-[var(--font-display)] text-[1.8rem] leading-none text-[color:var(--gold)]">
            {number}
          </span>
          <span className="text-[0.68rem] tracking-[0.14em] text-[color:var(--ink-faint)]">
            {locale === "en" ? `${count}x` : `${count}次`}
          </span>
          {i === 0 ? (
            <span className="text-[0.58rem] tracking-[0.18em] text-[color:var(--gold)]">
              ✦
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default function ProfilePage({
  profile,
  orders,
  allDailyLogs,
  angelLogs,
  checkinStreak,
}) {
  const { locale } = useI18n();
  const navigate = useNavigate();

  const lifePathNumber = profile?.lifePathNumber || null;
  const lifePathMap = LIFE_PATH_KEYWORDS[locale] || LIFE_PATH_KEYWORDS["zh-TW"];
  const lifePathInfo = lifePathNumber ? lifePathMap[lifePathNumber] : null;
  const daysJoined = daysSinceTimestamp(profile?.createdAt);

  const deliveredCount = useMemo(
    () => orders.filter((o) => o.status === "delivered").length,
    [orders],
  );

  const latestDelivered = useMemo(
    () =>
      orders
        .filter((o) => o.status === "delivered")
        .sort((a, b) => {
          const at = a.deliveredAt?.seconds || 0;
          const bt = b.deliveredAt?.seconds || 0;
          return bt - at;
        })[0] || null,
    [orders],
  );

  const copy = locale === "en"
    ? {
      title: "My Space",
      traveler: "Cosmos Traveler",
      lifePath: "Life path number",
      joined: "days since joining",
      streakLabel: "Check-in streak",
      fulfilledLabel: "Wishes fulfilled",
      moodTitle: "Mood (7 days)",
      signalTitle: "Top signals",
      wallTitle: "Fulfilled goals",
      goWall: "View all →",
      noWall: "Your first fulfilled wish will be displayed here.",
    }
    : {
      title: "我的",
      traveler: "宇宙旅人",
      lifePath: "生命靈數",
      joined: "天加入",
      streakLabel: "連續打卡",
      fulfilledLabel: "已實現願望",
      moodTitle: "情緒分布（近 7 天）",
      signalTitle: "數字訊號頻率",
      wallTitle: "戰績牆",
      goWall: "查看所有戰績 →",
      noWall: "你的第一個實現的願望，會在這裡出現。",
    };

  const latestTheme = latestDelivered ? getOrderTheme(latestDelivered) : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <section>
        <p className="gold-kicker">Cosmos Journal</p>
        <h1 className="page-title mt-2">{copy.title}</h1>
      </section>

      {/* Profile card */}
      <section className="paper-card px-5 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[rgba(181,120,58,0.3)] bg-[rgba(232,201,154,0.18)]">
            <span className="text-2xl">✦</span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-[var(--font-display)] text-[1.55rem] leading-[1.2] text-[color:var(--navy-deep)]">
              {copy.traveler}
            </h2>
            {lifePathInfo ? (
              <p className="mt-1 text-[0.82rem] tracking-[0.08em] text-[color:var(--ink-soft)]">
                {copy.lifePath} {lifePathNumber} · {lifePathInfo.theme}
              </p>
            ) : null}
            <p className="mt-1 text-[0.72rem] tracking-[0.14em] text-[color:var(--ink-faint)]">
              {locale === "en" ? `${daysJoined} ${copy.joined}` : `加入 ${daysJoined} 天`}
            </p>
          </div>
        </div>
      </section>

      {/* Stats (2 columns) */}
      <section className="grid grid-cols-2 gap-3">
        <div className="profile-stat-card">
          <p className="profile-stat-value">{checkinStreak}</p>
          <p className="profile-stat-label">
            {locale === "en" ? `days` : "天"}
          </p>
          <p className="mt-1 text-[0.66rem] tracking-[0.14em] text-[color:var(--ink-faint)]">
            {copy.streakLabel}
          </p>
        </div>
        <div className="profile-stat-card">
          <p className="profile-stat-value">{deliveredCount}</p>
          <p className="profile-stat-label">
            {locale === "en" ? `wishes` : "個"}
          </p>
          <p className="mt-1 text-[0.66rem] tracking-[0.14em] text-[color:var(--ink-faint)]">
            {copy.fulfilledLabel}
          </p>
        </div>
      </section>

      {/* Mood distribution (7 days) */}
      <section className="paper-card px-5 py-5">
        <p className="section-label">{copy.moodTitle}</p>
        <MoodBarChart allDailyLogs={allDailyLogs} locale={locale} />
      </section>

      {/* Top signals */}
      <section className="paper-card px-5 py-5">
        <p className="section-label">{copy.signalTitle}</p>
        <TopSignals angelLogs={angelLogs} locale={locale} />
      </section>

      {/* Wall entry */}
      <section className="paper-card overflow-hidden px-0 py-0">
        <div className="px-5 pt-5">
          <p className="section-label">{copy.wallTitle}</p>
        </div>

        {latestDelivered ? (
          <>
            <div
              className="relative mt-3 h-28 overflow-hidden"
              style={{ background: latestTheme?.background }}
            >
              <OrderCoverArt order={latestDelivered} />
              <div className="absolute inset-x-0 bottom-0 h-12 bg-[linear-gradient(180deg,rgba(245,239,230,0),rgba(245,239,230,0.98))]" />
            </div>
            <div className="px-5 pb-5">
              <h3 className="mt-2 font-[var(--font-display)] text-[1.3rem] leading-[1.3] text-[color:var(--ink)]">
                {latestDelivered.title}
              </h3>
              <button
                type="button"
                onClick={() => navigate("/wall")}
                className="mt-3 text-[0.88rem] tracking-[0.12em] text-[color:var(--gold)]"
              >
                {copy.goWall}
              </button>
            </div>
          </>
        ) : (
          <div className="px-5 pb-5">
            <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">
              {copy.noWall}
            </p>
            <button
              type="button"
              onClick={() => navigate("/wall")}
              className="mt-3 text-[0.88rem] tracking-[0.12em] text-[color:var(--gold)]"
            >
              {copy.goWall}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
