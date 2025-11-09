# 🎨 B2B Admin UI Design - Quotation Management

## Overview
This document provides the complete UI design for the B2B quotation management system in the admin dashboard.

---

## 1. 📋 **Quotation List Screen**

### **Route**: `/admin/quotations`

### **Layout**:
```
┌─────────────────────────────────────────────────────────────────┐
│  Quotations & Orders                                            │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  [Pending Approval (5)] [All Quotations] [Orders]              │
│                                                                 │
│  Filters:  [Status ▼] [Customer Search] [Date Range]  [Search] │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ QUO#    Customer      Total    Outstanding  Status  Actions│ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ QUO-123 Acme Corp    $5,200   ⚠️ $12,000   PENDING  [View]│ │
│  │         (Limit: $10K)                                      │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ QUO-124 BuildCo      $3,400   ✅ $3,400    PENDING  [View]│ │
│  │         (Limit: $20K)                                      │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ QUO-125 ToolMart     $8,900   ✅ $8,900    APPROVED [View]│ │
│  │         (Limit: $50K)                                      │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Showing 1-10 of 23                           [< 1 2 3 4 5 >]  │
└─────────────────────────────────────────────────────────────────┘
```

### **Key Features**:
1. **Tabs**: Pending Approval (with count badge), All Quotations, Orders
2. **Filters**:
   - Status dropdown (PENDING_APPROVAL, APPROVED, DECLINED, etc.)
   - Customer search (autocomplete)
   - Date range picker
3. **List Columns**:
   - Quotation Number (clickable)
   - Customer Name + Company
   - Total Amount
   - Anticipated Outstanding (with warning icon if > limit)
   - Status (color-coded badge)
   - Actions (View button)
4. **Visual Indicators**:
   - ⚠️ Red warning if anticipated outstanding > financial limit
   - ✅ Green checkmark if within limit
   - Status badges: 
     - PENDING_APPROVAL: Yellow/Orange
     - APPROVED: Green
     - DECLINED: Red
     - DRAFT: Gray

---

## 2. 🔍 **Quotation Detail Modal**

### **Triggered by**: Clicking "View" on any quotation

