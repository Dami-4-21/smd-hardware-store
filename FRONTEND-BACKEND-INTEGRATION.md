# 🔗 Frontend-Backend Integration Guide

Complete guide for integrating the admin dashboard and customer frontend with the new backend API.

---

## 📋 **Overview**

This document explains how the admin dashboard and customer-facing frontend integrate with the custom Node.js backend, replacing the WooCommerce API.

---

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT APPLICATIONS                      │
├──────────────────────────┬──────────────────────────────────┤
│   Admin Dashboard        │   Customer Frontend              │
│   (Port 5174)            │   (Port 5173)                    │
│   - Category Management  │   - Browse Categories            │
│   - Product Management   │   - View Products                │
│   - Order Management     │   - Shopping Cart                │
│   - Image Upload         │   - Checkout                     │
└──────────────┬───────────┴──────────────┬───────────────────┘
               │                          │
               └──────────┬───────────────┘
                          │
                    HTTP/REST API
                          │
               ┌──────────▼──────────┐
               │   Backend Server    │
               │   (Port 3001)       │
               │   - Express.js      │
               │   - JWT Auth        │
               │   - File Upload     │
               │   - API Routes      │
               └──────────┬──────────┘
                          │
                    Prisma ORM
                          │
               ┌──────────▼──────────┐
               │   PostgreSQL DB     │
               │   - Categories      │
               │   - Products        │
               │   - Orders          │
               │   - Users           │
               └─────────────────────┘
```

---

## 🔌 **API Endpoints**

### **Categories API**

#### **Public Endpoints (No Auth Required)**

```typescript
// Get all categories with hierarchy
GET /api/categories
Query: ?includeInactive=true
Response: {
  success: true,
  data: [
    {
      id: string,
      name: string,
      slug: string,
      description: string,
      imageUrl: string,
      parentId: null,
      displayOrder: number,
      isActive: boolean,
      productCount: number,
      subcategories: [
        {
          id: string,
          name: string,
          slug: string,
          description: string,
          imageUrl: string,
          parentId: string,
          displayOrder: number,
          isActive: boolean
        }
      ],
      createdAt: string,
      updatedAt: string
    }
  ]
}

// Get single category
GET /api/categories/:id
Response: {
  success: true,
  data: {
    id: string,
    name: string,
    slug: string,
    description: string,
    imageUrl: string,
    parentId: string | null,
    displayOrder: number,
    isActive: boolean,
    productCount: number,
    subcategories: [...],
    parent: {...} | null
  }
}

// Get subcategories of a parent
GET /api/categories/:parentId/subcategories
Response: {
  success: true,
  data: [
    {
      id: string,
      name: string,
      slug: string,
      description: string,
      imageUrl: string,
      parentId: string,
      productCount: number,
      ...
    }
  ]
}

// Get products in category
GET /api/categories/:id/products
Query: ?page=1&limit=20
Response: {
  success: true,
  data: {
    products: [...],
    pagination: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    }
  }
}
```

#### **Protected Endpoints (Admin/Manager Only)**

```typescript
// Create category
POST /api/categories
Headers: Authorization: Bearer <token>
Body: {
  name: string,
  slug: string,
  description?: string,
  imageUrl?: string,
  parentId?: string,
  displayOrder?: number
}
Response: {
  success: true,
  data: {
    id: string,
    name: string,
    slug: string,
    ...
  }
}

// Update category
PUT /api/categories/:id
Headers: Authorization: Bearer <token>
Body: {
  name?: string,
  slug?: string,
  description?: string,
  imageUrl?: string,
  parentId?: string,
  displayOrder?: number,
  isActive?: boolean
}
Response: {
  success: true,
  data: {...}
}

// Delete category
DELETE /api/categories/:id
Headers: Authorization: Bearer <token>
Query: ?cascade=true
Response: {
  success: true,
  message: "Category deleted successfully",
  data: {
    deletedCategoryId: string,
    unassignedProducts: number,
    deletedSubcategories: number
  }
}
```

### **Upload API**

#### **All Endpoints Require Auth (Admin/Manager)**

```typescript
// Upload single image
POST /api/upload/image
Headers: 
  Authorization: Bearer <token>
  Content-Type: multipart/form-data
