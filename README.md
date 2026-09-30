# NestJS Products & Orders E-Commerce Backend API

A production-ready NestJS REST API with TypeORM, SQLite database, Swagger / OpenAPI documentation, transactional Order Checkout with real-time stock deduction, and DTO validation.

---

## 🛠️ Features

- **Framework**: [NestJS](https://nestjs.com/) (Modular architecture)
- **Database / ORM**: SQLite + [TypeORM](https://typeorm.io/) (Zero database setup needed)
- **Documentation**: [Swagger / OpenAPI](https://docs.nestjs.com/openapi/introduction) interactive UI at `/api`
- **Validation**: `class-validator` & `class-transformer` with automated type coercion
- **Products Management**:
  - `POST /products` - Create a product (with validation and unique SKU check)
  - `GET /products` - List products with query filtering (`category`, `search`, `minPrice`, `maxPrice`, `inStockOnly`), pagination (`page`, `limit`), and sorting (`sortBy`, `sortOrder`)
  - `GET /products/statistics` - Inventory overview (total units, stock valuation, out-of-stock count, category breakdown)
  - `GET /products/:id` - Fetch product by UUID
  - `PATCH /products/:id` - Update product by UUID
  - `DELETE /products/:id` - Remove product by UUID
- **Orders & Checkout System**:
  - `POST /orders` - Place / checkout an order with atomic stock validation and deduction
  - `GET /orders` - List orders with pagination, status filtering, date range, search, and sorting
  - `GET /orders/analytics` - Revenue metrics, total orders, average order value (AOV), status breakdown, and top-selling products
  - `GET /orders/:id` - Fetch order by UUID or Order Number (`ORD-YYYYMMDD-XXXX`) with full line items
  - `PATCH /orders/:id/status` - Transition order status (`PENDING`, `PROCESSING`, `COMPLETED`, `CANCELLED`, `REFUNDED`)
  - `POST /orders/:id/cancel` - Cancel order and automatically restock ordered quantities back to product inventory
- **Auto-Seeding**: Seeds demo products and demo orders on initial launch if the database is empty.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run start:dev
```

### 3. Open Interactive Swagger Docs
Navigate to:
👉 **[http://localhost:3000/api](http://localhost:3000/api)**

---

## 📋 API Reference Summary

### Products Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/products` | Create a new product |
| `GET` | `/products` | List & filter products |
| `GET` | `/products/statistics` | Inventory statistics & metrics |
| `GET` | `/products/:id` | Get single product by UUID |
| `PATCH` | `/products/:id` | Partial update of product |
| `DELETE` | `/products/:id` | Remove product |

### Orders Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/orders` | Checkout / place order (atomic stock deduction) |
| `GET` | `/orders` | List & search orders |
| `GET` | `/orders/analytics` | Revenue & sales analytics |
| `GET` | `/orders/:id` | Get order details by ID or Order Number |
| `PATCH` | `/orders/:id/status` | Update order status |
| `POST` | `/orders/:id/cancel` | Cancel order & auto-restock |

#### Example: Place Order (`POST /orders`)
```json
{
  "customerName": "Jane Doe",
  "customerEmail": "jane.doe@example.com",
  "shippingAddress": "742 Evergreen Terrace, Springfield, OR",
  "notes": "Leave at front door",
  "items": [
    {
      "productId": "d9b2d63d-a233-4123-847e-ef8510a9f110",
      "quantity": 2
    }
  ]
}
```
