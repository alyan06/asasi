export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price: number | null;
  category: string;
  skin_type: string[];
  ingredients: string;
  benefits: string;
  how_to_use: string;
  stock_quantity: number;
  image_urls: string[];
  is_featured: boolean;
  is_bestseller: boolean;
  is_active: boolean;
  created_at: string;
};

export type DiscountType = "percentage" | "fixed" | "free_shipping";

export type DiscountCode = {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  minimum_order_amount: number;
  usage_limit: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

export type DiscountValidation = {
  valid: boolean;
  message: string;
  code?: string;
  type?: DiscountType;
  value?: number;
  discount_amount?: number;
  free_shipping?: boolean;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cod" | "online" | "bank_transfer";

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  shipping_address: string;
  city: string | null;
  subtotal: number;
  discount_code: string | null;
  discount_amount: number;
  delivery_fee: number;
  total: number;
  payment_method: PaymentMethod;
  order_notes: string | null;
  status: OrderStatus;
  created_at: string;
  order_items?: OrderItem[];
};

/** A line in the shopper's local cart. Prices are recomputed server-side at checkout. */
export type CartLine = {
  product_id: string;
  slug: string;
  name: string;
  price: number; // effective price (sale_price ?? price) captured for display
  image: string | null;
  quantity: number;
  stock: number;
};

/** Result returned by the place_order RPC. */
export type PlacedOrder = {
  order_id: string;
  order_number: string;
  subtotal: number;
  discount_amount: number;
  delivery_fee: number;
  total: number;
};
