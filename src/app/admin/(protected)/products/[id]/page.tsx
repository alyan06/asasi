import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProductById } from "@/lib/admin-queries";
import { getCategories } from "@/lib/queries";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Edit product" };

type Params = Promise<{ id: string }>;

export default async function EditProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategories(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-forest"
      >
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="mb-6 font-display text-3xl text-ink">Edit product</h1>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
