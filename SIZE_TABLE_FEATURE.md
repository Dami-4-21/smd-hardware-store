# Size Table Feature - Dynamic Pricing System

## Overview
The Product Detail Page (PDP) now supports **dynamic pricing based on size/quantity variations** using your WooCommerce Size Manager plugin.

## How It Works

### 1. **WooCommerce Plugin Data Structure**
Your plugin adds this data to each product:
```json
{
  "size_table_data": {
    "is_size_product": true,
    "unit_type": "kg",  // Can be: kg, piece, L, m, etc.
    "size_table": [
      {
        "size": "10",      // Size/quantity value
        "quantity": 5000,  // Available stock for this size
        "price": 1.00      // Price for this size
      },
      {
        "size": "12",
        "quantity": 5000,
        "price": 0.50
      }
    ]
  }
}
```

### 2. **Supported Unit Types**
- **kg** - Kilogram (weight-based)
- **piece** - Individual pieces (1 piece, 6 pieces, 12 pieces)
- **L** - Liter (volume-based)
- **m** - Meter (length-based)
- Any custom unit type you configure in the plugin

### 3. **PDP Features**

#### **Size Selector Grid**
- Displays all available sizes in a 3-column grid
- Each size shows:
  - Size value + unit (e.g., "10 kg")
  - Price per unit (e.g., "1.00 TND")
  - Available stock (e.g., "5000 available")
- Selected size is highlighted in green

#### **Dynamic Price Display**
- Main price updates when size is selected
- Shows "per X unit" label (e.g., "per 10 kg")
- Price changes in real-time

#### **Stock Management**
- Each size has its own stock quantity
- Stock display updates based on selected size
- Add to cart button respects size-specific stock limits

#### **Quantity Controls**
- User can select quantity (1, 2, 3...)
- Max quantity limited by selected size's stock
- Total price = (size price) × (quantity)

## Example Use Cases

### Case 1: Bulk Products (by weight)
**Product**: Cement
- 10 kg = 15.00 TND (stock: 500)
- 25 kg = 35.00 TND (stock: 300)
- 50 kg = 65.00 TND (stock: 150)

### Case 2: Pack Sizes (by piece)
**Product**: Screws
- 1 piece = 0.50 TND (stock: 10000)
- 6 pieces = 2.50 TND (stock: 2000)
- 12 pieces = 4.50 TND (stock: 1000)

### Case 3: Length-based (by meter)
**Product**: Electrical Wire
- 1 m = 2.00 TND (stock: 5000)
- 10 m = 18.00 TND (stock: 800)
- 100 m = 150.00 TND (stock: 100)

### Case 4: Volume-based (by liter)
**Product**: Paint
- 1 L = 25.00 TND (stock: 200)
- 5 L = 110.00 TND (stock: 80)
- 10 L = 200.00 TND (stock: 40)

## User Flow

1. **User opens product** → PDP loads
2. **Size selector appears** → Shows all available sizes
3. **User selects size** → Price updates automatically
4. **User adjusts quantity** → Total calculated
5. **User adds to cart** → Product added with correct price

## Technical Implementation

### Frontend (React)
- **ProductDetailScreen.tsx**: Main PDP component
- **State Management**: 
  - `selectedSize`: Currently selected size
  - `quantity`: Number of items to add
- **Functions**:
  - `getCurrentPrice()`: Returns price for selected size
  - `getAvailableStock()`: Returns stock for selected size

### Backend (Express)
- **server.js**: Fetches product data from WooCommerce
- **Transformation**: Converts WooCommerce format to app format

### Data Types (TypeScript)
```typescript
sizeTableData?: {
  isSizeProduct: boolean;
  unitType: string;
  sizeTable: Array<{
    size: string;
    quantity: number;
    price: number;
  }>;
}
```

## Cart Integration

When user adds product to cart:
1. Product is cloned with selected size's price
2. Cart stores the specific price paid
3. Price doesn't change even if size table is updated later
4. Each cart item shows the price it was added at

## Benefits

✅ **Flexible Pricing** - Different prices for different quantities  
✅ **Stock Control** - Separate stock for each size  
✅ **Better UX** - Clear size/price comparison  
✅ **Bulk Discounts** - Encourage larger purchases  
✅ **Real-time Updates** - Instant price calculation  
✅ **Mobile Friendly** - Responsive grid layout  

## Configuration

To enable size table for a product in WooCommerce:
1. Edit product in WooCommerce admin
2. Find "Size Manager" meta box
3. Enable "Is Size Product"
4. Select unit type (kg, piece, L, m, etc.)
5. Add size entries with:
   - Size value
   - Stock quantity
   - Price
6. Save product

## Testing

Test with product ID 2314 (CASQUE DE SECURITE COULEUR):
- Unit type: kg
- Sizes: 8kg, 10kg, 12kg
- Different prices for each size
- 5000 stock for each size

```bash
# Test API endpoint
curl http://localhost:3001/api/products/2314 | jq '.size_table_data'
```

---

**Status**: ✅ Fully Implemented and Working
**Last Updated**: October 28, 2025
