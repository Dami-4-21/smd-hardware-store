# 🚀 B2B System Deployment Guide

## ⚠️ IMPORTANT: Read Before Deploying

This deployment adds critical B2B functionality including:
- Customer credit limits
- Quotation/approval workflow
- Payment terms (NET_30, NET_60, etc.)
- Outstanding balance tracking

**Database changes are irreversible once applied to production.**

---

## 📋 Pre-Deployment Checklist

- [ ] Backup production database
- [ ] Review migration file: `backend/prisma/migrations/20251109143452_add_b2b_credit_quotation_system/migration.sql`
- [ ] Confirm all existing orders will remain unaffected
- [ ] Verify local testing completed successfully
- [ ] Notify team of deployment window

---

## 🔧 Deployment Steps

### **Step 1: Backup Production Database**

```bash
# SSH into VPS
ssh user@catalogquienquillerie.sqb-tunisie.com

# Create backup
docker exec smd-postgres pg_dump -U postgres smd_hardware > backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
ls -lh backup_*.sql
```

### **Step 2: Pull Latest Code**

```bash
# Navigate to project directory
cd /path/to/project

# Pull latest changes
git pull origin main

# Verify files
ls -la backend/prisma/migrations/20251109143452_add_b2b_credit_quotation_system/
```

### **Step 3: Apply Database Migration**

```bash
# Run migration inside Docker container
docker exec -it smd-backend npx prisma migrate deploy

# Expected output:
# ✔ Generated Prisma Client
# Applying migration `20251109143452_add_b2b_credit_quotation_system`
# The following migration(s) have been applied:
# migrations/
#   └─ 20251109143452_add_b2b_credit_quotation_system/
#     └─ migration.sql
# All migrations have been successfully applied.
```

### **Step 4: Verify Migration**

```bash
# Check database tables
docker exec -it smd-postgres psql -U postgres -d smd_hardware -c "\dt"

# Should see new tables:
# - quotations
# - quotation_items

# Check User table columns
docker exec -it smd-postgres psql -U postgres -d smd_hardware -c "\d users"

# Should see new columns:
# - financial_limit
# - current_outstanding
# - payment_term
# - account_status
```

### **Step 5: Restart Backend**

```bash
# Restart backend container
docker restart smd-backend

# Wait 10 seconds
sleep 10

# Check logs
docker logs smd-backend --tail 50

# Should see:
# Server running on port 3001
# No errors
```

### **Step 6: Test API Endpoints**

```bash
# Test health check
curl https://catalogquienquillerie.sqb-tunisie.com/api/health

# Test quotations endpoint (should return 401 without auth)
curl https://catalogquienquillerie.sqb-tunisie.com/api/quotations

# Expected: {"success":false,"error":{"message":"No token provided"}}
```

---

## ✅ Post-Deployment Verification

### **Database Checks**:

```sql
-- Check new enums exist
SELECT typname FROM pg_type WHERE typname IN ('PaymentTerm', 'AccountStatus', 'QuotationStatus');

-- Check User table defaults
SELECT account_status, financial_limit, current_outstanding 
FROM users 
LIMIT 5;

-- Verify all existing orders are intact
SELECT COUNT(*) FROM orders;
```

### **API Checks**:
- [ ] `/api/quotations` endpoint responds (401 without auth)
- [ ] Backend logs show no errors
- [ ] Existing order endpoints still work
- [ ] Customer login still works

---

## 🔄 Rollback Plan (If Needed)

### **Option 1: Restore from Backup**

```bash
# Stop backend
docker stop smd-backend

# Restore database
docker exec -i smd-postgres psql -U postgres smd_hardware < backup_YYYYMMDD_HHMMSS.sql

# Revert code
git reset --hard HEAD~1

# Restart
docker start smd-backend
```

### **Option 2: Manual Rollback (Partial)**

```sql
-- Drop new tables
DROP TABLE IF EXISTS quotation_items CASCADE;
DROP TABLE IF EXISTS quotations CASCADE;

-- Drop new enums
DROP TYPE IF EXISTS QuotationStatus CASCADE;
DROP TYPE IF EXISTS AccountStatus CASCADE;
DROP TYPE IF EXISTS PaymentTerm CASCADE;

-- Remove User columns
ALTER TABLE users 
  DROP COLUMN IF EXISTS financial_limit,
  DROP COLUMN IF EXISTS current_outstanding,
  DROP COLUMN IF EXISTS payment_term,
  DROP COLUMN IF EXISTS account_status;

-- Remove Order columns
ALTER TABLE orders
  DROP COLUMN IF EXISTS quotation_id,
  DROP COLUMN IF EXISTS payment_term,
  DROP COLUMN IF EXISTS due_date;
```

**⚠️ WARNING**: Manual rollback may cause data loss. Use backup restore instead.

---

## 📊 Expected Database Changes

### **New Tables**:
- `quotations` (0 rows initially)
- `quotation_items` (0 rows initially)

### **Modified Tables**:
- `users`: +4 columns (all nullable or with defaults)
- `orders`: +3 columns (all nullable)
- `products`: No schema changes (only new relation)
- `addresses`: No schema changes (only new relation)

### **New Enums**:
- `PaymentTerm`: 5 values
- `AccountStatus`: 5 values
- `QuotationStatus`: 6 values
- `PaymentMethod`: +2 values (NET_TERMS, CHEQUE)

---

## 🎯 Success Criteria

Deployment is successful if:
- ✅ Migration applies without errors
- ✅ Backend restarts successfully
- ✅ No errors in backend logs
- ✅ Existing orders are intact (count matches)
- ✅ Customer login works
- ✅ Product browsing works
- ✅ New `/api/quotations` endpoint responds

---

## 📞 Support

If issues occur:
1. Check backend logs: `docker logs smd-backend --tail 100`
2. Check database logs: `docker logs smd-postgres --tail 100`
3. Verify migration status: `docker exec -it smd-backend npx prisma migrate status`
4. If critical: Execute rollback plan immediately

---

## 🔜 Next Steps After Deployment

1. **Test quotation creation** via Postman/API client
2. **Monitor backend logs** for 24 hours
3. **Begin frontend implementation**:
   - Admin quotation list page
   - Admin quotation detail modal
   - Customer financial fields in admin
4. **Plan customer-side implementation**:
   - Quotation submission from cart
   - "My Quotations" page
   - Financial status display

---

**Deployment Time Estimate**: 15-20 minutes  
**Downtime**: ~30 seconds (backend restart only)  
**Risk Level**: Low (additive changes, no data modification)

---

## 📝 Deployment Log Template

```
Date: ___________
Time: ___________
Deployed by: ___________

Pre-deployment:
[ ] Database backup created: ___________
[ ] Code pulled successfully
[ ] Migration file verified

Deployment:
[ ] Migration applied at: ___________
[ ] Backend restarted at: ___________
[ ] Logs checked - no errors

Post-deployment:
[ ] API health check: ___________
[ ] Database verification: ___________
[ ] Existing orders count: ___________
[ ] New tables created: ___________

Status: SUCCESS / ROLLBACK
Notes: ___________________________________________
```

---

**Ready to deploy!** 🚀
