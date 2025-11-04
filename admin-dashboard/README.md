# SMD Admin Dashboard

Modern admin dashboard for SMD Hardware Store e-commerce platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Backend API running on http://localhost:3001

### Installation

```bash
# Navigate to admin dashboard
cd admin-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

The dashboard will open at **http://localhost:5174**

## 🔐 Login Credentials

### Demo Account
- **Email**: `admin@smd-tunisie.com`
- **Password**: `admin123`

**Note**: You need to create this user in your database first!

## 📁 Project Structure

```
admin-dashboard/
├── src/
│   ├── components/
│   │   └── DashboardLayout.tsx    # Main layout with sidebar
│   ├── pages/
│   │   ├── LoginPage.tsx          # Login screen
│   │   ├── DashboardHome.tsx      # Dashboard overview
│   │   ├── ProductsPage.tsx       # Product management
│   │   ├── CategoriesPage.tsx     # Category management
│   │   ├── OrdersPage.tsx         # Order management
│   │   ├── CustomersPage.tsx      # Customer management
│   │   └── SettingsPage.tsx       # Settings
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## ✨ Features

### ✅ Implemented
- [x] Login page with authentication
- [x] Dashboard layout with sidebar navigation
- [x] Dashboard home with stats and recent activity
- [x] Responsive design (mobile, tablet, desktop)
- [x] Protected routes
- [x] JWT token management
- [x] Logout functionality

### 🔄 In Progress
- [ ] Product CRUD operations
- [ ] Category management
- [ ] Order management
- [ ] Customer management
- [ ] Settings page

### ⏳ Planned
- [ ] Analytics charts
- [ ] File upload for product images
- [ ] Bulk operations
- [ ] Export data
- [ ] Email notifications
- [ ] User roles & permissions

## 🎨 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router v6** - Routing
- **Lucide React** - Icons
- **Axios** - HTTP client (to be added)

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 🔐 Authentication Flow

1. User enters email and password
2. POST request to `/api/auth/login`
3. Backend returns JWT token
4. Token stored in localStorage
5. Token sent with all API requests
6. Protected routes check for token

## 📡 API Integration

### Base URL
```
http://localhost:3001/api
```

### Endpoints Used
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user
- `GET /products` - Get all products
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

## 🎯 Pages Overview

### Dashboard Home
- Revenue stats
- Order count
- Product count
- Customer count
- Recent orders
- Low stock alerts
- Quick actions

### Products Page
- Product list with search
- Add new product
- Edit product
- Delete product
- Filter by category
- Pagination

### Categories Page
- Category tree view
- Add/edit/delete categories
- Drag & drop reordering
- Category images

### Orders Page
- Order list with filters
- Order details
- Update order status
- Print invoices
- Customer information

### Customers Page
- Customer list
- Customer profiles
- Order history
- Contact information

### Settings Page
- Store information
- Payment methods
- Shipping settings
- Tax configuration
- User management

## 🚨 Important Notes

### Before Running:

1. **Backend must be running** on port 3001
2. **Database must be set up** with Prisma
3. **Admin user must exist** in database

### Create Admin User:

```bash
# In backend directory
cd ../backend

# Create admin user (you'll need to implement this)
npm run seed
```

Or use Prisma Studio:
```bash
npm run prisma:studio
```

Then manually create a user with:
- Email: `admin@sqb-tunisie.com`
- Password: `admin123` (hashed with bcrypt)
- Role: `ADMIN`

## 🐛 Troubleshooting

### Login fails
- Check backend is running on port 3001
- Verify admin user exists in database
- Check browser console for errors
- Verify CORS is enabled in backend

### Page not loading
- Clear browser cache
- Check for console errors
- Verify all dependencies installed
- Try `npm install` again

### Styles not working
- Run `npm install` to ensure Tailwind is installed
- Check `tailwind.config.js` is present
- Verify `index.css` imports Tailwind

## 📚 Next Steps

1. Complete product management UI
2. Add image upload functionality
3. Implement category management
4. Build order management interface
5. Add analytics charts
6. Implement search and filters
7. Add data export features

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

MIT

---

**Built for SMD Tunisie Hardware Store** 🛠️
