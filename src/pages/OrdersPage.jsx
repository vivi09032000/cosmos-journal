import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import OrdersModeToggle from "../components/OrdersModeToggle";
import { WaveDivider } from "../components/CosmosDecor";
import OrderCard from "../components/OrderCard";
import OrderCoverArt from "../components/OrderCoverArt";
import OrderDetail from "../components/OrderDetail";
import { useI18n } from "../lib/i18n";
import { getOrderTheme } from "../lib/orderTheme";

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
  const content = [entry?.q1, entry?.q2, entry?.q3]
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter(Boolean)
    .join(" · ");

  if (!content) {
    return "";
  }

  return content.length > 40 ? `${content.slice(0, 40)}...` : content;
}

function formatDeliveredDate(timestamp) {
  if (!timestamp?.toDate) return null;
  return timestamp.toDate();
}

function CreateOrderModal({ onClose, onCreate }) {
  const { locale } = useI18n();
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    imageFile: null,
  });
  const [previewUrl, setPreviewUrl] = useState("");

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    if (!form.imageFile) {
      setPreviewUrl("");
      return undefined;
    }

    const nextPreviewUrl = URL.createObjectURL(form.imageFile);
    setPreviewUrl(nextPreviewUrl);

    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [form.imageFile]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;

    const payload = { ...form };

    flushSync(() => {
      onClose();
    });

    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        onCreate(payload);
      }, 0);
    });
  };

  const copy = locale === "en"
    ? {
      kicker: "New Goal",
      title: "Create Goal",
      titleLabel: "Goal title",
      subtitleLabel: "Subtitle",
      imageLabel: "Goal image",
      helper: "You can skip the upload. The app will start with an illustrated cover for this goal.",
      previewAlt: "Goal preview",
      cancel: "Cancel",
      submit: "Create",
    }
    : {
      kicker: "新增目標",
      title: "新增目標",
      titleLabel: "目標標題",
      subtitleLabel: "副標題",
      imageLabel: "目標圖片",
      helper: "沒有上傳也沒關係，系統會先用目標類型的插畫陪你記錄。",
      previewAlt: "目標預覽",
      cancel: "取消",
      submit: "建立",
    };

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-[rgba(18,20,29,0.48)] p-4 pb-28 pt-6">
      <form
        onSubmit={handleSubmit}
        className="paper-card mx-auto w-full max-w-lg overflow-y-auto px-5 py-5 max-h-[calc(100svh-3rem)]"
      >
        <p className="gold-kicker">{copy.kicker}</p>
        <h2 className="mt-2 font-display text-[2rem] text-[color:var(--navy-deep)]">{copy.title}</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-[color:var(--ink-soft)]">{copy.titleLabel}</label>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              className="cosmos-input mt-2"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[color:var(--ink-soft)]">{copy.subtitleLabel}</label>
            <input
              value={form.subtitle}
              onChange={(event) => updateField("subtitle", event.target.value)}
              className="cosmos-input mt-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[color:var(--ink-soft)]">{copy.imageLabel}</label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => updateField("imageFile", event.target.files?.[0] || null)}
              className="cosmos-input mt-2 file:mr-4 file:rounded-full file:border-0 file:bg-[rgba(181,120,58,0.12)] file:px-4 file:py-2 file:text-sm file:text-[color:var(--gold)]"
            />
            <p className="mt-2 text-xs leading-6 text-[color:var(--ink-faint)]">
              {copy.helper}
            </p>
            {previewUrl ? (
              <div className="mt-3 overflow-hidden rounded-[1.2rem] border border-[rgba(181,120,58,0.18)]">
                <img src={previewUrl} alt={copy.previewAlt} className="h-40 w-full object-cover" />
              </div>
            ) : null}
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="secondary-button flex-1">
            {copy.cancel}
          </button>
          <button
            type="submit"
            disabled={!form.title.trim()}
            className="primary-button flex-1"
          >
            {copy.submit}
          </button>
        </div>
      </form>
    </div>
  );
}

