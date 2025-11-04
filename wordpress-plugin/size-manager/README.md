# Size Manager - WordPress Plugin

A WordPress plugin for managing WooCommerce products sold by size and quantity (e.g., screws, bolts, hardware items).

## Features

- ✅ Add checkbox to mark products as "Size & Quantity Products"
- ✅ Dynamic table editor for managing sizes, quantities, and prices
- ✅ REST API endpoint for accessing size table data
- ✅ Frontend display of size tables on product pages
- ✅ Responsive admin interface
- ✅ Clean, modern UI

## Installation

### Method 1: Upload via WordPress Admin

1. Download the `size-manager` folder
2. Create a ZIP file of the folder
3. Go to WordPress Admin > Plugins > Add New
4. Click "Upload Plugin"
5. Choose the ZIP file and click "Install Now"
6. Activate the plugin

### Method 2: FTP Upload

1. Upload the `size-manager` folder to `/wp-content/plugins/`
2. Go to WordPress Admin > Plugins
3. Find "Size Manager" and click "Activate"

### Method 3: Manual Installation

```bash
# Navigate to your WordPress plugins directory
cd /path/to/wordpress/wp-content/plugins/

# Copy the size-manager folder
cp -r /path/to/size-manager ./

# Set proper permissions
chmod -R 755 size-manager
```

## Usage

### Admin - Product Configuration

1. **Edit a WooCommerce Product**
   - Go to Products > Edit Product

2. **Enable Size Table**
   - Navigate to the "Size Table" tab in Product Data
   - Check "Size & Quantity Product"

3. **Add Size Entries**
   - Click "Add Row" to add a new size entry
   - Fill in:
     - **Size**: e.g., "M8", "10mm", "Small"
     - **Available Quantity**: Number of units in stock
     - **Price**: Price per unit

4. **Save Product**
   - Click "Update" to save the product

### REST API Usage

#### Get Size Table Data

**Endpoint:**
```
GET /wp-json/siesta/v1/size-table/{product_id}
```

**Example Request:**
```bash
curl https://www.sqb-tunisie.com/wp-json/siesta/v1/size-table/123
```

**Example Response:**
```json
{
  "product_id": 123,
  "product_name": "Stainless Steel Screws",
  "product_sku": "SS-SCREW-001",
  "is_size_product": true,
  "size_table": [
    {
      "size": "M6",
      "quantity": 500,
      "price": 0.15
    },
    {
      "size": "M8",
      "quantity": 300,
      "price": 0.25
    },
    {
      "size": "M10",
      "quantity": 200,
      "price": 0.35
    }
  ],
  "currency": "TND",
  "currency_symbol": "د.ت"
}
```

**Error Responses:**

Product not found (404):
```json
{
  "code": "product_not_found",
  "message": "Product not found",
  "data": {
    "status": 404
  }
}
```

Not a size product (400):
```json
{
  "code": "not_size_product",
  "message": "This product is not configured as a size product",
  "data": {
    "status": 400
  }
}
```

### Frontend Display

The size table automatically displays on the product page before the "Add to Cart" button for products marked as size products.

## Integration with React App

### Fetch Size Table Data

```javascript
// In your React app
import { API_CONFIG } from './config/api';

async function getSizeTable(productId) {
  try {
    const response = await fetch(
      `${API_CONFIG.WOOCOMMERCE_URL}/wp-json/siesta/v1/size-table/${productId}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch size table');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching size table:', error);
    return null;
  }
}

// Usage
const sizeTable = await getSizeTable(123);
if (sizeTable && sizeTable.size_table) {
  console.log('Available sizes:', sizeTable.size_table);
}
```

### Display Size Table in React

```jsx
import React, { useState, useEffect } from 'react';

function SizeTable({ productId }) {
  const [sizeData, setSizeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSizeTable() {
      try {
        const response = await fetch(
          `https://www.sqb-tunisie.com/wp-json/siesta/v1/size-table/${productId}`
        );
        const data = await response.json();
        setSizeData(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSizeTable();
  }, [productId]);

  if (loading) return <div>Loading sizes...</div>;
  if (!sizeData) return null;

  return (
    <div className="size-table-container">
      <h3>Available Sizes & Quantities</h3>
      <table className="size-table">
        <thead>
          <tr>
            <th>Size</th>
            <th>Available</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {sizeData.size_table.map((row, index) => (
            <tr key={index}>
              <td><strong>{row.size}</strong></td>
              <td>{row.quantity} units</td>
              <td>{sizeData.currency_symbol}{row.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SizeTable;
```

## File Structure

```
size-manager/
├── size-manager.php          # Main plugin file
├── README.md                 # This file
├── assets/
│   ├── css/
│   │   └── admin.css        # Admin styles
│   └── js/
│       └── admin.js         # Admin JavaScript
└── languages/               # Translation files (optional)
```

## Requirements

- WordPress 5.8 or higher
- WooCommerce 5.0 or higher
- PHP 7.4 or higher

## Hooks & Filters

### Actions

- `woocommerce_product_data_tabs` - Adds Size Table tab
- `woocommerce_product_data_panels` - Adds Size Table panel content
- `woocommerce_process_product_meta` - Saves size table data
- `rest_api_init` - Registers REST API routes
- `woocommerce_before_add_to_cart_button` - Displays size table on frontend

### Filters

None currently available.

## Database

### Post Meta Keys

- `_is_size_product` - (string) 'yes' or 'no'
- `_size_table_data` - (array) Size table data

### Data Structure

```php
array(
    array(
        'size' => 'M8',
        'quantity' => 100,
        'price' => 0.25
    ),
    array(
        'size' => 'M10',
        'quantity' => 50,
        'price' => 0.35
    )
)
```

## Troubleshooting

### Size table not showing

1. Make sure WooCommerce is installed and active
2. Check that the product has "Size & Quantity Product" checked
3. Verify that at least one size row has been added

### REST API not working

1. Check WordPress permalinks (Settings > Permalinks)
2. Ensure permalinks are set to "Post name" or custom structure
3. Test the endpoint in a browser or Postman

### JavaScript not loading

1. Clear WordPress cache
2. Check browser console for errors
3. Verify file permissions (should be 644)

## Support

For issues or questions:
- Email: support@sqb-tunisie.com
- Website: https://www.sqb-tunisie.com

## Changelog

### Version 1.0.0 (2025-10-28)
- Initial release
- Dynamic size table editor
- REST API endpoint
- Frontend display
- Admin interface

## License

This plugin is proprietary software developed for SQB Tunisie.

## Credits

Developed by SQB Tunisie Development Team
