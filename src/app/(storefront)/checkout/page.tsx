"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Leaf, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { PAYMENT_METHODS } from "@/lib/config";
import {
  fetchStoreSettings,
  DEFAULT_SETTINGS,
  type StoreSettings,
} from "@/lib/store-settings";
import {
  computeTotals,
  loadAppliedDiscount,
  saveAppliedDiscount,
  type AppliedDiscount,
} from "@/lib/totals";

type Form = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  payment: string;
  notes: string;
};

export default function CheckoutPage() {
  const { lines, hydrated, subtotal, clear } = useCart();
  const router = useRouter();
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [applied, setApplied] = useState<AppliedDiscount>(null);
  const [form, setForm] = useState<Form>({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    payment: "cod",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStoreSettings().then(setSettings);
    setApplied(loadAppliedDiscount());
  }, []);

  const totals = computeTotals(subtotal, settings, applied);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError("Please fill in your name, phone number and shipping address.");
      return;
    }
    if (lines.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data, error: rpcError } = await supabase.rpc("place_order", {
        p_customer_name: form.name.trim(),
        p_customer_phone: form.phone.trim(),
        p_shipping_address: form.address.trim(),
        p_items: lines.map((l) => ({
          product_id: l.product_id,
          quantity: l.quantity,
        })),
        p_customer_email: form.email.trim() || null,
        p_city: form.city.trim() || null,
        p_payment_method: form.payment,
        p_order_notes: form.notes.trim() || null,
        p_discount_code: applied?.code ?? null,
      });

      if (rpcError) throw rpcError;
      const result = data as {
        order_number: string;
        subtotal: number;
        discount_amount: number;
        delivery_fee: number;
        total: number;
      };

      // Stash a receipt for the success page, then clear the cart.
      try {
        sessionStorage.setItem(
          "asasi:lastOrder",
          JSON.stringify({
            ...result,
            customer_name: form.name.trim(),
            payment_method: form.payment,
            items: lines.map((l) => ({
              name: l.name,
              quantity: l.quantity,
              price: l.price,
            })),
          }),
        );
      } catch {
        /* ignore */
      }
      clear();
      saveAppliedDiscount(null);
      router.push(`/order/success?o=${encodeURIComponent(result.order_number)}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message.replace(/^.*?:\s/, ""));
      setSubmitting(false);
    }
  }

  if (hydrated && lines.length === 0) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="font-display text-3xl text-ink">Your cart is empty</h1>
        <p className="mt-2 text-muted">Add something lovely before checking out.</p>
        <Link href="/shop" className="btn-primary mt-6">
          Browse the shop <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x py-10 md:py-14">
      <h1 className="font-display text-4xl text-ink">Checkout</h1>

      <form
        onSubmit={placeOrder}
        className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]"
      >
        {/* Details */}
        <div className="flex flex-col gap-6">
          <section className="card p-6">
            <h2 className="font-display text-xl text-ink">Contact & shipping</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Full name *</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Ayesha Khan"
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="label">Phone number *</label>
                <input
                  className="input"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="03xx xxxxxxx"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </div>
              <div>
                <label className="label">Email (optional)</label>
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@email.com"
                  autoComplete="email"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Shipping address *</label>
                <textarea
                  className="input min-h-24 resize-y"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="House / flat, street, area, landmark"
                  autoComplete="street-address"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">City</label>
                <input
                  className="input"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="e.g. Lahore"
                  autoComplete="address-level2"
                />
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-xl text-ink">Payment method</h2>
            <div className="mt-4 flex flex-col gap-3">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                    form.payment === m.value
                      ? "border-forest bg-sage-soft/40"
                      : "border-line hover:border-forest/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={m.value}
                    checked={form.payment === m.value}
                    onChange={(e) => set("payment", e.target.value)}
                    className="mt-1 accent-forest"
                  />
                  <span>
                    <span className="block font-medium text-ink">{m.label}</span>
                    <span className="block text-sm text-muted">{m.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-xl text-ink">Order notes (optional)</h2>
            <textarea
              className="input mt-4 min-h-20 resize-y"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Anything we should know? e.g. call before delivery"
            />
          </section>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="card p-6">
            <h2 className="font-display text-xl text-ink">Your order</h2>

            <ul className="mt-5 flex flex-col gap-3">
              {lines.map((l) => (
                <li key={l.product_id} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream-deep">
                    {l.image ? (
                      <Image
                        src={l.image}
                        alt={l.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="grid h-full w-full place-items-center">
                        <Leaf className="h-4 w-4 text-sage" />
                      </span>
                    )}
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-forest px-1 text-[11px] font-semibold text-cream">
                      {l.quantity}
                    </span>
                  </div>
                  <span className="flex-1 text-sm text-ink">{l.name}</span>
                  <span className="text-sm font-medium text-ink">
                    {money(l.price * l.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-medium text-ink">{money(totals.subtotal)}</dd>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-forest">
                  <dt>Discount {applied?.code ? `(${applied.code})` : ""}</dt>
                  <dd className="font-medium">−{money(totals.discountAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Delivery</dt>
                <dd className="font-medium text-ink">
                  {totals.delivery === 0 ? (
                    <span className="text-forest">Free</span>
                  ) : (
                    money(totals.delivery)
                  )}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex justify-between border-t border-line pt-5">
              <span className="font-display text-lg text-ink">Total</span>
              <span className="font-display text-lg text-forest">
                {money(totals.total)}
              </span>
            </div>

            {error && (
              <p className="mt-4 flex items-start gap-2 rounded-lg bg-clay/10 px-3 py-2.5 text-sm text-clay">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary mt-5 w-full"
            >
              {submitting ? "Placing order…" : "Place order"}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
              <Lock className="h-3 w-3" /> Your details are kept private &
              secure.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
