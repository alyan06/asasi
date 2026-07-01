"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      className={`inline-flex items-center gap-2 rounded-lg text-sm font-medium text-muted transition-colors hover:text-clay ${
        compact ? "" : "px-3 py-2"
      }`}
    >
      <LogOut className="h-4 w-4" /> Sign out
    </button>
  );
}
