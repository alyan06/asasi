import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  StickyNote,
  MessageCircle,
} from "lucide-react";
import { getOrderById } from "@/lib/admin-queries";
import { money, formatDateTime } from "@/lib/format";
import { PAYMENT_METHODS } from "@/lib/config";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

export const metadata = { title: "Order" };

type Params = Promise<{ id: string }>;

function waNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("92")) return digits;
  if (digits.startsWith("0")) return "92" + digits.slice(1);
  return digits;
}

function paymentLabel(value: string) {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value;
}

export default async function AdminOrderDetail({ params }: { params: Params }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const items = order.order_items ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-forest"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">{order.order_number}</h1>
          <p className="mt-1 text-sm text-muted">
            Placed {formatDateTime(order.created_at)}
          </p>
        </div>
        <OrderStatusSelect id={order.id} status={order.status} />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_320px]">
        {/* Items + totals */}
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-5 py-3 font-medium">Item</th>
                <th className="px-5 py-3 font-medium">Qty</th>
                <th className="px-5 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink">{it.product_name}</p>
                    <p className="text-xs text-muted">{money(it.unit_price)} each</p>
                  </td>
                  <td className="px-5 py-3 text-ink">{it.quantity}</td>
                  <td className="px-5 py-3 text-right font-medium text-ink">
                    {money(it.total_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <dl className="space-y-2 border-t border-line p-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="text-ink">{money(order.subtotal)}</dd>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-forest">
                <dt>
                  Discount {order.discount_code ? `(${order.discount_code})` : ""}
                </dt>
                <dd>−{money(order.discount_amount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd className="text-ink">
                {order.delivery_fee === 0 ? "Free" : money(order.delivery_fee)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3">
              <dt className="font-display text-base text-ink">Total</dt>
              <dd className="font-display text-base text-forest">
                {money(order.total)}
              </dd>
            </div>
            <div className="flex justify-between pt-1">
              <dt className="text-muted">Payment</dt>
              <dd className="text-ink">{paymentLabel(order.payment_method)}</dd>
            </div>
          </dl>
        </div>

        {/* Customer */}
        <div className="flex flex-col gap-4">
          <div className="card p-5">
            <h2 className="font-display text-lg text-ink">Customer</h2>
            <p className="mt-3 font-medium text-ink">{order.customer_name}</p>
            <div className="mt-3 flex flex-col gap-2.5 text-sm">
              <a
                href={`tel:${order.customer_phone}`}
                className="flex items-center gap-2 text-ink hover:text-forest"
              >
                <Phone className="h-4 w-4 text-sage" /> {order.customer_phone}
              </a>
              {order.customer_email && (
                <a
                  href={`mailto:${order.customer_email}`}
                  className="flex items-center gap-2 text-ink hover:text-forest"
                >
                  <Mail className="h-4 w-4 text-sage" /> {order.customer_email}
                </a>
              )}
              <p className="flex items-start gap-2 text-ink">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
                <span>
                  {order.shipping_address}
                  {order.city ? `, ${order.city}` : ""}
                </span>
              </p>
            </div>

            <a
              href={`https://wa.me/${waNumber(order.customer_phone)}`}
              target="_blank"
              rel="noreferrer"
              className="btn-clay mt-4 w-full text-sm"
            >
              <MessageCircle className="h-4 w-4" /> Message on WhatsApp
            </a>
          </div>

          {order.order_notes && (
            <div className="card p-5">
              <h2 className="flex items-center gap-2 font-display text-lg text-ink">
                <StickyNote className="h-4 w-4 text-sage" /> Notes
              </h2>
              <p className="mt-2 text-sm text-ink/80">{order.order_notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
