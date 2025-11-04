# SMD Hardware Store - Backend API

Backend API for SMD Hardware Store e-commerce platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your database credentials
nano .env

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with initial data
npm run seed

# Start development server
npm run dev
```

## 📁 Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   └── database.ts        # Prisma client
│   ├── controllers/           # Route controllers
│   │   ├── auth.controller.ts
│   │   ├── product.controller.ts
│   │   ├── category.controller.ts
│   │   ├── order.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/            # Express middleware
│   │   ├── auth.ts           # JWT authentication
│   │   ├── errorHandler.ts   # Error handling
│   │   └── notFound.ts       # 404 handler
│   ├── routes/               # API routes
│   │   ├── auth.routes.ts
│   │   ├── product.routes.ts
│   │   ├── category.routes.ts
│   │   ├── order.routes.ts
│   │   └── user.routes.ts
│   ├── utils/                # Utility functions
│   └── server.ts             # Express app entry
├── uploads/                  # File uploads directory
├── .env.example             # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## 🗄️ Database Schema

### Core Tables:
- **users** - Admin and customer accounts
- **categories** - Product categories (hierarchical)
- **products** - Product catalog
- **product_images** - Product images
- **product_specifications** - Product specs
- **product_size_tables** - Size-based pricing ⭐
- **orders** - Customer orders
- **order_items** - Order line items
- **addresses** - Shipping addresses

## 🔐 Authentication

### JWT-based authentication with refresh tokens

**Register:**
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Login:**
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "role": "CUSTOMER" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

## 📡 API Endpoints

### Products

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | Get all products | Public |
| GET | `/api/products/:id` | Get single product | Public |
| GET | `/api/products/search?q=drill` | Search products | Public |
| GET | `/api/products/category/:id` | Get products by category | Public |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |

### Categories

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/categories` | Get all categories | Public |
| GET | `/api/categories/:id` | Get single category | Public |
| POST | `/api/categories` | Create category | Admin |
| PUT | `/api/categories/:id` | Update category | Admin |
| DELETE | `/api/categories/:id` | Delete category | Admin |

### Orders

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/orders` | Get all orders | Admin |
| GET | `/api/orders/:id` | Get single order | User/Admin |
| POST | `/api/orders` | Create order | Public |
| PUT | `/api/orders/:id/status` | Update order status | Admin |

### Size Tables ⭐

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/products/:id/size-table` | Add size option | Admin |
| PUT | `/api/products/:id/size-table/:sizeId` | Update size option | Admin |
| DELETE | `/api/products/:id/size-table/:sizeId` | Delete size option | Admin |

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sqb_store"

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🛠️ Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate Prisma client
npm run prisma:generate

# Create database migration
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Seed database
npm run seed
```

## 📊 Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name add_new_feature

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Option 1: Railway
1. Create account at railway.app
2. Connect GitHub repository
3. Add PostgreSQL database
4. Set environment variables
5. Deploy

### Option 2: Render
1. Create account at render.com
2. Create new Web Service
3. Connect repository
4. Add PostgreSQL database
5. Set environment variables
6. Deploy

### Option 3: DigitalOcean App Platform
1. Create account at digitalocean.com
2. Create new App
3. Connect repository
4. Add managed PostgreSQL
5. Configure environment
6. Deploy

## 📝 API Response Format

### Success Response:
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response:
```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

## 🔒 Security Features

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Input validation
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection

## 📈 Performance

- ✅ Response compression (gzip)
- ✅ Database query optimization
- ✅ Pagination support
- ✅ Caching headers
- ✅ Connection pooling

## 🐛 Troubleshooting

### Database connection fails
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U your_user -d sqb_store
```

### Prisma errors
```bash
# Regenerate Prisma client
npm run prisma:generate

# Reset database
npm run prisma:migrate reset
```

### Port already in use
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

## 📚 Documentation

- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js Docs](https://expressjs.com/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [JWT Docs](https://jwt.io/introduction)

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Write tests
4. Submit pull request

## 📄 License

MIT

---

**Built with ❤️ for SMD Tunisie**
