"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { categoryLabel, skinTypeLabel } from "@/lib/format";

const SKIN_TYPES = ["all", "normal", "dry", "oily", "combination", "sensitive"];
const PRICE_OPTIONS = [
  { label: "Under Rs 1,500", value: "1500" },
  { label: "Under Rs 2,000", value: "2000" },
  { label: "Under Rs 2,500", value: "2500" },
];
const SORTS = [
  { label: "Newest", value: "newest" },
  { label: "Most popular", value: "popular" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
];

export function ShopControls({
  categories,
  resultCount,
}: {
  categories: string[];
  resultCount: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const current = {
    category: params.get("category") ?? "",
    skinType: params.get("skinType") ?? "",
    maxPrice: params.get("maxPrice") ?? "",
    sort: params.get("sort") ?? "newest",
  };

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/shop?${next.toString()}`, { scroll: false });
  }

  const hasFilters =
    current.category || current.skinType || current.maxPrice || params.get("sort");

  return (
    <>
      {/* Top bar: result count + sort + mobile filter toggle */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {resultCount} {resultCount === 1 ? "product" : "products"}
        </p>
        <div className="flex items-center gap-2">
          <label className="hidden text-sm text-muted sm:block">Sort by</label>
          <select
            value={current.sort}
            onChange={(e) => update("sort", e.target.value)}
            className="rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink outline-none focus:border-forest"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setOpen((v) => !v)}
            className="btn-outline px-4 py-2 text-sm lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        </div>
      </div>

      {/* Filter panel — sidebar on desktop, collapsible on mobile */}
      <FilterPanel
        className={`${open ? "block" : "hidden"} lg:hidden`}
        categories={categories}
        current={current}
        update={update}
        hasFilters={!!hasFilters}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

function FilterPanel({
  categories,
  current,
  update,
  hasFilters,
  className = "",
  onClose,
}: {
  categories: string[];
  current: { category: string; skinType: string; maxPrice: string };
  update: (k: string, v: string) => void;
  hasFilters: boolean;
  className?: string;
  onClose?: () => void;
}) {
  return (
    <div className={`mb-6 card p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <span className="font-medium">Filters</span>
        <button onClick={onClose} aria-label="Close filters">
          <X className="h-5 w-5" />
        </button>
      </div>

      <FilterGroup label="Category">
        <Pill active={!current.category} onClick={() => update("category", "")}>
          All
        </Pill>
        {categories.map((c) => (
          <Pill
            key={c}
            active={current.category === c}
            onClick={() => update("category", c)}
          >
            {categoryLabel(c)}
          </Pill>
        ))}
      </FilterGroup>

      <FilterGroup label="Skin type">
        <Pill active={!current.skinType} onClick={() => update("skinType", "")}>
          Any
        </Pill>
        {SKIN_TYPES.map((s) => (
          <Pill
            key={s}
            active={current.skinType === s}
            onClick={() => update("skinType", s)}
          >
            {skinTypeLabel(s)}
          </Pill>
        ))}
      </FilterGroup>

      <FilterGroup label="Price">
        <Pill active={!current.maxPrice} onClick={() => update("maxPrice", "")}>
          Any
        </Pill>
        {PRICE_OPTIONS.map((p) => (
          <Pill
            key={p.value}
            active={current.maxPrice === p.value}
            onClick={() => update("maxPrice", p.value)}
          >
            {p.label}
          </Pill>
        ))}
      </FilterGroup>

      {hasFilters && (
        <button
          onClick={() => {
            update("category", "");
            update("skinType", "");
            update("maxPrice", "");
          }}
          className="mt-2 text-sm font-medium text-clay hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-line py-4 first:border-t-0 first:pt-0">
      <h3 className="mb-3 text-sm font-semibold text-ink">{label}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        active
          ? "border-forest bg-forest text-cream"
          : "border-line bg-paper text-ink hover:border-forest"
      }`}
    >
      {children}
    </button>
  );
}

/** Desktop sidebar version (always visible on lg). */
export function ShopSidebar({
  categories,
}: {
  categories: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const current = {
    category: params.get("category") ?? "",
    skinType: params.get("skinType") ?? "",
    maxPrice: params.get("maxPrice") ?? "",
  };
  const hasFilters =
    current.category || current.skinType || current.maxPrice || params.get("sort");

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/shop?${next.toString()}`, { scroll: false });
  }

  return (
    <FilterPanel
      className="hidden lg:block"
      categories={categories}
      current={current}
      update={update}
      hasFilters={!!hasFilters}
    />
  );
}
