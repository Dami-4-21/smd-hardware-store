# 🚀 SMD Tunisie - Complete Local Development & Testing Guide

## 📋 **Table of Contents**
1. [What is This Project?](#what-is-this-project)
2. [Prerequisites - Installing Required Software](#prerequisites---installing-required-software)
3. [Initial Setup - Backend](#initial-setup---backend)
4. [Initial Setup - Customer Frontend](#initial-setup---customer-frontend)
5. [Initial Setup - Admin Dashboard](#initial-setup---admin-dashboard)
6. [Running Everything](#running-everything)
7. [Testing Everything Works](#testing-everything-works)
8. [Application URLs](#application-urls)
9. [Testing Workflow](#testing-workflow)
10. [Troubleshooting](#troubleshooting)

---

## 📚 **What is This Project?**

You have **3 separate applications** that work together:

1. **Backend API** (The Brain 🧠)
   - Stores data in a database
   - Handles login, products, orders
   - Like a restaurant kitchen - prepares everything

2. **Customer Frontend** (The Store 🛍️)
   - What customers see
   - Browse products, add to cart, checkout
   - Like a restaurant dining area - where customers eat

3. **Admin Dashboard** (The Control Panel ⚙️)
   - Where you manage everything
   - Add products, manage orders, view customers
   - Like a restaurant manager's office

---

## ✅ **Prerequisites - Installing Required Software**

Before you can run the project, you need to install some programs on your computer.

### **Step 1: Install Node.js**

**What is Node.js?**
- It's like a translator that lets your computer understand JavaScript code
- Your project is written in JavaScript/TypeScript
- Without Node.js, your computer can't run the code

**How to install:**

1. **Go to:** https://nodejs.org/
2. **Click:** The big green button that says "Download" (usually shows "LTS")
3. **Run the installer** (the file you just downloaded)
4. **Click "Next"** through all the steps
5. **Click "Finish"**

**How to check if it worked:**

1. **Open Terminal** (also called Command Prompt):
   - **Windows:** Press `Windows + R`, type `cmd`, press Enter
   - **Mac:** Press `Cmd + Space`, type `terminal`, press Enter
   - **Linux:** Press `Ctrl + Alt + T`

2. **Type this and press Enter:**
   ```bash
   node --version
   ```

3. **You should see:** Something like `v18.17.0` or `v20.10.0`
   - If you see this, ✅ **Success!**
   - If you see "command not found", ❌ **Try installing again**

---

### **Step 2: Install PostgreSQL (Database)**

**What is PostgreSQL?**
- It's a database - a place to store all your data
- Like a filing cabinet for your products, customers, orders
- Without it, your app has nowhere to save information

**How to install:**

#### **For Windows:**
1. **Go to:** https://www.postgresql.org/download/windows/
2. **Click:** "Download the installer"
3. **Choose:** Latest version (e.g., PostgreSQL 15)
4. **Run the installer**
5. **Important:** When it asks for a password, remember it! (e.g., `postgres123`)
6. **Keep clicking "Next"**
7. **Finish installation**

#### **For Mac:**
1. **First, install Homebrew** (a package manager):
   - Open Terminal
   - Paste this and press Enter:
     ```bash
     /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
     ```
   - Wait for it to finish (takes 5-10 minutes)

2. **Then install PostgreSQL:**
   ```bash
   brew install postgresql@15
   brew services start postgresql@15
   ```

#### **For Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**How to check if it worked:**

```bash
psql --version
```

**You should see:** `psql (PostgreSQL) 15.x`

---

### **Step 3: Create Your Database**

**What is this doing?**
- Creating a "container" to store your app's data
- Like creating a new folder for your files

#### **🐧 Linux (Ubuntu/Debian) - Using Terminal:**

**Step-by-step instructions:**

1. **Open Terminal** (Press `Ctrl + Alt + T`)

2. **Switch to PostgreSQL user:**
   ```bash
   sudo -u postgres psql
   ```
   **What this does:** Logs you into PostgreSQL as the admin user

3. **You'll see a prompt like:** `postgres=#`
   This means you're inside PostgreSQL!

4. **Create the database:**
   ```sql
   CREATE DATABASE smd_hardware;
   ```
   **Press Enter** - You'll see: `CREATE DATABASE`

5. **Create a user with password:**
   ```sql
   CREATE USER smd_user WITH ENCRYPTED PASSWORD 'mypassword123';
   ```
   **Press Enter** - You'll see: `CREATE ROLE`
   
   **⚠️ Important:** Remember this password! You'll need it later.

6. **Give the user permissions:**
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE smd_hardware TO smd_user;
   ```
   **Press Enter** - You'll see: `GRANT`

7. **Exit PostgreSQL:**
   ```sql
   \q
   ```
   **Press Enter** - You're back to normal terminal

**✅ Success!** Your database is ready.

**What each command does:**
- `CREATE DATABASE` = Makes a new database named `smd_hardware`
- `CREATE USER` = Makes a username (`smd_user`) and password to access it
- `GRANT ALL PRIVILEGES` = Gives that user full permission to use the database
- `\q` = Quit PostgreSQL

---

#### **Windows/Mac - Using pgAdmin (Graphical Interface):**

1. **Open pgAdmin 4** (installed with PostgreSQL)
2. **Enter your password** (the one you set during installation)
3. **Right-click "Databases"** in the left sidebar
4. **Click "Create" → "Database"**
5. **Name it:** `smd_hardware`
6. **Click "Save"**

---

## 🔧 **Initial Setup - Backend**

Now we'll set up the backend - the part that handles all the logic.

### **Step 1: Open Terminal in Backend Folder**

**What is a terminal?**
- A text-based way to give commands to your computer
- Like typing instructions instead of clicking buttons

**How to open terminal in the right folder:**

#### **Windows:**
1. **Open File Explorer**
2. **Navigate to:** `C:\Users\YourName\Documents\theBricoHouse\UpdatedCatalog\project-20251027T071334Z-1-001\project\backend`
3. **Click in the address bar** (where the path is shown)
4. **Type:** `cmd` and press Enter
5. **Terminal opens in that folder!**

#### **Mac/Linux:**
1. **Open Terminal**
2. **Type:**
   ```bash
   cd /home/cube/Documents/theBricoHouse/UpdatedCatalog/project-20251027T071334Z-1-001/project/backend
   ```
3. **Press Enter**

**How to verify you're in the right place:**
```bash
pwd
```
Should show the backend folder path.

---

### **Step 2: Install Dependencies**

**What are dependencies?**
- Libraries and tools your code needs to work
- Like ingredients for a recipe
- Your code uses other people's code to work faster

**Command:**
```bash
npm install
```

**What happens:**
- Downloads ~200 packages from the internet
- Takes 2-3 minutes
- Creates a folder called `node_modules` (don't touch this!)
- You'll see lots of text scrolling - that's normal

**When it's done, you'll see:**
```
added 543 packages in 2m
```

✅ **Success!** All dependencies installed.

---

### **Step 3: Create Environment File**

**What is an environment file (.env)?**
- A file that stores secret settings
- Like a configuration file
- Contains passwords, API keys, etc.
- **Never share this file publicly!**

**Command:**
```bash
cp .env.example .env
```

**What this does:**
- `cp` = copy
- `.env.example` = template file (safe to share)
- `.env` = your actual secrets (keep private)
- Makes a copy of the template for you to edit

---

### **Step 4: Edit the .env File**

**How to open and edit:**

#### **Windows:**
1. **Right-click** `.env` file in File Explorer
2. **Choose:** "Open with" → "Notepad"

#### **Mac:**
```bash
nano .env
```

#### **Linux:**
```bash
nano .env
```

**What to change:**

```env
# 1. DATABASE CONNECTION
DATABASE_URL="postgresql://smd_user:mypassword123@localhost:5432/smd_hardware?schema=public"
```
**Change `mypassword123` to the password you set for PostgreSQL**

```env
# 2. JWT SECRETS (for security)
JWT_SECRET=abc123xyz789randomstring
JWT_REFRESH_SECRET=def456uvw012anotherrandom
```
**Change these to random strings** (just mash your keyboard!)

**How to generate better random strings:**
```bash
openssl rand -base64 32
```
Copy the output and paste it as your JWT_SECRET.

```env
# 3. ADMIN PASSWORD
ADMIN_PASSWORD=MySecurePassword123!
```
**Change this to a strong password** (you'll use this to login)

**Save the file:**
- **Notepad:** File → Save
- **Nano:** Press `Ctrl + O`, then Enter, then `Ctrl + X`

---

### **Step 5: Generate Prisma Client**

**What is Prisma?**
- A tool that talks to your database
- Converts your database tables into JavaScript code
- Makes it easy to read/write data

**Command:**
```bash
npm run prisma:generate
```

**What happens:**
- Reads your database schema
- Creates TypeScript code
- Takes 10-20 seconds

**You'll see:**
```
✔ Generated Prisma Client
```

✅ **Success!**

---

### **Step 6: Create Database Tables**

**What are database tables?**
- Like Excel spreadsheets
- Each table stores different data (users, products, orders)
- Tables have columns (name, email, price, etc.)

**Command:**
```bash
npm run prisma:migrate
```

**What happens:**
- Creates all tables in your database
- Sets up relationships between tables
- Takes 5-10 seconds

**You'll see:**
```
✔ Applied 1 migration(s)
```

**What tables were created:**
- `users` - stores customer/admin accounts
- `categories` - product categories
- `products` - your products
- `orders` - customer orders
- And 8 more tables!

✅ **Success!** Database is ready.

---

### **Step 7: Add Initial Data (Seeding)**

**What is seeding?**
- Adding starter data to your empty database
- Like putting sample products in a new store
- Creates an admin account for you

**Command:**
```bash
npm run seed
```

**What happens:**
- Creates admin user (email: admin@smd-tunisie.com)
- Might add sample categories
- Takes 2-3 seconds

**You'll see:**
```
✅ Admin user created
✅ Database seeded successfully
```

✅ **Success!** You now have an admin account.

---

## 🛍️ **Initial Setup - Customer Frontend**

Now let's set up the customer-facing website.

### **Step 1: Open New Terminal in Project Folder**

**Important:** Don't close the backend terminal! Open a **NEW** terminal.

**Navigate to project root:**
```bash
cd /home/cube/Documents/theBricoHouse/UpdatedCatalog/project-20251027T071334Z-1-001/project
```

---

### **Step 2: Install Dependencies**

```bash
npm install
```

Same as before - downloads packages. Takes 1-2 minutes.

---

### **Step 3: Create Environment File**

```bash
echo "VITE_API_URL=http://localhost:3001/api" > .env.local
```

**What this does:**
- Creates a file called `.env.local`
- Tells the frontend where the backend is
- `localhost:3001` = your computer, port 3001

---

## ⚙️ **Initial Setup - Admin Dashboard**

One more app to set up!

### **Step 1: Open ANOTHER New Terminal**

**Important:** You now need **3 terminals total**:
1. Backend (from previous section)
2. Customer Frontend (from previous section)
3. Admin Dashboard (this one)

**Navigate to admin dashboard:**
```bash
cd /home/cube/Documents/theBricoHouse/UpdatedCatalog/project-20251027T071334Z-1-001/project/admin-dashboard
```

---

### **Step 2: Install Dependencies**

```bash
npm install
```

Takes 1-2 minutes.

---

### **Step 3: Create Environment File**

```bash
echo "VITE_API_URL=http://localhost:3001/api" > .env.local
```

Same as customer frontend - points to backend.

---

## 🚀 **Running Everything**

Now the fun part - starting all 3 apps!

### **Terminal 1: Start Backend**

**In the backend terminal:**
```bash
npm run dev
```

**What happens:**
- Starts the backend server
- Listens on port 3001
- Connects to database
- Waits for requests

**You'll see:**
```
🚀 Server running on http://localhost:3001
📦 Database connected
✅ Ready to accept requests
```

**✅ Leave this terminal running!** Don't close it.

---

### **Terminal 2: Start Customer Frontend**

**In the project root terminal:**
```bash
npm run dev
```

**What happens:**
- Starts the customer website
- Listens on port 5173
- Hot-reloads when you change code

**You'll see:**
```
  VITE v5.4.2  ready in 500 ms

  ➜  Local:   http://localhost:5173/
```

**✅ Leave this terminal running!**

---

### **Terminal 3: Start Admin Dashboard**

**In the admin-dashboard terminal:**
```bash
npm run dev
```

**What happens:**
- Starts the admin panel
- Listens on port 5174

**You'll see:**
```
  VITE v5.4.2  ready in 500 ms

  ➜  Local:   http://localhost:5174/
```

**✅ Leave this terminal running!**

---

## 🧪 **Testing Everything Works**

Now let's verify everything is working!

### **Test 1: Check Backend is Running**

**Open your web browser** (Chrome, Firefox, etc.)

**Go to:** http://localhost:3001/api/health

**You should see:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-31T15:52:00.000Z"
}
```

✅ **Backend is working!**

---

### **Test 2: Login to Admin Dashboard**

**Go to:** http://localhost:5174

**You should see:** A login page

**Enter:**
- Email: `admin@smd-tunisie.com`
- Password: (the password you set in `.env`)

**Click:** Login

**You should see:** Dashboard with sidebar (Categories, Products, Customers, etc.)

✅ **Admin dashboard is working!**

---

### **Test 3: Create a Category**

**In the admin dashboard:**

1. **Click** "Categories" in the left sidebar
2. **Click** "Add Category" button (top right)
3. **Fill in:**
   - Name: `Test Tools`
   - Description: `Testing category`
   - Slug: `test-tools` (auto-fills)
4. **Click** "Upload Image" (optional)
5. **Click** "Save"

**You should see:** Your new category in the list

✅ **Category creation works!**

---

### **Test 4: View Customer Frontend**

**Go to:** http://localhost:5173

**You should see:**
- Homepage
- Your "Test Tools" category
- Navigation menu

**Click on the category** - it should open

✅ **Customer frontend is working!**

---

## 🎉 **Congratulations!**

You've successfully:
- ✅ Installed all required software
- ✅ Set up the database
- ✅ Configured all 3 applications
- ✅ Started all servers
- ✅ Created your first category
- ✅ Verified everything works

---

## 📝 **What Each Terminal Does**

```
Terminal 1 (Backend)
├─ Handles API requests
├─ Talks to database
├─ Processes login, products, orders
└─ Must stay running

Terminal 2 (Customer Frontend)
├─ Shows the store website
├─ Sends requests to backend
├─ Updates automatically when you edit code
└─ Must stay running

Terminal 3 (Admin Dashboard)
├─ Shows the admin panel
├─ Sends requests to backend
├─ Updates automatically when you edit code
└─ Must stay running
```

---

## 🔄 **Daily Workflow**

**Every time you want to work on the project:**

1. **Open 3 terminals**
2. **Terminal 1:** `cd backend && npm run dev`
3. **Terminal 2:** `cd project && npm run dev`
4. **Terminal 3:** `cd admin-dashboard && npm run dev`
5. **Make changes to code**
6. **Browser auto-refreshes** - see changes immediately!

**When you're done:**
- Press `Ctrl + C` in each terminal to stop
- Or just close the terminals

---

## ❓ **Common Questions**

**Q: Do I need to run `npm install` every time?**
A: No! Only once, or when you add new packages.

**Q: Do I need to run migrations every time?**
A: No! Only when the database schema changes.

**Q: Can I close the terminals?**
A: Not while working! The apps stop when you close terminals.

**Q: What if I see errors?**
A: Check the troubleshooting section below, or ask for help!

**Q: How do I stop the servers?**
A: Press `Ctrl + C` in each terminal.

---

## 🌐 Application URLs

### 1. **Customer Frontend** (Main Store)
- **URL**: http://localhost:5175/app/
- **Purpose**: Customer-facing e-commerce store
- **Features**:
  - Browse products by category
  - Search products
  - Add to cart
  - View product details with size tables
  - Checkout process
  - Responsive design

### 2. **Admin Dashboard**
- **URL**: http://localhost:5174
- **Purpose**: Admin management panel
- **Login Credentials**:
  - Email: `admin@smd-tunisie.com`
  - Password: `admin123`
- **Features**:
  - ✅ Customer Management (NEW!)
  - ✅ Category Management
  - ✅ Product Creation
  - ⏳ Order Management (Coming soon)
  - ⏳ Analytics (Coming soon)

### 3. **Backend API**
- **URL**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **API Base**: http://localhost:3001/api
- **Purpose**: REST API server
- **Database**: PostgreSQL (smd_hardware)

---

## 🧪 Testing Workflow

### Phase 1: Admin Dashboard Testing

#### 1. **Login to Admin**
1. Go to http://localhost:5174
2. Login with:
   - Email: `admin@smd-tunisie.com`
   - Password: `admin123`

#### 2. **Test Customer Management** ✨ NEW FEATURE
1. Click "Customers" in sidebar
2. Click "Create Customer" button
3. Fill out the form:
   - **Personal Info**: Name, Email, Phone
   - **Company Info**: Company Name, RNE Number, Tax ID
   - **Upload RNE PDF** (optional)
   - **Customer Type**: Select type (Wholesaler, Retailer, etc.)
   - **Login Credentials**: Auto-generate or manual password
4. Submit form
5. **View Generated Credentials** in modal
6. **Copy credentials** for customer login
7. **Test Search/Filter**: Search by name, email, company, RNE
8. **Test Delete**: Delete a test customer

#### 3. **Test Category Management**
1. Click "Categories" in sidebar
2. Create a test category:
   - Name: "Test Category"
   - Description: "For testing"
   - Upload an image
3. Create a subcategory
4. Edit category
5. Delete test category

#### 4. **Test Product Creation**
1. Click "Products" in sidebar
2. Click "Create Product"
3. Fill out product form:
   - Basic info (name, SKU, price)
   - Select category
   - Upload images
   - Add specifications
   - Add size table (optional)
4. Save product

### Phase 2: Customer Frontend Testing

#### 1. **Browse Store**
1. Go to http://localhost:5175/app/
2. Browse categories
3. Click on a category to view products
4. Search for products

#### 2. **Product Details**
1. Click on a product
2. View product details
3. Check size table (if available)
4. Select size/options
5. Add to cart

#### 3. **Shopping Cart**
1. View cart
2. Update quantities
3. Remove items
4. View totals

#### 4. **Checkout Process**
1. Click "Checkout"
2. Fill customer information
3. Fill shipping address
4. Select payment method
5. Review order
6. Place order

### Phase 3: API Testing

#### Test API Endpoints Directly

**Health Check:**
```bash
curl http://localhost:3001/health
```

**Get Categories:**
```bash
curl http://localhost:3001/api/categories
```

**Login (Get Token):**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smd-tunisie.com",
    "password": "admin123"
  }'
```

**Get Customers (with token):**
```bash
TOKEN="your-token-here"
curl http://localhost:3001/api/customers \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📋 Test Scenarios

### Scenario 1: Complete Customer Onboarding
1. **Admin creates customer** with RNE verification
2. **System generates credentials** and sends email
3. **Customer receives email** with login info
4. **Customer logs in** to frontend
5. **Customer browses** and places order
6. **Admin views order** in dashboard

### Scenario 2: Product Management
1. **Admin creates categories** (hierarchy)
2. **Admin uploads products** with images
3. **Admin adds size tables** for products
4. **Customer views products** on frontend
5. **Customer filters** by category
6. **Customer searches** for products

### Scenario 3: Order Processing
1. **Customer adds items** to cart
2. **Customer proceeds** to checkout
3. **Customer fills** shipping info
4. **Customer places** order
5. **Admin receives** order notification
6. **Admin processes** order

---

## 🐛 Troubleshooting

### Backend Not Running
```bash
cd backend
npm run dev
```

### Admin Dashboard Not Running
```bash
cd admin-dashboard
npm run dev
```

### Customer Frontend Not Running
```bash
cd project
npm run dev
```

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Port Already in Use
```bash
# Kill process on port 3001 (backend)
sudo lsof -ti:3001 | xargs kill -9

# Kill process on port 5174 (admin)
sudo lsof -ti:5174 | xargs kill -9

# Kill process on port 5175 (frontend)
sudo lsof -ti:5175 | xargs kill -9
```

### Clear Browser Cache
- Press `Ctrl + Shift + R` (hard refresh)
- Or clear localStorage in DevTools

---

## 📊 Database Access

### View Database with Prisma Studio
```bash
cd backend
npx prisma studio
```
Opens at: http://localhost:5555

### Direct PostgreSQL Access
```bash
psql -U smd_user -d smd_hardware
```

---

## 🔧 Development Commands

### Backend
```bash
cd backend

# Start dev server
npm run dev

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npm run prisma:generate

# View database
npx prisma studio

# Create admin user
npx tsx create-admin.ts
```

### Admin Dashboard
```bash
cd admin-dashboard

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Customer Frontend
```bash
cd project

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📝 Test Data

### Admin Account
- Email: `admin@smd-tunisie.com`
- Password: `admin123`
- Role: ADMIN

### Test Customer (Create via Admin Dashboard)
- Name: Ahmed Ben Ali
- Email: ahmed@example.com
- Company: ABC Trading
- RNE: B123456789
- Type: Wholesaler

### Test Categories
- Power Tools
  - Drills
  - Saws
- Hand Tools
  - Hammers
  - Screwdrivers
- Electrical
  - Cables
  - Switches

---

## ✅ Feature Checklist

### Backend API
- [x] Authentication & Authorization
- [x] Category CRUD
- [x] Customer Management
- [x] File Upload
- [x] Email Service
- [ ] Product CRUD (placeholder)
- [ ] Order Management (pending)
- [ ] Analytics (pending)

### Admin Dashboard
- [x] Login/Logout
- [x] Category Management
- [x] Customer Management (NEW!)
- [x] Product Creation Form
- [x] Image Upload
- [ ] Order Management (pending)
- [ ] Analytics Dashboard (pending)

### Customer Frontend
- [x] Category Browsing
- [x] Product Listing
- [x] Product Details
- [x] Shopping Cart
- [x] Size Tables
- [x] Search
- [x] Checkout Form
- [ ] Customer Login (pending)
- [ ] Order History (pending)

---

## 🚀 Next Steps

### Immediate (Today)
1. ✅ Test customer creation workflow
2. ✅ Test category management
3. ✅ Test product browsing
4. ⏳ Test checkout process

### Short-term (This Week)
1. Implement product controller
2. Implement order controller
3. Add customer login to frontend
4. Add order history
5. Test complete order flow

### Medium-term (Next Week)
1. Add payment gateway integration
2. Add email notifications for orders
3. Add order tracking
4. Add analytics dashboard
5. Optimize performance

### Long-term (Next Month)
1. Deploy to production
2. Add product reviews
3. Add wishlist feature
4. Add advanced reporting
5. Add mobile app

---

## 📞 Support

If you encounter any issues during testing:

1. **Check Console Logs**: Browser DevTools Console (F12)
2. **Check Backend Logs**: Terminal running backend
3. **Check Database**: Use Prisma Studio
4. **Review Documentation**: See other MD files in project
5. **Test API Directly**: Use curl or Postman

---

## 🎉 Success Criteria

Your local testing is successful when you can:

- ✅ Login to admin dashboard
- ✅ Create a customer with RNE verification
- ✅ View generated credentials
- ✅ Create categories with images
- ✅ Create products
- ✅ Browse products on frontend
- ✅ Add products to cart
- ✅ Complete checkout process
- ✅ View orders in admin (when implemented)

---

**Happy Testing! 🚀**

*SMD Tunisie E-commerce Platform*  
*Version: 1.0.0-beta*  
*Last Updated: October 30, 2025*
