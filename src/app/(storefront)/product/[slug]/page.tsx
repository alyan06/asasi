import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Leaf, HandHeart, Truck, ChevronRight } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { money, discountPercent, categoryLabel, skinTypeLabel } from "@/lib/format";
import { ProductGallery } from "@/components/product-gallery";
import { AddToCart } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.image_urls?.[0] ? [product.image_urls[0]] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);
  const off = discountPercent(product);
  const stock = product.stock_quantity;
  const stockState = stock <= 0 ? "out" : stock <= 5 ? "low" : "in";

  const sections = [
    { title: "Benefits", body: product.benefits, open: true },
    { title: "Key ingredients", body: product.ingredients, open: false },
    { title: "How to use", body: product.how_to_use, open: false },
  ].filter((s) => s.body?.trim());

  return (
    <div className="container-x py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted">
        <Link href="/" className="hover:text-forest">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/shop" className="hover:text-forest">Shop</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/shop?category=${product.category}`}
          className="hover:text-forest"
        >
          {categoryLabel(product.category)}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ProductGallery product={product} />
        </div>

        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-sage">
              {categoryLabel(product.category)}
            </span>
            {product.is_bestseller && (
              <span className="chip border-forest/20 bg-sage-soft text-forest">
                Bestseller
              </span>
            )}
          </div>

          <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-forest">
              {money(product.sale_price ?? product.price)}
            </span>
            {off && (
              <>
                <span className="text-lg text-muted line-through">
                  {money(product.price)}
                </span>
                <span className="rounded-full bg-clay/15 px-2 py-0.5 text-sm font-semibold text-clay">
                  Save {off}%
                </span>
              </>
            )}
          </div>

          <div className="mt-3">
            {stockState === "out" ? (
              <span className="text-sm font-medium text-clay">● Out of stock</span>
            ) : stockState === "low" ? (
              <span className="text-sm font-medium text-clay">
                ● Low stock — only {stock} left
              </span>
            ) : (
              <span className="text-sm font-medium text-sage">
                ● In stock & ready to ship
              </span>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-ink/80">
            {product.description}
          </p>

          {product.skin_type?.length > 0 && (
            <div className="mt-5">
              <span className="text-sm font-medium text-muted">Best for:</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.skin_type.map((s) => (
                  <span key={s} className="chip">
                    <Leaf className="h-3 w-3 text-sage" />
                    {skinTypeLabel(s)}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7">
            <AddToCart product={product} />
          </div>

          {/* Mini trust row */}
          <div className="mt-6 grid grid-cols-3 gap-3 border-y border-line py-4 text-center text-xs text-muted">
            <span className="flex flex-col items-center gap-1.5">
              <Leaf className="h-4 w-4 text-sage" /> 100% organic
            </span>
            <span className="flex flex-col items-center gap-1.5">
              <HandHeart className="h-4 w-4 text-sage" /> Cruelty-free
            </span>
            <span className="flex flex-col items-center gap-1.5">
              <Truck className="h-4 w-4 text-sage" /> Nationwide delivery
            </span>
          </div>

          {/* Detail sections */}
          <div className="mt-6 divide-y divide-line border-y border-line">
            {sections.map((s) => (
              <details key={s.title} open={s.open} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-ink">
                  {s.title}
                  <ChevronRight className="h-4 w-4 text-muted transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-ink/75">
                  {s.body}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-display text-2xl text-ink sm:text-3xl">
            You may also like
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
