"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { useCart } from "@/lib/cart";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?sort=popular", label: "Bestsellers" },
  { href: "/shop?category=serum", label: "Serums" },
  { href: "/#promise", label: "Our Promise" },
];

export function SiteHeader() {
  const { count, hydrated } = useCart();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-forest text-center text-xs font-medium tracking-wide text-cream/90">
        <p className="px-4 py-2">
          Handmade organic skincare · Free delivery over Rs 5,000 · Cash on
          Delivery across Pakistan
        </p>
      </div>

      <div className="border-b border-line bg-cream/85 backdrop-blur-md">
        <div className="container-x flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="-ml-2 grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-cream-deep md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Logo />
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-ink/80 transition-colors hover:text-forest"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/cart"
            className="relative grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-cream-deep"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {hydrated && count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-clay px-1 text-[11px] font-semibold text-paper">
                {count}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile menu */}
        {open && (
          <nav className="border-t border-line bg-cream md:hidden">
            <div className="container-x flex flex-col py-2">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="py-3 text-base font-medium text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
