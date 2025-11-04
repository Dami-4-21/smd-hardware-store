# 🚀 Full-Stack SaaS Setup Guide

Complete guide to set up and run the SQB Hardware Store full-stack application.

---

## 📋 What Has Been Created

### ✅ Backend API (Complete Foundation)
- **Location**: `/backend/`
- **Tech Stack**: Node.js + Express + TypeScript + Prisma + PostgreSQL
- **Features**:
  - JWT authentication system
  - User management (Admin/Customer roles)
  - Complete database schema
  - API route structure
  - Error handling middleware
  - Security features (Helmet, CORS, Rate limiting)

### 📁 File Structure Created

```
backend/
├── prisma/
│   └── schema.prisma          ✅ Complete database schema
├── src/
│   ├── config/
│   │   └── database.ts        ✅ Prisma client setup
│   ├── controllers/
│   │   └── auth.controller.ts ✅ Authentication logic
│   ├── middleware/
│   │   ├── auth.ts           ✅ JWT middleware
│   │   ├── errorHandler.ts   ✅ Error handling
│   │   └── notFound.ts       ✅ 404 handler
│   ├── routes/
│   │   ├── auth.routes.ts    ✅ Auth endpoints
│   │   └── product.routes.ts ✅ Product endpoints
│   └── server.ts             ✅ Express server
├── .env.example              ✅ Environment template
├── package.json              ✅ Dependencies
├── tsconfig.json             ✅ TypeScript config
└── README.md                 ✅ Documentation
```

---

## 🛠️ Step-by-Step Setup

### Step 1: Install PostgreSQL

#### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### On macOS:
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### On Windows:
Download and install from: https://www.postgresql.org/download/windows/

### Step 2: Create Database

```bash
# Access PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE sqb_store;

# Create user
CREATE USER sqb_admin WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE sqb_store TO sqb_admin;

# Exit
\q
```

### Step 3: Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your database credentials
nano .env
```

**Update `.env` file:**
```env
DATABASE_URL="postgresql://sqb_admin:your_secure_password@localhost:5432/sqb_store?schema=public"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_REFRESH_SECRET=your-refresh-token-secret-also-32-chars
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

### Step 4: Initialize Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (creates all tables)
npm run prisma:migrate

# Seed database with initial data (optional)
npm run seed
```

### Step 5: Start Backend Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

**Server should start on**: `http://localhost:3001`

### Step 6: Verify Backend

```bash
# Test health endpoint
curl http://localhost:3001/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2025-10-29T...",
  "uptime": 1.234,
  "environment": "development"
}
```

---

## 🎨 Next Steps: What Needs to Be Built

### 🔄 Remaining Backend Controllers (Priority Order)

#### 1. Product Controller (HIGH PRIORITY)
**File**: `src/controllers/product.controller.ts`

**Functions needed**:
- `getAllProducts()` - List products with pagination
- `getProductById()` - Get single product with images, specs, size table
- `createProduct()` - Create new product
- `updateProduct()` - Update product details
- `deleteProduct()` - Soft delete product
- `searchProducts()` - Search by name, description, SKU
- `getProductsByCategory()` - Filter by category
- `updateProductStock()` - Update stock quantity

#### 2. Category Controller
**File**: `src/controllers/category.controller.ts`

**Functions needed**:
- `getAllCategories()` - Get category tree
- `getCategoryById()` - Get single category
- `createCategory()` - Create category
- `updateCategory()` - Update category
- `deleteCategory()` - Delete category
- `getSubcategories()` - Get child categories

#### 3. Order Controller
**File**: `src/controllers/order.controller.ts`

**Functions needed**:
- `getAllOrders()` - List orders (admin)
- `getOrderById()` - Get order details
- `createOrder()` - Place new order
- `updateOrderStatus()` - Update order status
- `getCustomerOrders()` - Get user's orders
- `getOrderStats()` - Order statistics

#### 4. User Controller
**File**: `src/controllers/user.controller.ts`

**Functions needed**:
- `getAllUsers()` - List users (admin)
- `getUserById()` - Get user profile
- `updateUser()` - Update profile
- `deleteUser()` - Delete account
- `getUserOrders()` - Get user's order history

#### 5. Analytics Controller
**File**: `src/controllers/analytics.controller.ts`

**Functions needed**:
- `getSalesStats()` - Revenue metrics
- `getProductStats()` - Product performance
- `getCustomerStats()` - Customer insights
- `getDashboardStats()` - Overview metrics

### 📱 Admin Dashboard Frontend (To Be Built)

**Location**: `/admin-dashboard/`

**Tech Stack**:
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- React Router v6
- TanStack Table
- Recharts
- React Hook Form + Zod

**Screens needed**:
1. Login page
2. Dashboard home (analytics)
3. Product management
4. Category management
5. Order management
6. Customer management
7. Size table manager
8. Settings

