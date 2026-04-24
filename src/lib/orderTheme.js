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

export const orderStatusLabels = {
  packing: "打包中",
  aligning: "對準中",
  delivered: "已送達",
};

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
