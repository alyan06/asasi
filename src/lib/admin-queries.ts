import { createClient } from "@/lib/supabase/server";
import type { Order, Product, DiscountCode } from "@/lib/types";

export async function getAdminStats() {
  const supabase = await createClient();
  const [{ data: orders }, { count: productCount }, { data: lowStock }] =
    await Promise.all([
      supabase.from("orders").select("total, status, created_at"),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("products")
        .select("id")
        .lte("stock_quantity", 5)
        .eq("is_active", true),
    ]);

  const list = orders ?? [];
  const revenue = list
    .filter((o) => o.status !== "cancelled" && o.status !== "awaiting_payment")
    .reduce((sum, o) => sum + Number(o.total), 0);
  const pending = list.filter((o) => o.status === "pending").length;
  const awaiting = list.filter((o) => o.status === "awaiting_payment").length;

  return {
    orderCount: list.length,
    revenue,
    pending,
    awaiting,
    productCount: productCount ?? 0,
    lowStockCount: lowStock?.length ?? 0,
  };
}

export async function getRecentOrders(limit = 6): Promise<Order[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as Order[]) ?? [];
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Product[]) ?? [];
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Product) ?? null;
}

export async function getOrders(status?: string): Promise<Order[]> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (status && status !== "all") query = query.eq("status", status);
  const { data } = await query;
  return (data as Order[]) ?? [];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .maybeSingle();
  return (data as Order) ?? null;
}

export async function getDiscounts(): Promise<DiscountCode[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as DiscountCode[]) ?? [];
}
