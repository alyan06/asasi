import type { OrderStatus } from "@/lib/types";

const STYLES: Record<OrderStatus, string> = {
  pending: "bg-gold/15 text-gold",
  confirmed: "bg-sage-soft text-forest",
  packed: "bg-clay-soft text-clay",
  shipped: "bg-forest/10 text-forest",
  delivered: "bg-forest text-cream",
  cancelled: "bg-clay/15 text-clay",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
