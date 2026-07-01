"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function DeleteProductButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function del() {
    if (
      !confirm(
        `Delete "${name}"? This removes it from the shop. Past orders keep their record.`,
      )
    )
      return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      alert("Could not delete this product.");
      setBusy(false);
      return;
    }
    router.refresh();
  }

  return (
    <button
      onClick={del}
      disabled={busy}
      className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-clay/10 hover:text-clay disabled:opacity-50"
      aria-label={`Delete ${name}`}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
