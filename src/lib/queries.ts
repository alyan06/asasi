import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export type ShopFilters = {
  category?: string;
  skinType?: string;
  sort?: string;
  maxPrice?: number;
  bestsellers?: boolean;
};

/** Featured products for the homepage. */
export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as Product[]) ?? [];
}

export async function getBestsellers(limit = 4): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("is_bestseller", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as Product[]) ?? [];
}

/** Filtered + sorted product list for the shop page. */
export async function getProducts(filters: ShopFilters = {}): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase.from("products").select("*").eq("is_active", true);

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.skinType) query = query.contains("skin_type", [filters.skinType]);
  if (filters.bestsellers) query = query.eq("is_bestseller", true);
  if (filters.maxPrice && filters.maxPrice > 0)
    query = query.lte("price", filters.maxPrice);

  switch (filters.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "popular":
      query = query
        .order("is_bestseller", { ascending: false })
        .order("created_at", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data } = await query;
  return (data as Product[]) ?? [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return (data as Product) ?? null;
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("category", product.category)
    .neq("id", product.id)
    .limit(limit);
  return (data as Product[]) ?? [];
}

/** Distinct categories present in the active catalog (for filters). */
export async function getCategories(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("category")
    .eq("is_active", true);
  const set = new Set<string>();
  (data ?? []).forEach((r: { category: string }) => set.add(r.category));
  return Array.from(set).sort();
}
