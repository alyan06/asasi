import { CartProvider } from "@/lib/cart";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getStoreSettings } from "@/lib/queries";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStoreSettings();

  return (
    <CartProvider>
      <SiteHeader
        announcement={settings.announcement}
        announcementEnabled={settings.announcement_enabled}
        storeOpen={settings.store_open}
        closedMessage={settings.closed_message}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </CartProvider>
  );
}
