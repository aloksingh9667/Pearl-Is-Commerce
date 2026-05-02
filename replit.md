# Pearlis — Luxury Jewelry eCommerce

## Overview

Full-stack luxury jewelry eCommerce website ("Pearlis") with a premium UI inspired by high-end fashion brands. Sells pendants, necklaces, rings, bracelets, earrings, and accessories.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifact: `pearlis`, at `/`)
- **API framework**: Express 5 (artifact: `api-server`, at `/api`)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Auth**: Clerk (regular users — Google + email/password) + JWT/bcryptjs (admin only)
- **Build**: esbuild (CJS bundle)

## Design

- **Color palette**: Black (#0F0F0F), Gold (#D4AF37), Cream (#FAF7F2)
- **Typography**: Playfair Display (headings) + Poppins (body)
- **Animations**: Framer Motion throughout

## Key Pages (Customer)

- `/` — Homepage (hero, featured, trending, new arrivals, categories, newsletter)
- `/shop` — Shop with filters (category, price, material, sort)
- `/category/:slug` — Category pages
- `/product/:id` — Product detail with gallery, reviews, related
- `/cart` — Shopping cart with coupon support
- `/checkout` — Full checkout with INR pricing, coupon validation, COD/Razorpay
- `/orders` — Order history
- `/wishlist` — Wishlist
- `/sign-in`, `/sign-up` — Clerk auth pages (branded, with Google login)
- `/login`, `/register` — redirect to `/sign-in` and `/sign-up`
- `/blog`, `/blog/:id` — Blog / The Journal
- `/about`, `/contact`, `/gallery` — Brand pages
- `/contact` — "The Concierge" — saves messages to DB via `/api/contact-messages`

## Admin Panel (`/admin`)

Credentials: `admin@pearlis.com` / `Pearl@Admin2024`

Nav groups:
- **Store**: Dashboard, Products (add/edit modal, videoUrl support), Orders, Coupons (create modal)
- **Content**: Journal/Blogs (add/edit modal), Page Content (per-page content editor), Messages (inbox + reply)
- **People**: Users
- **Configuration**: Site Settings (grouped tabs)

## API Routes

All routes under `/api`:
- `GET/POST /products` + featured/trending/new-arrivals + related + `GET/PUT/DELETE /products/:id`
- `GET/POST/PUT/DELETE /categories`
- `POST /auth/register`, `/auth/login`, `/auth/logout`, `GET /auth/me`, `POST /auth/clerk-sync`
- `GET/POST /cart/items`, `PUT/DELETE /cart/items/:id`, `DELETE /cart/clear`, `POST /cart/coupon`
- `GET/POST /orders`, `GET/PUT /orders/:id`
- `GET/POST /products/:id/reviews`
- `GET/POST/DELETE /wishlist/:productId`
- `GET/POST/PUT/DELETE /blogs`
- `GET/POST/DELETE /coupons`, **`POST /coupons/validate`** (public, for checkout)
- `POST /newsletter/subscribe`
- `GET /dashboard/stats`, `/dashboard/recent-orders`, `/dashboard/top-products`, `/dashboard/sales-by-category`
- `GET /search`
- **`GET /settings`**, **`GET/PUT /settings/:key`** — site-wide settings (key/value JSONB store)
- **`GET/PUT /page-content/:page`** — per-page content editing
- **`POST /contact-messages`** (public), **`GET/GET/:id/PUT/:id /contact-messages`** (admin), **`POST /contact-messages/:id/reply`**, **`POST /contact-messages/bulk-reply`**
- **`GET/POST/PATCH/DELETE /users/addresses`** — saved addresses with set-as-default support
- **`POST /stock-alerts`** (public) — subscribe to back-in-stock email alert
- **`GET /admin/stock-alerts`** (admin) — list all alert subscriptions

## Database Schema

Tables:
- `categories`, `products` (+ `video_url`), `users` (+ `clerk_id TEXT UNIQUE`), `addresses`, `orders`, `cart_items`, `reviews`, `wishlist`, `blogs`, `coupons`, `newsletter`
- **`site_settings`** — key/value JSONB pairs (general, announcement, payment, contact, social, instagram, videos, flashSale)
- **`page_content`** — per-page content JSONB (home, shop, rings, necklaces, bracelets, earrings, gallery, blog, about, contact)
- **`contact_messages`** — contact form submissions with admin reply tracking
- **`stock_alerts`** — back-in-stock alert subscriptions (productId, email, notifiedAt)

## Custom Frontend Hooks

`artifacts/pearlis/src/lib/adminApi.ts` — custom TanStack Query hooks (NOT via Orval) for:
- `useGetSettings`, `useUpdateSetting`
- `useGetPageContent`, `useUpdatePageContent`
- `useGetContactMessages`, `useSendContactMessage`, `useMarkMessageRead`, `useReplyToMessage`, `useBulkReply`

## INR Pricing

All prices stored in USD (numeric), displayed in INR using `price * 83` conversion. INR symbol `₹` used throughout.

## Resend Email Integration

`artifacts/api-server/src/routes/contact-messages.ts` sends HTML emails via Resend API when replying.
- Requires `RESEND_API_KEY` environment variable to be set for emails to send.
- Replies are always saved to DB regardless of whether email sends.
- From address: `concierge@pearlis.com`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — rebuild composite lib declaration files
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Seed Data

- 6 categories (rings, necklaces, pendants, bracelets, earrings, accessories)
- 12 products across all categories
- 7 reviews, 3 blog posts
- 2 coupons: `PEARLIS10` (10% off, min ₹5,000), `WELCOME2000` (₹2,000 off, min ₹15,000)
- Admin user: `admin@pearlis.com` / `Pearl@Admin2024`

## Notes

- Cart is session-based (`x-session-id` header for anonymous, `user-{id}` for logged-in)
- **Auth flow**: Regular users authenticate via Clerk (Google OAuth + email/password). On sign-in, frontend calls `/api/auth/clerk-sync` to upsert the user in the local DB. Admin users use a separate JWT flow via `/admin-login`.
- `AuthContext` checks for Clerk user first; falls back to JWT `/api/auth/me` for admin-only sessions.
- `clerk.browser.js` (v6.8.0) is bundled into `public/` and loaded via `<script>` tag in `index.html` to bypass the Clerk FAPI subdomain (`clerk.<replit-domain>`) which isn't accessible in dev.
- The orval zod config uses `mode: "single"` to avoid duplicate export conflicts
- `req.params` TS typing quirk (`string | string[]`) is a pre-existing issue across all route files — runtime is fine
