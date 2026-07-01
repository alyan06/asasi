import { getDiscounts } from "@/lib/admin-queries";
import { DiscountManager } from "@/components/admin/discount-manager";

export const metadata = { title: "Discounts" };

export default async function AdminDiscountsPage() {
  const discounts = await getDiscounts();

  return (
    <div>
      <h1 className="mb-1 font-display text-3xl text-ink">Discount codes</h1>
      <p className="mb-6 text-muted">
        Create and manage promo codes. Percentage, fixed amount, or free
        shipping.
      </p>
      <DiscountManager discounts={discounts} />
    </div>
  );
}
