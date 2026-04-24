import { detectOrderQuestionTheme } from "./orderQuestions";

const ACTION_BANK = {
  travel: [
    "去看一眼機票或車票的價格，讓這趟旅程開始有形狀。",
    "替這個目的地存下一小筆金額，讓宇宙看見你的準備。",
    "找一張讓你心動的風景圖，讓願望有更清楚的方向。",
    "把最想出發的月份寫下來，讓時間開始對齊你。",
    "打開地圖感受目的地離你多近，讓想像更真實。",
    "列出一樣你會帶上的裝備，讓身體先進入旅程。",
  ],
  career: [
    "替理想工作的自己寫下一句自我介紹，讓身份先落地。",
    "花十分鐘整理作品、履歷或提案，讓機會更容易找到你。",
    "看一眼你想合作的品牌或公司，讓方向不再模糊。",
    "替這份事業定下一個本月想靠近的里程碑，讓能量有出口。",
    "把你想服務的人寫得更具體，讓宇宙知道你在回應誰。",
    "為未來的工作空間找一張參考圖，讓願望開始佔據現實。",
  ],
  wealth: [
    "去感受一下你想達成的金額，讓數字不只是夢而已。",
    "替自己打開一個小小的存錢入口，讓豐盛開始流動。",
    "記下今天收到的任何一筆支持，讓注意力先站在豐盛這邊。",
    "看一眼你的帳戶或收入來源，讓你和金流更靠近一點。",
    "寫下一件有錢後想先完成的事，讓接收變得更具體。",
    "替自己的價值說一句肯定，讓豐盛先從內在允許開始。",
  ],
  relationship: [
    "寫下你渴望的關係感受，讓宇宙聽懂你真正想靠近的是什麼。",
    "為理想關係留出一點時間或空間，讓愛有地方降落。",
    "練習一次你希望被對待的方式，讓關係先從自己開始。",
    "去感受一句讓你安心的話，讓心先熟悉被接住的狀態。",
    "整理一個會讓你更願意打開自己的小細節，讓吸引更自然。",
    "寫下你想一起共享的日常畫面，讓愛情不只停在抽象裡。",
  ],
  home: [
    "替未來的空間找一張靈感圖，讓家的樣子開始清楚。",
    "整理一個角落，讓你先在現在練習想要的生活感。",
    "去感受一樣你想放進家的物件，讓願望先有材質。",
    "寫下你最想住進去的那種光線與氣味，讓畫面更落地。",
    "看看理想區域或房型的資訊，讓宇宙知道你的偏好。",
    "替未來的家存下一小筆基金，讓安穩慢慢靠近你。",
  ],
  health: [
    "替身體做一個溫柔的小選擇，讓恢復從今天開始累積。",
    "花幾分鐘感受自己的呼吸，讓平衡先回到當下。",
    "記下今天身體已經變好的地方，讓注意力支持療癒。",
    "替自己安排一個更早休息的時刻，讓能量有地方回來。",
    "喝一杯水或做一個伸展，讓身體知道你正在站在它這邊。",
    "寫下你最想恢復的狀態，讓療癒有明確的方向。",
  ],
  default: [
    "替這個願望做一件很小但很真的事，讓它不只停在想像裡。",
    "把你最想靠近的畫面寫成一句話，讓宇宙更容易接住。",
    "找一個能代表這個願望的細節，讓它開始進入你的生活。",
    "為這個目標留出十分鐘，讓行動先比懷疑早一步。",
    "去看一眼與願望有關的資訊，讓模糊變得更清楚。",
    "存下一個小小的承諾，讓今天的你開始和未來對齊。",
  ],
};

function sampleItems(items, count = 3) {
  const pool = [...items];
  const picked = [];

  while (pool.length > 0 && picked.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool[index]);
    pool.splice(index, 1);
  }

  return picked;
}

function baseProgress(order) {
  const age = order.createdAt?.toDate
    ? Math.max(
      0,
      Math.floor((Date.now() - order.createdAt.toDate().getTime()) / (1000 * 60 * 60 * 24)),
    )
    : 0;

  if (order.status === "delivered") return 100;
  if (order.status === "aligning") return Math.min(88, 48 + age * 2);
  return Math.min(56, 18 + age * 1.5);
}

export function getSuggestedActionPrompts(order) {
  const theme = detectOrderQuestionTheme(order);
  return sampleItems(ACTION_BANK[theme] || ACTION_BANK.default, 3);
}

export function getActionProgress(order) {
  if (order.status === "delivered") {
    return 100;
  }

  const items = order.actionItems || [];

  if (items.length === 0) {
    return Math.round(baseProgress(order));
  }

  const completedCount = items.filter((item) => item.completed).length;
  return Math.round((completedCount / items.length) * 100);
}

export function getActionSummary(order) {
  const items = order.actionItems || [];
  const completedCount = items.filter((item) => item.completed).length;

  return {
    total: items.length,
    completed: completedCount,
    remaining: Math.max(0, items.length - completedCount),
  };
}