function DeliveredOrderCard({ order, onOpenCapsule }) {
  const { locale } = useI18n();
  const theme = getOrderTheme(order);
  const allLinkedNumbers = [
    ...new Set((order.linkedAngelLogs || []).map((log) => log.number).filter(Boolean)),
  ];
  const linkedNumbers = allLinkedNumbers.slice(0, 6);
  const hiddenLinkedCount = Math.max(0, allLinkedNumbers.length - linkedNumbers.length);
  const journeyDays = getOrderJourneyDays(order);
  const latestEntry = [...(order.journal || [])].sort((left, right) => {
    const leftTime = left.recordedAt?.seconds || 0;
    const rightTime = right.recordedAt?.seconds || 0;
    return rightTime - leftTime;
  })[0];

  const deliveredDate = formatDeliveredDate(order.deliveredAt);

  return (
    <article className="paper-card overflow-hidden">
      <div className="relative h-40 overflow-hidden" style={{ background: theme.background }}>
        <OrderCoverArt order={order} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(250,246,240,0)_35%,rgba(250,246,240,0.96)_100%)]" />
        <div className="absolute right-4 top-4 rounded-full border border-[rgba(181,120,58,0.45)] bg-[rgba(250,246,240,0.9)] px-3 py-1 text-[0.68rem] tracking-[0.16em] text-[color:var(--gold)]">
          {locale === "en" ? "✦ Fulfilled" : "✦ 已實現"}
        </div>
      </div>

      <div className="px-5 py-5">
        <h3 className="font-display text-[1.85rem] leading-[1.2] text-[color:var(--ink)]">
          {order.title}
        </h3>
        {order.subtitle ? (
          <p className="mt-2 text-sm leading-7 text-[color:var(--ink-soft)]">
            {order.subtitle}
          </p>
        ) : null}
        {linkedNumbers.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[0.62rem] tracking-[0.16em] text-[color:var(--ink-faint)]">
              {locale === "en" ? "Linked signals" : "已連結訊號"}
            </span>
            {linkedNumbers.map((number) => (
              <span key={`${order.id}-${number}`} className="journal-tag">
                {number}
              </span>
            ))}
            {hiddenLinkedCount > 0 ? (
              <span className="journal-tag">+{hiddenLinkedCount}</span>
            ) : null}
          </div>
        ) : null}
        {latestEntry ? (
          <p className="mt-4 border-l border-[rgba(181,120,58,0.24)] pl-4 text-sm italic leading-7 text-[color:var(--ink-soft)]">
            「{getJournalExcerpt(latestEntry)}」
          </p>
        ) : null}
        <div className="mt-5 flex items-center justify-between gap-4 border-t border-[rgba(181,120,58,0.12)] pt-4">
          <div>
            <p className="text-[0.72rem] tracking-[0.16em] text-[color:var(--ink-faint)]">
              {locale === "en" ? "Fulfilled on" : "實現日期"}
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">
              {deliveredDate
                ? `${deliveredDate.toLocaleDateString(locale === "en" ? "en-US" : "zh-TW", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                })} · ${locale === "en" ? `${journeyDays} days from goal to fulfillment` : `從建立到實現 ${journeyDays} 天`}`
                : locale === "en"
                  ? "Marked as fulfilled"
                  : "已記錄為實現"}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCapsule}
            className="text-[0.9rem] tracking-[0.12em] text-[color:var(--gold)]"
          >
            {locale === "en" ? "Time capsule →" : "時光膠囊 →"}
          </button>
        </div>
      </div>
    </article>
  );
}

function DeliveredEmptyState({ deliveredCount, activeCount, projectionDays }) {
  const { locale } = useI18n();
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-3">
        <div className="paper-card-soft px-4 py-5 text-center">
          <p className="font-display text-[1.9rem] leading-none text-[color:var(--gold)]">
            {deliveredCount}
          </p>
          <p className="mt-3 text-[0.72rem] tracking-[0.16em] text-[color:var(--ink-soft)]">{locale === "en" ? "Fulfilled" : "已實現"}</p>
        </div>
        <div className="paper-card-soft px-4 py-5 text-center">
          <p className="font-display text-[1.9rem] leading-none text-[color:var(--gold)]">
            {activeCount}
          </p>
          <p className="mt-3 text-[0.72rem] tracking-[0.16em] text-[color:var(--ink-soft)]">{locale === "en" ? "In transit" : "運送中"}</p>
        </div>
        <div className="paper-card-soft px-4 py-5 text-center">
          <p className="font-display text-[1.9rem] leading-none text-[color:var(--gold)]">
            {projectionDays}
          </p>
          <p className="mt-3 text-[0.72rem] tracking-[0.16em] text-[color:var(--ink-soft)]">{locale === "en" ? "Days tracked" : "累計紀錄天數"}</p>
        </div>
      </div>

      <section className="paper-card border-dashed px-6 py-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(232,201,154,0.18)] text-3xl text-[rgba(181,120,58,0.32)]">
          ✦
        </div>
        <p className="mx-auto mt-8 max-w-[20rem] font-display text-[1.9rem] leading-[1.45] text-[color:var(--navy-deep)]">
          {locale === "en" ? "Your first fulfilled goal is on its way" : "第一個實現的願望正在路上"}
        </p>
        <p className="mx-auto mt-5 max-w-[22rem] text-[1rem] leading-[2] text-[color:var(--ink-soft)]">
          {locale === "en"
            ? "When a wish becomes real, it will stay here permanently."
            : "當願望落地的那一刻，它會永遠留在這裡。"}
        </p>
      </section>
    </section>
  );
}

