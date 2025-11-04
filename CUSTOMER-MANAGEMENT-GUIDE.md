# Customer Management System - Complete Guide

## Overview

The Customer Management System allows administrators to create and manage customer accounts with commercial registration verification for Tunisian businesses. The system includes:

- **Customer Creation Form** with commercial registration (RNE) verification
- **Automatic Password Generation** and email delivery
- **Customer List** with search, filtering, and pagination
- **Customer Deletion** with soft-delete for customers with orders
- **Email Notifications** sent automatically to customers

---

## Features Implemented

### 1. Backend API (Node.js + Express + PostgreSQL)

#### Database Schema Updates
- Added customer business fields to User model:
  - `username` - Login username (unique)
  - `companyName` - Company name
  - `rneNumber` - Commercial Registration Number (RNE) - unique
  - `rnePdfUrl` - URL to uploaded RNE PDF document
  - `taxId` - Tax Identification Number
  - `customerType` - Customer category (Retailer, Wholesaler, etc.)

#### API Endpoints

**Base URL:** `http://localhost:3001/api/customers`

All endpoints require authentication and ADMIN/MANAGER role.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create new customer |
| GET | `/` | Get all customers (with pagination & filters) |
| GET | `/:id` | Get customer by ID |
| PUT | `/:id` | Update customer |
| DELETE | `/:id` | Delete customer |
| POST | `/:id/reset-password` | Reset customer password |

#### Email Service
- Automatic email delivery of credentials to customers
- Professional HTML email template in French
- Includes username, password, and security recommendations
- Configurable SMTP settings

### 2. Admin Dashboard (React + TypeScript)

#### Components Created

1. **CustomerForm.tsx**
   - Comprehensive form with all required fields
   - RNE PDF upload functionality
   - Auto-generate or manual password option
   - Address fields (optional)
   - Real-time validation

2. **CustomerList.tsx**
   - Table view with customer information
   - Company name and RNE number display
   - Link to view RNE PDF document
   - Order count display
   - Active/Inactive status indicators
   - View and Delete actions

3. **CredentialsModal.tsx**
   - Displays generated credentials after customer creation
   - Copy-to-clipboard functionality
   - Email confirmation message
   - Security warnings and recommendations

4. **CustomersPage.tsx**
   - Main page with search and filters
   - Pagination support
   - Create customer modal
   - Credentials display modal

---

## Setup Instructions

### 1. Database Migration

Run Prisma migration to update the database schema:

```bash
cd backend
npm run prisma:generate
npx prisma migrate dev --name add_customer_business_fields
```

### 2. Environment Configuration

Update your `.env` file with email configuration:

```env
# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_NAME=SMD Tunisie
SMTP_FROM_EMAIL=noreply@smd-tunisie.com
```

**For Gmail:**
1. Enable 2-Factor Authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password in `SMTP_PASSWORD`

### 3. Start the Backend

```bash
cd backend
npm run dev
```

### 4. Start the Admin Dashboard

```bash
cd admin-dashboard
npm run dev
```

Access at: http://localhost:5174

---

## Usage Guide

### Creating a Customer

1. **Navigate to Customers Page**
   - Click "Customers" in the sidebar
   - Click "Create Customer" button

2. **Fill Out the Form**

   **Personal Information:**
   - First Name (required)
   - Last Name (required)
   - Email (required)
   - Phone (optional)

   **Company Information:**
   - Company Name (required)
   - RNE Number (required) - Commercial Registration Number
   - Upload RNE PDF (optional but recommended)
   - Tax ID (optional)
   - Customer Type (Retailer, Wholesaler, Contractor, etc.)

   **Login Credentials:**
   - Username (auto-generated from email if empty)
   - Password (auto-generated or manual)

   **Address (Optional):**
   - Street, City, State, Postal Code, Country

3. **Submit the Form**
   - Click "Create Customer"
   - System will:
     - Upload RNE PDF (if provided)
     - Create customer account
     - Generate secure password (if auto-generate selected)
     - Send credentials via email
     - Display credentials to admin

4. **Save Credentials**
   - Copy username and password
   - Share with customer if needed
   - Email is automatically sent to customer

### Viewing Customers

**Search & Filter:**
- Search by name, email, company name, or RNE number
- Filter by customer type
- Filter by active/inactive status
- Clear all filters button

**Customer List Displays:**
- Full name, email, phone
- Company name
- RNE number with PDF link
- Customer type badge
- Order count
- Active/Inactive status

