const orderThemes = [
  {
    background:
      "linear-gradient(145deg, rgba(28,38,66,0.95), rgba(14,18,33,0.96) 54%, rgba(122,88,63,0.92))",
    accent: "rgba(240, 214, 167, 0.72)",
  },
  {
    background:
      "linear-gradient(145deg, rgba(78,49,32,0.95), rgba(23,28,51,0.92) 58%, rgba(209,161,116,0.88))",
    accent: "rgba(236, 205, 154, 0.72)",
  },
  {
    background:
      "linear-gradient(145deg, rgba(31,48,39,0.95), rgba(17,23,44,0.94) 58%, rgba(163,133,95,0.9))",
    accent: "rgba(226, 210, 171, 0.74)",
  },
];

const ORDER_STATUS_LABELS = {
  "zh-TW": {
    packing: "意圖送出",
    aligning: "對齊中",
    resonating: "強烈共振中",
    delivered: "✦ 已實現",
  },
  en: {
    packing: "Intent Sent",
    aligning: "Aligning",
    resonating: "Strongly Resonating",
    delivered: "✦ Fulfilled",
  },
};

export function getOrderStatusLabel(status, locale = "zh-TW") {
  return ORDER_STATUS_LABELS[locale]?.[status] || ORDER_STATUS_LABELS["zh-TW"][status] || status;
}

export function getOrderComputedStatus(order) {
  if (order.status === "delivered") return "delivered";

  const journal = order.journal || [];
  if (journal.length === 0) return "packing";

  const uniqueDates = new Set();
  for (const entry of journal) {
    const rawTime = entry.recordedAt?.seconds
      ? entry.recordedAt.seconds * 1000
      : entry.date;
    if (!rawTime) continue;

    const date = new Date(rawTime);
    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
    uniqueDates.add(key);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  const cursor = new Date(today);
  
  const todayKey = [
    cursor.getFullYear(),
    String(cursor.getMonth() + 1).padStart(2, "0"),
    String(cursor.getDate()).padStart(2, "0"),
  ].join("-");

  if (!uniqueDates.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const key = [
      cursor.getFullYear(),
      String(cursor.getMonth() + 1).padStart(2, "0"),
      String(cursor.getDate()).padStart(2, "0"),
    ].join("-");

    if (!uniqueDates.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  if (streak >= 7) return "resonating";
  return "aligning";
}

export function daysSince(timestamp) {
  if (!timestamp?.toDate) return 0;
  const createdAt = timestamp.toDate();
  return Math.max(
    0,
    Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

export function formatOrderMonth(timestamp) {
  if (!timestamp?.toDate) return "Awaiting";
  return timestamp.toDate().toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function getOrderTheme(order) {
  const seed = `${order.angelNumber || "0"}-${order.title || ""}`;
  const index =
    [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    orderThemes.length;
  return orderThemes[index];
}
