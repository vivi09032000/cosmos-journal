import {
  daysSince,
  formatOrderMonth,
  getOrderTheme,
  orderStatusLabels,
} from "../lib/orderTheme";
import { getActionProgress } from "../lib/orderActions";
import { Tag } from "./CosmosDecor";
import OrderCoverArt from "./OrderCoverArt";

export default function OrderCard({ order, onClick }) {
  const theme = getOrderTheme(order);
  const progress = getActionProgress(order);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group paper-card w-full overflow-hidden text-left transition duration-300 hover:-translate-y-1"
    >
      <div className="relative h-40 overflow-hidden" style={{ background: theme.background }}>
        <OrderCoverArt order={order} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(250,246,240,0)_38%,rgba(250,246,240,0.96)_100%)]" />
        <div className="absolute inset-0 opacity-80">
          <div className="absolute left-6 top-5 h-2 w-2 rounded-full" style={{ background: theme.accent }} />
          <div className="absolute right-9 top-8 h-1.5 w-1.5 rounded-full" style={{ background: theme.accent }} />
          <div className="absolute bottom-4 right-3 h-24 w-24 rounded-full border" style={{ borderColor: "rgba(240, 214, 167, 0.2)" }} />
        </div>
        <div className="absolute right-3 top-3">
          <Tag>{order.angelNumber ? `#${order.angelNumber}` : "Manifest"}</Tag>
        </div>
        <div className="absolute bottom-3 left-4 right-4">
          <div className="font-[var(--font-display)] text-[1.7rem] leading-none text-[color:var(--ink)]">
            {order.title}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[0.62rem] tracking-[0.16em] text-[color:var(--ink-faint)]">
              {formatOrderMonth(order.createdAt)} · {orderStatusLabels[order.status]}
            </p>
            {order.subtitle ? (
              <p className="mt-1 text-sm text-[color:var(--ink-soft)]">{order.subtitle}</p>
            ) : null}
          </div>
          <div className="text-[0.65rem] tracking-[0.16em] text-[color:var(--ink-faint)]">
            第 {daysSince(order.createdAt)} 天
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="relative h-[2px] flex-1 rounded-full bg-[color:var(--paper-strong)]">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(to_right,var(--gold-soft),var(--gold))]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-[0.62rem] tracking-[0.16em] text-[color:var(--ink-faint)]">
            {orderStatusLabels[order.status]}
          </div>
        </div>
      </div>
    </button>
  );
}
