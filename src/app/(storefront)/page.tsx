import Link from "next/link";
import {
  Leaf,
  Sparkles,
  ShieldCheck,
  HandHeart,
  FlaskConical,
  Truck,
  Star,
  ArrowRight,
} from "lucide-react";
import { getFeaturedProducts, getBestsellers } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { BRAND } from "@/lib/config";

const TRUST = [
  { icon: Leaf, label: "100% Organic" },
  { icon: HandHeart, label: "Cruelty-Free" },
  { icon: FlaskConical, label: "No Harsh Chemicals" },
  { icon: Sparkles, label: "Handmade in Small Batches" },
];

const PROMISES = [
  {
    icon: Leaf,
    title: "Grown, not synthesised",
    body: "Every formula starts with organic, plant-derived ingredients — botanical oils, extracts and butters your skin recognises.",
  },
  {
    icon: ShieldCheck,
    title: "Nothing harsh, ever",
    body: "No parabens, no sulphates, no synthetic fragrance. Gentle enough for daily use on the most sensitive skin.",
  },
  {
    icon: HandHeart,
    title: "Made by hand, with care",
    body: "Blended in small batches so every jar is fresh, potent and made the way real skincare should be.",
  },
];

const REVIEWS = [
  {
    quote:
      "My skin has never felt this calm. The Vitamin C serum gave me a glow I didn't think was possible.",
    name: "Hira S.",
    city: "Karachi",
  },
  {
    quote:
      "Finally skincare I can trust — no breakouts, no irritation, just soft healthy skin. Beautifully made.",
    name: "Mahnoor A.",
    city: "Lahore",
  },
  {
    quote:
      "You can tell it's handmade and pure. The clay mask is a weekly ritual now. Worth every rupee.",
    name: "Zainab K.",
    city: "Islamabad",
  },
];

export default async function HomePage() {
  const [featured, bestsellers] = await Promise.all([
    getFeaturedProducts(4),
    getBestsellers(4),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_85%_0%,var(--color-sage-soft)_0%,var(--color-cream)_55%)]" />
        <div className="container-x grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
          <div className="animate-rise">
            <span className="eyebrow">Organic · Handmade · Pakistan</span>
            <h1 className="mt-4 font-display text-5xl leading-[1.02] text-ink sm:text-6xl lg:text-7xl">
              All organic skincare for a{" "}
              <span className="italic text-forest">natural glow</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              {BRAND.tagline}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/shop" className="btn-primary">
                Shop the collection
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/shop?sort=popular" className="btn-outline">
                View bestsellers
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-sage" /> {BRAND.courier} delivery
                nationwide
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-gold text-gold" /> Loved by 2,000+
                customers
              </span>
            </div>
          </div>

          {/* Decorative hero composition */}
          <div className="relative mx-auto hidden aspect-square w-full max-w-md md:block">
            <div className="absolute inset-6 rounded-[2.5rem] bg-gradient-to-br from-sage-soft to-clay-soft" />
            <div className="absolute left-0 top-10 h-40 w-32 rotate-[-6deg] rounded-3xl border border-line bg-paper shadow-[var(--shadow-lift)]" />
            <div className="absolute bottom-8 right-2 h-48 w-36 rotate-[8deg] rounded-3xl border border-line bg-gradient-to-b from-cream to-cream-deep shadow-[var(--shadow-lift)]" />
            <div className="absolute left-1/2 top-1/2 grid h-32 w-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-forest/20 bg-cream/80 text-center backdrop-blur">
              <div>
                <Leaf className="mx-auto h-6 w-6 text-forest" />
                <p className="mt-1 font-display text-lg leading-tight text-forest">
                  100%
                  <br />
                  Organic
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-line bg-paper">
        <div className="container-x grid grid-cols-2 gap-4 py-6 sm:grid-cols-4">
          {TRUST.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center justify-center gap-2.5 text-center"
            >
              <Icon className="h-5 w-5 shrink-0 text-sage" />
              <span className="text-sm font-medium text-ink">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="container-x py-16 md:py-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <span className="eyebrow">Handpicked for you</span>
              <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
                Featured favourites
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden shrink-0 items-center gap-1 text-sm font-medium text-forest hover:underline sm:flex"
            >
              All products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* PROMISE */}
      <section id="promise" className="bg-forest text-cream">
        <div className="container-x py-16 md:py-24">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-sage-soft">
              The Asasi promise
            </span>
            <h2 className="mt-3 font-display text-3xl leading-tight text-cream sm:text-4xl">
              Skincare you can read, trust, and feel good about.
            </h2>
            <p className="mt-4 text-cream/75">
              We believe what you put on your skin should be as honest as what
              you put in your body. No fillers, no guesswork — just clean,
              effective, organic care.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {PROMISES.map(({ icon: Icon, title, body }) => (
              <div key={title}>
                <span className="grid h-12 w-12 place-items-center rounded-full bg-cream/10">
                  <Icon className="h-5 w-5 text-sage-soft" />
                </span>
                <h3 className="mt-4 font-display text-xl text-cream">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/70">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BESTSELLERS */}
      {bestsellers.length > 0 && (
        <section className="container-x py-16 md:py-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <span className="eyebrow">Customer loved</span>
              <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
                Our bestsellers
              </h2>
            </div>
            <Link
              href="/shop?sort=popular"
              className="hidden shrink-0 items-center gap-1 text-sm font-medium text-forest hover:underline sm:flex"
            >
              Shop bestsellers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* REVIEWS */}
      <section className="bg-cream-deep">
        <div className="container-x py-16 md:py-20">
          <div className="mb-10 text-center">
            <span className="eyebrow">Real skin, real results</span>
            <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
              Loved across Pakistan
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {REVIEWS.map((r) => (
              <figure key={r.name} className="card flex flex-col gap-4 p-6">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </div>
                <blockquote className="text-ink/85">“{r.quote}”</blockquote>
                <figcaption className="mt-auto text-sm font-medium text-muted">
                  {r.name} · {r.city}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-x py-16 md:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sage-soft via-cream to-clay-soft px-8 py-14 text-center md:py-20">
          <h2 className="mx-auto max-w-2xl font-display text-3xl text-ink sm:text-4xl">
            Start your natural skincare ritual today
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            Gentle, organic, and made for everyday glow. Your skin will thank
            you.
          </p>
          <Link href="/shop" className="btn-primary mt-7">
            Explore the collection
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
