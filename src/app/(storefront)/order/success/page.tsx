"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, MessageCircle, Package, ArrowRight } from "lucide-react";
import { money } from "@/lib/format";
import {
  BRAND,
  PAYMENT_METHODS,
  BANK_DETAILS,
  PAYMENT_WHATSAPP_DISPLAY,
  whatsappLink,
} from "@/lib/config";

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

  const needsProof =
    receipt?.payment_method === "online" ||
    receipt?.payment_method === "bank_transfer";

  const num = orderNumber || receipt?.order_number || "";
  const waMessage = `Hi ${BRAND.name}! I just placed order ${num}. I'd like to confirm my order, thank you!`;
  const payMessage = `Hi ${BRAND.name}! Sending payment proof for order ${num}. My name is ${
    receipt?.customer_name ?? ""
  } (same as on the order).`;

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
          {needsProof
            ? `Your order is reserved. Complete the payment below and send us the proof to confirm — then we'll ship via ${BRAND.courier}.`
            : `Your order has been placed. We'll confirm it shortly and send it your way via ${BRAND.courier}.`}
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

      {receipt && needsProof && (
        <div className="mx-auto mt-8 max-w-xl">
          <div className="card border-clay/40 p-6">
            <h2 className="font-display text-xl text-ink">Complete your payment</h2>
            <p className="mt-1 text-sm text-muted">
              Transfer <strong className="text-ink">{money(receipt.total)}</strong>{" "}
              using the details below.
            </p>

            <dl className="mt-4 divide-y divide-line rounded-xl border border-line">
              {[
                ["Bank", BANK_DETAILS.bankName],
                ["Account title", BANK_DETAILS.accountTitle],
                ["Account number", BANK_DETAILS.accountNumber],
                ["IBAN", BANK_DETAILS.iban],
                ["JazzCash / Easypaisa", BANK_DETAILS.jazzcash],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                >
                  <dt className="text-muted">{label}</dt>
                  <dd className="font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 rounded-xl bg-cream-deep px-4 py-3 text-sm text-ink/80">
              Send the payment screenshot{" "}
              <strong>
                with your name
                {receipt.customer_name ? ` (${receipt.customer_name})` : ""} — it
                must match your order
              </strong>{" "}
              to WhatsApp {PAYMENT_WHATSAPP_DISPLAY}. We confirm and dispatch once
              received.
            </div>

            <a
              href={whatsappLink(payMessage)}
              target="_blank"
              rel="noreferrer"
              className="btn-clay mt-4 w-full"
            >
              <MessageCircle className="h-4 w-4" /> Send payment proof on WhatsApp
            </a>
          </div>
        </div>
      )}

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
        {!needsProof && (
          <a
            href={whatsappLink(waMessage)}
            target="_blank"
            rel="noreferrer"
            className="btn-clay"
          >
            <MessageCircle className="h-4 w-4" /> Confirm on WhatsApp
          </a>
        )}
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
