# Yummilicious

Premium homemade fast-food ecommerce for **Yummilicious** — Next.js, MongoDB, NextAuth, Cloudinary.

**Tagline:** Homemade Comfort. Unforgettable Flavour.

**Ordering windows (Asia/Karachi):** 9:00 AM – 12:00 PM & 8:00 PM – 11:00 PM  
Orders outside these hours are blocked on the storefront and at checkout.

**Contact:** [yummilicious321@gmail.com](mailto:yummilicious321@gmail.com) · 03369863734

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Framer Motion + GSAP ScrollTrigger + Lenis
- MongoDB + Mongoose
- NextAuth (credentials) for admin
- Cloudinary for media
- Zustand cart, React Hook Form + Zod, Recharts, Sonner

## Quick start

### 1. Install

```bash
npm install
```

### 2. Environment

```bash
cp .env.example .env.local
```

Set at least:

- `MONGODB_URI` — local or Atlas connection string
- `NEXTAUTH_SECRET` — random string (`openssl rand -base64 32`)
- `NEXTAUTH_URL` — `http://localhost:3000` in development
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — used by the seed script

### 3. MongoDB

Install and run MongoDB locally, or create a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster and paste the URI into `.env.local`.

### 4. Seed the database

```bash
npm run seed
```

This creates categories, all 17 products (with variants/options/add-ons), gallery images, site content, settings, and one admin user.

### 5. Develop

```bash
npm run dev
```

- Storefront: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

### 6. Production build

```bash
npm run build
npm start
```

## Cloudinary (optional)

1. Create a Cloudinary account  
2. Copy Cloud name, API key, and API secret into `.env.local`  
3. Admin Media / product uploads will use Cloudinary  

Without Cloudinary, the upload API returns a clear error / placeholder so the rest of the app still works.

## Admin

After seeding, sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

Manage products, categories, add-ons, orders, customers, content, gallery, media, and store settings (including ordering shifts).

## Deploy on Vercel

1. Push the repo to GitHub  
2. Import the project in Vercel  
3. Add all environment variables from `.env.example`  
4. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to your production domain  
5. Use MongoDB Atlas for `MONGODB_URI`  
6. Deploy, then run the seed once against Atlas:

```bash
MONGODB_URI="your-atlas-uri" ADMIN_EMAIL="..." ADMIN_PASSWORD="..." npm run seed
```

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Development server       |
| `npm run build`| Production build         |
| `npm start`    | Start production server  |
| `npm run lint` | ESLint                   |
| `npm run seed` | Seed MongoDB             |
| `npm run typecheck` | TypeScript check    |

## Project structure

```
src/
  app/(store)/     # Customer storefront routes
  app/admin/       # Admin portal
  app/api/         # Route handlers
  components/      # UI, home, product, cart, admin, animations
  models/          # Mongoose models
  lib/             # auth, db, pricing, store-hours, validations
  store/           # Zustand cart
scripts/seed.ts    # Database seed
```

## Licence

Private — Yummilicious brand project.
