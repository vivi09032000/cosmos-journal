import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import {
  PROFILE_AVATARS,
  PROFILE_NAME_POOL_BY_LOCALE,
  getDefaultProfileIdentity,
  getProfileAvatar,
  getProfileAvatarLabel,
  getProfileDisplayName,
} from "../lib/profileIdentity";

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
  onSaveProfileIdentity,
  checkinStreak,
  deliveredCount,
}) {
  const { locale, setLocale } = useI18n();
  const navigate = useNavigate();
  const [closing, setClosing] = useState(false);
  const fallbackIdentity = getDefaultProfileIdentity(profile?.createdAt?.seconds || "", locale);
  const displayName = getProfileDisplayName(profile, locale);
  const activeAvatar = getProfileAvatar(profile?.avatarKey || fallbackIdentity.avatarKey);
  const [editingIdentity, setEditingIdentity] = useState(false);
  const [nameDraft, setNameDraft] = useState(displayName);
  const [avatarDraft, setAvatarDraft] = useState(activeAvatar.key);
  const [identitySaving, setIdentitySaving] = useState(false);
  const [identityError, setIdentityError] = useState("");

  useEffect(() => {
    setNameDraft(displayName);
    setAvatarDraft(activeAvatar.key);
    setIdentityError("");
    setEditingIdentity(false);
  }, [activeAvatar.key, displayName, open]);

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
      editIdentity: "Edit profile",
      saveIdentity: "Save profile",
      cancelIdentity: "Cancel",
      randomName: "Random",
      namePlaceholder: "Your cosmos name",
      identityError: "Profile update failed. Please try again.",
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
      editIdentity: "編輯檔案",
      saveIdentity: "儲存檔案",
      cancelIdentity: "取消",
      randomName: "隨機",
      namePlaceholder: "你的宇宙名稱",
      identityError: "檔案更新失敗，請再試一次。",
      version: "v2.5 · Cosmos Journal",
    };

  const handleSaveIdentity = async () => {
    if (!onSaveProfileIdentity) return;

    setIdentitySaving(true);
    setIdentityError("");

    try {
      await onSaveProfileIdentity({
        displayName: nameDraft,
        avatarKey: avatarDraft,
      });
      setEditingIdentity(false);
    } catch (saveError) {
      setIdentityError(saveError.message || copy.identityError);
    } finally {
      setIdentitySaving(false);
    }
  };

  const handleRandomName = () => {
    const namePool = PROFILE_NAME_POOL_BY_LOCALE[locale] || PROFILE_NAME_POOL_BY_LOCALE["zh-TW"];
    const currentIndex = namePool.indexOf(nameDraft.trim());
    const nextIndex = currentIndex >= 0
      ? (currentIndex + 1) % namePool.length
      : Math.floor(Math.random() * namePool.length);

    setNameDraft(namePool[nextIndex]);
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
            <span className="text-[1.9rem]" aria-label={getProfileAvatarLabel(activeAvatar, locale)}>
              {activeAvatar.icon}
            </span>
          </div>
          <h2 className="mt-3 font-display text-[1.4rem] leading-[1.2] text-[color:var(--navy-deep)]">
            {displayName}
          </h2>
          <button
            type="button"
            onClick={() => setEditingIdentity((current) => !current)}
            className="mt-2 text-[0.68rem] tracking-[0.16em] text-[color:var(--gold)]"
          >
            {copy.editIdentity}
          </button>
          {lifePathTheme ? (
            <p className="mt-1 text-[0.78rem] tracking-[0.08em] text-[color:var(--ink-soft)]">
              {copy.lifePath} {lifePathNumber} · {lifePathTheme}
            </p>
          ) : null}
          <p className="mt-1 text-[0.68rem] tracking-[0.14em] text-[color:var(--ink-faint)]">
            {copy.joined}
          </p>
        </div>

        {editingIdentity ? (
          <div className="mt-4 rounded-2xl border border-[rgba(181,120,58,0.16)] bg-[rgba(250,246,240,0.72)] p-3">
            <div className="flex gap-2">
              <input
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                className="cosmos-input min-w-0 flex-1 py-2 text-center text-sm"
                placeholder={copy.namePlaceholder}
              />
              <button
                type="button"
                onClick={handleRandomName}
                className="secondary-button shrink-0 px-3 py-2 text-xs"
              >
                {copy.randomName}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {PROFILE_AVATARS.map((avatar) => (
                <button
                  key={avatar.key}
                  type="button"
                  onClick={() => setAvatarDraft(avatar.key)}
                  className={`flex h-12 items-center justify-center rounded-2xl border text-xl transition ${
                    avatarDraft === avatar.key
                      ? "border-[rgba(181,120,58,0.52)] bg-[rgba(181,120,58,0.12)]"
                      : "border-[rgba(181,120,58,0.12)] bg-[rgba(255,255,255,0.42)]"
                  }`}
                  aria-label={getProfileAvatarLabel(avatar, locale)}
                >
                  {avatar.icon}
                </button>
              ))}
            </div>
            {identityError ? (
              <p className="mt-2 text-xs leading-5 text-[color:var(--ink-soft)]">{identityError}</p>
            ) : null}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingIdentity(false);
                  setNameDraft(displayName);
                  setAvatarDraft(activeAvatar.key);
                  setIdentityError("");
                }}
                className="secondary-button py-2 text-xs"
              >
                {copy.cancelIdentity}
              </button>
              <button
                type="button"
                onClick={handleSaveIdentity}
                disabled={identitySaving}
                className="primary-button py-2 text-xs disabled:opacity-60"
              >
                {identitySaving ? "..." : copy.saveIdentity}
              </button>
            </div>
          </div>
        ) : null}

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
            <p className="font-display text-[1.6rem] leading-none text-[color:var(--gold)]">
              {checkinStreak}
            </p>
            <p className="mt-1 text-[0.62rem] tracking-[0.14em] text-[color:var(--ink-faint)]">
              {copy.streakUnit} · {copy.streakLabel}
            </p>
          </div>
          <div className="text-center">
            <p className="font-display text-[1.6rem] leading-none text-[color:var(--gold)]">
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
        <p className="text-center text-[color:var(--ink-faint)]" style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--ls-caps)" }}>
          {copy.version}
        </p>
      </div>
    </>
  );
}
