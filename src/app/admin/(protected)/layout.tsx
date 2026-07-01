import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/logo";
import { AdminNav } from "@/components/admin/admin-nav";
import { SignOutButton } from "@/components/admin/sign-out-button";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not signed in → bounce to login (the proxy also enforces this).
  if (!user) redirect("/admin/login");

  // Signed in but not on the admin allow-list → deny (no redirect, avoids loop).
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream px-5 text-center">
        <div className="max-w-sm">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-clay/15">
            <ShieldAlert className="h-7 w-7 text-clay" />
          </span>
          <h1 className="mt-4 font-display text-2xl text-ink">Access denied</h1>
          <p className="mt-2 text-sm text-muted">
            The account <strong>{user.email}</strong> is not authorised to
            access the Asasi admin.
          </p>
          <div className="mt-5">
            <SignOutButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-line bg-paper p-5 md:flex">
        <div className="mb-8">
          <Logo />
        </div>
        <AdminNav />
        <div className="mt-auto border-t border-line pt-4">
          <p className="mb-1 truncate px-3 text-xs text-muted">{user.email}</p>
          <SignOutButton />
        </div>
      </aside>

      <div className="md:ml-60">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-line bg-paper px-5 py-3 md:hidden">
          <Logo />
          <SignOutButton compact />
        </header>
        <div className="border-b border-line bg-paper px-3 py-2 md:hidden">
          <AdminNav horizontal />
        </div>

        <main className="p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
