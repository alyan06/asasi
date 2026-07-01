import type { StoreSettings } from "@/lib/store-settings";

export type AppliedDiscount = {
  code: string;
  discount_amount: number;
  free_shipping: boolean;
} | null;

export type Totals = {
  subtotal: number;
  delivery: number;
  discountAmount: number;
  total: number;
  freeShipping: boolean;
};

const DISCOUNT_KEY = "asasi:discount";

/**
 * Preview totals shown in cart/checkout. These are advisory only — the database
 * recomputes everything authoritatively inside place_order().
 */
export function computeTotals(
  subtotal: number,
  settings: StoreSettings,
  applied: AppliedDiscount,
): Totals {
  let delivery =
    settings.freeShippingThreshold > 0 &&
    subtotal >= settings.freeShippingThreshold
      ? 0
      : settings.deliveryFee;
  let discountAmount = 0;
  let freeShipping = false;

  if (applied) {
    if (applied.free_shipping) {
      delivery = 0;
      freeShipping = true;
    } else {
      discountAmount = Math.min(applied.discount_amount, subtotal);
    }
  }

  if (subtotal <= 0) delivery = 0;

  const total = Math.max(0, subtotal - discountAmount + delivery);
  return { subtotal, delivery, discountAmount, total, freeShipping };
}

export function saveAppliedDiscount(applied: AppliedDiscount) {
  try {
    if (applied) localStorage.setItem(DISCOUNT_KEY, JSON.stringify(applied));
    else localStorage.removeItem(DISCOUNT_KEY);
  } catch {
    /* ignore */
  }
}

export function loadAppliedDiscount(): AppliedDiscount {
  try {
    const raw = localStorage.getItem(DISCOUNT_KEY);
    return raw ? (JSON.parse(raw) as AppliedDiscount) : null;
  } catch {
    return null;
  }
}
