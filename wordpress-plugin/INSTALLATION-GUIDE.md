# 📦 Size Manager Plugin - Installation Guide

Complete guide to install and configure the Size Manager plugin for WooCommerce.

---

## 📋 Prerequisites

Before installing, ensure you have:

- ✅ WordPress 5.8 or higher
- ✅ WooCommerce 5.0 or higher installed and active
- ✅ PHP 7.4 or higher
- ✅ Access to WordPress admin panel or FTP/cPanel

---

## 🚀 Installation Methods

### Method 1: Upload via WordPress Admin (Recommended)

1. **Create ZIP File**
   ```bash
   cd /home/cube/Documents/theBricoHouse/UpdatedCatalog/project-20251027T071334Z-1-001/project/wordpress-plugin
   zip -r size-manager.zip size-manager/
   ```

2. **Upload to WordPress**
   - Log in to WordPress Admin
   - Go to **Plugins > Add New**
   - Click **Upload Plugin**
   - Click **Choose File** and select `size-manager.zip`
   - Click **Install Now**
   - Click **Activate Plugin**

### Method 2: FTP/cPanel Upload

1. **Prepare the Plugin**
   - Locate the `size-manager` folder at:
     ```
     /home/cube/Documents/theBricoHouse/UpdatedCatalog/project-20251027T071334Z-1-001/project/wordpress-plugin/size-manager/
     ```

2. **Upload via FTP**
   - Connect to your server via FTP (FileZilla, WinSCP, etc.)
   - Navigate to `/wp-content/plugins/`
   - Upload the entire `size-manager` folder

3. **Or Upload via cPanel**
   - Log in to cPanel
   - Open **File Manager**
   - Navigate to `public_html/wp-content/plugins/`
   - Click **Upload**
   - Upload the `size-manager` folder (or ZIP and extract)

4. **Set Permissions**
   ```bash
   chmod -R 755 /path/to/wp-content/plugins/size-manager
   ```

5. **Activate Plugin**
   - Go to WordPress Admin > Plugins
   - Find "Size Manager"
   - Click **Activate**

### Method 3: SSH/Command Line

```bash
# Connect to your server
ssh user@sqb-tunisie.com

# Navigate to plugins directory
cd /path/to/wordpress/wp-content/plugins/

# Copy the plugin folder
cp -r /home/cube/Documents/theBricoHouse/UpdatedCatalog/project-20251027T071334Z-1-001/project/wordpress-plugin/size-manager ./

# Set permissions
chmod -R 755 size-manager

# Activate via WP-CLI (if available)
wp plugin activate size-manager
```

---

## ✅ Verify Installation

1. **Check Plugin is Active**
   - Go to WordPress Admin > Plugins
   - "Size Manager" should show as **Active**

2. **Check Product Editor**
   - Go to Products > Edit any product
   - You should see a new **"Size Table"** tab in Product Data

3. **Test REST API**
   - Open browser and visit:
     ```
     https://www.sqb-tunisie.com/wp-json/siesta/v1/size-table/123
     ```
   - Replace `123` with an actual product ID
   - You should see JSON response (or error if product not configured)

---

## 🔧 Configuration

### Step 1: Configure a Product

1. **Edit a Product**
   - Go to Products > All Products
   - Click on a product (e.g., screws, bolts)

2. **Enable Size Table**
   - Scroll to **Product Data** section
   - Click on **Size Table** tab
   - Check ☑ **"Size & Quantity Product"**

3. **Add Size Entries**
   - Click **Add Row**
   - Fill in:
     - **Size**: e.g., "M6", "M8", "M10"
     - **Available Quantity**: e.g., 500, 300, 200
     - **Price**: e.g., 0.15, 0.25, 0.35
   - Click **Add Row** again for more sizes

4. **Save Product**
   - Click **Update** button

### Step 2: Test Frontend Display

1. Visit the product page on your website
2. You should see a table showing "Available Sizes & Quantities"
3. The table appears before the "Add to Cart" button

### Step 3: Test REST API

```bash
# Test with curl
curl https://www.sqb-tunisie.com/wp-json/siesta/v1/size-table/PRODUCT_ID

# Or open in browser
https://www.sqb-tunisie.com/wp-json/siesta/v1/size-table/PRODUCT_ID
```

Replace `PRODUCT_ID` with your actual product ID.

**Expected Response:**
```json
{
  "product_id": 123,
  "product_name": "Stainless Steel Screws",
  "product_sku": "SS-001",
  "is_size_product": true,
  "size_table": [
    {
      "size": "M6",
      "quantity": 500,
      "price": 0.15
    }
  ],
  "currency": "TND",
  "currency_symbol": "د.ت"
}
```

---

## 🔗 Integration with React App

### Update Your React App

Add this service to fetch size tables:

