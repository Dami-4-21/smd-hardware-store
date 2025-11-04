# 📤 Upload Instructions for Shared Hosting

Your project has been successfully built and prepared for deployment!

## 📦 What You Have

A deployment package is ready at:
```
~/sqb-deploy/sqb-app.zip (62 KB)
```

This contains:
- ✅ Production-optimized React application
- ✅ All assets (CSS, JavaScript, images)
- ✅ `.htaccess` configuration for routing
- ✅ Optimized for `/app/` subdirectory

## 🚀 Upload Steps

### Step 1: Download the Deployment Package

The file is located at: `~/sqb-deploy/sqb-app.zip`

You can download it using:
- FTP client (FileZilla, WinSCP, etc.)
- cPanel File Manager
- SCP command: `scp user@your-computer:~/sqb-deploy/sqb-app.zip .`

### Step 2: Log in to cPanel

1. Go to: `https://www.sqb-tunisie.com:2083/` (or your cPanel URL)
2. Enter your username and password
3. Click **Login**

### Step 3: Open File Manager

1. In cPanel, click **File Manager**
2. Select **public_html** folder
3. Click **Go**

### Step 4: Create App Directory

1. Right-click in the empty space
2. Select **Create New Folder**
3. Name it: `app`
4. Click **Create New Folder**

### Step 5: Upload the ZIP File

1. Double-click the **app** folder to enter it
2. Click **Upload** button
3. Select `sqb-app.zip` from your computer
4. Wait for upload to complete

### Step 6: Extract the ZIP File

1. Right-click on `sqb-app.zip`
2. Select **Extract**
3. Click **Extract File(s)**
4. Wait for extraction to complete

### Step 7: Delete the ZIP File

1. Right-click on `sqb-app.zip`
2. Select **Delete**
3. Confirm deletion

### Step 8: Set Permissions

1. Select all files in the **app** folder
2. Click **Permissions** button
3. Set to: **644** (or 755 for directories)
4. Click **Change Permissions**

## ✅ Verify Deployment

### Test 1: Check Application

Visit: `https://www.sqb-tunisie.com/app/`

You should see your Hardware Store application with:
- ✅ Header with cart icon
- ✅ Category grid
- ✅ Search functionality
- ✅ Professional styling

### Test 2: Check API Connection

Open browser console (F12) and check:
- No red errors in console
- Network tab shows successful API calls
- Categories and products load

### Test 3: Test Functionality

1. **Browse Categories** - Click on a category
2. **Search Products** - Use search bar
3. **Add to Cart** - Add items to cart
4. **View Cart** - Click cart icon
5. **Checkout** - Complete checkout form

## 🔧 Backend Setup (If Needed)

If you need to set up the backend API server:

### Option A: Using cPanel Node.js Selector

1. In cPanel, find **Setup Node.js App**
2. Click **Create Application**
3. Configure:
   - **Node.js version**: 18.x or higher
   - **Application root**: `/home/username/nodeapp`
   - **Application startup file**: `server.js`
4. Upload `server.js` and dependencies

### Option B: Contact Hosting Support

Ask your hosting provider to:
- Enable Node.js support
- Set up a separate subdomain for the API (e.g., `api.sqb-tunisie.com`)
- Configure environment variables

## 🐛 Troubleshooting

### Issue: Page shows 404 error

**Check:**
1. Verify `.htaccess` file exists in `/app/` folder
2. Ask hosting to enable `mod_rewrite`
3. Check file permissions (should be 644 for files)

### Issue: Styles/JavaScript not loading

**Check:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Verify `vite.config.ts` has `base: '/app/'`
3. Check browser console for 404 errors

### Issue: API requests fail

**Check:**
1. Backend server is running
2. API endpoint is accessible
3. Check browser console for error messages

### Issue: Cart data not saving

**Check:**
1. Browser localStorage is enabled
2. No privacy extensions blocking storage
3. Check browser console for errors

## 📞 Support

If you encounter issues:

1. **Check Error Logs** - In cPanel, go to Error Log
2. **Review Console** - Press F12 in browser, check Console tab
3. **Contact Hosting** - Ask support to enable required modules
4. **Review Documentation** - See `DEPLOYMENT-GUIDE.md`

## 📋 Deployment Checklist

- [ ] Downloaded `sqb-app.zip`
- [ ] Logged in to cPanel
- [ ] Created `/app/` folder in `public_html`
- [ ] Uploaded `sqb-app.zip` to `/app/`
- [ ] Extracted the ZIP file
- [ ] Deleted the ZIP file
- [ ] Set file permissions (644/755)
- [ ] Visited `https://www.sqb-tunisie.com/app/`
- [ ] Tested categories and search
- [ ] Tested add to cart
- [ ] Tested checkout
- [ ] Verified no console errors

## 🎉 Success!

Your Hardware Store application is now live at:
```
https://www.sqb-tunisie.com/app/
```

## 📚 Additional Resources

- **Vite Documentation**: https://vitejs.dev/
- **React Documentation**: https://react.dev/
- **cPanel Help**: https://docs.cpanel.net/
- **WooCommerce API**: https://woocommerce.com/document/woocommerce-rest-api/

## 🔄 Future Updates

To deploy updates:

1. Make changes to your code
2. Run: `npm run build`
3. Create new ZIP: `zip -r sqb-app.zip dist/* .htaccess`
4. Upload and extract to `/app/` folder
5. Clear browser cache
6. Test thoroughly

---

**Deployment Date**: October 27, 2025
**Application Version**: 1.0.0
**Status**: Ready for Production
