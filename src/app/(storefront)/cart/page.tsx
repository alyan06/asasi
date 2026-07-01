"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, Tag, X, ShoppingBag, Leaf, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import {
  fetchStoreSettings,
  DEFAULT_SETTINGS,
  type StoreSettings,
} from "@/lib/store-settings";
import {
  computeTotals,
  saveAppliedDiscount,
  loadAppliedDiscount,
  type AppliedDiscount,
} from "@/lib/totals";

export default function CartPage() {
  const { lines, hydrated, subtotal, setQty, remove } = useCart();
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [applied, setApplied] = useState<AppliedDiscount>(null);
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStoreSettings().then(setSettings);
    const saved = loadAppliedDiscount();
    if (saved) setApplied(saved);
  }, []);

  // Re-validate a saved code when the subtotal changes (e.g. minimum no longer met).
  useEffect(() => {
    if (!applied || subtotal <= 0) return;
    const supabase = createClient();
    supabase
      .rpc("validate_discount", { p_code: applied.code, p_subtotal: subtotal })
      .then(({ data }) => {
        const res = data as { valid: boolean } | null;
        if (!res?.valid) {
          setApplied(null);
          saveAppliedDiscount(null);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  const totals = computeTotals(subtotal, settings, applied);
  const remainingForFreeShip =
    settings.freeShippingThreshold - subtotal;

  async function applyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setChecking(true);
    setError("");
    try {
      const supabase = createClient();
      const { data, error: rpcError } = await supabase.rpc("validate_discount", {
        p_code: code.trim(),
        p_subtotal: subtotal,
      });
      if (rpcError) throw rpcError;
      const res = data as {
        valid: boolean;
        message: string;
        code?: string;
        discount_amount?: number;
        free_shipping?: boolean;
      };
      if (!res.valid) {
        setError(res.message);
        setApplied(null);
        saveAppliedDiscount(null);
        return;
      }
      const next: AppliedDiscount = {
        code: res.code!,
        discount_amount: res.discount_amount ?? 0,
        free_shipping: res.free_shipping ?? false,
      };
      setApplied(next);
      saveAppliedDiscount(next);
      setCode("");
    } catch {
      setError("Could not check that code. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  function removeCode() {
    setApplied(null);
    saveAppliedDiscount(null);
    setError("");
  }

  if (!hydrated) {
    return (
      <div className="container-x py-20">
        <div className="mx-auto h-64 max-w-3xl animate-pulse rounded-2xl bg-cream-deep" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-x py-20">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-cream-deep">
            <ShoppingBag className="h-7 w-7 text-sage" />
          </span>
          <h1 className="font-display text-3xl text-ink">Your cart is empty</h1>
          <p className="text-muted">
            Discover gentle, organic skincare made for your everyday glow.
          </p>
          <Link href="/shop" className="btn-primary mt-2">
            Start shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-10 md:py-14">
      <h1 className="font-display text-4xl text-ink">Your cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Items */}
        <div className="flex flex-col gap-4">
          {lines.map((line) => (
            <div
              key={line.product_id}
              className="card flex gap-4 p-4"
            >
              <Link
                href={`/product/${line.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-cream-deep"
              >
                {line.image ? (
                  <Image
                    src={line.image}
                    alt={line.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <span className="grid h-full w-full place-items-center">
                    <Leaf className="h-6 w-6 text-sage" />
                  </span>
                )}
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/product/${line.slug}`}
                    className="font-display text-lg text-ink hover:text-forest"
                  >
                    {line.name}
                  </Link>
                  <button
                    onClick={() => remove(line.product_id)}
                    className="text-muted hover:text-clay"
                    aria-label={`Remove ${line.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-muted">{money(line.price)} each</p>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-line">
                    <button
                      onClick={() => setQty(line.product_id, line.quantity - 1)}
                      className="grid h-9 w-9 place-items-center rounded-full text-ink"
                      aria-label="Decrease"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm font-medium tabular-nums">
                      {line.quantity}
                    </span>
                    <button
                      onClick={() => setQty(line.product_id, line.quantity + 1)}
                      disabled={line.quantity >= line.stock}
                      className="grid h-9 w-9 place-items-center rounded-full text-ink disabled:opacity-40"
                      aria-label="Increase"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-semibold text-forest">
                    {money(line.price * line.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="card p-6">
            <h2 className="font-display text-xl text-ink">Order summary</h2>

            {/* Discount */}
            <form onSubmit={applyCode} className="mt-5">
              {applied ? (
                <div className="flex items-center justify-between rounded-xl border border-sage bg-sage-soft/50 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-forest">
                    <Tag className="h-4 w-4" /> {applied.code} applied
                  </span>
                  <button
                    type="button"
                    onClick={removeCode}
                    className="text-forest/70 hover:text-forest"
                    aria-label="Remove code"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Discount code"
                    className="input flex-1 uppercase"
                  />
                  <button
                    type="submit"
                    disabled={checking || !code.trim()}
                    className="btn-outline px-5 py-3"
                  >
                    {checking ? "…" : "Apply"}
                  </button>
                </div>
              )}
              {error && <p className="mt-2 text-sm text-clay">{error}</p>}
            </form>

            {/* Totals */}
            <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-medium text-ink">{money(totals.subtotal)}</dd>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-forest">
                  <dt>Discount</dt>
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

            {!totals.freeShipping &&
              remainingForFreeShip > 0 &&
              settings.freeShippingThreshold > 0 && (
                <p className="mt-3 rounded-lg bg-cream-deep px-3 py-2 text-xs text-muted">
                  Add {money(remainingForFreeShip)} more for free delivery.
                </p>
              )}

            <div className="mt-5 flex justify-between border-t border-line pt-5">
              <span className="font-display text-lg text-ink">Total</span>
              <span className="font-display text-lg text-forest">
                {money(totals.total)}
              </span>
            </div>

            <Link href="/checkout" className="btn-primary mt-6 w-full">
              Proceed to checkout <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/shop"
              className="mt-3 block text-center text-sm text-muted hover:text-forest"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
