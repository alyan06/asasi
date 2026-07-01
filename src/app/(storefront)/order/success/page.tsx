"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, MessageCircle, Package, ArrowRight } from "lucide-react";
import { money } from "@/lib/format";
import { BRAND, PAYMENT_METHODS, whatsappLink } from "@/lib/config";

type Receipt = {
  order_number: string;
  subtotal: number;
  discount_amount: number;
  delivery_fee: number;
  total: number;
  customer_name?: string;
  payment_method?: string;
  items?: { name: string; quantity: number; price: number }[];
};

function paymentLabel(value?: string) {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? "On delivery";
}

function SuccessView() {
  const params = useSearchParams();
  const orderNumber = params.get("o") ?? "";
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("asasi:lastOrder");
      if (raw) {
        const parsed = JSON.parse(raw) as Receipt;
        if (!orderNumber || parsed.order_number === orderNumber) {
          setReceipt(parsed);
        }
      }
    } catch {
      /* ignore */
    }
  }, [orderNumber]);

  const waMessage = `Hi ${BRAND.name}! I just placed order ${
    orderNumber || receipt?.order_number || ""
  }. I'd like to confirm my order, thank you!`;

  return (
    <div className="container-x py-14 md:py-20">
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sage-soft">
          <CheckCircle2 className="h-8 w-8 text-forest" />
        </span>
        <h1 className="mt-5 font-display text-4xl text-ink">
          Thank you{receipt?.customer_name ? `, ${receipt.customer_name}` : ""}!
        </h1>
        <p className="mt-3 text-muted">
          Your order has been placed. We&apos;ll confirm it shortly and send it
          your way via {BRAND.courier}.
        </p>

        <div className="mt-6 inline-flex flex-col items-center rounded-2xl border border-line bg-paper px-8 py-5">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Order number
          </span>
          <span className="font-display text-2xl text-forest">
            {orderNumber || receipt?.order_number || "—"}
          </span>
        </div>
      </div>

      {receipt && (
        <div className="mx-auto mt-10 max-w-xl">
          <div className="card p-6">
            <h2 className="flex items-center gap-2 font-display text-xl text-ink">
              <Package className="h-5 w-5 text-sage" /> Order summary
            </h2>

            {receipt.items && receipt.items.length > 0 && (
              <ul className="mt-5 flex flex-col gap-2.5">
                {receipt.items.map((it, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="text-ink">
                      {it.name}{" "}
                      <span className="text-muted">× {it.quantity}</span>
                    </span>
                    <span className="font-medium text-ink">
                      {money(it.price * it.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <dl className="mt-5 space-y-2 border-t border-line pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="text-ink">{money(receipt.subtotal)}</dd>
              </div>
              {receipt.discount_amount > 0 && (
                <div className="flex justify-between text-forest">
                  <dt>Discount</dt>
                  <dd>−{money(receipt.discount_amount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Delivery</dt>
                <dd className="text-ink">
                  {receipt.delivery_fee === 0
                    ? "Free"
                    : money(receipt.delivery_fee)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Payment</dt>
                <dd className="text-ink">{paymentLabel(receipt.payment_method)}</dd>
              </div>
            </dl>

            <div className="mt-4 flex justify-between border-t border-line pt-4">
              <span className="font-display text-lg text-ink">Total</span>
              <span className="font-display text-lg text-forest">
                {money(receipt.total)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          href={whatsappLink(waMessage)}
          target="_blank"
          rel="noreferrer"
          className="btn-clay"
        >
          <MessageCircle className="h-4 w-4" /> Confirm on WhatsApp
        </a>
        <Link href="/shop" className="btn-outline">
          Continue shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="container-x py-20" />}>
      <SuccessView />
    </Suspense>
  );
}
