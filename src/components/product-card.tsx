"use client";

import Link from "next/link";
import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { money, discountPercent, categoryLabel } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { ProductImage } from "@/components/product-image";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const off = discountPercent(product);
  const soldOut = product.stock_quantity <= 0;

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (soldOut) return;
    add(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper transition-shadow duration-300 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-cream-deep">
        <ProductImage
          product={product}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.is_bestseller && (
            <span className="rounded-full bg-forest px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cream">
              Bestseller
            </span>
          )}
          {off && (
            <span className="rounded-full bg-clay px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-paper">
              {off}% off
            </span>
          )}
        </div>

        {soldOut && (
          <div className="absolute inset-0 grid place-items-center bg-cream/70 backdrop-blur-[1px]">
            <span className="rounded-full border border-line bg-paper px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
              Sold out
            </span>
          </div>
        )}

        {!soldOut && (
          <button
            onClick={quickAdd}
            aria-label={`Add ${product.name} to cart`}
            className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-paper text-forest shadow-[var(--shadow-soft)] transition-all duration-200 hover:bg-forest hover:text-cream sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
          >
            {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-[11px] font-medium uppercase tracking-wider text-sage">
          {categoryLabel(product.category)}
        </span>
        <h3 className="font-display text-lg leading-snug text-ink">
          {product.name}
        </h3>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-base font-semibold text-forest">
            {money(product.sale_price ?? product.price)}
          </span>
          {off && (
            <span className="text-sm text-muted line-through">
              {money(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
