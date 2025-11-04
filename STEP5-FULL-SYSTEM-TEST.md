# ✅ Step 5: Full System Test Guide

**Date**: October 30, 2025, 15:05 UTC+01:00  
**Status**: Backend Running - Manual Testing Required

---

## Current System Status

### Services Running
- ✅ **Backend API**: Port 3001 (Running)
- 🔄 **Admin Dashboard**: Port 5174 (You're starting manually)
- ⏳ **Customer Frontend**: Port 5173 (Start after admin test)

---

## Manual Testing Checklist

### Test 1: Backend Health ✅

**Already Verified**:
```bash
curl http://localhost:3001/health
```

**Result**: ✅ Backend is healthy and running

---

### Test 2: Admin Dashboard Startup

**Your Terminal Command**:
```bash
cd admin-dashboard
npm run dev
```

**Expected Output**:
```
VITE v5.4.21  ready in 300ms
➜  Local:   http://localhost:5174/
```

**Verify**: Open http://localhost:5174 in browser

---

### Test 3: Admin Login

**Steps**:
1. Go to http://localhost:5174
2. You should see login page
3. Enter credentials:
   - **Email**: `admin@smd-tunisie.com`
   - **Password**: `admin123`
4. Click "Login"

**Expected**: ✅ Redirected to dashboard

**If Login Fails**: Use this token in browser console:
```javascript
localStorage.setItem('token', 'YOUR_TOKEN_HERE')
// Then refresh page
```

---

### Test 4: Product Creation (CRITICAL TEST)

**Steps**:
1. Click "**Products**" in sidebar
2. Click "**Create Product**"
3. Fill out the form:

**Product Info Tab**:
- Name: `Test Cordless Drill`
- Category: Select any category (create one if needed)
- Description: `Professional 18V cordless drill with Li-Ion battery`
- Brand: `DeWalt`
- Status: `Active`

**Pricing & Inventory Tab**:
- Base Price: `299.00`
- SKU: `DRILL-TEST-001`
- Stock Quantity: `50`

**SEO Tab** (Optional):
- Slug: `test-cordless-drill`

4. Click "**Create Product**"

**Expected Results**:
- ✅ Success message: "Product created successfully!"
- ✅ Redirected to products list
- ✅ Product appears in list
- ✅ No errors in browser console (F12)

**If It Fails**:
- Check browser console (F12) for errors
- Check network tab for API response
- Verify you're logged in (check localStorage.getItem('token'))

---

### Test 5: Verify Product in Database

**Run this command**:
```bash
curl http://localhost:3001/api/products | jq '.data.products[] | {name, sku, basePrice, stockQuantity}'
```

**Expected**: See your product listed with correct data

---

### Test 6: View Product Details

**In Admin Dashboard**:
1. Go to Products page
2. Click on your test product
3. Verify all fields are correct

**Expected**: All data displays correctly

---

### Test 7: Start Customer Frontend

**Your Terminal Command**:
```bash
cd project  # or cd .. from admin-dashboard
npm run dev
```

**Expected Output**:
```
VITE v5.4.1  ready in 400ms
➜  Local:   http://localhost:5173/app/
```

---

### Test 8: Verify Product in Customer Frontend

**Steps**:
1. Go to http://localhost:5173/app/
2. Navigate to the category where you created the product
3. Look for "Test Cordless Drill"

**Expected**: ✅ Product appears in category listing

---

### Test 9: View Product Details (Customer Side)

**Steps**:
1. Click on "Test Cordless Drill"
2. View product details page

**Expected**:
- ✅ Product name displays
- ✅ Price shows: 299.00 TND
- ✅ Description visible
- ✅ Stock status shows
- ✅ Add to cart button works

---

### Test 10: Add to Cart

**Steps**:
1. On product details page
2. Click "Add to Cart"
3. Click cart icon in header

**Expected**:
- ✅ Product added to cart
- ✅ Cart shows 1 item
- ✅ Total price: 299.00 TND

---

## Comprehensive API Test

**Run this automated test**:
```bash
cd /home/cube/Documents/theBricoHouse/UpdatedCatalog/project-20251027T071334Z-1-001/project
./test-complete-flow.sh
```

**Expected Output**:
```
✅ Backend API: Working
✅ Authentication: Working
✅ Categories: Working
✅ Product Creation: Working
✅ Database Sync: Working
```

---

## Troubleshooting

### Issue: "No token provided"

**Solution**:
1. Make sure you're logged in
2. Check: `localStorage.getItem('token')` in browser console
3. If null, login again

### Issue: "Product not appearing"

**Solution**:
1. Check product `isActive` is true
2. Check category exists and is active
3. Hard refresh browser (Ctrl+Shift+R)
4. Check API: `curl http://localhost:3001/api/products`

### Issue: "Validation error"

**Solution**:
1. Check all required fields are filled
2. Ensure SKU is unique
3. Ensure slug is unique
4. Check browser console for specific error

### Issue: Port already in use

**Solution**:
```bash
# Find process using port
lsof -i :5174  # or :5173

# Kill process
kill -9 <PID>

# Restart service
npm run dev
```

---

## Success Criteria

### ✅ All Tests Must Pass

- [ ] Backend health check passes
- [ ] Admin dashboard loads
- [ ] Admin login works
- [ ] Product creation succeeds
- [ ] Product appears in database
- [ ] Product appears in admin list
- [ ] Customer frontend loads
- [ ] Product appears in customer frontend
- [ ] Product details viewable
- [ ] Add to cart works

---

## Test Results Template

**Copy and fill this out**:

```
=== SYSTEM TEST RESULTS ===
Date: October 30, 2025

Backend API:           [ ] Pass  [ ] Fail
Admin Dashboard:       [ ] Pass  [ ] Fail
Admin Login:           [ ] Pass  [ ] Fail
Product Creation:      [ ] Pass  [ ] Fail
Database Verification: [ ] Pass  [ ] Fail
Customer Frontend:     [ ] Pass  [ ] Fail
Product Display:       [ ] Pass  [ ] Fail
Add to Cart:           [ ] Pass  [ ] Fail

Overall Status: [ ] PASS  [ ] FAIL

Notes:
_________________________________
_________________________________
_________________________________
```

---

## Quick Commands Reference

### Check Services
```bash
# Backend health
curl http://localhost:3001/health

# List products
curl http://localhost:3001/api/products | jq '.data.products'

# Check ports
lsof -i -P -n | grep LISTEN | grep -E "3001|5173|5174"
```

### Start Services
```bash
# Backend
cd backend && npm run dev

# Admin Dashboard
cd admin-dashboard && npm run dev

# Customer Frontend
cd project && npm run dev
```

### Stop Services
```bash
# Stop all
pkill -f "tsx watch" && pkill -f "vite"
```

---

## Expected URLs

- **Backend API**: http://localhost:3001
- **Admin Dashboard**: http://localhost:5174
- **Customer Frontend**: http://localhost:5173/app/

---

## Login Credentials

**Admin**:
- Email: `admin@smd-tunisie.com`
- Password: `admin123`

---

## Next Steps After Testing

### If All Tests Pass ✅
1. Document results
2. Create more test products
3. Test other features (categories, customers)
4. Prepare for production deployment

### If Any Test Fails ❌
1. Note which test failed
2. Check error messages
3. Review logs
4. Check documentation
5. Report issue with details

---

*Ready for full system testing!*  
*Follow this guide step by step*  
*Report results when complete*
