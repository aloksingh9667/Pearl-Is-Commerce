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
- **Auth**: JWT with bcryptjs for password hashing
- **Build**: esbuild (CJS bundle)

## Design

- **Color palette**: Black (#0F0F0F), Gold (#D4AF37), Cream (#FAF7F2)
- **Typography**: Playfair Display (headings) + Poppins (body)
- **Animations**: Framer Motion throughout

## Key Pages

- `/` — Homepage (hero, featured, trending, new arrivals, categories, newsletter)
- `/shop` — Shop with filters (category, price, material, sort)
- `/category/:slug` — Category pages
- `/product/:id` — Product detail with gallery, reviews, related
- `/cart` — Shopping cart with coupon support
- `/checkout` — Checkout with address form
- `/orders` — Order history
- `/wishlist` — Wishlist
- `/login`, `/register` — Auth pages
- `/blog`, `/blog/:id` — Blog
- `/about`, `/contact`, `/gallery` — Brand pages
- `/admin` — Admin dashboard (stats, orders, products, users, blogs, coupons)

## API Routes

All routes under `/api`:
- `GET/POST /products` + featured/trending/new-arrivals + related
- `GET/POST/PUT/DELETE /categories`
- `POST /auth/register`, `/auth/login`, `/auth/logout`, `GET /auth/me`
- `GET/POST /cart/items`, `PUT/DELETE /cart/items/:id`, `DELETE /cart/clear`, `POST /cart/coupon`
- `GET/POST /orders`, `GET/PUT /orders/:id`
- `GET/POST /products/:id/reviews`
- `GET/POST/DELETE /wishlist/:productId`
- `GET/POST/PUT/DELETE /blogs`
- `GET/POST/DELETE /coupons`
- `POST /newsletter/subscribe`
- `GET /dashboard/stats`, `/dashboard/recent-orders`, `/dashboard/top-products`, `/dashboard/sales-by-category`
- `GET /search`

## Database Schema

Tables: `categories`, `products`, `users`, `addresses`, `orders`, `cart_items`, `reviews`, `wishlist`, `blogs`, `coupons`, `newsletter`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Seed Data

- 6 categories (rings, necklaces, pendants, bracelets, earrings, accessories)
- 12 products across all categories
- 7 reviews
- 3 blog posts
- 2 coupons: `PEARLIS10` (10% off, min ₹5000), `WELCOME2000` (₹2000 off, min ₹15000)
- Admin user: `admin@pearlis.com`

## Notes

- Cart is session-based (uses `x-session-id` header for anonymous users, or `user-{id}` for logged-in users)
- Auth: Bearer token in Authorization header, stored in localStorage by frontend
- The orval zod config uses `mode: "single"` to avoid duplicate export conflicts — do not revert to split mode without fixing `lib/api-zod/src/index.ts`
