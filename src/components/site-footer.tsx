import Link from "next/link";
import { Mail, Leaf } from "lucide-react";
import { BRAND } from "@/lib/config";

// lucide-react dropped brand icons — inline a Simple-Icons style Instagram glyph.
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 3.68A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84Zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4Zm6.41-10.4a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44Z" />
    </svg>
  );
}

const PROMISES = [
  "100% organic ingredients",
  "Cruelty-free & never tested on animals",
  "No harsh chemicals or parabens",
  "Handmade in small batches",
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-cream-deep">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <span className="font-display text-3xl text-forest">{BRAND.name}</span>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            {BRAND.tagline}
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href={`https://instagram.com/${BRAND.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink transition-colors hover:border-forest hover:text-forest"
              aria-label="Instagram"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${BRAND.email}`}
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink transition-colors hover:border-forest hover:text-forest"
              aria-label="Email"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-ink">Shop</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li><Link href="/shop" className="hover:text-forest">All products</Link></li>
            <li><Link href="/shop?category=cleanser" className="hover:text-forest">Cleansers</Link></li>
            <li><Link href="/shop?category=serum" className="hover:text-forest">Serums & Oils</Link></li>
            <li><Link href="/shop?category=moisturizer" className="hover:text-forest">Moisturizers</Link></li>
            <li><Link href="/shop?sort=popular" className="hover:text-forest">Bestsellers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-ink">Help</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li><Link href="/cart" className="hover:text-forest">Your cart</Link></li>
            <li><a href={`https://wa.me/${BRAND.whatsapp}`} className="hover:text-forest">WhatsApp us</a></li>
            <li><span>Delivery via {BRAND.courier}</span></li>
            <li><span>Cash on Delivery available</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-ink">Our promise</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            {PROMISES.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <Leaf className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <p>{BRAND.whatsappDisplay} · {BRAND.email}</p>
        </div>
      </div>
    </footer>
  );
}
