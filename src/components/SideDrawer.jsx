import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../lib/i18n";

const LIFE_PATH_KEYWORDS = {
  "zh-TW": {
    1: "領導與開創", 2: "平衡與合作", 3: "創意與表達",
    4: "穩定與建構", 5: "自由與變化", 6: "愛與責任",
    7: "智慧與靈性", 8: "豐盛與成就", 9: "完成與慈悲",
    11: "靈感與覺醒", 22: "宏大藍圖", 33: "療癒與光",
  },
  en: {
    1: "Leadership", 2: "Balance", 3: "Creativity",
    4: "Stability", 5: "Freedom", 6: "Love",
    7: "Wisdom", 8: "Abundance", 9: "Compassion",
    11: "Inspiration", 22: "Grand Vision", 33: "Healing",
  },
};

function daysSinceTimestamp(timestamp) {
  if (!timestamp) return 0;
  const created = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
  return Math.max(0, Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function SideDrawer({
  open,
  onClose,
  profile,
  checkinStreak,
  deliveredCount,
}) {
  const { locale, setLocale } = useI18n();
  const navigate = useNavigate();
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 220);
  }, [onClose]);

  const handleNav = useCallback(
    (path) => {
      handleClose();
      setTimeout(() => navigate(path), 250);
    },
    [handleClose, navigate],
  );

  const lifePathNumber = profile?.lifePathNumber || null;
  const lifePathMap = LIFE_PATH_KEYWORDS[locale] || LIFE_PATH_KEYWORDS["zh-TW"];
  const lifePathTheme = lifePathNumber ? lifePathMap[lifePathNumber] : null;
  const daysJoined = daysSinceTimestamp(profile?.createdAt);
  const displayName = profile?.displayName || (locale === "en" ? "Cosmos Traveler" : "宇宙旅人");
  const initial = displayName.charAt(0).toUpperCase();

  const copy = locale === "en"
    ? {
      identity: "✦ Cosmos Journal",
      lifePath: "Life path",
      joined: `${daysJoined} days`,
      streakLabel: "Check-in streak",
      streakUnit: "days",
      deliveredLabel: "Wishes fulfilled",
      deliveredUnit: "",
      langLabel: "Language settings",
      profileLink: "Cosmos Archive",
      journalLink: "Daily Journey",
      signalLink: "Soul codes",
      wallLink: "Achievements",
      version: "v2.5 · Cosmos Journal",
    }
    : {
      identity: "✦ 宇宙手帳",
      lifePath: "生命靈數",
      joined: `加入 ${daysJoined} 天`,
      streakLabel: "持續打卡",
      streakUnit: "天",
      deliveredLabel: "實現願望",
      deliveredUnit: "個",
      langLabel: "語言設定 · Language",
      profileLink: "宇宙檔案",
      journalLink: "每日歷程",
      signalLink: "心靈密碼",
      wallLink: "戰績牆",
      version: "v2.5 · Cosmos Journal",
    };

  if (!open) return null;

  return (
    <>
      <div
        className={`drawer-overlay ${closing ? "closing" : ""}`}
        onClick={handleClose}
      />
      <div className={`drawer-panel ${closing ? "closing" : ""}`}>
        {/* Identity */}
        <p className="text-[0.68rem] tracking-[0.24em] text-[color:var(--gold)]">
          {copy.identity}
        </p>

        {/* Avatar & info */}
        <div className="mt-5 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[rgba(181,120,58,0.35)] bg-[rgba(25,35,60,0.9)]">
            <span className="font-[var(--font-display)] text-[1.5rem] text-[color:var(--gold)]">
              {initial}
            </span>
          </div>
          <h2 className="mt-3 font-[var(--font-display)] text-[1.4rem] leading-[1.2] text-[color:var(--navy-deep)]">
            {displayName}
          </h2>
          {lifePathTheme ? (
            <p className="mt-1 text-[0.78rem] tracking-[0.08em] text-[color:var(--ink-soft)]">
              {copy.lifePath} {lifePathNumber} · {lifePathTheme}
            </p>
          ) : null}
          <p className="mt-1 text-[0.68rem] tracking-[0.14em] text-[color:var(--ink-faint)]">
            {copy.joined}
          </p>
        </div>

        <div className="drawer-divider" />

        {/* Language toggle */}
        <p className="text-[0.68rem] tracking-[0.18em] text-[color:var(--ink-faint)]">
          {copy.langLabel}
        </p>
        <div className="mt-2 inline-flex w-full items-center rounded-full border border-[rgba(181,120,58,0.18)] bg-[rgba(250,246,240,0.9)] p-1">
          <button
            type="button"
            onClick={() => setLocale("zh-TW")}
            className={`flex-1 rounded-full py-2 text-center text-[0.76rem] tracking-[0.12em] transition ${
              locale === "zh-TW"
                ? "bg-[rgba(181,120,58,0.14)] text-[color:var(--gold)]"
                : "text-[color:var(--ink-faint)]"
            }`}
          >
            中文
          </button>
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={`flex-1 rounded-full py-2 text-center text-[0.76rem] tracking-[0.12em] transition ${
              locale === "en"
                ? "bg-[rgba(181,120,58,0.14)] text-[color:var(--gold)]"
                : "text-[color:var(--ink-faint)]"
            }`}
          >
            EN
          </button>
        </div>

        <div className="drawer-divider" />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="font-[var(--font-display)] text-[1.6rem] leading-none text-[color:var(--gold)]">
              {checkinStreak}
            </p>
            <p className="mt-1 text-[0.62rem] tracking-[0.14em] text-[color:var(--ink-faint)]">
              {copy.streakUnit} · {copy.streakLabel}
            </p>
          </div>
          <div className="text-center">
            <p className="font-[var(--font-display)] text-[1.6rem] leading-none text-[color:var(--gold)]">
              {deliveredCount}
            </p>
            <p className="mt-1 text-[0.62rem] tracking-[0.14em] text-[color:var(--ink-faint)]">
              {copy.deliveredUnit ? `${copy.deliveredUnit} · ` : ""}{copy.deliveredLabel}
            </p>
          </div>
        </div>

        <div className="drawer-divider" />

        {/* Nav links */}
        <nav className="space-y-0">
          <button type="button" onClick={() => handleNav("/profile")} className="drawer-link w-full">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M5.5 21c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" />
            </svg>
            <span className="flex-1 text-left">{copy.profileLink}</span>
            <span className="text-[0.68rem] text-[color:var(--ink-faint)]">›</span>
          </button>
          <button type="button" onClick={() => handleNav("/journal")} className="drawer-link w-full">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <path d="M8 7h8M8 11h6" />
            </svg>
            <span className="flex-1 text-left">{copy.journalLink}</span>
            <span className="text-[0.68rem] text-[color:var(--ink-faint)]">›</span>
          </button>
          <button type="button" onClick={() => handleNav("/angel?view=history")} className="drawer-link w-full">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
              <path d="M5 16l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
            </svg>
            <span className="flex-1 text-left">{copy.signalLink}</span>
            <span className="text-[0.68rem] text-[color:var(--ink-faint)]">›</span>
          </button>
          <button type="button" onClick={() => handleNav("/wall")} className="drawer-link w-full">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l2.4 7.2H22l-6 4.5 2.3 7.3L12 16.5 5.7 21l2.3-7.3-6-4.5h7.6L12 2z" />
            </svg>
            <span className="flex-1 text-left">{copy.wallLink}</span>
            <span className="text-[0.68rem] text-[color:var(--ink-faint)]">›</span>
          </button>
        </nav>

        <div className="drawer-divider" />

        {/* Version */}
        <p className="text-center text-[0.58rem] tracking-[0.2em] text-[color:var(--ink-faint)]">
          {copy.version}
        </p>
      </div>
    </>
  );
}
