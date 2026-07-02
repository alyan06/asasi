import Link from "next/link";
import { getOrders } from "@/lib/admin-queries";
import { money, formatDate, statusLabel } from "@/lib/format";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

export const metadata = { title: "Orders" };

const TABS = [
  "all",
  "awaiting_payment",
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

type SearchParams = Promise<{ status?: string }>;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status = "all" } = await searchParams;
  const orders = await getOrders(status);

  return (
    <div>
      <h1 className="mb-1 font-display text-3xl text-ink">Orders</h1>
      <p className="mb-6 text-muted">Manage and fulfil customer orders.</p>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-1.5 overflow-x-auto">
        {TABS.map((t) => (
          <Link
            key={t}
            href={t === "all" ? "/admin/orders" : `/admin/orders?status=${t}`}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              status === t
                ? "bg-forest text-cream"
                : "border border-line bg-paper text-ink hover:border-forest"
            }`}
          >
            {t === "all" ? "All" : statusLabel(t)}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="card px-6 py-16 text-center text-muted">
          No {status !== "all" ? `"${statusLabel(status)}"` : ""} orders to show.
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">City</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-line last:border-0 hover:bg-cream/60"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-medium text-forest hover:underline"
                      >
                        {o.order_number}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-ink">{o.customer_name}</p>
                      <p className="text-xs text-muted">{o.customer_phone}</p>
                    </td>
                    <td className="px-5 py-3 text-muted">{o.city ?? "—"}</td>
                    <td className="px-5 py-3 text-muted">
                      {formatDate(o.created_at)}
                    </td>
                    <td className="px-5 py-3 font-medium text-ink">
                      {money(o.total)}
                    </td>
                    <td className="px-5 py-3">
                      <OrderStatusSelect id={o.id} status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
