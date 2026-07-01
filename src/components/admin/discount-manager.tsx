"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2, AlertCircle, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { money, formatDate } from "@/lib/format";
import type { DiscountCode, DiscountType } from "@/lib/types";

export function DiscountManager({ discounts }: { discounts: DiscountCode[] }) {
  const router = useRouter();
  const supabase = createClient();

  const [code, setCode] = useState("");
  const [type, setType] = useState<DiscountType>("percentage");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!code.trim()) {
      setError("Enter a code.");
      return;
    }
    if (type !== "free_shipping" && (!value || Number(value) <= 0)) {
      setError("Enter a discount value greater than zero.");
      return;
    }
    setCreating(true);
    try {
      const { error: insErr } = await supabase.from("discount_codes").insert({
        code: code.trim().toUpperCase(),
        type,
        value: type === "free_shipping" ? 0 : Number(value),
        minimum_order_amount: minOrder ? Number(minOrder) : 0,
        usage_limit: usageLimit ? Number(usageLimit) : null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        is_active: true,
      });
      if (insErr) {
        if (insErr.message.includes("duplicate") || insErr.message.includes("unique"))
          setError("That code already exists.");
        else setError("Could not create the code.");
        setCreating(false);
        return;
      }
      setCode("");
      setValue("");
      setMinOrder("");
      setUsageLimit("");
      setExpiresAt("");
      setCreating(false);
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setCreating(false);
    }
  }

  async function toggle(d: DiscountCode) {
    await supabase
      .from("discount_codes")
      .update({ is_active: !d.is_active })
      .eq("id", d.id);
    router.refresh();
  }

  async function remove(d: DiscountCode) {
    if (!confirm(`Delete code ${d.code}?`)) return;
    await supabase.from("discount_codes").delete().eq("id", d.id);
    router.refresh();
  }

  function summary(d: DiscountCode) {
    if (d.type === "percentage") return `${d.value}% off`;
    if (d.type === "fixed") return `${money(d.value)} off`;
    return "Free shipping";
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      {/* Create form */}
      <form onSubmit={create} className="card h-fit p-6">
        <h2 className="flex items-center gap-2 font-display text-lg text-ink">
          <Plus className="h-4 w-4 text-sage" /> New discount code
        </h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className="label">Code</label>
            <input
              className="input uppercase"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. GLOWUP20"
            />
          </div>
          <div>
            <label className="label">Type</label>
            <select
              className="input"
              value={type}
              onChange={(e) => setType(e.target.value as DiscountType)}
            >
              <option value="percentage">Percentage off</option>
              <option value="fixed">Fixed amount off</option>
              <option value="free_shipping">Free shipping</option>
            </select>
          </div>
          {type !== "free_shipping" && (
            <div>
              <label className="label">
                {type === "percentage" ? "Percent (%)" : "Amount (Rs)"}
              </label>
              <input
                className="input"
                type="number"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="label">Minimum order (Rs)</label>
            <input
              className="input"
              type="number"
              min="0"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              placeholder="0 = no minimum"
            />
          </div>
          <div>
            <label className="label">Usage limit</label>
            <input
              className="input"
              type="number"
              min="0"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              placeholder="Blank = unlimited"
            />
          </div>
          <div>
            <label className="label">Expires on</label>
            <input
              className="input"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
          {error && (
            <p className="flex items-start gap-2 text-sm text-clay">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
          <button type="submit" disabled={creating} className="btn-primary">
            {creating ? "Creating…" : "Create code"}
          </button>
        </div>
      </form>

      {/* List */}
      <div>
        {discounts.length === 0 ? (
          <div className="card px-6 py-16 text-center text-muted">
            No discount codes yet. Create your first one.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {discounts.map((d) => {
              const expired =
                d.expires_at != null && new Date(d.expires_at) < new Date();
              const exhausted =
                d.usage_limit != null && d.used_count >= d.usage_limit;
              return (
                <div key={d.id} className="card flex flex-wrap items-center gap-4 p-4">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-sage-soft text-forest">
                    <Tag className="h-4 w-4" />
                  </span>
                  <div className="min-w-32 flex-1">
                    <p className="font-display text-lg text-ink">{d.code}</p>
                    <p className="text-sm text-muted">{summary(d)}</p>
                  </div>
                  <div className="text-sm text-muted">
                    <p>Min: {d.minimum_order_amount > 0 ? money(d.minimum_order_amount) : "—"}</p>
                    <p>
                      Used: {d.used_count}
                      {d.usage_limit != null ? ` / ${d.usage_limit}` : ""}
                    </p>
                  </div>
                  <div className="text-sm text-muted">
                    {d.expires_at ? (
                      <p className={expired ? "text-clay" : ""}>
                        {expired ? "Expired" : "Expires"} {formatDate(d.expires_at)}
                      </p>
                    ) : (
                      <p>No expiry</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {(expired || exhausted) && d.is_active && (
                      <span className="chip border-clay/30 text-clay">Inactive</span>
                    )}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={d.is_active}
                      onClick={() => toggle(d)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        d.is_active ? "bg-forest" : "bg-line"
                      }`}
                      aria-label="Toggle active"
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper transition-transform ${
                          d.is_active ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => remove(d)}
                      className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-clay/10 hover:text-clay"
                      aria-label={`Delete ${d.code}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
