# Asasi — build handoff

**Asasi** is an organic-skincare e-commerce store for the Pakistani market (PKR),
built as a tight, launch-ready MVP: a premium storefront + a properly-secured
admin dashboard, backed by Supabase.

- **Live site:** https://asasi-sage.vercel.app
- **Admin:** https://asasi-sage.vercel.app/admin  (login at `/admin/login`)
- **GitHub:** https://github.com/alyan06/asasi  (auto-deploys `main` → Vercel)
- **Vercel project:** `asasi` (scope: muhammadalyan06)
- **Supabase project:** `asasi` — ref `ircrirnzghxmewatalaa`, region `ap-south-1`
- **Admin credentials:** see `ADMIN_CREDENTIALS.local.txt` (git-ignored). Email is
  `admin@asasi.pk`; the password is in that local file — **change it for production.**

> This repo is **public** — never commit secrets. The Supabase URL + publishable
> ("anon") key are public by design (RLS protects the data) and live in
> `src/lib/supabase/config.ts`. The admin password is not in the repo.

---

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack) — ⚠️ read `AGENTS.md`; v16 has
  breaking changes vs older Next (see "Next 16 gotchas" below).
- **Tailwind CSS v4** (theme tokens live in `src/app/globals.css` `@theme`, no
  `tailwind.config.js`).
- **Supabase** — Postgres + Auth + Storage. Client via `@supabase/ssr`.
- **lucide-react** for icons (no brand icons — Instagram is an inline SVG in the footer).
- Deployed on **Vercel**.

## Run it

```bash
cd C:\Users\Muham\Documents\asasi
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (Turbopack)
npx vercel --prod --yes   # deploy to production (CLI already logged in as muhammadalyan06)
```

Env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are set on
Vercel for all environments and also have safe fallbacks in code, so the app runs
without a local `.env.local` — but one exists locally for reference.

---

## Security model (this is the important part)

The brief called out "cover up the vibecoded app problems (e.g. changing the URL
to get admin)". Here's how that's handled — defense in depth:

