# 🔍 B2B Credit Limit & Quotation System - Feasibility Analysis

## Executive Summary

**Status**: ✅ **FEASIBLE** - The proposed B2B Credit Limit and Quotation/Approval Flow is compatible with your existing architecture.

**Complexity**: Medium-High (Requires changes across all tiers)

**Estimated Development Time**: 2-3 weeks

**Risk Level**: Low-Medium (Well-structured, no architectural conflicts)

---

## 📊 Current System Architecture

### ✅ **What You Already Have:**

1. **User Management**
   - ✅ User roles (ADMIN, MANAGER, CUSTOMER)
   - ✅ Business information fields (companyName, rneNumber, taxId, customerType)
   - ✅ Authentication & authorization system

2. **Order System**
   - ✅ Complete order flow (Order, OrderItem, OrderStatusHistory)
   - ✅ Payment methods enum (CASH_ON_DELIVERY, BANK_TRANSFER, CREDIT_CARD)
   - ✅ Payment status tracking (PENDING, PAID, FAILED, REFUNDED)
   - ✅ Order status workflow (PENDING → PROCESSING → SHIPPED → DELIVERED)

3. **Product Catalog**
   - ✅ Products with variants (sizes, pack sizes)
   - ✅ Stock management
   - ✅ Pricing system

4. **Frontend Dashboards**
   - ✅ Admin dashboard (React + Tailwind)
   - ✅ Customer shop (React + Tailwind)
   - ✅ Authentication flows

---

## 🎯 Required Changes - Refined for Your System

### 1. 🗄️ **Database Schema Updates**

#### A. **Update `User` Model** (Add Financial Fields)

```prisma
model User {
  // ... existing fields ...
  
  // B2B Financial Fields
  financialLimit      Decimal?  @default(0) @db.Decimal(10, 2) @map("financial_limit")
  currentOutstanding  Decimal?  @default(0) @db.Decimal(10, 2) @map("current_outstanding")
  paymentTerm         PaymentTerm? @map("payment_term")
  accountStatus       AccountStatus @default(COMMERCIAL_IN_PROCESS) @map("account_status")
  
  // Relations
  quotations          Quotation[]
}

enum PaymentTerm {
  NET_30    // 30 days
  NET_60    // 60 days
  NET_90    // 90 days
  NET_120   // 120 days
  IMMEDIATE // Cash on delivery
}

enum AccountStatus {
  COMMERCIAL_IN_PROCESS    // New customer, under review
  FINANCIAL_IN_PROCESS     // Approved for ordering, credit being set up
  ACTIVE                   // Fully approved, can place orders
  FINANCIAL_NON_CURRENT    // Overdue payments, restricted
  SUSPENDED                // Account suspended
}
```

**Why This Works:**
- ✅ Extends existing User model without breaking current functionality
- ✅ Uses Decimal for precise financial calculations
- ✅ Nullable fields allow gradual migration (existing customers default to null)
- ✅ Enums provide type safety and clear business rules

---

#### B. **New `Quotation` Model**

