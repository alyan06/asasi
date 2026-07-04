"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Upload, X, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Toggle } from "@/components/admin/toggle";
import type { Product } from "@/lib/types";

const SKIN_TYPES = ["all", "normal", "dry", "oily", "combination", "sensitive"];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Build a URL slug from the name that isn't already taken by another product. */
async function makeUniqueSlug(
  supabase: ReturnType<typeof createClient>,
  base: string,
): Promise<string> {
  const safe = base || "product";
  const { data } = await supabase
    .from("products")
    .select("slug")
    .ilike("slug", `${safe}%`);
  const taken = new Set((data ?? []).map((r: { slug: string }) => r.slug));
  if (!taken.has(safe)) return safe;
  let n = 2;
  while (taken.has(`${safe}-${n}`)) n++;
  return `${safe}-${n}`;
}

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: string[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const isEdit = !!product;

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [salePrice, setSalePrice] = useState(
    product?.sale_price != null ? String(product.sale_price) : "",
  );
  const [category, setCategory] = useState(product?.category ?? "");
  const [skinTypes, setSkinTypes] = useState<string[]>(product?.skin_type ?? []);
  const [ingredients, setIngredients] = useState(product?.ingredients ?? "");
  const [benefits, setBenefits] = useState(product?.benefits ?? "");
  const [howToUse, setHowToUse] = useState(product?.how_to_use ?? "");
  const [stock, setStock] = useState(product ? String(product.stock_quantity) : "0");
  const [images, setImages] = useState<string[]>(product?.image_urls ?? []);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [isBestseller, setIsBestseller] = useState(product?.is_bestseller ?? false);
  const [isActive, setIsActive] = useState(product?.is_active ?? true);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleSkin(t: string) {
    setSkinTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("product-images")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(path);
        uploaded.push(publicUrl);
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch {
      setError("Image upload failed. Please try a smaller JPG/PNG/WebP (max 5MB).");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !category.trim() || !price) {
      setError("Name, category and price are required.");
      return;
    }
    const priceNum = Number(price);
    const saleNum = salePrice ? Number(salePrice) : null;
    if (saleNum != null && saleNum >= priceNum) {
      setError("Sale price must be lower than the regular price.");
      return;
    }

    setSaving(true);
    // URL slug is derived from the name automatically (kept stable on edit).
    const slug = isEdit
      ? product!.slug
      : await makeUniqueSlug(supabase, slugify(name));
    const payload = {
      name: name.trim(),
      slug,
      description: description.trim(),
      price: priceNum,
      sale_price: saleNum,
      category: category.trim().toLowerCase(),
      skin_type: skinTypes,
      ingredients: ingredients.trim(),
      benefits: benefits.trim(),
      how_to_use: howToUse.trim(),
      stock_quantity: Math.max(0, Math.floor(Number(stock) || 0)),
      image_urls: images,
      is_featured: isFeatured,
      is_bestseller: isBestseller,
      is_active: isActive,
    };

    try {
      if (isEdit) {
        const { error: upErr } = await supabase
          .from("products")
          .update(payload)
          .eq("id", product!.id);
        if (upErr) throw upErr;
      } else {
        const { error: insErr } = await supabase.from("products").insert(payload);
        if (insErr) throw insErr;
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("duplicate") || message.includes("unique")) {
        setError("A product with a very similar name exists — tweak the name slightly.");
      } else {
        setError("Could not save the product. Please try again.");
      }
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <section className="card p-6">
          <h2 className="font-display text-lg text-ink">Details</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label className="label">Product name *</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                className="input min-h-24 resize-y"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg text-ink">Product content</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label className="label">Benefits</label>
              <textarea
                className="input min-h-20 resize-y"
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Key ingredients</label>
              <textarea
                className="input min-h-20 resize-y"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
              />
            </div>
            <div>
              <label className="label">How to use</label>
              <textarea
                className="input min-h-20 resize-y"
                value={howToUse}
                onChange={(e) => setHowToUse(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg text-ink">Images</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {images.map((url) => (
              <div
                key={url}
                className="relative h-24 w-24 overflow-hidden rounded-xl border border-line"
              >
                <Image src={url} alt="" fill sizes="96px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink/70 text-cream"
                  aria-label="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <label className="grid h-24 w-24 cursor-pointer place-items-center rounded-xl border border-dashed border-line text-muted hover:border-forest hover:text-forest">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex flex-col items-center gap-1 text-xs">
                  <Upload className="h-5 w-5" /> Upload
                </span>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
                disabled={uploading}
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-muted">
            First image is used as the main thumbnail. JPG/PNG/WebP up to 5MB.
          </p>
        </section>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-6">
        <section className="card p-6">
          <h2 className="font-display text-lg text-ink">Pricing & stock</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label className="label">Price (Rs) *</label>
              <input
                className="input"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Sale price (Rs)</label>
              <input
                className="input"
                type="number"
                min="0"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="label">Stock quantity</label>
              <input
                className="input"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg text-ink">Organisation</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label className="label">Category *</label>
              <input
                className="input"
                list="category-list"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. serum"
              />
              <datalist id="category-list">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <span className="label">Skin types</span>
              <div className="flex flex-wrap gap-2">
                {SKIN_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleSkin(t)}
                    className={`rounded-full border px-3 py-1.5 text-sm capitalize transition-colors ${
                      skinTypes.includes(t)
                        ? "border-forest bg-forest text-cream"
                        : "border-line text-ink hover:border-forest"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg text-ink">Visibility</h2>
          <div className="mt-4 flex flex-col gap-3">
            <Toggle label="Active (visible in shop)" checked={isActive} onChange={setIsActive} />
            <Toggle label="Featured on homepage" checked={isFeatured} onChange={setIsFeatured} />
            <Toggle label="Mark as bestseller" checked={isBestseller} onChange={setIsBestseller} />
          </div>
        </section>

        {error && (
          <p className="flex items-start gap-2 rounded-lg bg-clay/10 px-3 py-2.5 text-sm text-clay">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={saving || uploading} className="btn-primary flex-1">
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="btn-outline"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

