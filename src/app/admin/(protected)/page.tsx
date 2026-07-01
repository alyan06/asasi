import Link from "next/link";
import {
  Wallet,
  ClipboardList,
  Clock,
  Package,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { getAdminStats, getRecentOrders } from "@/lib/admin-queries";
import { money, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/admin/status-badge";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const [stats, recent] = await Promise.all([
    getAdminStats(),
    getRecentOrders(6),
  ]);

  const cards = [
    { label: "Revenue", value: money(stats.revenue), icon: Wallet },
    { label: "Total orders", value: stats.orderCount, icon: ClipboardList },
    { label: "Pending orders", value: stats.pending, icon: Clock },
    { label: "Active products", value: stats.productCount, icon: Package },
  ];

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-3xl text-ink">Dashboard</h1>
        <p className="mt-1 text-muted">Welcome back — here&apos;s your store at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">{label}</span>
              <Icon className="h-4 w-4 text-sage" />
            </div>
            <p className="mt-2 font-display text-2xl text-ink">{value}</p>
          </div>
        ))}
      </div>

      {stats.lowStockCount > 0 && (
        <Link
          href="/admin/products"
          className="mt-5 flex items-center gap-3 rounded-xl border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay transition-colors hover:bg-clay/15"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            {stats.lowStockCount} product{stats.lowStockCount > 1 ? "s" : ""} low
            on stock (5 or fewer). Review inventory →
          </span>
        </Link>
      )}

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-ink">Recent orders</h2>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-sm font-medium text-forest hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="card px-6 py-14 text-center text-muted">
            No orders yet. They&apos;ll appear here as customers check out.
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Total</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o) => (
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
                      <td className="px-5 py-3 text-ink">{o.customer_name}</td>
                      <td className="px-5 py-3 text-muted">
                        {formatDate(o.created_at)}
                      </td>
                      <td className="px-5 py-3 font-medium text-ink">
                        {money(o.total)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
