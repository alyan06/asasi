/** Format a number as Pakistani Rupees, e.g. 2400 -> "Rs 2,400". */
export function money(amount: number | null | undefined): string {
  const n = Number(amount ?? 0);
  return `Rs ${n.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}

/** Effective selling price of a product (sale price when present). */
export function effectivePrice(p: { price: number; sale_price: number | null }): number {
  return p.sale_price != null && p.sale_price > 0 ? p.sale_price : p.price;
}

/** Percentage off, rounded, when a sale price is set. */
export function discountPercent(p: { price: number; sale_price: number | null }): number | null {
  if (p.sale_price == null || p.sale_price <= 0 || p.sale_price >= p.price) return null;
  return Math.round((1 - p.sale_price / p.price) * 100);
}

const SKIN_TYPE_LABELS: Record<string, string> = {
  all: "All skin types",
  normal: "Normal",
  dry: "Dry",
  oily: "Oily",
  combination: "Combination",
  sensitive: "Sensitive",
};

export function skinTypeLabel(key: string): string {
  return SKIN_TYPE_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

const CATEGORY_LABELS: Record<string, string> = {
  cleanser: "Cleansers",
  serum: "Serums & Oils",
  moisturizer: "Moisturizers",
  mask: "Masks",
  toner: "Toners",
  "body-care": "Body & Lip",
  skincare: "Skincare",
};

export function categoryLabel(key: string): string {
  return (
    CATEGORY_LABELS[key] ??
    key
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
