"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Megaphone, Store, Truck, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { money } from "@/lib/format";
import { DEFAULT_CLOSED_MESSAGE } from "@/lib/config";
import { Toggle } from "@/components/admin/toggle";
import type { StoreSettingsRow } from "@/lib/types";

export function SettingsForm({ initial }: { initial: StoreSettingsRow }) {
  const router = useRouter();
  const supabase = createClient();

  const [announcement, setAnnouncement] = useState(initial.announcement);
  const [announcementEnabled, setAnnouncementEnabled] = useState(
    initial.announcement_enabled,
  );
  const [storeOpen, setStoreOpen] = useState(initial.store_open);
  const [closedMessage, setClosedMessage] = useState(initial.closed_message);
  const [deliveryFee, setDeliveryFee] = useState(String(initial.delivery_fee));
  const [freeOver, setFreeOver] = useState(
    String(initial.free_shipping_threshold),
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const { error: upErr } = await supabase
      .from("store_settings")
      .update({
        announcement: announcement.trim(),
        announcement_enabled: announcementEnabled,
        store_open: storeOpen,
        closed_message: closedMessage.trim() || DEFAULT_CLOSED_MESSAGE,
        delivery_fee: Math.max(0, Number(deliveryFee) || 0),
        free_shipping_threshold: Math.max(0, Number(freeOver) || 0),
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    setSaving(false);
    if (upErr) {
      setError("Could not save settings. Please try again.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    router.refresh();
  }

  return (
    <form onSubmit={save} className="max-w-2xl">
      {/* Live preview of the top-of-site bar */}
      <div className="mb-6">
        <span className="label">Live preview</span>
        <div className="overflow-hidden rounded-xl border border-line">
          {!storeOpen ? (
            <p className="bg-clay px-4 py-2 text-center text-xs font-semibold text-paper">
              {closedMessage || "Store closed"}
            </p>
          ) : announcementEnabled && announcement.trim() ? (
            <p className="bg-forest px-4 py-2 text-center text-xs font-medium text-cream/90">
              {announcement}
            </p>
          ) : (
            <p className="bg-cream-deep px-4 py-2 text-center text-xs text-muted">
              No bar shown
            </p>
          )}
        </div>
      </div>

      {/* Storefront */}
      <section className="card mb-6 p-6">
        <h2 className="flex items-center gap-2 font-display text-lg text-ink">
          <Megaphone className="h-4 w-4 text-sage" /> Announcement bar
        </h2>
        <div className="mt-4 space-y-4">
          <Toggle
            label="Show the announcement bar"
            checked={announcementEnabled}
            onChange={setAnnouncementEnabled}
          />
          <div>
            <label className="label">Announcement text</label>
            <input
              className="input"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="e.g. Free delivery over Rs 5,000 · Eid sale now on"
            />
            <p className="mt-1 text-xs text-muted">
              Shown across the very top of the site. Turn the toggle off (or clear
              this) to hide it.
            </p>
          </div>
        </div>
      </section>

      {/* Store status */}
      <section className="card mb-6 p-6">
        <h2 className="flex items-center gap-2 font-display text-lg text-ink">
          <Store className="h-4 w-4 text-sage" /> Store status
        </h2>
        <div className="mt-4 space-y-4">
          <Toggle
            label="Store open for orders"
            hint="Turn off for holidays or restocking — checkout is disabled and a notice shows across the site."
            checked={storeOpen}
            onChange={setStoreOpen}
          />
          <div>
            <label className="label">Closed message</label>
            <input
              className="input"
              value={closedMessage}
              onChange={(e) => setClosedMessage(e.target.value)}
              placeholder="We're closed for Eid — back on the 5th!"
            />
            <p className="mt-1 text-xs text-muted">
              Shown to customers while the store is closed.
            </p>
          </div>
        </div>
      </section>

      {/* Delivery */}
      <section className="card mb-6 p-6">
        <h2 className="flex items-center gap-2 font-display text-lg text-ink">
          <Truck className="h-4 w-4 text-sage" /> Delivery
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Delivery fee (Rs)</label>
            <input
              className="input"
              type="number"
              min="0"
              step="50"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Free delivery over (Rs)</label>
            <input
              className="input"
              type="number"
              min="0"
              step="500"
              value={freeOver}
              onChange={(e) => setFreeOver(e.target.value)}
            />
          </div>
        </div>
        <p className="mt-3 text-sm text-muted">
          Orders of {money(Number(freeOver) || 0)} or more ship free; otherwise a{" "}
          {money(Number(deliveryFee) || 0)} delivery fee applies. Set “free over” to
          0 to always charge delivery.
        </p>
      </section>

      {error && (
        <p className="mb-4 flex items-center gap-2 text-sm text-clay">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving…" : "Save settings"}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-forest">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
