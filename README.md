# NestJS Products & Inventory CRUD API

A production-ready NestJS REST API with TypeORM, SQLite database, Swagger / OpenAPI documentation, and DTO validation.

---

## 🛠️ Features

- **Framework**: [NestJS](https://nestjs.com/) (Modular architecture)
- **Database / ORM**: SQLite + [TypeORM](https://typeorm.io/) (Zero database setup needed)
- **Documentation**: [Swagger / OpenAPI](https://docs.nestjs.com/openapi/introduction) interactive UI at `/api`
- **Validation**: `class-validator` & `class-transformer` with automated type coercion
- **Endpoints**:
  - `POST /products` - Create a product (with validation and unique SKU check)
  - `GET /products` - List products with query filtering (`category`, `search`, `minPrice`, `maxPrice`, `inStockOnly`), pagination (`page`, `limit`), and sorting (`sortBy`, `sortOrder`)
  - `GET /products/statistics` - Inventory overview (total units, stock valuation, out-of-stock count, category breakdown)
  - `GET /products/:id` - Fetch product by UUID
  - `PATCH /products/:id` - Update product by UUID
  - `DELETE /products/:id` - Remove product by UUID
- **Auto-Seeding**: Seeds demo products on initial launch if the database is empty.

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

### `POST /products`
**Body:**
```json
{
  "name": "Wireless Noise-Canceling Headphones",
  "description": "High fidelity audio with active noise cancellation",
  "price": 199.99,
  "stockQuantity": 50,
  "category": "Electronics",
  "sku": "ELEC-WNC-001",
  "isActive": true
}
```

### `GET /products`
**Query Parameters (Optional):**
- `search` (e.g. `headphones`)
- `category` (`Electronics`, `Clothing`, `Home & Kitchen`, `Books`, `Beauty & Personal Care`, `Sports & Outdoors`, `Other`)
- `minPrice` & `maxPrice`
- `inStockOnly` (`true` / `false`)
- `page` (default: `1`) & `limit` (default: `10`)
- `sortBy` (`createdAt`, `name`, `price`, `stockQuantity`)
- `sortOrder` (`ASC` / `DESC`)

### `GET /products/statistics`
Returns stock metrics & category breakdowns.

### `GET /products/:id`
Fetch single product by UUID.

### `PATCH /products/:id`
Partial update of product fields.

### `DELETE /products/:id`
Delete product by UUID.
