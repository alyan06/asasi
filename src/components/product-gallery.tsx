"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { ProductImage } from "@/components/product-image";

export function ProductGallery({ product }: { product: Product }) {
  const images = product.image_urls ?? [];
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-cream-deep">
        {images.length > 0 ? (
          <Image
            src={images[active]}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <ProductImage product={product} priority />
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden rounded-xl border ${
                i === active ? "border-forest" : "border-line"
              }`}
            >
              <Image
                src={src}
                alt={`${product.name} ${i + 1}`}
                fill
                sizes="20vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
