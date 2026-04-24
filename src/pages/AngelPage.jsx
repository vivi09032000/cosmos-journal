import AngelDecoder from "../components/AngelDecoder";

function formatDate(timestamp) {
  if (!timestamp?.toDate) return "";
  return timestamp.toDate().toLocaleDateString("zh-TW");
}

const moodLabels = {
  calm: "平靜",
  sad: "難過",
  anxious: "焦慮",
  confused: "迷惘",
  excited: "期待",
  touched: "感動",
};

export default function AngelPage({ orders, angelLogs, onCreateAngelLog }) {
  const orderTitleMap = new Map(orders.map((order) => [order.id, order.title]));

  return (
    <div className="space-y-5">
      <AngelDecoder orders={orders} onSave={onCreateAngelLog} />

      <section className="paper-card px-5 py-5">
        <p className="section-label">過去的訊號</p>
        <h2 className="mt-2 font-[var(--font-display)] text-[1.55rem] text-[color:var(--ink)]">解碼紀錄</h2>
        <div className="timeline-rail mt-4 space-y-4">
          {angelLogs.length === 0 ? (
            <p className="text-sm text-[color:var(--ink-soft)]">還沒有任何天使數字紀錄。</p>
          ) : (
            angelLogs.map((log) => (
              <article key={log.id} className="relative pl-10">
                <span className="timeline-dot absolute left-0 top-1">✦</span>
                <div className="paper-card-soft px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-[var(--font-display)] text-2xl text-[color:var(--navy-deep)]">{log.number}</p>
                    <p className="text-xs tracking-[0.16em] text-[color:var(--ink-faint)]">{formatDate(log.recordedAt)}</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--ink)]">{log.decodedMessage}</p>
                  <p className="mt-2 text-xs tracking-[0.16em] text-[color:var(--ink-soft)]">
                    情緒：{moodLabels[log.mood] || "未標記"}
                  </p>
                  {log.note ? (
                    <p className="mt-2 text-sm leading-7 text-[color:var(--ink-soft)]">{log.note}</p>
                  ) : null}
                  {log.linkedOrderId && orderTitleMap.get(log.linkedOrderId) ? (
                    <p className="mt-2 text-xs tracking-[0.16em] text-[color:var(--ink-faint)]">
                      連結訂單：{orderTitleMap.get(log.linkedOrderId)}
                    </p>
                  ) : null}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