### Deleting a Customer

1. Click "Delete" button next to customer
2. Confirm deletion
3. System behavior:
   - **Has orders:** Customer is deactivated (soft delete)
   - **No orders:** Customer is permanently deleted

---

## API Request Examples

### Create Customer

```bash
curl -X POST http://localhost:3001/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "firstName": "Ahmed",
    "lastName": "Ben Ali",
    "phone": "+216 12 345 678",
    "companyName": "ABC Trading",
    "rneNumber": "B123456789",
    "taxId": "1234567X",
    "customerType": "Wholesaler",
    "address": {
      "street": "123 Avenue Habib Bourguiba",
      "city": "Tunis",
      "postalCode": "1000",
      "country": "Tunisia"
    }
  }'
```

### Get All Customers

```bash
curl -X GET "http://localhost:3001/api/customers?page=1&limit=20&search=ahmed" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Delete Customer

```bash
curl -X DELETE http://localhost:3001/api/customers/CUSTOMER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Email Template

The system sends a professional email in French to customers with:

- Welcome message
- Company name (if provided)
- Login credentials (username, password, email)
- Security recommendations
- Important warnings about password safety

---

## Security Features

1. **Password Security**
   - Auto-generated passwords are 12 characters with mixed case, numbers, and symbols
   - Passwords are hashed with bcrypt before storage
   - Passwords are never stored in plain text

2. **Access Control**
   - All customer management endpoints require authentication
   - Only ADMIN and MANAGER roles can access
   - JWT token-based authentication

3. **Data Validation**
   - Email uniqueness check
   - Username uniqueness check
   - RNE number uniqueness check
   - File type validation for PDF uploads
   - File size limit (5MB)

4. **Email Security**
   - Credentials sent via secure SMTP
   - Email delivery confirmation
   - Fallback if email fails (admin still gets credentials)

---

## Customer Types

Available customer types:
- **Retailer** - Retail businesses
- **Wholesaler** - Wholesale distributors
- **Contractor** - Construction contractors
- **Industrial** - Industrial companies
- **Individual** - Individual professionals
- **Other** - Other business types

---

## Troubleshooting

### Email Not Sending

1. Check SMTP configuration in `.env`
2. Verify Gmail App Password (if using Gmail)
3. Check backend console for email errors
4. Ensure SMTP port is not blocked by firewall

### Customer Creation Fails

1. Check for duplicate email/username/RNE
2. Verify all required fields are filled
3. Check backend logs for detailed error
4. Ensure database connection is active

### PDF Upload Fails

1. Verify file is PDF format
2. Check file size (must be < 5MB)
3. Ensure uploads directory exists and is writable
4. Check backend upload service configuration

---

## File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── customer.controller.ts    # Customer CRUD operations
│   ├── routes/
│   │   └── customer.routes.ts        # Customer API routes
│   ├── services/
│   │   └── email.service.ts          # Email sending service
│   └── server.ts                     # Route registration
├── prisma/
│   └── schema.prisma                 # Updated with customer fields
└── .env.example                      # Environment variables template

admin-dashboard/
├── src/
│   ├── components/
│   │   ├── CustomerForm.tsx          # Customer creation form
│   │   ├── CustomerList.tsx          # Customer list table
│   │   └── CredentialsModal.tsx      # Credentials display modal
│   ├── pages/
│   │   └── CustomersPage.tsx         # Main customer management page
│   └── services/
│       └── customerService.ts        # API client for customers
```

---

## Next Steps

### Recommended Enhancements

1. **Customer Details Modal**
   - View full customer information
   - Edit customer details
   - View order history

2. **Password Reset**
   - Admin can reset customer password
   - Send new password via email

3. **Customer Import**
   - Bulk import from CSV/Excel
   - Validate and create multiple customers

4. **Advanced Reporting**
   - Customer statistics
   - Order analytics per customer
   - Revenue by customer type

5. **Document Management**
   - Store multiple documents per customer
   - Document expiry tracking
   - Renewal notifications

---

## Support

For issues or questions:
1. Check backend logs: `backend/logs/`
2. Check browser console for frontend errors
3. Verify API endpoints with Postman/curl
4. Review this documentation

---

## License

This customer management system is part of the SMD Tunisie e-commerce platform.

**Company:** SMD Tunisie  
**Domain:** www.smd-tunisie.com  
**Currency:** Tunisian Dinar (TND)
