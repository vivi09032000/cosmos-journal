import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderCoverArt from "../components/OrderCoverArt";
import OrdersModeToggle from "../components/OrdersModeToggle";
import { formatOrderMonth, getOrderTheme } from "../lib/orderTheme";

function formatDeliveredDate(timestamp) {
  if (!timestamp?.toDate) return "";
  return timestamp.toDate().toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatShortDate(timestamp) {
  if (!timestamp?.toDate) return "";
  return timestamp.toDate().toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

function getOrderJourneyDays(order) {
  if (!order.createdAt?.toDate) return 0;
  const start = order.createdAt.toDate().getTime();
  const end = order.deliveredAt?.toDate
    ? order.deliveredAt.toDate().getTime()
    : Date.now();

  return Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
}

function getProjectionDays(orders) {
  return orders.reduce((total, order) => total + getOrderJourneyDays(order), 0);
}

function getJournalExcerpt(entry) {
  const parts = [entry?.q1, entry?.q2, entry?.q3]
    .filter(Boolean)
    .map((part) => String(part).trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return "你曾經反覆感受到的畫面，現在成為現實的一部分。";
  }

  return `「${parts.join(" · ")}」`;
}

function WallStats({ deliveredCount, activeCount, projectionDays }) {
  const items = [
    { value: deliveredCount, label: "已實現" },
    { value: activeCount, label: "運送中" },
    { value: projectionDays, label: "投射天數" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <div key={item.label} className="paper-card-soft px-4 py-5 text-center">
          <p className="font-[var(--font-display)] text-[2.2rem] leading-none text-[color:var(--gold)]">
            {item.value}
          </p>
          <p className="mt-3 text-[0.72rem] tracking-[0.18em] text-[color:var(--ink-soft)]">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function WallEmptyState() {
  return (
    <section className="paper-card border-dashed px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(232,201,154,0.22)] text-3xl text-[rgba(181,120,58,0.38)]">
        ✦
      </div>
      <h2 className="mt-8 font-[var(--font-display)] text-[2.05rem] leading-[1.35] text-[color:var(--navy-deep)]">
        第一個顯化
        <br />
        正在路上
      </h2>
      <p className="mx-auto mt-5 max-w-[18rem] text-[1.02rem] leading-[2] text-[color:var(--ink-soft)]">
        你的訂單已送出，
        <br />
        宇宙正在打包。
        <br />
        當願望落地的那一刻，
        <br />
        它會永遠留在這裡。
      </p>
      <div className="mt-8 inline-flex rounded-xl border border-[rgba(181,120,58,0.35)] px-6 py-3 text-[0.84rem] tracking-[0.28em] text-[color:var(--gold)]">
        AWAITING DELIVERY
      </div>
    </section>
  );
}

function WallListCard({ order, onOpen }) {
  const theme = getOrderTheme(order);
  const journeyDays = getOrderJourneyDays(order);
  const latestEntry = [...(order.journal || [])].sort((left, right) => {
    const leftTime = left.recordedAt?.seconds || 0;
    const rightTime = right.recordedAt?.seconds || 0;
    return rightTime - leftTime;
  })[0];

  return (
    <article className="paper-card overflow-hidden">
      <div className="relative h-48 overflow-hidden rounded-b-none rounded-t-[1.6rem]" style={{ background: theme.background }}>
        <OrderCoverArt order={order} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(21,27,42,0)_34%,rgba(245,239,230,0.98)_100%)]" />
        <div className="absolute right-4 top-4 flex h-[4.4rem] w-[4.4rem] flex-col items-center justify-center rounded-full border border-[rgba(181,120,58,0.6)] bg-[rgba(245,239,230,0.96)] text-[color:var(--gold)] shadow-[0_12px_24px_rgba(46,35,24,0.12)]">
          <span className="text-sm">✦</span>
          <span className="mt-1 text-[0.72rem] tracking-[0.16em]">已</span>
          <span className="text-[0.72rem] tracking-[0.16em]">送達</span>
        </div>
      </div>

      <div className="px-5 py-5">
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex rounded-full border border-[rgba(181,120,58,0.38)] px-3 py-1 text-[0.68rem] tracking-[0.14em] text-[color:var(--gold)]">
            ✦ 已實現
          </span>
          <span className="text-[0.9rem] tracking-[0.08em] text-[color:var(--ink-soft)]">
            {journeyDays} 天後實現
          </span>
        </div>

        <h3 className="mt-4 font-[var(--font-display)] text-[2rem] leading-[1.22] text-[color:var(--ink)]">
          {order.title}
        </h3>

        {latestEntry ? (
          <blockquote className="mt-5 border-l border-[rgba(181,120,58,0.28)] pl-4 text-[1.04rem] italic leading-[1.95] text-[color:var(--ink-soft)]">
            {getJournalExcerpt(latestEntry)}
          </blockquote>
        ) : null}

        <div className="mt-6 border-t border-[rgba(181,120,58,0.12)] pt-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[0.9rem] tracking-[0.12em] text-[color:var(--ink-faint)]">
              {formatDeliveredDate(order.deliveredAt) || `${formatOrderMonth(order.createdAt)} 實現`}
            </p>
            <button
              type="button"
              onClick={onOpen}
              className="text-[0.9rem] tracking-[0.12em] text-[color:var(--gold)]"
            >
              時光膠囊 →
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function CapsuleTimeline({ order }) {
  const entries = [...(order.journal || [])].sort((left, right) => {
    const leftTime = left.recordedAt?.seconds || 0;
    const rightTime = right.recordedAt?.seconds || 0;
    return leftTime - rightTime;
  });

  const journeyDays = getOrderJourneyDays(order);

  return (
    <div className="space-y-5">
      {entries.length === 0 ? (
        <p className="text-sm leading-7 text-[color:var(--ink-soft)]">
          還沒有留下投射日記，但這個願望依然被宇宙收到了。
        </p>
      ) : (
        entries.map((entry, index) => {
          const isLast = index === entries.length - 1;
          const label = isLast
            ? "實現當天"
            : `${index === 0 ? "第 1 次投射" : `第 ${index + 1} 次投射`}`;

          return (
            <article key={`${entry.recordedAt?.seconds || "journal"}-${index}`} className="relative pl-12">
              <span className={`absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border ${isLast ? "border-[rgba(181,120,58,0.78)] bg-[rgba(181,120,58,0.92)] text-[#fff8ef]" : "border-[rgba(181,120,58,0.72)] bg-[rgba(255,251,246,0.96)] text-[color:var(--gold)]"}`}>
                {isLast ? "" : ""}
              </span>
              {!isLast ? (
                <span className="absolute left-[0.72rem] top-8 h-[calc(100%+0.85rem)] w-px bg-[rgba(181,120,58,0.18)]" />
              ) : null}
              <p className="text-[0.92rem] tracking-[0.12em] text-[color:var(--ink-faint)]">
                {formatShortDate(entry.recordedAt)} · {label}
              </p>
              <blockquote className="mt-3 text-[1.08rem] italic leading-[1.95] text-[color:var(--ink-soft)]">
                {getJournalExcerpt(entry)}
              </blockquote>
            </article>
          );
        })
      )}

      <div className="border-t border-[rgba(181,120,58,0.16)] pt-6 text-center">
        <p className="font-[var(--font-display)] text-[1.5rem] italic text-[color:var(--gold)]">
          正如你所預見。
        </p>
        <p className="mt-2 text-[0.82rem] tracking-[0.14em] text-[color:var(--ink-faint)]">
          從下單到實現：{journeyDays} 天
        </p>
      </div>
    </div>
  );
}

function CapsuleDetail({ order, onBack }) {
  const journeyDays = getOrderJourneyDays(order);
  const latestEntry = [...(order.journal || [])].sort((left, right) => {
    const leftTime = left.recordedAt?.seconds || 0;
    const rightTime = right.recordedAt?.seconds || 0;
    return rightTime - leftTime;
  })[0];

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="ghost-button -ml-2 text-sm"
      >
        <span>‹</span>
        <span>時光膠囊</span>
      </button>

      <section className="paper-card overflow-hidden px-0 py-0">
        <div className="px-6 py-6">
          <p className="text-[0.8rem] tracking-[0.22em] text-[color:var(--ink-faint)]">
            ✦ 已實現 · {formatDeliveredDate(order.deliveredAt)}
          </p>
          <h1 className="mt-4 font-[var(--font-display)] text-[2.2rem] leading-[1.18] text-[color:var(--ink)]">
            {order.title}
          </h1>
          <p className="mt-3 text-[1.05rem] tracking-[0.08em] text-[color:var(--ink-soft)]">
            從下單到實現：{journeyDays} 天
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
          <div className="mt-6">
            <CapsuleTimeline order={order} />
          </div>
        </div>

        {latestEntry ? (
          <div className="border-t border-[rgba(181,120,58,0.1)] bg-[rgba(250,246,240,0.55)] px-6 py-5">
            <p className="text-sm leading-7 text-[color:var(--ink-soft)]">
              最新留下的感受：{getJournalExcerpt(latestEntry)}
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default function WallPage({ orders }) {
  const navigate = useNavigate();
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || null,
    [orders, selectedOrderId],
  );

  const deliveredOrders = useMemo(
    () =>
      orders
        .filter((order) => order.status === "delivered")
        .sort((left, right) => {
          const leftTime = left.deliveredAt?.seconds || 0;
          const rightTime = right.deliveredAt?.seconds || 0;
          return rightTime - leftTime;
        }),
    [orders],
  );

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status !== "delivered"),
    [orders],
  );

  const projectionDays = useMemo(
    () => getProjectionDays(orders),
    [orders],
  );

  if (selectedOrder) {
    return <CapsuleDetail order={selectedOrder} onBack={() => setSelectedOrderId("")} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="ghost-button -ml-2 text-sm"
          >
            <span>‹</span>
            <span>返回</span>
          </button>
          <p className="gold-kicker mt-1">Cosmos Journal</p>
          <h1 className="section-title mt-2 text-[2.7rem] leading-[1.1]">
            已實現的
            <br />
            顯化
          </h1>
        </div>
        <OrdersModeToggle
          mode="delivered"
          onChange={(mode) => {
            if (mode === "active") {
              navigate("/orders");
            }
          }}
        />
      </div>

      <div className="border-t border-[rgba(181,120,58,0.14)] pt-5">
        <WallStats
          deliveredCount={deliveredOrders.length}
          activeCount={activeOrders.length}
          projectionDays={projectionDays}
        />
      </div>

      {deliveredOrders.length === 0 ? (
        <WallEmptyState />
      ) : (
        <section className="grid gap-4">
          {deliveredOrders.map((order) => (
            <WallListCard
              key={order.id}
              order={order}
              onOpen={() => setSelectedOrderId(order.id)}
            />
          ))}
        </section>
      )}
    </div>
  );
}
