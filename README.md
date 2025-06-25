![rmz_nextjs](https://i.ibb.co/RTz6zJwW/rmz-nextjs.png)

# RMZ STORE FRONT - Storefront Example (NextJS)

A professional Next.js storefront application built for the rmz.gg store front api. This application provides a complete e-commerce experience with authentication, product browsing, cart management, and order processing.

## Features

### 🔐 Authentication
- **OTP-based Login**: Phone number verification with SMS/WhatsApp
- **Multi-country Support**: Supports GCC countries (Saudi Arabia, UAE, Qatar, etc.)
- **Automatic Registration**: Seamless account creation for new customers
- **Session Management**: Secure token-based authentication

### 🛍️ Shopping Experience
- **Product Catalog**: Browse products with advanced filtering and search
- **Categories**: Organized product categorization
- **Shopping Cart**: Add, update, and remove items
- **Coupon System**: Apply discount coupons
- **Multiple Product Types**: Support for digital products, subscriptions, and courses

### 📱 User Account
- **Profile Management**: Update personal information
- **Order History**: View past purchases and order status
- **Subscriptions**: Manage active subscriptions
- **Course Access**: Track learning progress for enrolled courses

### 💳 Checkout Process
- **Secure Checkout**: Integrated payment processing
- **Free Orders**: Support for zero-cost transactions
- **Real-time Updates**: Live cart synchronization

### 🎨 User Interface
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern Components**: Built with Headless UI and Heroicons
- **Loading States**: Skeleton loaders and loading indicators
- **Toast Notifications**: User-friendly feedback messages

## Technology Stack

- **Frontend Framework**: Next.js 15 with App Router
- **UI Library**: Tailwind CSS + Headless UI
- **State Management**: Zustand with persistence
- **API Integration**: RMZ Storefront SDK (rmz-storefront-sdk)
- **HTTP Client**: Axios with React Query
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Heroicons + Lucide React
- **Notifications**: Sonner

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your API configuration:
   ```env
   # Production API (default)
   NEXT_PUBLIC_API_URL=https://front.rmz.gg/api
   NEXT_PUBLIC_API_BASE_URL=https://front.rmz.gg/api
   
   # Development (uncomment for local dev)
   # NEXT_PUBLIC_API_URL=http://front.rmz.local:8000/api
   # NEXT_PUBLIC_API_BASE_URL=http://front.rmz.local:8000/api
   
   # SDK Authentication Keys
   NEXT_PUBLIC_STOREFRONT_PUBLIC_KEY=your_public_key_here
   STOREFRONT_SECRET_KEY=your_secret_key_here
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## API Integration

This storefront uses the **RMZ Storefront SDK** (`rmz-storefront-sdk`) for seamless API integration. The SDK provides:

### SDK Features
- **Secure Authentication**: HMAC-based security with public/secret keys
- **Framework Agnostic**: Works with React, Vue, Angular, Svelte, and Vanilla JS
- **TypeScript Support**: Full type definitions included
- **Automatic Error Handling**: Built-in retry logic and error management
- **Caching**: Intelligent response caching for better performance

### Installation
```bash
npm install rmz-storefront-sdk
```

### Usage
```typescript
import { createStorefrontSDK } from 'rmz-storefront-sdk';

const sdk = createStorefrontSDK({
  apiUrl: 'https://front.rmz.gg/api',
  publicKey: 'your_public_key',
  secretKey: 'your_secret_key', // Server-side only
  enableLogging: true
});

// Example: Get products
const products = await sdk.products.getAll();
const store = await sdk.store.get();
```

### Backend API Endpoints

### Authentication Endpoints
- `POST /api/storefront/auth/initiate` - Start authentication
- `POST /api/storefront/auth/verify` - Verify OTP code
- `POST /api/storefront/auth/complete` - Complete registration
- `POST /api/storefront/customer/logout` - Logout

### Store & Products
- `GET /api/storefront/store` - Get store information
- `GET /api/storefront/products` - List products
- `GET /api/storefront/products/{slug}` - Get product details
- `GET /api/storefront/categories` - List categories

### Cart & Checkout
- `GET /api/storefront/cart` - Get cart contents
- `POST /api/storefront/cart/add` - Add item to cart
- `PATCH /api/storefront/cart/items/{id}` - Update cart item
- `POST /api/storefront/checkout` - Create checkout session

### Customer Account
- `GET /api/storefront/customer/profile` - Get profile
- `PATCH /api/storefront/customer/profile` - Update profile
- `GET /api/storefront/customer/orders` - Get orders
- `GET /api/storefront/customer/subscriptions` - Get subscriptions

## Key Features Explained

### Authentication Flow
1. User enters phone number and country code
2. Backend sends OTP via SMS/WhatsApp
3. User verifies OTP code
4. If new user, complete registration with email and name
5. JWT token stored for authenticated requests

### Cart Management
- Items stored in Zustand store with persistence
- Real-time synchronization with backend
- Support for product variants and custom fields
- Coupon application and discount calculation

### Product Types
- **Digital Products**: Instant download/access
- **Subscriptions**: Recurring billing with features
- **Courses**: Educational content with progress tracking

## Production Deployment

### Environment Variables
```env
# Production API
NEXT_PUBLIC_API_URL=https://front.rmz.gg/api
NEXT_PUBLIC_API_BASE_URL=https://front.rmz.gg/api

# SDK Authentication
NEXT_PUBLIC_STOREFRONT_PUBLIC_KEY=your_public_key
STOREFRONT_SECRET_KEY=your_secret_key

# Node Environment
NODE_ENV=production
```

### Build Commands
```bash
npm run build    # Build for production
npm run start    # Start production server
```

This application can be deployed on Vercel, Netlify, AWS Amplify, or any Node.js hosting platform.