```prisma
model Quotation {
  id                      String          @id @default(uuid())
  quotationNumber         String          @unique @map("quotation_number")
  userId                  String          @map("user_id")
  status                  QuotationStatus @default(DRAFT)
  
  // Financial Data
  subtotal                Decimal         @db.Decimal(10, 2)
  taxAmount               Decimal         @map("tax_amount") @db.Decimal(10, 2)
  totalAmount             Decimal         @map("total_amount") @db.Decimal(10, 2)
  anticipatedOutstanding  Decimal         @map("anticipated_outstanding") @db.Decimal(10, 2)
  
  // Shipping Info (same as Order)
  shippingAddressId       String?         @map("shipping_address_id")
  shippingAddress         String?         @map("shipping_address") @db.Text
  
  // Admin Decision
  adminDecisionReason     String?         @map("admin_decision_reason") @db.Text
  reviewedBy              String?         @map("reviewed_by") // Admin user ID
  reviewedAt              DateTime?       @map("reviewed_at")
  
  // Conversion Tracking
  convertedToOrderId      String?         @unique @map("converted_to_order_id")
  
  notes                   String?         @db.Text
  createdAt               DateTime        @default(now()) @map("created_at")
  updatedAt               DateTime        @updatedAt @map("updated_at")
  
  // Relations
  user                    User            @relation(fields: [userId], references: [id])
  shippingAddr            Address?        @relation(fields: [shippingAddressId], references: [id])
  items                   QuotationItem[]
  convertedOrder          Order?          @relation(fields: [convertedToOrderId], references: [id])
  reviewer                User?           @relation("ReviewedQuotations", fields: [reviewedBy], references: [id])
  
  @@map("quotations")
}

enum QuotationStatus {
  DRAFT                 // Customer is building the quote
  PENDING_APPROVAL      // Submitted, waiting for admin review
  APPROVED              // Admin approved
  DECLINED              // Admin declined
  CONVERTED_TO_ORDER    // Successfully converted to order
  EXPIRED               // Quote expired (optional feature)
}

model QuotationItem {
  id                  String    @id @default(uuid())
  quotationId         String    @map("quotation_id")
  productId           String    @map("product_id")
  productName         String    @map("product_name")
  productSku          String?   @map("product_sku")
  selectedSize        String?   @map("selected_size")
  selectedUnitType    String?   @map("selected_unit_type")
  quantity            Int
  unitPrice           Decimal   @map("unit_price") @db.Decimal(10, 2)
  totalPrice          Decimal   @map("total_price") @db.Decimal(10, 2)
  
  quotation           Quotation @relation(fields: [quotationId], references: [id], onDelete: Cascade)
  product             Product   @relation(fields: [productId], references: [id])
  
  @@map("quotation_items")
}
```

**Why This Works:**
- ✅ Mirrors your existing Order/OrderItem structure (easy to understand & maintain)
- ✅ Tracks the complete approval workflow
- ✅ Links back to converted order for audit trail
- ✅ Stores snapshot of financial state at submission time

---

#### C. **Update `Order` Model** (Add Quotation Link)

```prisma
model Order {
  // ... existing fields ...
  
  // B2B Enhancements
  quotationId         String?       @unique @map("quotation_id")
  paymentTerm         PaymentTerm?  @map("payment_term")
  dueDate             DateTime?     @map("due_date")
  
  // Relations
  sourceQuotation     Quotation?
  convertedFromQuote  Quotation?    @relation("ConvertedOrder")
}
```

**Why This Works:**
- ✅ Minimal changes to existing Order model
- ✅ Optional fields preserve backward compatibility
- ✅ Clear audit trail from quote → order

---

### 2. 🔌 **Backend API Updates**

#### **New Endpoints Required:**

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `POST` | `/api/quotations` | CUSTOMER | Create quotation from cart |
| `GET` | `/api/quotations` | CUSTOMER/ADMIN | List quotations (filtered by user/status) |
| `GET` | `/api/quotations/:id` | CUSTOMER/ADMIN | Get quotation details |
| `PUT` | `/api/quotations/:id` | CUSTOMER | Update draft quotation |
| `POST` | `/api/quotations/:id/submit` | CUSTOMER | Submit for approval |
| `PUT` | `/api/quotations/:id/approve` | ADMIN/MANAGER | **CRITICAL** - Approve & convert to order |
| `PUT` | `/api/quotations/:id/decline` | ADMIN/MANAGER | Decline quotation |
| `DELETE` | `/api/quotations/:id` | CUSTOMER | Delete draft quotation |

#### **Modified Endpoints:**

| Method | Endpoint | Change |
|--------|----------|--------|
| `POST` | `/api/orders` | **Keep as-is** for backward compatibility, but add check: if user has `accountStatus !== ACTIVE`, redirect to quotation flow |

---

#### **Critical Logic: Approve Quotation Flow**

