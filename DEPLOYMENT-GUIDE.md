# 🚀 Deployment Guide for Shared Hosting

This guide will help you deploy your Hardware Store application to shared hosting at `https://www.sqb-tunisie.com/app/`

## Prerequisites

- Access to cPanel or similar hosting control panel
- FTP or File Manager access
- Node.js support on your hosting (if deploying backend)
- SSH access (optional but recommended)

## Step 1: Build the Project

```bash
# Navigate to your project directory
cd /home/cube/Documents/theBricoHouse/UpdatedCatalog/project-20251027T071334Z-1-001/project

# Install dependencies
npm install

# Build for production
npm run build
```

This creates a `dist` folder with all production-ready files.

## Step 2: Prepare Files for Upload

```bash
# Create deployment directory
mkdir -p ~/sqb-deploy/app

# Copy built files
cp -r dist/* ~/sqb-deploy/app/

# Copy .htaccess file
cp .htaccess ~/sqb-deploy/app/

# Create a zip file for easy upload
cd ~/sqb-deploy
zip -r sqb-app.zip .
cd ..
```

## Step 3: Upload to Shared Hosting

### Using cPanel File Manager:

1. Log in to your cPanel dashboard
2. Click on **File Manager**
3. Navigate to **public_html** directory
4. Create a new folder called **app** (if it doesn't exist)
5. Upload the `sqb-app.zip` file to the **app** folder
6. Right-click the zip file and select **Extract**
7. Delete the zip file after extraction

### Using FTP:

1. Connect to your FTP server using an FTP client (FileZilla, WinSCP, etc.)
2. Navigate to `public_html/app/`
3. Upload all files from `~/sqb-deploy/app/` to this directory
4. Ensure `.htaccess` file is uploaded (it may be hidden by default)

## Step 4: Set File Permissions

### Using cPanel File Manager:

1. Navigate to `public_html/app/`
2. Select all files and folders
3. Click **Permissions** button
4. Set permissions:
   - Directories: **755**
   - Files: **644**

### Using SSH:

```bash
# Connect to your server
ssh username@sqb-tunisie.com

# Navigate to app directory
cd public_html/app

# Set permissions
chmod -R 755 .
find . -type f -exec chmod 644 {} \;
```

## Step 5: Configure Backend (Node.js)

### Option A: Using cPanel's Node.js Selector

1. In cPanel, find **Setup Node.js App**
2. Click **Create Application**
3. Configure:
   - **Node.js version**: 18.x or higher
   - **Application root**: `/home/username/nodeapp` (create this directory)
   - **Application URL**: `yourdomain.com` or `api.yourdomain.com`
   - **Application startup file**: `server.js`
4. Click **Create**
5. Upload your `server.js` and related files to the application root

### Option B: Using PM2 (if SSH access available)

```bash
# SSH into your server
ssh username@sqb-tunisie.com

# Navigate to your app directory
cd ~/nodeapp

# Copy server files
cp server.js .
cp package.json .
cp .env .

# Install dependencies
npm install

# Start with PM2
pm2 start server.js --name "sqb-api"
pm2 save
pm2 startup
```

## Step 6: Configure Environment Variables

### For Backend Server:

Create a `.env` file in your Node.js app directory:

```env
NODE_ENV=production
PORT=3001
WOOCOMMERCE_URL=https://www.sqb-tunisie.com
WOOCOMMERCE_CONSUMER_KEY=ck_9ea2c038002c981296a19679add1d057338a3fef
WOOCOMMERCE_CONSUMER_SECRET=cs_07d5fcc411413459e46c01eee503f77a57beec7c
```

## Step 7: Test the Deployment

1. Visit `https://www.sqb-tunisie.com/app/` in your browser
2. You should see your Hardware Store application
3. Test the following features:
   - Browse categories
   - Search for products
   - Add items to cart
   - Complete checkout
   - Check browser console for any errors

## Step 8: Verify API Connectivity

Test the API endpoints:

```bash
# Test health check
curl https://www.sqb-tunisie.com/app/api/health

# Test categories
curl https://www.sqb-tunisie.com/app/api/categories

# Test products
curl https://www.sqb-tunisie.com/app/api/products
```

## Troubleshooting

### Issue: Application shows 404 error

**Solution:**
- Verify `.htaccess` file exists in `/app/` directory
- Check that mod_rewrite is enabled on your server
- Contact hosting support to enable mod_rewrite if needed

### Issue: API requests fail

**Solution:**
- Verify backend server is running
- Check that Node.js app is properly configured
- Review error logs in cPanel
- Ensure firewall allows connections to port 3001

### Issue: Static assets not loading (CSS, JS, images)

**Solution:**
- Verify `base: '/app/'` is set in `vite.config.ts`
- Rebuild the project: `npm run build`
- Clear browser cache (Ctrl+Shift+Delete)
- Check file permissions (should be 644 for files)

### Issue: Cart data not persisting

**Solution:**
- Check browser's localStorage is enabled
- Verify no browser privacy/security extensions blocking storage
- Check browser console for errors

## Performance Optimization

### Enable GZIP Compression

The `.htaccess` file already includes GZIP compression settings. Verify it's working:

```bash
curl -I -H "Accept-Encoding: gzip" https://www.sqb-tunisie.com/app/
```

Look for `Content-Encoding: gzip` in the response.

### Enable Browser Caching

The `.htaccess` file includes cache headers for static assets. This reduces bandwidth and improves load times.

## Security Checklist

- ✅ HTTPS enabled (SSL certificate installed)
- ✅ `.env` file not uploaded to public directory
- ✅ File permissions set correctly (644 for files, 755 for directories)
- ✅ Security headers configured in `.htaccess`
- ✅ API credentials stored securely on backend only
- ✅ Regular backups of your application

## Monitoring & Maintenance

### Regular Tasks:

1. **Monitor error logs** - Check cPanel error logs weekly
2. **Update dependencies** - Keep npm packages updated
3. **Backup your application** - Use cPanel backup feature
4. **Monitor disk usage** - Ensure sufficient storage space
5. **Test API connectivity** - Verify WooCommerce API access

### Useful Commands:

```bash
# View PM2 logs
pm2 logs sqb-api

# Restart backend
pm2 restart sqb-api

# Monitor processes
pm2 monit
```

## Updating Your Application

To deploy updates:

1. Make changes locally
2. Run `npm run build`
3. Create new zip file: `zip -r sqb-app.zip dist/* .htaccess`
4. Upload and extract to `/app/` directory
5. Clear browser cache
6. Test thoroughly

## Support & Resources

- **Vite Documentation**: https://vitejs.dev/
- **React Documentation**: https://react.dev/
- **WooCommerce API**: https://woocommerce.com/document/woocommerce-rest-api/
- **cPanel Documentation**: https://docs.cpanel.net/

## Next Steps

After successful deployment:

1. Monitor application performance
2. Gather user feedback
3. Plan for future enhancements
4. Set up automated backups
5. Consider CDN for static assets

---

**Deployment Date**: [Your deployment date]
**Version**: 1.0.0
**Last Updated**: October 27, 2025
