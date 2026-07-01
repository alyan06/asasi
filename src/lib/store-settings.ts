import { createClient } from "@/lib/supabase/client";

export type StoreSettings = {
  deliveryFee: number;
  freeShippingThreshold: number;
};

export const DEFAULT_SETTINGS: StoreSettings = {
  deliveryFee: 250,
  freeShippingThreshold: 5000,
};

/** Fetch delivery settings (public read) from the client. */
export async function fetchStoreSettings(): Promise<StoreSettings> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("store_settings")
      .select("delivery_fee, free_shipping_threshold")
      .eq("id", 1)
      .maybeSingle();
    if (!data) return DEFAULT_SETTINGS;
    return {
      deliveryFee: Number(data.delivery_fee),
      freeShippingThreshold: Number(data.free_shipping_threshold),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
