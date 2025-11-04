# SMD Hardware Store - Customer Frontend

Modern React + TypeScript e-commerce application for SMD Tunisie Hardware Store, powered by a custom Node.js backend.

---

## 🏗️ **Architecture**

```
Customer Frontend (React + TypeScript)
         ↓
Custom Backend API (Node.js + Express)
         ↓
PostgreSQL Database
         ↑
Admin Dashboard (React + TypeScript)
```

**No WooCommerce. No WordPress. Full Control.** ✅

---

## 🚀 **Features**

### **✅ Shopping Experience**
- **Category Navigation**: Hierarchical category browsing with subcategories
- **Product Browsing**: Grid view with images, prices, and stock info
- **Product Details**: Full product pages with specifications and size options
- **Search**: Real-time search across products, categories, and specs
- **Cart System**: Persistent cart with localStorage
- **Checkout**: Complete checkout flow with order creation

### **✅ Cart System**
- **Persistent Storage**: Cart saved across browser sessions
- **Real-time Stock**: Shows available stock minus cart quantity
- **Stock Validation**: Prevents over-ordering
- **Price Calculations**: Subtotal + 10% tax = Total (TND)
- **Loading States**: Proper UX feedback

### **✅ Size Table Support**
- **Dynamic Pricing**: Different prices for different sizes/quantities
- **Unit Types**: kg, piece, L, m, or custom
- **Size Selector**: 3-column responsive grid
- **Per-Size Stock**: Independent inventory per size

### **✅ Currency**
- **Tunisian Dinar (TND)**: All prices in TND
- **Accurate Formatting**: Consistent display across app

---

## 🛠️ **Tech Stack**

### **Frontend:**
- React 18.3.1 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Lucide React (icons)
- Context API (state management)
- localStorage (cart persistence)

### **Backend:**
- Node.js + Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- Multer (file uploads)

---

## 📦 **Installation**

### **Prerequisites:**
- Node.js 18+
- npm or yarn
- Backend API running (see `/backend` folder)

### **1. Install Dependencies:**
```bash
npm install
```

### **2. Configure Environment:**
Create `.env` file:
```env
VITE_API_URL=http://localhost:3001/api
```

### **3. Start Development Server:**
```bash
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## 🎯 **Available Scripts**

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run typecheck  # TypeScript type checking
```

---

## 📁 **Project Structure**

```
src/
├── App.tsx                    # Main app with routing
├── main.tsx                   # Entry point
├── index.css                  # Global styles
│
├── components/                # Reusable UI components
│   ├── CategoryCard.tsx       # Category display card
│   ├── FloatingCart.tsx       # Floating cart button
│   ├── Header.tsx             # App header
│   ├── ProductCard.tsx        # Product display card
│   └── Sidebar.tsx            # Navigation sidebar
│
├── screens/                   # Full page screens
│   ├── HomeScreen.tsx         # Category browsing
│   ├── SubcategoryScreen.tsx  # Subcategory view
│   ├── ProductListScreen.tsx  # Product grid
│   ├── ProductDetailScreen.tsx # Product details
│   ├── BasketScreen.tsx       # Cart view
│   ├── CheckoutScreen.tsx     # Checkout form
│   └── OrderConfirmationScreen.tsx # Order success
│
├── context/
│   └── CartContext.tsx        # Global cart state
│
├── services/
│   └── api.ts                 # Custom backend API service
│
├── types/
│   └── api.ts                 # TypeScript interfaces
│
└── config/
    └── api.ts                 # API configuration
```

---

## 🔌 **API Integration**

### **Backend Endpoints Used:**

#### **Categories:**
- `GET /api/categories` - All categories
- `GET /api/categories/:id` - Single category
- `GET /api/categories/:id/subcategories` - Subcategories

#### **Products:**
- `GET /api/products` - All products (paginated)
- `GET /api/products/:id` - Single product
- `GET /api/products/search?q=query` - Search products
- `GET /api/categories/:id/products` - Products by category

#### **Orders:**
- `POST /api/orders` - Create order

---

## 🛒 **How to Use**

### **1. Browse Categories**
- Click on category cards on home screen
- Navigate through subcategories if available

### **2. View Products**
- Browse products in grid view
- Click product card for details
- See specifications and size options

### **3. Add to Cart**
- Click **+** button on product cards
- Or use quantity selector on product detail page
- Select size if product has size options

### **4. Checkout**
- Click cart icon (shows item count)
- Review cart items
- Click "Proceed to Checkout"
- Fill customer information
- Select payment method
- Place order

---

## 🎨 **Customization**

### **Colors & Branding:**
Edit `tailwind.config.js` for theme colors.

### **API URL:**
Change `VITE_API_URL` in `.env` file.

### **Currency:**
Update currency display in components (currently TND).

---

## 🔗 **Related Projects**

- **Backend API**: `/backend` - Custom Node.js API
- **Admin Dashboard**: `/admin-dashboard` - Management interface

---

## 📚 **Documentation**

- **`CLEANUP-SUMMARY.md`** - WooCommerce removal summary
- **`COMPLETE-DEPLOYMENT-GUIDE.md`** - VPS deployment guide
- **`FRONTEND-BACKEND-INTEGRATION.md`** - API integration docs
- **`CATEGORY-MANAGEMENT.md`** - Category system docs
- **`INTEGRATION-SUMMARY.md`** - Project summary

---

## 🐛 **Known Issues**

1. **CheckoutScreen.tsx** - Needs fixing (corrupted during migration)
2. **Product API** - Backend product controller needs implementation
3. **Order API** - Backend order controller needs implementation

---

## 🚀 **Deployment**

### **Production Build:**
```bash
npm run build
```

Output in `dist/` folder.

### **Deploy to VPS:**
See `COMPLETE-DEPLOYMENT-GUIDE.md` for full instructions.

---

## 🤝 **Contributing**

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

---

## 📄 **License**

MIT

---

**Built for SMD Tunisie Hardware Store** 🛠️

*Modern. Fast. Reliable.* ✨
