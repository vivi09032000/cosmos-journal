export const PROFILE_AVATARS = [
  { key: "moon-rabbit", label: "月亮兔", labels: { "zh-TW": "月亮兔", en: "Moon Rabbit" }, icon: "🐰" },
  { key: "star-cat", label: "星星貓", labels: { "zh-TW": "星星貓", en: "Star Cat" }, icon: "🐱" },
  { key: "cosmos-bear", label: "宇宙熊", labels: { "zh-TW": "宇宙熊", en: "Cosmos Bear" }, icon: "🐻" },
  { key: "cloud-fox", label: "雲朵狐", labels: { "zh-TW": "雲朵狐", en: "Cloud Fox" }, icon: "🦊" },
  { key: "little-orbit", label: "小行星", labels: { "zh-TW": "小行星", en: "Little Orbit" }, icon: "🪐" },
  { key: "soft-comet", label: "軟糖彗星", labels: { "zh-TW": "軟糖彗星", en: "Soft Comet" }, icon: "🌙" },
];

export const PROFILE_NAME_POOL = [
  "月光旅人",
  "星塵小熊",
  "銀河兔兔",
  "雲朵觀測員",
  "小行星店長",
  "溫柔彗星",
  "奶油月亮",
  "宇宙信差",
  "晚風收藏家",
  "星球散步者",
];

export const PROFILE_NAME_POOL_BY_LOCALE = {
  "zh-TW": PROFILE_NAME_POOL,
  en: [
    "Moonlight Traveler",
    "Stardust Keeper",
    "Galaxy Wanderer",
    "Cloud Observer",
    "Little Orbit",
    "Soft Comet",
    "Cream Moon",
    "Cosmos Messenger",
    "Evening Breeze",
    "Planet Walker",
  ],
};

function hashSeed(seed = "") {
  return String(seed)
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);
}

export function getDefaultProfileIdentity(seed = "", locale = "zh-TW") {
  const hash = hashSeed(seed);
  const namePool = PROFILE_NAME_POOL_BY_LOCALE[locale] || PROFILE_NAME_POOL_BY_LOCALE["zh-TW"];
  return {
    displayName: namePool[hash % namePool.length],
    avatarKey: PROFILE_AVATARS[hash % PROFILE_AVATARS.length].key,
  };
}

export function getProfileAvatar(avatarKey) {
  return PROFILE_AVATARS.find((avatar) => avatar.key === avatarKey) || PROFILE_AVATARS[0];
}

export function getProfileAvatarLabel(avatar, locale = "zh-TW") {
  return avatar?.labels?.[locale] || avatar?.label || "";
}

export function getProfileDisplayName(profile, locale = "zh-TW") {
  const displayName = profile?.displayName;

  if (!displayName) {
    return locale === "en" ? "Cosmos Traveler" : "宇宙旅人";
  }

  const zhIndex = PROFILE_NAME_POOL_BY_LOCALE["zh-TW"].indexOf(displayName);
  if (locale === "en" && zhIndex >= 0) {
    return PROFILE_NAME_POOL_BY_LOCALE.en[zhIndex];
  }

  const enIndex = PROFILE_NAME_POOL_BY_LOCALE.en.indexOf(displayName);
  if (locale === "zh-TW" && enIndex >= 0) {
    return PROFILE_NAME_POOL_BY_LOCALE["zh-TW"][enIndex];
  }

  return displayName;
}
