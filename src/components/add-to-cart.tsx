"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Check } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart";

export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock_quantity <= 0;
  const max = product.stock_quantity;

  function changeQty(delta: number) {
    setQty((q) => Math.max(1, Math.min(max, q + delta)));
  }

  function handleAdd() {
    if (soldOut) return;
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  function buyNow() {
    if (soldOut) return;
    add(product, qty);
    router.push("/checkout");
  }

  if (soldOut) {
    return (
      <div className="rounded-xl border border-line bg-cream-deep px-4 py-4 text-center text-sm font-medium text-muted">
        Out of stock — check back soon or message us to be notified.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-line bg-paper">
          <button
            onClick={() => changeQty(-1)}
            disabled={qty <= 1}
            className="grid h-11 w-11 place-items-center rounded-full text-ink disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-medium tabular-nums">{qty}</span>
          <button
            onClick={() => changeQty(1)}
            disabled={qty >= max}
            className="grid h-11 w-11 place-items-center rounded-full text-ink disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button onClick={handleAdd} className="btn-primary flex-1">
          {added ? (
            <>
              <Check className="h-4 w-4" /> Added to cart
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" /> Add to cart
            </>
          )}
        </button>
      </div>
      <button onClick={buyNow} className="btn-outline w-full">
        Buy it now
      </button>
      {max <= 5 && (
        <p className="text-center text-xs font-medium text-clay">
          Only {max} left in stock — order soon.
        </p>
      )}
    </div>
  );
}