export default function OrdersPage({
  orders,
  angelLogs = [],
  loading,
  onCreateOrder,
  onUpdateStatus,
  onAddJournalEntry,
  onSaveActionItems,
  onUpdateOrderImage,
}) {
  const { locale } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [mode, setMode] = useState("active");

  const linkedAngelLogsByOrderId = useMemo(() => {
    const map = new Map();

    for (const log of angelLogs) {
      if (!log.linkedOrderId) continue;
      const currentLogs = map.get(log.linkedOrderId) || [];
      currentLogs.push(log);
      map.set(log.linkedOrderId, currentLogs);
    }

    return map;
  }, [angelLogs]);

  const ordersWithLinkedSignals = useMemo(
    () =>
      orders.map((order) => ({
        ...order,
        linkedAngelLogs: linkedAngelLogsByOrderId.get(order.id) || [],
      })),
    [linkedAngelLogsByOrderId, orders],
  );

  const selectedOrder = useMemo(
    () => ordersWithLinkedSignals.find((order) => order.id === selectedOrderId) || null,
    [ordersWithLinkedSignals, selectedOrderId],
  );

  const activeOrders = useMemo(
    () => ordersWithLinkedSignals.filter((order) => order.status !== "delivered"),
    [ordersWithLinkedSignals],
  );

  const deliveredOrders = useMemo(
    () =>
      ordersWithLinkedSignals
        .filter((order) => order.status === "delivered")
        .sort((left, right) => {
          const leftTime = left.deliveredAt?.seconds || 0;
          const rightTime = right.deliveredAt?.seconds || 0;
          return rightTime - leftTime;
        }),
    [ordersWithLinkedSignals],
  );

  const projectionDays = useMemo(
    () => getProjectionDays(orders),
    [orders],
  );

  useEffect(() => {
    const nextSelectedOrderId = location.state?.selectedOrderId;

    if (!nextSelectedOrderId) {
      return;
    }

    if (orders.some((order) => order.id === nextSelectedOrderId)) {
      setMode("active");
      setSelectedOrderId(nextSelectedOrderId);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate, orders]);

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setSelectedOrderId("");
  };

  const handleCreateOrder = async (form) => {
    try {
      await onCreateOrder(form);
    } catch (error) {
      console.error("Error creating order:", error);
      alert((locale === "en" ? "Saving failed: " : "儲存時發生錯誤：") + error.message);
    }
  };

  return (
    <div className="space-y-5">
      {selectedOrder ? (
        <OrderDetail
          order={selectedOrder}
          linkedAngelLogs={selectedOrder.linkedAngelLogs}
          onBack={() => setSelectedOrderId("")}
          onUpdateStatus={(status) => onUpdateStatus(selectedOrder.id, status)}
          onSubmitJournal={(entry) => onAddJournalEntry(selectedOrder.id, entry)}
          onSaveActionItems={(actionItems) => onSaveActionItems(selectedOrder.id, actionItems)}
          onUpdateOrderImage={(imageFile) => onUpdateOrderImage(selectedOrder.id, imageFile)}
        />
      ) : (
        <>
          <section className="screen-header">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="gold-kicker">Goals</p>
                <h1 className="section-title mt-2 text-[2rem]">{locale === "en" ? "Goals" : "目標"}</h1>
              </div>
              <OrdersModeToggle mode={mode} onChange={handleModeChange} />
            </div>
            <WaveDivider className="wave-divider" />
          </section>

          {loading ? (
            <p className="text-sm text-[color:var(--ink-soft)]">{locale === "en" ? "Loading goals..." : "讀取目標中..."}</p>
          ) : mode === "active" ? (
            activeOrders.length === 0 ? (
              <section className="paper-card px-6 py-10 text-center text-sm text-[color:var(--ink-soft)]">
                {locale === "en" ? "There are no goals yet. Create the first wish." : "還沒有目標，先建立第一個願望吧。"}
              </section>
            ) : (
              <section className="grid gap-4">
                {activeOrders.map((order) => (
                  <OrderCard key={order.id} order={order} onClick={() => setSelectedOrderId(order.id)} />
                ))}
              </section>
            )
          ) : deliveredOrders.length === 0 ? (
            <DeliveredEmptyState
              deliveredCount={deliveredOrders.length}
              activeCount={activeOrders.length}
              projectionDays={projectionDays}
            />
          ) : (
            <section className="grid gap-4">
              {deliveredOrders.map((order) => (
                <DeliveredOrderCard
                  key={order.id}
                  order={order}
                  onOpenCapsule={() => navigate(`/capsule/${order.id}`)}
                />
              ))}
            </section>
          )}
        </>
      )}

      {!selectedOrder && mode === "active" ? (
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="floating-order-add z-20 flex h-[4.3rem] w-[4.3rem] items-center justify-center rounded-full border border-[rgba(181,120,58,0.28)] bg-[linear-gradient(180deg,rgba(41,53,82,0.98),rgba(31,41,72,0.99))] text-4xl text-[#f6ead2] shadow-[0_18px_34px_rgba(31,41,72,0.3)]"
        >
          +
        </button>
      ) : null}

      {showModal ? (
        <CreateOrderModal onClose={() => setShowModal(false)} onCreate={handleCreateOrder} />
      ) : null}
    </div>
  );
}
