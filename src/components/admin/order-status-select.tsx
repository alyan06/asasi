"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ORDER_STATUSES } from "@/lib/config";
import { statusLabel } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

export function OrderStatusSelect({
  id,
  status,
}: {
  id: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [value, setValue] = useState<OrderStatus>(status);
  const [busy, setBusy] = useState(false);

  async function change(next: OrderStatus) {
    const prev = value;
    setValue(next);
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status: next })
      .eq("id", id);
    setBusy(false);
    if (error) {
      setValue(prev);
      alert("Could not update the order status.");
      return;
    }
    router.refresh();
  }

  return (
    <select
      value={value}
      onChange={(e) => change(e.target.value as OrderStatus)}
      disabled={busy}
      className="rounded-full border border-line bg-paper px-3 py-1.5 text-sm text-ink outline-none focus:border-forest disabled:opacity-50"
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {statusLabel(s)}
        </option>
      ))}
    </select>
  );
}
