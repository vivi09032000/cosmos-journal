export const PROFILE_AVATARS = [
  { key: "moon-rabbit", label: "月亮兔", icon: "🐰" },
  { key: "star-cat", label: "星星貓", icon: "🐱" },
  { key: "cosmos-bear", label: "宇宙熊", icon: "🐻" },
  { key: "cloud-fox", label: "雲朵狐", icon: "🦊" },
  { key: "little-orbit", label: "小行星", icon: "🪐" },
  { key: "soft-comet", label: "軟糖彗星", icon: "🌙" },
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

function hashSeed(seed = "") {
  return String(seed)
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);
}

export function getDefaultProfileIdentity(seed = "") {
  const hash = hashSeed(seed);
  return {
    displayName: PROFILE_NAME_POOL[hash % PROFILE_NAME_POOL.length],
    avatarKey: PROFILE_AVATARS[hash % PROFILE_AVATARS.length].key,
  };
}

export function getProfileAvatar(avatarKey) {
  return PROFILE_AVATARS.find((avatar) => avatar.key === avatarKey) || PROFILE_AVATARS[0];
}

export function getProfileDisplayName(profile, locale = "zh-TW") {
  return profile?.displayName || (locale === "en" ? "Cosmos Traveler" : "宇宙旅人");
}
