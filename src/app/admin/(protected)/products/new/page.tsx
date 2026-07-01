import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCategories } from "@/lib/queries";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Add product" };

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-forest"
      >
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="mb-6 font-display text-3xl text-ink">Add product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
