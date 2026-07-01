import { Suspense } from "react";
import type { Metadata } from "next";
import { Leaf } from "lucide-react";
import { getProducts, getCategories, type ShopFilters } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { ShopControls, ShopSidebar } from "@/components/shop-controls";

export const metadata: Metadata = {
  title: "Shop all organic skincare",
  description:
    "Browse our full range of organic, handmade skincare — cleansers, serums, moisturizers, masks and more. Filter by skin type, category and price.",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function pick(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const filters: ShopFilters = {
    category: pick(sp.category),
    skinType: pick(sp.skinType),
    sort: pick(sp.sort),
    maxPrice: pick(sp.maxPrice) ? Number(pick(sp.maxPrice)) : undefined,
  };

  const [products, categories] = await Promise.all([
    getProducts(filters),
    getCategories(),
  ]);

  return (
    <div className="container-x py-10 md:py-14">
      <header className="mb-8 max-w-2xl">
        <span className="eyebrow">The collection</span>
        <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
          Organic skincare, made for real skin
        </h1>
        <p className="mt-3 text-muted">
          Clean formulas with ingredients you can pronounce. Find your match by
          skin type, category or price.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-10">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Suspense fallback={<div className="card h-64 animate-pulse" />}>
            <ShopSidebar categories={categories} />
          </Suspense>
        </aside>

        <div>
          <Suspense fallback={null}>
            <ShopControls categories={categories} resultCount={products.length} />
          </Suspense>

          {products.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 px-6 py-20 text-center">
              <Leaf className="h-8 w-8 text-sage" />
              <p className="font-display text-xl text-ink">
                No products match these filters
              </p>
              <p className="text-sm text-muted">
                Try clearing a filter to see more of the collection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