```typescript
// PUT /api/quotations/:id/approve
export const approveQuotation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUserId = req.user?.id;
    
    // 1. Authorization Check
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // 2. Fetch Quotation with Customer Data
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        user: true,
        items: { include: { product: true } },
        shippingAddr: true,
      },
    });
    
    if (!quotation || quotation.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({ error: 'Invalid quotation state' });
    }
    
    // 3. Credit Limit Check (Warning, not blocking)
    const customer = quotation.user;
    const anticipatedOutstanding = 
      (customer.currentOutstanding || 0) + quotation.totalAmount;
    
    const creditWarning = anticipatedOutstanding > (customer.financialLimit || 0);
    
    // 4. Convert to Order (Transaction)
    const result = await prisma.$transaction(async (tx) => {
      // Create Order
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: customer.id,
          customerName: `${customer.firstName} ${customer.lastName}`,
          customerEmail: customer.email,
          customerPhone: customer.phone || '',
          shippingAddressId: quotation.shippingAddressId,
          shippingAddress: quotation.shippingAddress,
          status: 'PENDING',
          paymentMethod: 'BANK_TRANSFER', // B2B default
          paymentStatus: 'PENDING',
          paymentTerm: customer.paymentTerm || 'NET_30',
          dueDate: calculateDueDate(customer.paymentTerm),
          subtotal: quotation.subtotal,
          taxAmount: quotation.taxAmount,
          totalAmount: quotation.totalAmount,
          quotationId: quotation.id,
          notes: quotation.notes,
        },
      });
      
      // Create Order Items
      for (const item of quotation.items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            productSku: item.productSku,
            selectedSize: item.selectedSize,
            selectedUnitType: item.selectedUnitType,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          },
        });
        
        // Update stock (if needed)
        // await tx.product.update({ ... });
      }
      
      // Update Quotation Status
      await tx.quotation.update({
        where: { id },
        data: {
          status: 'CONVERTED_TO_ORDER',
          convertedToOrderId: order.id,
          reviewedBy: adminUserId,
          reviewedAt: new Date(),
        },
      });
      
      // Update Customer Outstanding
      await tx.user.update({
        where: { id: customer.id },
        data: {
          currentOutstanding: {
            increment: quotation.totalAmount,
          },
        },
      });
      
      return { order, creditWarning };
    });
    
    // 5. Send Notification (TODO)
    // await sendOrderConfirmationEmail(customer.email, result.order);
    
    res.json({
      success: true,
      data: {
        order: result.order,
        creditWarning: result.creditWarning,
        message: creditWarning 
          ? 'Order created - Customer exceeds credit limit'
          : 'Order created successfully',
      },
    });
    
  } catch (error) {
    console.error('Error approving quotation:', error);
    res.status(500).json({ error: 'Failed to approve quotation' });
  }
};

function calculateDueDate(paymentTerm?: PaymentTerm): Date {
  const now = new Date();
  switch (paymentTerm) {
    case 'NET_30': return addDays(now, 30);
    case 'NET_60': return addDays(now, 60);
    case 'NET_90': return addDays(now, 90);
    case 'NET_120': return addDays(now, 120);
    default: return now; // IMMEDIATE
  }
}
```

---

### 3. 🛠️ **Admin Dashboard Updates**

#### **New Components Needed:**

1. **Customer Management Enhancement**
   - Add financial fields to customer edit form:
     - Financial Limit (input)
     - Payment Term (dropdown)
     - Account Status (dropdown)
     - Current Outstanding (read-only, calculated)

2. **Quotation Management Screen** (`/admin/quotations`)
   - List view with filters:
     - Status (PENDING_APPROVAL, APPROVED, DECLINED, etc.)
     - Customer name
     - Date range
   - Columns:
     - Quotation #
     - Customer
     - Total Amount
     - Anticipated Outstanding
     - Credit Status (⚠️ if exceeds limit)
     - Status
     - Actions (View, Approve, Decline)

3. **Quotation Detail Modal**
   - Customer info panel:
     - Name, Company, Account Status
     - Financial Limit vs. Current Outstanding
     - Anticipated Outstanding (highlighted if > limit)
   - Items list (same as order)
   - Action buttons:
     - ✅ **Approve** (green, prominent)
     - ❌ **Decline** (red, requires reason)

4. **Analytics Dashboard Enhancement**
   - New KPI card: **Total Outstanding Balance**
   - Chart: Outstanding by customer
   - Alert: Customers exceeding credit limit

---

### 4. 🛒 **Customer Shop Updates**

#### **New/Modified Components:**

1. **Checkout Flow** (`/checkout`)
   - **Change**: Button text from "Place Order" → "Submit Quotation"
   - **Logic**: 
     - If `user.accountStatus === 'ACTIVE'` → Allow direct order (keep existing flow)
     - If `user.accountStatus !== 'ACTIVE'` → Force quotation flow
   - **UI**: Show message: "Your order will be reviewed by our team"