### 🔄 Customer App Updates (To Be Modified)

**Current**: Uses WooCommerce API  
**Target**: Use new custom API

**Files to update**:
- `src/services/woocommerce.ts` → Rename to `api.ts`
- Update all API calls to new endpoints
- Update type definitions
- Test all features

---

## 🗄️ Database Schema Overview

### Key Tables:

**users** - Authentication and profiles
```sql
- id (UUID)
- email (unique)
- passwordHash
- role (ADMIN, MANAGER, CUSTOMER)
- firstName, lastName, phone
- isActive, emailVerified
```

**categories** - Product categories (hierarchical)
```sql
- id (UUID)
- name, slug (unique)
- description, imageUrl
- parentId (self-reference)
- displayOrder, isActive
```

**products** - Product catalog
```sql
- id (UUID)
- name, slug (unique)
- description, shortDescription
- sku (unique), brand
- basePrice, stockQuantity
- categoryId (FK)
- isActive, isFeatured
```

**product_size_tables** ⭐ - Dynamic pricing
```sql
- id (UUID)
- productId (FK)
- unitType (kg, piece, L, m)
- size
- price, stockQuantity
```

**orders** - Customer orders
```sql
- id (UUID)
- orderNumber (unique)
- userId (FK, optional)
- customerName, customerEmail, customerPhone
- status (PENDING, PROCESSING, SHIPPED, etc.)
- paymentMethod, paymentStatus
- subtotal, taxAmount, totalAmount
```

**order_items** - Order line items
```sql
- id (UUID)
- orderId (FK)
- productId (FK)
- productName, productSku
- selectedSize, selectedUnitType
- quantity, unitPrice, totalPrice
```

---

## 🔐 Authentication Flow

### Register New User:
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "admin@sqb-tunisie.com",
  "password": "SecurePass123!",
  "firstName": "Admin",
  "lastName": "User"
}
```

### Login:
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@sqb-tunisie.com",
  "password": "SecurePass123!"
}
```

### Use Token:
```bash
GET /api/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 API Testing

### Using cURL:

```bash
# Health check
curl http://localhost:3001/health

# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Using Postman:
1. Import API collection
2. Set base URL: `http://localhost:3001`
3. Add Authorization header with JWT token

---

## 🚀 Deployment Options

### Option 1: Railway (Recommended)
- **Backend + Database**: Free tier available
- **Setup**: 5 minutes
- **Auto-deploy**: GitHub integration

### Option 2: Render
- **Backend**: Free tier
- **Database**: Paid ($7/month)
- **Setup**: 10 minutes

### Option 3: DigitalOcean
- **Droplet**: $6/month
- **Managed Database**: $15/month
- **Full control**

---

## 📝 Development Workflow

### Daily Development:

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Customer App
cd ..
npm run dev

# Terminal 3: Admin Dashboard (when built)
cd admin-dashboard
npm run dev
```

### Database Management:

```bash
# Open Prisma Studio (visual database editor)
cd backend
npm run prisma:studio

# Create new migration
npm run prisma:migrate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

---

## ✅ Current Status

### ✅ Completed:
1. Backend project structure
2. Database schema (Prisma)
3. Authentication system (JWT)
4. User management
5. Middleware (auth, errors, security)
6. API route structure
7. Environment configuration
8. Documentation

### 🔄 In Progress:
1. Product controller implementation
2. Category controller implementation
3. Order controller implementation

### ⏳ Pending:
1. Admin dashboard frontend
2. Customer app API migration
3. File upload system
4. Email notifications
5. WooCommerce data migration script
6. Testing suite
7. Deployment configuration

---

## 🎯 Next Immediate Steps

### For You:

1. **Install PostgreSQL** on your machine
2. **Create database** using commands above
3. **Setup backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npm run prisma:generate
   npm run prisma:migrate
   npm run dev
   ```
4. **Test API** using cURL or Postman
5. **Let me know** when backend is running

### For Me (Next):

1. Complete product controller
2. Complete category controller
3. Complete order controller
4. Add file upload middleware
5. Create seed data script
6. Start admin dashboard structure

---

## 🆘 Troubleshooting

### PostgreSQL not starting:
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Port 3001 already in use:
```bash
lsof -i :3001
kill -9 <PID>
```

### Prisma errors:
```bash
npm run prisma:generate
npm run prisma:migrate reset
```

### Database connection fails:
- Check DATABASE_URL in .env
- Verify PostgreSQL is running
- Test connection: `psql -U sqb_admin -d sqb_store`

---

## 📚 Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
- [JWT Introduction](https://jwt.io/introduction)

---

**Ready to build! 🚀**

Let me know when you've completed the setup steps and I'll continue with the remaining controllers and admin dashboard.
