// ============================================================
// 宇宙手帳 — 今日天使數字計算引擎
// 邏輯：生命靈數 × 月相能量 → 今日個人天使數字
// ============================================================

// ── 1. 生命靈數計算 ─────────────────────────────────────────

/**
 * 把數字不斷相加直到變成個位數（除了 11、22、33 這三個主數字）
 * 例：29 → 2+9=11 → 保留 11（主數字），不繼續化簡
 */
function reduceToSingleDigit(n) {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split("").reduce((sum, d) => sum + parseInt(d), 0);
  }
  return n;
}

/**
 * 計算生命靈數
 * @param {string} birthday - "YYYY-MM-DD" 格式
 * @returns {number} 生命靈數（1-9 或 11、22、33）
 */
export function getLifePathNumber(birthday) {
  const [year, month, day] = birthday.split("-").map(Number);

  const monthReduced = reduceToSingleDigit(month);
  const dayReduced   = reduceToSingleDigit(day);
  const yearReduced  = reduceToSingleDigit(
    String(year).split("").reduce((sum, d) => sum + parseInt(d), 0)
  );

  return reduceToSingleDigit(monthReduced + dayReduced + yearReduced);
}

// 使用範例：
// getLifePathNumber("1990-07-23") → 4
// getLifePathNumber("1995-11-11") → 11（主數字）


// ── 2. 月相計算 ──────────────────────────────────────────────

import SunCalc from "suncalc";

/**
 * 取得精確的月齡 (天)
 * @param {Date} date
 * @returns {number}
 */
function getMoonAge(date) {
  const phase = SunCalc.getMoonIllumination(date).phase;
  // phase 是 0.0 ~ 1.0，朔望月大約是 29.53 天
  return phase * 29.53058867;
}

/**
 * 取得精確的月相比例
 * @param {Date} date
 * @returns {number} 0.0 ~ 1.0（0 = 新月，0.5 = 滿月）
 */
function getMoonPhaseRatio(date) {
  return SunCalc.getMoonIllumination(date).phase;
}

function getDailyMoonNumber(moonAge) {
  return (Math.floor(moonAge) % 9) + 1;
}

/**
 * 把月相比例轉換成 8 個階段
 * @param {Date} date
 * @returns {{ phase: string, label: string, energy: number, moonNumber: number }}
 */
export function getMoonPhaseInfo(date = new Date()) {
  const ratio = getMoonPhaseRatio(date);
  const moonAge = getMoonAge(date);

  const phases = [
    { phase: "new",           label: "新月",   energy: 1  }, // 0.00 - 0.07
    { phase: "waxCrescent",   label: "眉月",   energy: 3  }, // 0.07 - 0.25
    { phase: "firstQuarter",  label: "上弦月", energy: 3  }, // 0.25 - 0.32
    { phase: "waxGibbous",    label: "盈凸月", energy: 5  }, // 0.32 - 0.50
    { phase: "full",          label: "滿月",   energy: 7  }, // 0.50 - 0.57
    { phase: "waneGibbous",   label: "虧凸月", energy: 9  }, // 0.57 - 0.75
    { phase: "lastQuarter",   label: "下弦月", energy: 9  }, // 0.75 - 0.82
    { phase: "waneCrescent",  label: "殘月",   energy: 11 }, // 0.82 - 1.00
  ];

  const boundaries = [0, 0.07, 0.25, 0.32, 0.50, 0.57, 0.75, 0.82, 1.0];
  const index = boundaries.findIndex((b, i) => ratio < boundaries[i + 1]);
  const phaseInfo = phases[Math.max(0, index)];

  return {
    ...phaseInfo,
    moonAge: Number(moonAge.toFixed(2)),
    moonNumber: getDailyMoonNumber(moonAge),
  };
}

// 使用範例：
// getMoonPhaseInfo(new Date("2026-04-24"))
// → { phase: "waxGibbous", label: "盈凸月", energy: 5, moonNumber: 4 }


// ── 3. 今日個人天使數字合成 ──────────────────────────────────

/**
 * 把生命靈數跟月相數字組合成天使數字
 * 規則：把兩個數字都重複，組成三或四位數
 */
function composeAngelNumber(lifePath, moonNumber) {
  // 處理主數字（11、22、33）
  const lp = lifePath <= 9 ? lifePath : Math.floor(lifePath / 10);
  const mn = moonNumber <= 9 ? moonNumber : Math.floor(moonNumber / 10);

  // 組合策略：
  // 同數字 → 三個重複（例：4 + 4 → 444）
  // 不同數字 → 生命靈數重複兩次 + 月相數字一次（例：4 + 7 → 447）
  if (lp === mn) {
    return parseInt(`${lp}${lp}${lp}`);
  } else {
    return parseInt(`${lp}${lp}${mn}`);
  }
}

/**
 * 主函數：計算今日個人天使數字
 * @param {string} birthday - "YYYY-MM-DD"
 * @param {Date} today - 預設今天
 * @returns {{ angelNumber: number, lifePath: number, moonPhase: object, meaning: object }}
 */
export function getTodayAngelNumber(birthday, today = new Date()) {
  const lifePath = getLifePathNumber(birthday);
  const moonPhase = getMoonPhaseInfo(today);
  const angelNumber = composeAngelNumber(lifePath, moonPhase.moonNumber);

  return {
    angelNumber,           // 例：447
    display: String(angelNumber), // 顯示用字串 "447"
    lifePath,              // 生命靈數：4
    moonPhase,             // 月相資訊
    meaning: getAngelMeaning(angelNumber, lifePath, moonPhase),
  };
}