2. **Account Dashboard** (`/account`)
   - **New Section**: "My Quotations"
     - Tabs: Draft | Pending | Approved | Declined
     - List with status badges
     - Click to view details
   
   - **New Section**: "Financial Status"
     - Display (read-only):
       - Account Status (badge)
       - Credit Limit
       - Current Outstanding
       - Available Credit (limit - outstanding)

3. **Order History** (`/account/orders`)
   - **Rename**: "Invoices & Payments"
   - **Filter**: Only show orders with `status !== 'PENDING_APPROVAL'`
   - **Add**: Link to source quotation (if exists)

---

## ⚠️ **Potential Conflicts & Solutions**

### **Conflict 1: Existing Orders Without Quotations**

**Issue**: Current orders don't have `quotationId`.

**Solution**: ✅ Make `quotationId` optional (`String?`). Existing orders continue to work.

---

### **Conflict 2: Direct Order Placement**

**Issue**: Some customers may need to place orders directly (e.g., walk-in customers, admin-created orders).

**Solution**: ✅ Keep both flows:
- **B2B Customers** (`accountStatus !== 'ACTIVE'`) → Quotation flow
- **Direct/Admin Orders** → Existing order flow
- Add admin permission to bypass quotation for specific customers

---

### **Conflict 3: Payment Method Enum**

**Issue**: Current enum has `CASH_ON_DELIVERY`, `BANK_TRANSFER`, `CREDIT_CARD`. B2B needs net terms.

**Solution**: ✅ Add to existing enum:
```prisma
enum PaymentMethod {
  CASH_ON_DELIVERY
  BANK_TRANSFER
  CREDIT_CARD
  NET_TERMS        // New: For B2B orders with payment terms
  CHEQUE           // New: For B2B cheque payments
}
```

---

### **Conflict 4: Stock Management**

**Issue**: Should stock be reserved when quotation is submitted or when approved?

**Solution**: ✅ **Reserve on approval** (when converting to order)
- Quotations don't affect stock
- Stock is decremented when order is created
- If stock insufficient at approval time, admin can decline with reason

---

## 📋 **Implementation Roadmap**

### **Phase 1: Database & Backend** (Week 1)
1. ✅ Create Prisma migration for User fields
2. ✅ Create Quotation & QuotationItem models
3. ✅ Update Order model
4. ✅ Implement quotation CRUD endpoints
5. ✅ Implement approve/decline logic
6. ✅ Add tests

### **Phase 2: Admin Dashboard** (Week 2)
1. ✅ Update customer management UI
2. ✅ Create quotation list screen
3. ✅ Create quotation detail modal
4. ✅ Add analytics KPIs
5. ✅ Test approval workflow

### **Phase 3: Customer Shop** (Week 2-3)
1. ✅ Update checkout flow
2. ✅ Create "My Quotations" section
3. ✅ Create "Financial Status" panel
4. ✅ Update order history
5. ✅ Test end-to-end flow

### **Phase 4: Polish & Deploy** (Week 3)
1. ✅ Email notifications
2. ✅ PDF generation for quotations
3. ✅ Audit logging
4. ✅ Production deployment
5. ✅ User training

---

## ✅ **Final Verdict**

### **Is This Feasible?**
**YES** - The proposed system is fully compatible with your architecture.

### **Recommended Approach:**
1. **Start with Phase 1** (Database + Backend) - This is the foundation
2. **Test thoroughly** with Postman/API tests before touching frontend
3. **Implement admin dashboard first** - Admins need to approve before customers see results
4. **Roll out customer shop last** - Once the full flow is tested

### **Key Success Factors:**
- ✅ Use transactions for approve flow (data consistency)
- ✅ Keep existing order flow intact (backward compatibility)
- ✅ Make all new fields optional (gradual migration)
- ✅ Add comprehensive logging (audit trail)
- ✅ Test with real data before production

---

## 🚀 **Next Steps**

Would you like me to:
1. **Start implementing Phase 1** (Database schema + migrations)?
2. **Create the quotation controller** with full CRUD + approval logic?
3. **Design the admin UI mockup** for quotation management?
4. **Set up the project structure** for the new features?

Let me know which part you'd like to tackle first! 💪