1. **`proxy.ts`** (Next 16's renamed middleware) guards `/admin/**`: any request
   without a valid session is redirected to `/admin/login`. You cannot reach the
   dashboard by typing the URL.
2. **Admin layout re-checks server-side**: `src/app/admin/(protected)/layout.tsx`
   calls the `is_admin()` RPC. A logged-in user who is **not** on the allow-list
   gets an "Access denied" screen — being authenticated ≠ being an admin.
3. **Row Level Security** is ON for every table and is the final gate:
   - anon can only `SELECT` active products + read `store_settings`.
   - `discount_codes` are never exposed to the client; validated via the
     `validate_discount()` SECURITY DEFINER RPC.
   - orders are created only via `place_order()` (SECURITY DEFINER), which
     **recomputes every price, discount, stock check and total in the DB** — a
     tampered client request cannot change what's charged.
   - all writes (products/orders/discounts) require `is_admin()` = membership in
     `public.admin_users` (an allow-list), not merely a session.

Full DB definition: `db/schema.sql`. It was applied via the Supabase MCP in
migrations `001_core_schema` … `005_tighten_storage_listing`.

### Data model
`products`, `discount_codes`, `orders`, `order_items`, `admin_users`,
`store_settings` (single row: `delivery_fee` = 250, `free_shipping_threshold` = 5000).
Order statuses: `pending → confirmed → packed → shipped → delivered` (+ `cancelled`).
Storage bucket `product-images` (public read via CDN, admin-only writes).

### Seeded data
16 products across 6 categories (cleanser, serum, moisturizer, mask, toner,
body-care). Discount codes: `ORGANIC10` (10%), `WELCOME15` (15%, min 2000),
`GLOWUP20` (20%, min 3000, limit 100), `FREESHIP` (free shipping, min 2500),
`FLAT500` (Rs 500 off, min 3000). One demo order (`ASI-2606-01001`).

---

## Code map

```
src/
  proxy.ts                         # admin route guard (Next 16 "middleware")
  app/
    layout.tsx                     # root: fonts (Fraunces + Inter), metadata
    globals.css                    # Tailwind v4 theme tokens + component classes
    (storefront)/                  # public site (header + footer + cart provider)
      page.tsx  shop/  product/[slug]/  cart/  checkout/  order/success/
    admin/
      login/page.tsx
      (protected)/                 # guarded group: layout.tsx does the is_admin check
        page.tsx (dashboard)  products/  products/new/  products/[id]/
        orders/  orders/[id]/  discounts/
  components/            # site-header, product-card, product-image, add-to-cart,
                         # shop-controls, + admin/* (nav, forms, status, etc.)
  lib/
    supabase/{client,server,middleware,config}.ts
    queries.ts  admin-queries.ts   # server-side data access
    cart.tsx                        # client cart (localStorage + cross-tab sync)
    totals.ts  store-settings.ts    # preview totals (DB is authoritative)
    format.ts (money = "Rs …")  config.ts (BRAND)  types.ts
db/schema.sql                       # full reproducible backend
```

Brand config (WhatsApp number, Instagram, email, tagline) is in `src/lib/config.ts`
— **these are placeholders**, update with the real ones.

---

## Next 16 gotchas (bit me, will bite you)
- Middleware is now **`proxy.ts`** with `export function proxy` (nodejs runtime).
- `params` and `searchParams` are **Promises** — always `await` them.
- Turbopack is default; `next lint` is removed; `next build` doesn't lint.
- `lucide-react` has no brand icons.
- Committing shows harmless CRLF warnings on Windows.

---

## What's DONE
- ✅ Storefront: homepage, shop (filter by skin type/category/price + sort),
  product detail, cart (live discount validation), checkout, order success (+ WhatsApp).
- ✅ Server-authoritative orders/discounts/stock.
- ✅ Secured admin: dashboard stats, product CRUD **with image upload to Storage**,
  order management (inline status + detail + WhatsApp-customer), discount manager.
- ✅ Mobile responsive, SEO metadata, PKR, COD + online + bank-transfer options.
- ✅ Deployed to Vercel + pushed to GitHub.

## What's LEFT (to finish / productionize)
1. **Real product photos** — products currently show tasteful botanical
   placeholders. Upload real images per product in the admin (Products → edit →
   Images), or generate a set with **Higgsfield** and upload. First image = thumbnail.
2. **Brand assets & copy** — real logo/favicon + OG image; set the real WhatsApp
   number, Instagram handle and email in `src/lib/config.ts` (currently placeholders);
   confirm the tagline/brand voice with the owner.
3. **Supabase Auth hardening** (Dashboard → Authentication):
   - Disable "Allow new users to sign up" (email provider) so no random accounts
     can be created (admin is already allow-list-gated, this is belt-and-braces).
   - Enable **leaked-password protection** (flagged by the security advisor).
   - **Change the admin password** from the default.
4. **Payments** — `online` / `bank_transfer` are currently manual (order is saved,
   owner confirms via WhatsApp). Integrate a PK gateway (Safepay / JazzCash /
   Easypaisa) or put real bank-transfer details into the checkout copy.
5. **Delivery settings UI** — `store_settings` (fee 250, free-ship 5000) has no
   admin screen yet; edit in Supabase or build a small settings page.
6. **Custom domain** — add `asasi.pk` (or chosen domain) in Vercel → Domains, and
   update `metadataBase` in `src/app/layout.tsx`.
7. **Order notifications** — automate a confirmation to the customer
   (email/WhatsApp) instead of manual.
8. **Analytics** — add Vercel Analytics or GA.

## Housekeeping note
The Supabase free tier allows **2 active projects**. To create `asasi`, the
**`fresho`** project was **paused**. If Fresho is needed again, unpause it (that
will require pausing another project, or upgrading to Pro).
