# Shopify Booking System & Staff Dashboard

Enterprise-grade **Shopify Booking System** featuring a Next.js (Tailwind CSS) Admin & Staff Dashboard, MongoDB database, Cloudinary media storage, Shopify API & Webhook integration, and a post-service Customer Review & Tip Checkout flow.

## 🚀 Features

- **Shopify Storefront Integration**: Receives Shopify order webhooks (`orders/create`, `orders/paid`, `orders/cancelled`, `products/update`) and automatically syncs customer bookings in MongoDB.
- **Staff Tip System via Shopify Checkout**: Post-service customer completion portal generates dynamic Shopify Draft Orders for staff gratuities, routing payment securely through Shopify Checkout.
- **Interactive Booking Calendar**: Visual staff schedule grid with time-slot management and status tracking (Confirmed, In Progress, Completed, Cancelled).
- **Role-based Dashboard**: Admin vs Staff viewing modes with KPI financial metrics, revenue reporting, and staff commission calculations.
- **Customer Ratings & Photo Reviews**: Verified customer star ratings, comments, and image uploads.

## 🛠️ Technology Stack

- **Frontend & Server**: Next.js 14 App Router (JavaScript / JSX), Tailwind CSS, Lucide React Icons
- **Database**: MongoDB & Mongoose
- **Integrations**: Shopify Admin API, Shopify Webhooks, Cloudinary API

## 🚦 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MdSHiFaTRaHMaN/Booking-Dot-Com.git
   cd Booking-Dot-Com
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables** (`.env.local`):
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   SHOPIFY_ADMIN_API_ACCESS_TOKEN=shpat_xxx
   SHOPIFY_WEBHOOK_SECRET=shpss_xxx
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   ```

4. **Run local development server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.
