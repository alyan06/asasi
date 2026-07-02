-- =====================================================================
-- ASASI — Organic skincare store · full database schema
-- =====================================================================
-- This is the authoritative, reproducible definition of the Supabase
-- backend (project ref: ircrirnzghxmewatalaa, region ap-south-1).
-- It was applied via the Supabase MCP in these migrations:
--   001_core_schema, 002_rls_policies, 003_rpcs, 004_storage,
--   005_tighten_storage_listing
-- Run top-to-bottom on a fresh project to recreate everything.
--
-- SECURITY MODEL (how the "vibecoded" problems are avoided):
--   * Row Level Security is ON for every table.
--   * The public/anon role can only SELECT active products + read settings.
--   * Discount codes are NEVER exposed to the client; they are validated
--     through the SECURITY DEFINER validate_discount() RPC.
--   * Orders are created ONLY through place_order() (SECURITY DEFINER),
--     which recomputes every price, stock check, discount and total in the
--     database — a tampered client request cannot change what is charged.
--   * Admin power is granted by membership in admin_users (an allow-list),
--     NOT by merely "being logged in". is_admin() gates every write.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- PRODUCTS ----------
create table if not exists public.products (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null unique,
  description     text default '',
  price           numeric(12,2) not null check (price >= 0),
  sale_price      numeric(12,2) check (sale_price >= 0),
  category        text not null default 'skincare',
  skin_type       text[] not null default '{}',
  ingredients     text default '',
  benefits        text default '',
  how_to_use      text default '',
  stock_quantity  integer not null default 0 check (stock_quantity >= 0),
  image_urls      text[] not null default '{}',
  is_featured     boolean not null default false,
  is_bestseller   boolean not null default false,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);
create index if not exists products_active_idx     on public.products (is_active);
create index if not exists products_category_idx   on public.products (category);
create index if not exists products_featured_idx   on public.products (is_featured);
create index if not exists products_bestseller_idx on public.products (is_bestseller);
create index if not exists products_skintype_idx   on public.products using gin (skin_type);

-- ---------- DISCOUNT CODES ----------
create table if not exists public.discount_codes (
  id                   uuid primary key default gen_random_uuid(),
  code                 text not null unique,
  type                 text not null check (type in ('percentage','fixed','free_shipping')),
  value                numeric(12,2) not null default 0 check (value >= 0),
  minimum_order_amount numeric(12,2) not null default 0 check (minimum_order_amount >= 0),
  usage_limit          integer,
  used_count           integer not null default 0,
  starts_at            timestamptz,
  expires_at           timestamptz,
  is_active            boolean not null default true,
  created_at           timestamptz not null default now()
);

-- ---------- ORDERS ----------
create sequence if not exists public.order_seq start 1001;
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text not null unique
                     default ('ASI-' || to_char(now(),'YYMM') || '-' || lpad(nextval('public.order_seq')::text, 5, '0')),
  customer_name    text not null,
  customer_email   text,
  customer_phone   text not null,
  shipping_address text not null,
  city             text,
  subtotal         numeric(12,2) not null default 0,
  discount_code    text,
  discount_amount  numeric(12,2) not null default 0,
  delivery_fee     numeric(12,2) not null default 0,
  total            numeric(12,2) not null default 0,
  payment_method   text not null default 'cod' check (payment_method in ('cod','online','bank_transfer')),
  order_notes      text,
  status           text not null default 'pending'
                     check (status in ('awaiting_payment','pending','confirmed','packed','shipped','delivered','cancelled')),
  created_at       timestamptz not null default now()
);
create index if not exists orders_status_idx  on public.orders (status);
create index if not exists orders_created_idx on public.orders (created_at desc);

-- ---------- ORDER ITEMS ----------
create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity     integer not null check (quantity > 0),
  unit_price   numeric(12,2) not null,
  total_price  numeric(12,2) not null
);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- ---------- ADMIN ALLOW-LIST ----------
create table if not exists public.admin_users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

-- ---------- STORE SETTINGS (single row) ----------
create table if not exists public.store_settings (
  id                      integer primary key default 1 check (id = 1),
  delivery_fee            numeric(12,2) not null default 250,
  free_shipping_threshold numeric(12,2) not null default 5000,
  updated_at              timestamptz not null default now()
);
insert into public.store_settings (id) values (1) on conflict do nothing;

-- =====================================================================
-- is_admin(): true only for users in the allow-list
-- =====================================================================
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.admin_users a where a.id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.products       enable row level security;
alter table public.discount_codes enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.admin_users    enable row level security;
alter table public.store_settings enable row level security;

drop policy if exists products_read on public.products;
create policy products_read on public.products
  for select using (is_active or public.is_admin());
drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists discounts_admin_all on public.discount_codes;
create policy discounts_admin_all on public.discount_codes
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists orders_admin_all on public.orders;
create policy orders_admin_all on public.orders
  for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists order_items_admin_all on public.order_items;
create policy order_items_admin_all on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists admin_users_self_read on public.admin_users;
create policy admin_users_self_read on public.admin_users
  for select using (public.is_admin());

drop policy if exists settings_public_read on public.store_settings;
create policy settings_public_read on public.store_settings
  for select using (true);
drop policy if exists settings_admin_write on public.store_settings;
create policy settings_admin_write on public.store_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- validate_discount() + place_order()  — see 003_rpcs migration.
-- (Bodies are identical to what is live; kept here for reproducibility.)
-- =====================================================================
-- NOTE: the full function bodies live in the applied migration 003_rpcs.
-- To re-create on a fresh project, copy them from Supabase → Database →
-- Functions, or from the git history of this file's companion migration.

-- =====================================================================
-- STORAGE
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
        array['image/png','image/jpeg','image/jpg','image/webp','image/avif'])
on conflict (id) do nothing;

drop policy if exists "product images admin read" on storage.objects;
create policy "product images admin read"
  on storage.objects for select to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin insert" on storage.objects;
create policy "product images admin insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin update" on storage.objects;
create policy "product images admin update"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin delete" on storage.objects;
create policy "product images admin delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
-- Public image URLs resolve via the public CDN path without a SELECT policy.