```javascript
// src/services/sizeTable.ts
import { API_CONFIG } from '../config/api';

export interface SizeTableRow {
  size: string;
  quantity: number;
  price: number;
}

export interface SizeTableResponse {
  product_id: number;
  product_name: string;
  product_sku: string;
  is_size_product: boolean;
  size_table: SizeTableRow[];
  currency: string;
  currency_symbol: string;
}

export async function getSizeTable(productId: number): Promise<SizeTableResponse | null> {
  try {
    const response = await fetch(
      `${API_CONFIG.WOOCOMMERCE_URL}/wp-json/siesta/v1/size-table/${productId}`
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('Product not found');
        return null;
      }
      if (response.status === 400) {
        console.log('Not a size product');
        return null;
      }
      throw new Error('Failed to fetch size table');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching size table:', error);
    return null;
  }
}
```

### Use in Product Component

```jsx
import React, { useState, useEffect } from 'react';
import { getSizeTable, SizeTableResponse } from '../services/sizeTable';

function ProductDetail({ productId }) {
  const [sizeTable, setSizeTable] = useState<SizeTableResponse | null>(null);

  useEffect(() => {
    async function loadSizeTable() {
      const data = await getSizeTable(productId);
      setSizeTable(data);
    }
    loadSizeTable();
  }, [productId]);

  if (!sizeTable) return null;

  return (
    <div className="size-table-display">
      <h3>Available Sizes</h3>
      <table>
        <thead>
          <tr>
            <th>Size</th>
            <th>Available</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {sizeTable.size_table.map((row, index) => (
            <tr key={index}>
              <td>{row.size}</td>
              <td>{row.quantity} units</td>
              <td>{sizeTable.currency_symbol}{row.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🐛 Troubleshooting

### Plugin Not Showing

**Problem:** Size Manager doesn't appear in plugins list

**Solution:**
1. Check file permissions: `chmod -R 755 size-manager`
2. Verify folder structure is correct
3. Check PHP error logs: `/wp-content/debug.log`

### WooCommerce Required Error

**Problem:** "Size Manager requires WooCommerce" message

**Solution:**
1. Install WooCommerce: Plugins > Add New > Search "WooCommerce"
2. Activate WooCommerce
3. Complete WooCommerce setup wizard

### Size Table Tab Not Showing

**Problem:** No "Size Table" tab in product editor

**Solution:**
1. Deactivate and reactivate the plugin
2. Clear WordPress cache
3. Check if editing a WooCommerce product (not regular post)

### REST API Not Working

**Problem:** 404 error when accessing API endpoint

**Solution:**
1. **Check Permalinks**
   - Go to Settings > Permalinks
   - Click "Save Changes" (this flushes rewrite rules)
   - Ensure permalinks are NOT set to "Plain"

2. **Test REST API**
   ```
   https://www.sqb-tunisie.com/wp-json/
   ```
   Should show available endpoints

3. **Check .htaccess**
   - Ensure `.htaccess` file exists in WordPress root
   - Should contain WordPress rewrite rules

### JavaScript Not Loading

**Problem:** Add Row button doesn't work

**Solution:**
1. Clear browser cache: Ctrl+Shift+Delete
2. Check browser console for errors: F12
3. Verify file exists: `/wp-content/plugins/size-manager/assets/js/admin.js`
4. Check file permissions: `chmod 644 admin.js`

### Styles Not Applied

**Problem:** Table looks unstyled

**Solution:**
1. Clear WordPress cache
2. Hard refresh browser: Ctrl+F5
3. Verify CSS file exists: `/wp-content/plugins/size-manager/assets/css/admin.css`
4. Check file permissions: `chmod 644 admin.css`

---

## 📊 File Structure

After installation, verify this structure:

```
wp-content/plugins/size-manager/
├── size-manager.php          # Main plugin file (required)
├── README.md                 # Documentation
├── assets/
│   ├── css/
│   │   └── admin.css        # Admin styles (required)
│   └── js/
│       └── admin.js         # Admin JavaScript (required)
```

---

## 🔒 Security Notes

1. **File Permissions**
   - Directories: 755
   - Files: 644

2. **Data Sanitization**
   - All inputs are sanitized before saving
   - REST API uses WordPress nonce verification

3. **Access Control**
   - Only admin users can edit size tables
   - REST API is publicly accessible (read-only)

---

## 📞 Support

If you encounter issues:

1. **Check WordPress Debug Log**
   - Enable debug mode in `wp-config.php`:
     ```php
     define('WP_DEBUG', true);
     define('WP_DEBUG_LOG', true);
     ```
   - Check `/wp-content/debug.log`

2. **Test with Default Theme**
   - Switch to Twenty Twenty-Three theme
   - Test if issue persists

3. **Disable Other Plugins**
   - Deactivate all plugins except WooCommerce and Size Manager
   - Test if issue persists

4. **Contact Support**
   - Email: support@sqb-tunisie.com
   - Include: WordPress version, WooCommerce version, PHP version

---

## ✅ Installation Complete!

Your Size Manager plugin is now installed and ready to use.

**Next Steps:**
1. Configure your first product with size table
2. Test the frontend display
3. Integrate with your React app
4. Add more products

---

**Version:** 1.0.0  
**Last Updated:** October 28, 2025  
**Developed by:** SQB Tunisie
