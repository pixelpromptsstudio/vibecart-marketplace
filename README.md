# VibeCart — Multi-Vendor E-Commerce Marketplace
> **"Shop the vibe. Sell your style."**

A complete, production-ready full-stack multi-vendor e-commerce platform built with an editorial marketplace aesthetic, real database persistence, strict server-side RBAC, shoppable short-form video reels, and dedicated portals for Customers, Sellers, Managers, and Admins.

---

## 1. Project Architecture

VibeCart is organized as a decoupled monorepo containing a high-performance Express + TypeScript API backend and a Next.js (App Router) frontend styled with custom Vanilla CSS design tokens.

```
vibe cart/
├── backend/                  # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/          # DB connection (MongoDB Atlas + Memory fallback)
│   │   ├── models/          # 13 Mongoose schemas & indexes
│   │   ├── middleware/      # JWT auth, strict RBAC, audit logging, file upload
│   │   ├── controllers/     # Business logic for all 13 modules
│   │   ├── routes/          # REST endpoints
│   │   ├── services/        # Cloudinary media & payment gateway abstractions
│   │   ├── seeds/           # Database seeder with realistic catalogs & users
│   │   └── server.ts        # Server bootstrap & auto-seed invocation
│   └── package.json
│
├── frontend/                 # Next.js 15+ (App Router) + TypeScript + Vanilla CSS
│   ├── src/
│   │   ├── app/             # App router pages (Customer, Seller, Admin)
│   │   │   ├── page.tsx     # Editorial Homepage matching design reference
│   │   │   ├── product/     # PDP with gallery, variants, reviews
│   │   │   ├── category/    # Category catalog with filters
│   │   │   ├── search/      # Full-text product search
│   │   │   ├── cart/        # Database-backed cart & coupon calculator
│   │   │   ├── checkout/    # Address & payment processing
│   │   │   ├── orders/      # Visual order tracking timeline
│   │   │   ├── reels/       # Shoppable video reel feed
│   │   │   ├── seller/      # Seller onboarding & merchant dashboard
│   │   │   ├── admin/       # Admin Control Center (RBAC, moderation, logs)
│   │   │   └── ...
│   │   ├── components/      # Modular UI components (Navbar, Hero, Reels, etc.)
│   │   ├── context/         # AuthContext with 1-click test role switcher
│   │   └── lib/             # Typed API client with auto-JWT attachment
│   └── package.json
└── README.md
```

---

## 2. Requirements

- **Node.js**: `v18.x` or later (tested on Node v20+)
- **npm**: `v9.x` or later
- **MongoDB**: MongoDB Atlas connection URI or local MongoDB instance (automatically falls back to an embedded in-memory MongoDB if no database is running locally).

---

## 3. Installation & Setup

### Step 1: Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `backend/.env`:
```bash
cp .env.example backend/.env
```

**Environment Variables Definition**:
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/vibecart` |
| `JWT_SECRET` | Primary JWT signing secret | Secure key |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | Secure key |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary cloud name | `demo` (uses fallback if empty) |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | Your Cloudinary key |
| `CLOUDINARY_API_SECRET`| Cloudinary API Secret | Your Cloudinary secret |
| `NEXT_PUBLIC_API_URL` | Frontend API Target | `http://localhost:5000/api` |
| `PAYMENT_PROVIDER_KEY` | Payment service public key | Test key |
| `PAYMENT_PROVIDER_SECRET`| Payment service secret | Test secret |

---

## 4. Development Commands

Run both servers concurrently or in separate terminals:

```bash
# Start Backend (Port 5000)
npm run dev:backend

# Start Frontend (Port 3000)
npm run dev:frontend

# Run Seed Script Manually
npm run seed
```

> **Automatic Seeding**: If the database is fresh/empty, the backend automatically seeds all categories, brands, products, demo users, banners, coupons, and playable reels upon startup!

---

## 5. Seeded Test Accounts

The system includes pre-configured demo credentials across all role tiers:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Customer** | `dhruv@vibecart.com` | `password123` | Browsing, cart, wishlist, orders, reviews |
| **Seller** | `seller@vibecart.com` | `password123` | Store settings, product management, orders |
| **Manager** | `manager@vibecart.com` | `password123` | Order operations, inventory, return management |
| **Admin** | `admin@vibecart.com` | `password123` | Users, products, categories, sellers, coupons |
| **Super Admin**| `superadmin@vibecart.com`| `password123` | Unrestricted platform access & audit logs |

> **Pro-Tip**: Use the **Switch Test Account** dropdown in the navigation header to instantly switch between roles without logging in and out!

---

## 6. Live Portals & Features

