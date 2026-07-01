import { CartProvider } from "@/lib/cart";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </CartProvider>
  );
}
