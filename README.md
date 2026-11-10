# 🛍️ Simple E-Commerce Store (ShopSphere)

A modern, responsive e-commerce web application built for the **CodeAlpha Simple E-Commerce Store** task.

- **Frontend**: Semantic HTML5, modern responsive CSS3, and modular Vanilla JavaScript (ES6+).
- **Backend**: Node.js & Express.js REST API with file-based SQLite database.
- **Reference**: [www.codealpha.tech](https://www.codealpha.tech)

---

## ✨ Features Implemented

1. **Product Listings & Catalog (`index.html`)**:
   - Dynamic product grid with 12 pre-seeded high quality products.
   - Category filtering (Electronics, Fashion, Home & Living, Accessories).
   - Real-time search with debounce.
   - Sorting options (Price: Low to High, Price: High to Low, Top Rated, Alphabetical).
   - Quick "Add to Cart" and "View Details" buttons.

2. **Product Details Page (`product-detail.html`)**:
   - Dedicated product view loading from URL param `?id=...`.
   - High-resolution product image preview.
   - Rating, stock availability indicator, and customer reviews count.
   - Original price and calculated discount percentage badge.
   - Quantity selector (`[-] 1 [+]`) with stock boundary limits.
   - "Add to Cart" and instant "Buy Now" checkout redirect.

3. **Shopping Cart (`cart.html`)**:
   - Interactive cart drawer / table with thumbnail, title, and price.
   - Quantity adjustment stepper and item deletion.
   - Subtotal, shipping fee calculation (Free over $100), and 8% sales tax calculation.
   - Working promo code support (use code `ALPHA10` for 10% discount).
   - Cart badge counter in navigation header with cross-page updates.

4. **Order Processing & Checkout (`checkout.html`)**:
   - Multi-step customer & shipping address form (Name, Email, Street, City, Zip).
   - Pre-fills details automatically if user is logged in.
   - Multiple simulated payment options (Credit/Debit Card, UPI / Digital Wallet, Cash on Delivery).
   - Live order item summary and price calculation.
   - Order confirmation modal with unique Order ID (e.g., `ORD-XXXXXX-XXXX`) and summary receipt.

5. **User Registration & Login (`auth.html`)**:
   - User sign-up and sign-in tabs with validation.
   - Password encryption using **bcryptjs**.
   - Session authentication using **JSON Web Tokens (JWT)**.
   - Dynamic navigation bar showing user profile name and Logout button.

6. **Order History & Tracking (`orders.html`)**:
   - View past orders placed by the logged-in user.
   - Guest order tracking by checkout email address.
   - Order status badges (*Processing*, *Shipped*, *Delivered*), ordered item breakdown, and delivery addresses.

---

## 🚀 How to Run the Application

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v16 or higher).

### 2. Start the Server
Open your terminal in the project root directory and run:

```bash
cd backend
npm install
npm start
```

Or run directly:
```bash
node backend/server.js
```

### 3. Open in Browser
Open your browser and navigate to:
```
http://localhost:8000
```

The Express server serves the frontend files directly and provides all REST API endpoints.

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint |
| `GET` | `/api/products` | Get products (supports `?category=`, `?search=`, `?sort=`) |
| `GET` | `/api/products/categories` | Get all product categories |
| `GET` | `/api/products/:id` | Get single product details |
| `POST` | `/api/auth/register` | Register new user account (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Login and obtain JWT token |
| `GET` | `/api/auth/me` | Get logged-in user profile (Requires Bearer token) |
| `POST` | `/api/orders` | Place new order with items and shipping details |
| `GET` | `/api/orders` | Get user order history |
| `GET` | `/api/orders/:identifier` | Get single order details by ID or order number |

---

## 🗃️ Database
SQLite file `backend/ecommerce.db` is automatically created and initialized with table schemas and seed products on first startup.
