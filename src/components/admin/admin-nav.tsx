"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Tag,
  Settings,
} from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package, exact: false },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList, exact: false },
  { href: "/admin/discounts", label: "Discounts", icon: Tag, exact: false },
  { href: "/admin/settings", label: "Settings", icon: Settings, exact: false },
];

export function AdminNav({ horizontal = false }: { horizontal?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      className={
        horizontal
          ? "flex gap-1 overflow-x-auto"
          : "flex flex-col gap-1"
      }
    >
      {LINKS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact
          ? pathname === href
          : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-forest text-cream"
                : "text-ink/75 hover:bg-cream-deep"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
