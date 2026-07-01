import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Leaf } from "lucide-react";
import { getAllProducts } from "@/lib/admin-queries";
import { money, categoryLabel } from "@/lib/format";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">Products</h1>
          <p className="mt-1 text-muted">{products.length} total</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="card px-6 py-16 text-center text-muted">
          No products yet. Add your first one to get started.
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-line last:border-0 hover:bg-cream/60"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cream-deep">
                          {p.image_urls?.[0] ? (
                            <Image
                              src={p.image_urls[0]}
                              alt=""
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="grid h-full w-full place-items-center">
                              <Leaf className="h-4 w-4 text-sage" />
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-ink">{p.name}</p>
                          <p className="text-xs text-muted">
                            {categoryLabel(p.category)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-medium text-ink">
                        {money(p.sale_price ?? p.price)}
                      </span>
                      {p.sale_price != null && (
                        <span className="ml-1 text-xs text-muted line-through">
                          {money(p.price)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          p.stock_quantity <= 5
                            ? "font-medium text-clay"
                            : "text-ink"
                        }
                      >
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {!p.is_active && (
                          <span className="chip border-clay/30 text-clay">Hidden</span>
                        )}
                        {p.is_active && (
                          <span className="chip border-forest/20 text-forest">Active</span>
                        )}
                        {p.is_featured && (
                          <span className="chip">Featured</span>
                        )}
                        {p.is_bestseller && (
                          <span className="chip">Bestseller</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-cream-deep hover:text-forest"
                          aria-label={`Edit ${p.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <DeleteProductButton id={p.id} name={p.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