export default getTodayAngelNumber;


// ── 4. 天使數字含義資料庫 ────────────────────────────────────

// 生命靈數的核心關鍵字
const LIFE_PATH_KEYWORDS = {
  1:  { theme: "領導與開創", you: "你是天生的先行者" },
  2:  { theme: "平衡與合作", you: "你的直覺引導著你" },
  3:  { theme: "創意與表達", you: "你的創造力是天賦" },
  4:  { theme: "穩定與建構", you: "你的根基帶來力量" },
  5:  { theme: "自由與變化", you: "你為改變而生" },
  6:  { theme: "愛與責任",   you: "你的心是最強的磁場" },
  7:  { theme: "智慧與靈性", you: "你與宇宙的頻率相通" },
  8:  { theme: "豐盛與成就", you: "你的能量吸引豐盛" },
  9:  { theme: "完成與慈悲", you: "你正走向更高的使命" },
  11: { theme: "靈感與覺醒", you: "你是宇宙的傳遞者" },
  22: { theme: "宏大藍圖",   you: "你有能力建造奇蹟" },
  33: { theme: "療癒與光",   you: "你的存在本身就是禮物" },
};

// 月相能量的核心關鍵字
const MOON_PHASE_ENERGY = {
  new:          { action: "種下意圖",   message: "新的循環開始，你的意圖正在被宇宙登記。" },
  waxCrescent:  { action: "設定方向",   message: "能量正在積累，把你的願望說得更具體。" },
  firstQuarter: { action: "跨越阻力",   message: "遇到阻力是對的，你正在真正前進。" },
  waxGibbous:   { action: "調整優化",   message: "距離高峰只差一步，細節決定結果。" },
  full:         { action: "接收顯化",   message: "滿月是顯化力最強的時刻，打開雙手接收。" },
  waneGibbous:  { action: "感恩釋放",   message: "感謝已發生的一切，感恩加速豐盛流入。" },
  lastQuarter:  { action: "清理舊有",   message: "放下阻礙你的信念，清理才能接納新的。" },
  waneCrescent: { action: "靜待更新",   message: "在靜默中儲存能量，下一個循環即將開始。" },
};

/**
 * 根據天使數字、生命靈數、月相生成個人化含義
 */
function getAngelMeaning(angelNumber, lifePath, moonPhase) {
  const lpInfo   = LIFE_PATH_KEYWORDS[lifePath] || LIFE_PATH_KEYWORDS[1];
  const moonInfo = MOON_PHASE_ENERGY[moonPhase.phase];

  // 基礎天使數字含義（取第一位數字的重複）
  const baseDigit = parseInt(String(angelNumber)[0]);
  const baseMeanings = {
    1: "新的開始正在為你展開",
    2: "信任這個過程，一切在對齊",
    3: "宇宙三位一體在支持你",
    4: "天使正圍繞著你給予保護",
    5: "重大轉變正在為你開路",
    6: "愛與豐盛正在流向你",
    7: "你走在神聖的道路上",
    8: "豐盛之門為你而開",
    9: "一個美好的循環正在完成",
  };

  const title   = baseMeanings[baseDigit] || "宇宙正在與你溝通";
  const message = `${lpInfo.you}。${moonInfo.message}`;
  const action  = moonInfo.action;

  return {
    title,
    message,
    action,
    moonLabel: moonPhase.label,
    lifePathTheme: lpInfo.theme,
  };
}


// ── 5. Onboarding 輔助函數 ───────────────────────────────────

/**
 * 驗證生日格式是否正確
 */
export function validateBirthday(birthday) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(birthday)) return false;

  const [year, month, day] = birthday.split("-").map(Number);
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > new Date().getFullYear()) return false;

  return true;
}

/**
 * 顯示用：把生命靈數轉成天使數字格式
 * 例：4 → "444"，11 → "1111"
 */
export function lifePathToAngelDisplay(lifePath) {
  const digit = String(lifePath)[0];
  return digit.repeat(lifePath >= 10 ? 4 : 3);
}


// ── 6. 完整使用範例 ──────────────────────────────────────────

/*

// 在 React component 裡這樣用：

import { getTodayAngelNumber, validateBirthday } from "./angelEngine";

// 使用者生日從 Firestore users/{uid} 讀取
const birthday = "1990-07-23";

const result = getTodayAngelNumber(birthday);
console.log(result);

// 輸出範例：
// {
//   angelNumber: 447,
//   display: "447",
//   lifePath: 4,
//   moonPhase: {
//     phase: "waxGibbous",
//     label: "盈凸月",
//     energy: 5,
//     moonNumber: 5
//   },
//   meaning: {
//     title: "天使正圍繞著你給予保護",
//     message: "你的根基帶來力量。距離高峰只差一步，細節決定結果。",
//     action: "調整優化",
//     moonLabel: "盈凸月",
//     lifePathTheme: "穩定與建構"
//   }
// }

// 在今日頁顯示：
// 今日天使數字：447
// 天使正圍繞著你給予保護
// 你的根基帶來力量。距離高峰只差一步，細節決定結果。
// 今日行動：調整優化 · 盈凸月

*/


// ── 7. Firestore 需要新增的欄位 ──────────────────────────────

/*

users/{userId} 需要加：
{
  birthday: "1990-07-23",   // onboarding 時填寫，一次性
  lifePathNumber: 4,        // 計算完存起來，不用每次重算
}

今日天使數字每天重新計算（因為月相每天不同），不需要額外存。
如果要存歷史紀錄，可以在 angelLogs 裡加 isDaily: true 的標記。

*/
