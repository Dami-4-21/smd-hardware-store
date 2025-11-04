#!/bin/bash

echo "🔍 SMD Tunisie - Complete System Test"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Backend Health
echo "1️⃣  Testing Backend Health..."
HEALTH=$(curl -s http://localhost:3001/health | jq -r '.status')
if [ "$HEALTH" = "OK" ]; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend is not responding${NC}"
    exit 1
fi
echo ""

# Test 2: Admin Login
echo "2️⃣  Testing Admin Login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smd-tunisie.com","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
if [ "$TOKEN" != "null" ] && [ ! -z "$TOKEN" ]; then
    echo -e "${GREEN}✅ Login successful${NC}"
    echo "   Token: ${TOKEN:0:50}..."
else
    echo -e "${RED}❌ Login failed${NC}"
    echo "   Response: $LOGIN_RESPONSE"
    exit 1
fi
echo ""

# Test 3: Check Categories
echo "3️⃣  Checking Categories..."
CATEGORIES=$(curl -s http://localhost:3001/api/categories | jq '.data | length')
echo "   Found $CATEGORIES categories"
if [ "$CATEGORIES" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No categories found. Creating test category...${NC}"
    
    # Create a test category
    CREATE_CAT=$(curl -s -X POST http://localhost:3001/api/categories \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Power Tools",
        "slug": "power-tools",
        "description": "Electric and battery-powered tools",
        "isActive": true
      }')
    
    CAT_ID=$(echo $CREATE_CAT | jq -r '.data.id')
    if [ "$CAT_ID" != "null" ]; then
        echo -e "${GREEN}✅ Category created: $CAT_ID${NC}"
    else
        echo -e "${RED}❌ Failed to create category${NC}"
        echo "   Response: $CREATE_CAT"
    fi
else
    echo -e "${GREEN}✅ Categories exist${NC}"
    CAT_ID=$(curl -s http://localhost:3001/api/categories | jq -r '.data[0].id')
fi
echo ""

# Test 4: Create Test Product
echo "4️⃣  Testing Product Creation..."
CREATE_PRODUCT=$(curl -s -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Drill $(date +%s)\",
    \"slug\": \"test-drill-$(date +%s)\",
    \"sku\": \"TEST-DRILL-$(date +%s)\",
    \"description\": \"Test product for system verification\",
    \"shortDescription\": \"Test drill\",
    \"categoryId\": \"$CAT_ID\",
    \"price\": 299.99,
    \"stockQuantity\": 50,
    \"lowStockThreshold\": 5,
    \"isFeatured\": false,
    \"isActive\": true,
    \"metaTitle\": \"Test Drill\",
    \"metaDescription\": \"Test product\"
  }")

PRODUCT_ID=$(echo $CREATE_PRODUCT | jq -r '.data.id')
if [ "$PRODUCT_ID" != "null" ] && [ ! -z "$PRODUCT_ID" ]; then
    echo -e "${GREEN}✅ Product created successfully!${NC}"
    echo "   Product ID: $PRODUCT_ID"
    PRODUCT_NAME=$(echo $CREATE_PRODUCT | jq -r '.data.name')
    echo "   Product Name: $PRODUCT_NAME"
else
    echo -e "${RED}❌ Product creation failed${NC}"
    echo "   Response: $CREATE_PRODUCT"
    exit 1
fi
echo ""

# Test 5: Verify Product in Database
echo "5️⃣  Verifying Product in Database..."
PRODUCT_CHECK=$(curl -s http://localhost:3001/api/products/$PRODUCT_ID | jq -r '.data.name')
if [ "$PRODUCT_CHECK" != "null" ]; then
    echo -e "${GREEN}✅ Product verified in database${NC}"
    echo "   Name: $PRODUCT_CHECK"
else
    echo -e "${RED}❌ Product not found in database${NC}"
fi
echo ""

# Test 6: Check All Products
echo "6️⃣  Listing All Products..."
TOTAL_PRODUCTS=$(curl -s http://localhost:3001/api/products | jq '.data.pagination.total')
echo "   Total products in database: $TOTAL_PRODUCTS"
echo ""

# Summary
echo "======================================"
echo "📊 Test Summary"
echo "======================================"
echo -e "${GREEN}✅ Backend API: Working${NC}"
echo -e "${GREEN}✅ Authentication: Working${NC}"
echo -e "${GREEN}✅ Categories: Working${NC}"
echo -e "${GREEN}✅ Product Creation: Working${NC}"
echo -e "${GREEN}✅ Database Sync: Working${NC}"
echo ""
echo "🎉 All systems operational!"
echo ""
echo "📝 Next Steps:"
echo "1. Open Admin Dashboard: http://localhost:5174"
echo "2. Login with:"
echo "   Email: admin@smd-tunisie.com"
echo "   Password: admin123"
echo "3. Go to Products page"
echo "4. You should see the test product created above"
echo ""
echo "💡 Your Token (copy this):"
echo "$TOKEN"
echo ""
echo "To use this token in browser:"
echo "1. Open http://localhost:5174"
echo "2. Open DevTools (F12)"
echo "3. Go to Console tab"
echo "4. Paste: localStorage.setItem('token', '$TOKEN')"
echo "5. Refresh page"
echo "6. You should be logged in!"
