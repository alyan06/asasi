import { getStoreSettings } from "@/lib/queries";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div>
      <h1 className="mb-1 font-display text-3xl text-ink">Settings</h1>
      <p className="mb-6 text-muted">
        Control your announcement bar, holiday mode, and delivery pricing. Changes
        apply to the live storefront instantly.
      </p>
      <SettingsForm initial={settings} />
    </div>
  );
}