Body (FormData):
  image: File
  uploadType: 'categories' | 'products'
Response: {
  success: true,
  data: {
    filename: string,
    originalName: string,
    size: number,
    mimetype: string,
    url: string  // Full URL to access image
  }
}

// Upload multiple images
POST /api/upload/images
Headers: 
  Authorization: Bearer <token>
  Content-Type: multipart/form-data
Body (FormData):
  images: File[]
  uploadType: 'categories' | 'products'
Response: {
  success: true,
  data: {
    files: [
      {
        filename: string,
        originalName: string,
        size: number,
        mimetype: string,
        url: string
      }
    ],
    count: number
  }
}

// Delete image
DELETE /api/upload/image
Headers: Authorization: Bearer <token>
Body: {
  url: string  // Full URL of image to delete
}
Response: {
  success: true,
  message: "Image deleted successfully"
}
```

---

## 🔐 **Authentication Flow**

### **Admin Dashboard Login**

```typescript
// 1. User logs in
POST /api/auth/login
Body: {
  email: "admin@smd-tunisie.com",
  password: "password123"
}
Response: {
  success: true,
  data: {
    user: {
      id: string,
      email: string,
      firstName: string,
      lastName: string,
      role: "ADMIN" | "MANAGER" | "CUSTOMER"
    },
    token: string,  // JWT access token
    refreshToken: string
  }
}

// 2. Store token in localStorage
localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify(response.data.user));

// 3. Include token in all API requests
fetch('/api/categories', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// 4. Refresh token when expired
POST /api/auth/refresh
Body: {
  refreshToken: string
}
Response: {
  success: true,
  data: {
    token: string,
    refreshToken: string
  }
}
```

---

## 📸 **Image Upload Integration**

### **Admin Dashboard - Category Image Upload**

```typescript
// In CategoryModal component
const handleImageUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('uploadType', 'categories');

  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('http://localhost:3001/api/upload/image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();
    
    if (result.success) {
      // Use the returned URL
      setImageUrl(result.data.url);
      // Save category with this imageUrl
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### **Customer Frontend - Display Category Images**

```typescript
// In CategoryCard component
<img 
  src={category.imageUrl || '/placeholder.png'} 
  alt={category.name}
  className="w-full h-full object-cover"
/>
```

---

## 🔄 **Data Synchronization**

### **Admin Dashboard → Backend → Frontend**

```
1. Admin creates/updates category in dashboard
   ↓
2. Dashboard sends API request to backend
   POST /api/categories or PUT /api/categories/:id
   ↓
3. Backend validates and saves to PostgreSQL
   ↓
4. Backend returns updated data
   ↓
5. Dashboard updates local state
   ↓
6. Customer frontend fetches updated data
   GET /api/categories
   ↓
7. Frontend displays new/updated category
```

### **Real-Time Updates (Future Enhancement)**

For real-time synchronization, consider:
- **WebSockets**: Push updates to connected clients
- **Server-Sent Events (SSE)**: One-way server → client updates
- **Polling**: Frontend periodically fetches updates
- **Redis Pub/Sub**: Broadcast changes across instances

---

## 🎨 **Frontend Integration Examples**

### **Customer Frontend - Fetch Categories**

```typescript
// src/services/api.ts
const API_BASE_URL = 'http://localhost:3001/api';

export const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    throw new Error('Failed to fetch categories');
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const fetchSubcategories = async (parentId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${parentId}/subcategories`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    throw new Error('Failed to fetch subcategories');
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return [];
  }
};
```

### **Admin Dashboard - Create Category**

```typescript
// src/services/categoryService.ts
const API_BASE_URL = 'http://localhost:3001/api';

export const createCategory = async (categoryData: {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
}) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(categoryData)
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error.message);
    }
    
    return result.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (id: string, updates: Partial<Category>) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error.message);
    }
    
    return result.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string, cascade: boolean = false) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/categories/${id}?cascade=${cascade}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error.message);
    }
    
    return result.data;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};