### **Layout**:
```
┌─────────────────────────────────────────────────────────────────────┐
│  Quotation #QUO-123                                          [X]    │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  ┌─ Customer Information ────────────────────────────────────────┐ │
│  │  Acme Corporation                                             │ │
│  │  Contact: John Doe (john@acme.com)                            │ │
│  │  Phone: +216 12 345 678                                       │ │
│  │                                                               │ │
│  │  Account Status: [ACTIVE]                                     │ │
│  │                                                               │ │
│  │  Financial Summary:                                           │ │
│  │  ┌──────────────────────────────────────────────────────────┐│ │
│  │  │ Credit Limit:         $10,000.00                         ││ │
│  │  │ Current Outstanding:   $6,800.00                         ││ │
│  │  │ This Quotation:       +$5,200.00                         ││ │
│  │  │ ─────────────────────────────────────────────────────────││ │
│  │  │ Anticipated Total:    $12,000.00  ⚠️ EXCEEDS LIMIT      ││ │
│  │  │ Overage:               $2,000.00                         ││ │
│  │  └──────────────────────────────────────────────────────────┘│ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─ Quotation Items ─────────────────────────────────────────────┐ │
│  │  Product              Qty    Unit Price    Total              │ │
│  │  ──────────────────────────────────────────────────────────── │ │
│  │  Drill Set Pro        10     $120.00       $1,200.00         │ │
│  │  Hammer Heavy Duty    50     $25.00        $1,250.00         │ │
│  │  Safety Gloves (L)    100    $8.00         $800.00           │ │
│  │  Paint Roller Kit     30     $45.00        $1,350.00         │ │
│  │                                                               │ │
│  │                                  Subtotal:  $4,600.00         │ │
│  │                                  Tax (19%): $874.00           │ │
│  │                                  ────────────────────          │ │
│  │                                  Total:     $5,474.00         │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─ Shipping Address ────────────────────────────────────────────┐ │
│  │  123 Industrial Avenue                                        │ │
│  │  Tunis, 1000, Tunisia                                         │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  Notes: Customer requested urgent delivery                         │
│                                                                     │
│  ┌─ Admin Decision ──────────────────────────────────────────────┐ │
│  │  [Approve Quotation]                    [Decline Quotation]   │ │
│  │                                                               │ │
│  │  ⚠️ Warning: This approval will exceed customer credit limit │ │
│  │     You may proceed, but monitor payment closely.            │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  Submitted: Nov 9, 2025, 2:30 PM                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### **Approve Button Behavior**:
- **Click** → Shows confirmation dialog:
  ```
  ┌─────────────────────────────────────────┐
  │  Approve Quotation?                     │
  │  ─────────────────────────────────────  │
  │                                         │
  │  This will:                             │
  │  ✓ Convert quotation to order           │
  │  ✓ Reserve stock                        │
  │  ✓ Update customer outstanding          │
  │  ✓ Send confirmation email              │
  │                                         │
  │  ⚠️ Customer will exceed credit limit   │
  │                                         │
  │  [Cancel]           [Confirm Approval]  │
  └─────────────────────────────────────────┘
  ```

### **Decline Button Behavior**:
- **Click** → Shows reason input dialog:
  ```
  ┌─────────────────────────────────────────┐
  │  Decline Quotation                      │
  │  ─────────────────────────────────────  │
  │                                         │
  │  Reason (required):                     │
  │  ┌─────────────────────────────────────┐│
  │  │ Credit limit exceeded. Please       ││
  │  │ reduce order quantity or make       ││
  │  │ payment to reduce outstanding.      ││
  │  └─────────────────────────────────────┘│
  │                                         │
  │  [Cancel]              [Decline Quote]  │
  └─────────────────────────────────────────┘
  ```

---

## 3. 👤 **Customer Management Enhancement**

### **Route**: `/admin/customers/:id/edit`

### **New Section**: Financial Settings (added to existing customer form)

```
┌─────────────────────────────────────────────────────────────────┐
│  Edit Customer: Acme Corporation                                │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ... [Existing fields: Name, Email, Phone, etc.] ...           │
│                                                                 │
│  ┌─ B2B Financial Settings ──────────────────────────────────┐  │
│  │                                                            │  │
│  │  Account Status:                                           │  │
│  │  ┌────────────────────────────────────────────────────────┐│  │
│  │  │ [COMMERCIAL_IN_PROCESS ▼]                              ││  │
│  │  │  ○ COMMERCIAL_IN_PROCESS (New customer, under review)  ││  │
│  │  │  ○ FINANCIAL_IN_PROCESS (Approved, credit setup)       ││  │
│  │  │  ● ACTIVE (Fully approved)                             ││  │
│  │  │  ○ FINANCIAL_NON_CURRENT (Overdue payments)            ││  │
│  │  │  ○ SUSPENDED (Account suspended)                       ││  │
│  │  └────────────────────────────────────────────────────────┘│  │
│  │                                                            │  │
│  │  Financial Limit (TND):                                    │  │
│  │  ┌──────────────┐                                          │  │
│  │  │ 10000.00     │  Maximum credit allowed                 │  │
│  │  └──────────────┘                                          │  │
│  │                                                            │  │
│  │  Payment Term:                                             │  │
│  │  ┌────────────────────────────────────────────────────────┐│  │
│  │  │ [NET_30 ▼]                                             ││  │
│  │  │  ○ IMMEDIATE (Cash on delivery)                        ││  │
│  │  │  ● NET_30 (30 days)                                    ││  │
│  │  │  ○ NET_60 (60 days)                                    ││  │
│  │  │  ○ NET_90 (90 days)                                    ││  │
│  │  │  ○ NET_120 (120 days)                                  ││  │
│  │  └────────────────────────────────────────────────────────┘│  │
│  │                                                            │  │
│  │  Current Outstanding (Read-only):                          │  │
│  │  ┌──────────────┐                                          │  │
│  │  │ $6,800.00    │  Calculated from unpaid orders          │  │
│  │  └──────────────┘                                          │  │
│  │                                                            │  │
│  │  Available Credit:                                         │  │
│  │  $3,200.00 (Limit - Outstanding)                           │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [Cancel]                                          [Save Changes]│
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. 📊 **Analytics Dashboard Enhancement**

### **Route**: `/admin/dashboard`

### **New KPI Card**:
```
┌────────────────────────────────────┐
│  Total Outstanding Balance         │
│                                    │
│  $45,230.00                        │
│                                    │
│  ↑ 12% from last month             │
│                                    │
│  [View Details →]                  │
└────────────────────────────────────┘
```

