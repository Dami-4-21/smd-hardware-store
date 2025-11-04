# 🚀 Admin Dashboard - Quick Start Guide

## ✅ What's Been Created

I've built a complete admin dashboard frontend with:

- ✅ Login page with authentication
- ✅ Dashboard layout with sidebar navigation
- ✅ Dashboard home with stats and analytics
- ✅ Product management page (placeholder)
- ✅ Categories, Orders, Customers, Settings pages (placeholders)
- ✅ Responsive design
- ✅ JWT authentication
- ✅ Protected routes

## 📦 Installation & Setup

### Step 1: Install Dependencies

```bash
cd admin-dashboard
npm install
```

### Step 2: Start the Dashboard

```bash
npm run dev
```

The dashboard will open at: **http://localhost:5174**

## 🔐 Login

### Demo Credentials:
- **Email**: `admin@sqb-tunisie.com`
- **Password**: `admin123`

**⚠️ IMPORTANT**: You need to create this admin user in your database first!

## 🗄️ Create Admin User

### Option 1: Using Prisma Studio (Easiest)

```bash
# In backend directory
cd backend
npm run prisma:studio
```

This opens a visual database editor at `http://localhost:5555`

1. Click on **users** table
2. Click **Add record**
3. Fill in:
   - **email**: `admin@sqb-tunisie.com`
   - **passwordHash**: You need to hash the password first (see below)
   - **role**: `ADMIN`
   - **firstName**: `Admin`
   - **lastName**: `User`
   - **isActive**: `true`

### Option 2: Hash Password with Node.js

```bash
# In backend directory
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10));"
```

Copy the output hash and use it as the `passwordHash` value.

### Option 3: Create Seed Script

Create `backend/src/database/seed.ts`:

```typescript
import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';

async function main() {
  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@sqb-tunisie.com',
      passwordHash,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Then run:
```bash
npm run seed
```

## 🎯 Complete Setup Checklist

### Backend Setup:
- [ ] PostgreSQL installed and running
- [ ] Database created
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Environment variables configured (`.env` file)
- [ ] Prisma migrations run (`npm run prisma:migrate`)
- [ ] Admin user created in database
- [ ] Backend server running (`npm run dev`) on port 3001

### Dashboard Setup:
- [ ] Dashboard dependencies installed (`cd admin-dashboard && npm install`)
- [ ] Dashboard running (`npm run dev`) on port 5174
- [ ] Can access login page
- [ ] Can login with admin credentials
- [ ] Dashboard loads successfully

## 🧪 Test the Dashboard

### 1. Test Login
```bash
# Visit
http://localhost:5174

# Enter credentials
Email: admin@sqb-tunisie.com
Password: admin123

# Should redirect to dashboard
```

### 2. Test Navigation
- Click on different menu items (Dashboard, Products, Categories, etc.)
- Verify pages load
- Check responsive design (resize browser)

### 3. Test Logout
- Click logout button
- Should redirect to login page
- Token should be removed from localStorage

## 📁 Project Structure

```
admin-dashboard/
├── src/
│   ├── components/
│   │   └── DashboardLayout.tsx    ✅ Main layout
│   ├── pages/
│   │   ├── LoginPage.tsx          ✅ Login screen
│   │   ├── DashboardHome.tsx      ✅ Dashboard overview
│   │   ├── ProductsPage.tsx       ✅ Products (placeholder)
│   │   ├── CategoriesPage.tsx     ✅ Categories (placeholder)
│   │   ├── OrdersPage.tsx         ✅ Orders (placeholder)
│   │   ├── CustomersPage.tsx      ✅ Customers (placeholder)
│   │   └── SettingsPage.tsx       ✅ Settings (placeholder)
│   ├── App.tsx                    ✅ Main app
│   ├── main.tsx                   ✅ Entry point
│   └── index.css                  ✅ Styles
├── package.json                   ✅ Dependencies
├── vite.config.ts                 ✅ Vite config
├── tailwind.config.js             ✅ Tailwind config
└── README.md                      ✅ Documentation
```

## 🎨 Dashboard Features

### ✅ Implemented:
1. **Login Page**
   - Email/password form
   - Error handling
   - Loading states
   - Demo credentials display

2. **Dashboard Layout**
   - Responsive sidebar
   - Top navigation bar
   - Mobile menu
   - Logout button

3. **Dashboard Home**
   - Revenue stats
   - Order count
   - Product count
   - Customer count
   - Recent orders list
   - Low stock alerts
   - Quick action buttons

4. **Navigation**
   - Dashboard
   - Products
   - Categories
   - Orders
   - Customers
   - Settings

### 🔄 To Be Implemented:
- Product CRUD operations
- Category management
- Order management
- Customer management
- Analytics charts
- File uploads
- Search & filters
- Pagination

## 🚨 Troubleshooting

### Dashboard won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Login fails
1. Check backend is running: `curl http://localhost:3001/health`
2. Verify admin user exists in database
3. Check browser console for errors
4. Verify password is correct

### Styles not loading
```bash
# Reinstall Tailwind
npm install -D tailwindcss postcss autoprefixer
npm run dev
```

### Port 5174 already in use
```bash
# Kill process on port 5174
lsof -i :5174
kill -9 <PID>

# Or use different port in vite.config.ts
```

## 🎯 Next Development Steps

### Phase 1: Product Management (Priority)
1. Create product list component
2. Add product form
3. Edit product functionality
4. Delete product with confirmation
5. Image upload
6. Size table manager

### Phase 2: Category Management
1. Category tree view
2. Add/edit/delete categories
3. Drag & drop reordering
4. Category images

### Phase 3: Order Management
1. Order list with filters
2. Order detail view
3. Status updates
4. Print invoices

### Phase 4: Analytics
1. Sales charts (Recharts)
2. Revenue trends
3. Top products
4. Customer insights

## 📊 Current Status

| Component | Status | Progress |
|-----------|--------|----------|
| Project Setup | ✅ Complete | 100% |
| Login Page | ✅ Complete | 100% |
| Dashboard Layout | ✅ Complete | 100% |
| Dashboard Home | ✅ Complete | 100% |
| Navigation | ✅ Complete | 100% |
| Product Management | 🔄 Placeholder | 20% |
| Category Management | 🔄 Placeholder | 0% |
| Order Management | 🔄 Placeholder | 0% |
| Customer Management | 🔄 Placeholder | 0% |
| Settings | 🔄 Placeholder | 0% |
| **Overall** | **🔄 In Progress** | **40%** |

## 🎉 You're Ready!

Your admin dashboard is now set up and ready to run!

### To start working:

1. **Terminal 1** - Backend:
   ```bash
   cd backend
   npm run dev
   ```

2. **Terminal 2** - Dashboard:
   ```bash
   cd admin-dashboard
   npm run dev
   ```

3. **Terminal 3** - Customer App (optional):
   ```bash
   npm run dev
   ```

### Access:
- **Admin Dashboard**: http://localhost:5174
- **Backend API**: http://localhost:3001
- **Customer App**: http://localhost:5173

---

**Happy coding! 🚀**

Need help? Check the README.md or ask for assistance!
