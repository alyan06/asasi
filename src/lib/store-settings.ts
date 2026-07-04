import { createClient } from "@/lib/supabase/client";
import { DEFAULT_ANNOUNCEMENT, DEFAULT_CLOSED_MESSAGE } from "@/lib/config";

export type StoreSettings = {
  deliveryFee: number;
  freeShippingThreshold: number;
  storeOpen: boolean;
  closedMessage: string;
  announcement: string;
  announcementEnabled: boolean;
};

export const DEFAULT_SETTINGS: StoreSettings = {
  deliveryFee: 250,
  freeShippingThreshold: 5000,
  storeOpen: true,
  closedMessage: DEFAULT_CLOSED_MESSAGE,
  announcement: DEFAULT_ANNOUNCEMENT,
  announcementEnabled: true,
};

/** Fetch store settings (public read) from the client. */
export async function fetchStoreSettings(): Promise<StoreSettings> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("store_settings")
      .select(
        "delivery_fee, free_shipping_threshold, store_open, closed_message, announcement, announcement_enabled",
      )
      .eq("id", 1)
      .maybeSingle();
    if (!data) return DEFAULT_SETTINGS;
    return {
      deliveryFee: Number(data.delivery_fee),
      freeShippingThreshold: Number(data.free_shipping_threshold),
      storeOpen: data.store_open ?? true,
      closedMessage: data.closed_message ?? DEFAULT_SETTINGS.closedMessage,
      announcement: data.announcement ?? DEFAULT_SETTINGS.announcement,
      announcementEnabled: data.announcement_enabled ?? true,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