### **New Chart**: Outstanding by Customer (Top 10)
```
┌────────────────────────────────────────────────────────┐
│  Top 10 Customers by Outstanding Balance               │
│  ────────────────────────────────────────────────────  │
│                                                        │
│  Acme Corp        ████████████████░░░░  $12,000       │
│  BuildCo          ██████████░░░░░░░░░░  $8,500        │
│  ToolMart         ████████░░░░░░░░░░░░  $7,200        │
│  Hardware Plus    ██████░░░░░░░░░░░░░░  $5,800        │
│  ...                                                   │
│                                                        │
│  ⚠️ 3 customers exceeding credit limit                │
│  [View All →]                                          │
└────────────────────────────────────────────────────────┘
```

---

## 5. 🎨 **Color Scheme & Styling**

### **Status Colors**:
- **PENDING_APPROVAL**: `bg-yellow-100 text-yellow-800 border-yellow-300`
- **APPROVED**: `bg-green-100 text-green-800 border-green-300`
- **DECLINED**: `bg-red-100 text-red-800 border-red-300`
- **DRAFT**: `bg-gray-100 text-gray-800 border-gray-300`
- **CONVERTED_TO_ORDER**: `bg-blue-100 text-blue-800 border-blue-300`

### **Warning Indicators**:
- **Credit Limit Exceeded**: `bg-red-50 border-l-4 border-red-500 text-red-700`
- **Within Limit**: `bg-green-50 border-l-4 border-green-500 text-green-700`

### **Buttons**:
- **Approve**: `bg-green-600 hover:bg-green-700 text-white`
- **Decline**: `bg-red-600 hover:bg-red-700 text-white`
- **View**: `bg-blue-600 hover:bg-blue-700 text-white`
- **Cancel**: `bg-gray-200 hover:bg-gray-300 text-gray-800`

---

## 6. 📱 **Responsive Design**

### **Mobile View** (< 768px):
- Stack customer info and financial summary vertically
- Collapse quotation items into accordion
- Full-width action buttons
- Simplified table view (show only essential columns)

### **Tablet View** (768px - 1024px):
- 2-column layout for customer info
- Scrollable quotation items table
- Side-by-side action buttons

---

## 7. ✨ **Interactions & Animations**

1. **List Row Hover**: Subtle background color change + shadow
2. **Modal Open**: Fade in with slide-down animation (300ms)
3. **Approve/Decline**: Loading spinner on button during API call
4. **Success**: Toast notification (green) "Quotation approved successfully"
5. **Error**: Toast notification (red) with error message
6. **Credit Warning**: Pulsing animation on warning icon

---

## 8. 🔔 **Notifications**

### **Admin Notifications**:
- **New Quotation Submitted**: Badge on "Quotations" menu item
- **Desktop Notification**: "New quotation from Acme Corp - $5,200"

### **Customer Notifications** (Email):
- **Quotation Approved**: "Your quotation #QUO-123 has been approved"
- **Quotation Declined**: "Your quotation #QUO-123 was declined - [Reason]"

---

## 9. 🚀 **Implementation Priority**

### **Phase 1** (Week 1):
1. ✅ Quotation list screen (basic table)
2. ✅ Quotation detail modal (view only)
3. ✅ Customer financial fields in edit form

### **Phase 2** (Week 2):
1. ✅ Approve/Decline functionality
2. ✅ Credit limit warnings
3. ✅ Status badges and filters

### **Phase 3** (Week 3):
1. ✅ Analytics dashboard KPIs
2. ✅ Email notifications
3. ✅ Polish & animations

---

## 10. 📝 **Component Structure**

```
admin-dashboard/src/
├── pages/
│   ├── QuotationListPage.tsx       // Main quotation list
│   └── CustomerEditPage.tsx         // Enhanced with financial fields
├── components/
│   ├── QuotationDetailModal.tsx    // Modal for quotation details
│   ├── QuotationListTable.tsx      // Quotation table component
│   ├── QuotationStatusBadge.tsx    // Status badge component
│   ├── CreditWarningAlert.tsx      // Credit limit warning
│   ├── FinancialSummaryCard.tsx    // Customer financial summary
│   └── ApproveDeclineButtons.tsx   // Action buttons
└── services/
    └── quotationService.ts         // API calls for quotations
```

---

## ✅ **Ready for Implementation**

This design is fully compatible with your existing admin dashboard architecture (React + Tailwind + TypeScript). All components follow the same patterns as your current order management system.

**Next Step**: Start implementing `QuotationListPage.tsx` and `quotationService.ts`! 🚀