```

---

## 🔧 **Environment Configuration**

### **Backend (.env)**

```env
# Server
PORT=3001
NODE_ENV=development
API_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/smd_hardware

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **Admin Dashboard (.env)**

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=SQB Admin Dashboard
```

### **Customer Frontend (.env)**

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=SQB Hardware Store
```

---

## 📦 **Data Migration from WooCommerce**

### **Migration Strategy**

```typescript
// migration/migrate-categories.ts
import { PrismaClient } from '@prisma/client';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

const prisma = new PrismaClient();
const WooCommerce = new WooCommerceRestApi({
  url: 'https://www.sqb-tunisie.com',
  consumerKey: process.env.WC_CONSUMER_KEY!,
  consumerSecret: process.env.WC_CONSUMER_SECRET!,
  version: 'wc/v3'
});

async function migrateCategories() {
  try {
    // 1. Fetch all categories from WooCommerce
    const { data: wcCategories } = await WooCommerce.get('products/categories', {
      per_page: 100
    });

    // 2. Migrate top-level categories first
    for (const wcCat of wcCategories.filter(c => c.parent === 0)) {
      await prisma.category.create({
        data: {
          name: wcCat.name,
          slug: wcCat.slug,
          description: wcCat.description || '',
          imageUrl: wcCat.image?.src || null,
          displayOrder: wcCat.menu_order,
          isActive: true
        }
      });
    }

    // 3. Migrate subcategories
    for (const wcCat of wcCategories.filter(c => c.parent !== 0)) {
      const parent = await prisma.category.findFirst({
        where: { slug: wcCategories.find(p => p.id === wcCat.parent)?.slug }
      });

      if (parent) {
        await prisma.category.create({
          data: {
            name: wcCat.name,
            slug: wcCat.slug,
            description: wcCat.description || '',
            imageUrl: wcCat.image?.src || null,
            parentId: parent.id,
            displayOrder: wcCat.menu_order,
            isActive: true
          }
        });
      }
    }

    console.log('✅ Categories migrated successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateCategories();
```

---

## 🧪 **Testing**

### **API Testing with curl**

```bash
# Get all categories (public)
curl http://localhost:3001/api/categories

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sqb-tunisie.com","password":"admin123"}'

# Create category (with auth)
curl -X POST http://localhost:3001/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Category","slug":"test-category","description":"Test"}'

# Upload image
curl -X POST http://localhost:3001/api/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  -F "uploadType=categories"
```

### **Frontend Testing**

```typescript
// Test category fetch
const testFetch = async () => {
  const categories = await fetchCategories();
  console.log('Categories:', categories);
};

// Test category creation
const testCreate = async () => {
  const newCategory = await createCategory({
    name: 'Test Category',
    slug: 'test-category',
    description: 'This is a test'
  });
  console.log('Created:', newCategory);
};
```

---

## 🚀 **Deployment Checklist**

### **Backend**
- [ ] Set production DATABASE_URL
- [ ] Generate strong JWT_SECRET
- [ ] Configure production CORS_ORIGIN
- [ ] Set up file storage (S3, Cloudinary, etc.)
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure logging (Winston, Sentry)
- [ ] Set up monitoring (PM2, New Relic)

### **Frontend (Customer)**
- [ ] Update VITE_API_URL to production backend
- [ ] Build production bundle
- [ ] Configure CDN for static assets
- [ ] Set up error tracking
- [ ] Enable analytics

### **Frontend (Admin)**
- [ ] Update VITE_API_URL to production backend
- [ ] Restrict access (IP whitelist, VPN)
- [ ] Build production bundle
- [ ] Set up admin-specific monitoring

---

## 📚 **Additional Resources**

- **Prisma Docs**: https://www.prisma.io/docs
- **Express.js Guide**: https://expressjs.com/
- **JWT Best Practices**: https://jwt.io/introduction
- **Multer (File Upload)**: https://github.com/expressjs/multer
- **React Query (Data Fetching)**: https://tanstack.com/query

---

**Built for SMD Tunisie Hardware Store** 🛠️

*Last Updated: October 29, 2025*