- **Storefront & Homepage**: [`http://localhost:3000`](http://localhost:3000)
  - Editorial hero with carousel
  - Right rail with live countdown deal & seller onboarding CTA
  - Dynamic soft pastel category tiles
  - **Vibe Reels**: Short shoppable video reels with inline add-to-cart and video player
  - Trending product grid with hover quick-view and wishlist toggles
  - Top brands strip & promotional banners
- **Product Detail Page (PDP)**: [`http://localhost:3000/product/sony-wh-1000xm5-wireless-headphones`](http://localhost:3000/product/sony-wh-1000xm5-wireless-headphones)
  - Multi-image gallery with thumbnail switcher
  - Color & size variant picker
  - Stock validation & delivery estimate
  - Customer review modal with star rating submission
- **Cart & Server-side Coupons**: [`http://localhost:3000/cart`](http://localhost:3000/cart)
  - Test coupons: `WELCOME100` (₹100 off), `VIBE50` (50% off), `SUPERVIBE` (20% off)
- **Checkout & Order Tracking**: [`http://localhost:3000/checkout`](http://localhost:3000/checkout)
  - Visual order timeline (`PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`)
- **Seller Portal**:
  - Registration: [`http://localhost:3000/seller/register`](http://localhost:3000/seller/register)
  - Dashboard: [`http://localhost:3000/seller/dashboard`](http://localhost:3000/seller/dashboard) (Store stats, product inventory, order status updates)
- **Admin Control Center**: [`http://localhost:3000/admin/dashboard`](http://localhost:3000/admin/dashboard)
  - Platform KPIs: Revenue, total orders, customers, sellers, low stock alerts
  - Seller approvals (`APPROVED`, `PENDING`, `REJECTED`)
  - Product moderation & user RBAC role assignment
  - Full audit trail logging actions with timestamps and IPs

---

## 7. API Reference

### Authentication & RBAC
- `POST /api/auth/register` — Register customer or merchant account
- `POST /api/auth/login` — Login and receive JWT tokens
- `POST /api/auth/logout` — Invalidate session
- `POST /api/auth/forgot-password` — Password reset request
- `POST /api/auth/reset-password` — Reset password with token
- `GET /api/auth/me` — Current user profile and addresses

### Products, Categories & Brands
- `GET /api/products` — Filter, sort, paginate, and search products
- `GET /api/products/:id` — Single product details by slug or ID
- `POST /api/products` — Create product (Seller / Admin only)
- `PUT /api/products/:id` — Update product details
- `DELETE /api/products/:id` — Delete product
- `GET /api/categories` — List all categories
- `GET /api/brands` — List all verified brands

### Cart & Wishlist
- `GET /api/cart` — Get active customer cart
- `POST /api/cart` — Add item to cart with variant & quantity
- `PUT /api/cart/:itemId` — Update cart item quantity
- `DELETE /api/cart/:itemId` — Remove item from cart
- `POST /api/cart/coupon` — Apply & validate coupon code
- `GET /api/wishlist` — Retrieve customer wishlist
- `POST /api/wishlist` — Toggle item in wishlist

### Orders & Checkout
- `POST /api/orders` — Create order with server-side price validation
- `GET /api/orders` — List customer order history
- `GET /api/orders/:id` — Order tracking details & timeline
- `PUT /api/orders/:id/cancel` — Cancel eligible order
- `PUT /api/orders/:id/status` — Update lifecycle state (Seller/Admin)

### Vibe Reels
- `GET /api/reels` — List active shoppable video reels
- `POST /api/reels/:id/like` — Like a reel

### Admin & Auditing
- `GET /api/admin/stats` — Platform financial and operational statistics
- `GET /api/admin/sellers` — Manage seller accounts & approvals
- `PUT /api/admin/sellers/:id/status` — Approve/reject seller
- `GET /api/admin/audit-logs` — Full administrative audit log

---

## 8. Production Deployment

### Frontend (Vercel)
1. Push repository to GitHub.
2. Link the `frontend` folder to Vercel.
3. Configure Environment Variables:
   - `NEXT_PUBLIC_API_URL=https://api.yourvibecart.com/api`
4. Build command: `npm run build`

### Backend (Render / Railway / Fly.io / AWS)
1. Link the `backend` folder to your container or Node service.
2. Set Environment Variables:
   - `MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/vibecart?retryWrites=true&w=majority`
   - `JWT_SECRET=<long-random-entropy-string>`
   - `CLOUDINARY_CLOUD_NAME=<your-cloud-name>`
   - `CLOUDINARY_API_KEY=<your-api-key>`
   - `CLOUDINARY_API_SECRET=<your-api-secret>`
   - `NODE_ENV=production`
3. Build command: `npm run build`
4. Start command: `npm start`
