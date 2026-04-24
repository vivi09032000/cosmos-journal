import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

function formatDate(timestamp) {
  if (!timestamp?.toDate) return "";
  return timestamp.toDate().toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

function getOrderJourneyDays(order) {
  if (!order?.createdAt?.toDate) return 0;
  const start = order.createdAt.toDate().getTime();
  const end = order.deliveredAt?.toDate
    ? order.deliveredAt.toDate().getTime()
    : Date.now();

  return Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
}

function getJournalContent(entry) {
  const content = [entry?.q1, entry?.q2, entry?.q3]
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter(Boolean)
    .join(" · ");

  return content || "這次投射沒有留下文字，但願望仍然被宇宙記住了。";
}

export default function TimeCapsulePage({ orders }) {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const order = useMemo(
    () => orders.find((item) => item.id === orderId) || null,
    [orders, orderId],
  );

  const timeline = useMemo(
    () =>
      [...(order?.journal || [])].sort((left, right) => {
        const leftTime = left.recordedAt?.seconds || 0;
        const rightTime = right.recordedAt?.seconds || 0;
        return leftTime - rightTime;
      }),
    [order],
  );

  if (!order) {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => navigate("/orders")}
          className="ghost-button -ml-2 text-sm"
        >
          <span>‹</span>
          <span>返回訂單</span>
        </button>
        <section className="paper-card px-6 py-10 text-center">
          <h1 className="font-[var(--font-display)] text-[1.8rem] text-[color:var(--navy-deep)]">
            找不到這顆時光膠囊
          </h1>
          <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">
            這筆願望可能還沒被簽收，或已經不在目前的資料裡。
          </p>
        </section>
      </div>
    );
  }

  const journeyDays = getOrderJourneyDays(order);

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => navigate("/orders")}
        className="ghost-button -ml-2 text-sm"
      >
        <span>‹</span>
        <span>時光膠囊</span>
      </button>

      <section className="paper-card overflow-hidden px-0 py-0">
        <div className="px-6 py-6">
          <p className="text-[0.8rem] tracking-[0.18em] text-[color:var(--ink-faint)]">
            實現日期 · {formatDate(order.deliveredAt)}
          </p>
          <h1 className="mt-4 font-[var(--font-display)] text-[2.2rem] leading-[1.2] text-[color:var(--ink)]">
            {order.title}
          </h1>
          <p className="mt-3 text-[1rem] tracking-[0.06em] text-[color:var(--ink-soft)]">
            從下單到實現 {journeyDays} 天
          </p>
        </div>

        <div className="border-t border-[rgba(181,120,58,0.12)] px-6 py-8">
          <blockquote className="text-center font-[var(--font-display)] text-[2rem] italic leading-[1.7] text-[color:var(--ink)]">
            「你曾經反覆感受到的畫面，
            <br />
            現在成為現實的一部分。」
          </blockquote>
        </div>

        <div className="border-t border-[rgba(181,120,58,0.12)] px-6 py-8">
          <p className="section-label">投射日記回顧</p>
          <div className="mt-6 space-y-6">
            {timeline.length === 0 ? (
              <p className="text-sm leading-7 text-[color:var(--ink-soft)]">
                這張時光膠囊裡還沒有留下投射文字，但你真的已經走到這裡了。
              </p>
            ) : (
              timeline.map((entry, index) => {
                const isLast = index === timeline.length - 1;
                const label = isLast ? "實現當天" : `第 ${index + 1} 次投射`;

                return (
                  <article key={`${entry.recordedAt?.seconds || "entry"}-${index}`} className="relative pl-12">
                    <span className={`absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border ${isLast ? "border-[rgba(181,120,58,0.72)] bg-[rgba(181,120,58,0.9)]" : "border-[rgba(181,120,58,0.68)] bg-[rgba(255,252,247,0.98)]"}`} />
                    {!isLast ? (
                      <span className="absolute left-[0.72rem] top-8 h-[calc(100%+1rem)] w-px bg-[rgba(181,120,58,0.18)]" />
                    ) : null}
                    <p className="text-[0.9rem] tracking-[0.12em] text-[color:var(--ink-faint)]">
                      {formatDate(entry.recordedAt)} · {label}
                    </p>
                    <blockquote className="mt-3 text-[1.08rem] italic leading-[1.95] text-[color:var(--ink-soft)]">
                      「{getJournalContent(entry)}」
                    </blockquote>
                  </article>
                );
              })
            )}
          </div>
        </div>

        <div className="border-t border-[rgba(181,120,58,0.12)] px-6 py-6 text-center">
          <p className="font-[var(--font-display)] text-[1.7rem] italic text-[color:var(--gold)]">
            正如你所預見。
          </p>
        </div>
      </section>
    </div>
  );
}
