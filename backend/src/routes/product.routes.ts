import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts,
  getFeaturedProducts,
  updateProductStock,
  addProductSizeTable,
  updateProductSizeTable,
  deleteProductSizeTable,
} from '../controllers/product.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/:id', getProductById);

// Protected routes (Admin only)
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), createProduct);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), deleteProduct);
router.patch('/:id/stock', authenticate, authorize('ADMIN', 'MANAGER'), updateProductStock);

// Size table routes
router.post('/:id/size-table', authenticate, authorize('ADMIN', 'MANAGER'), addProductSizeTable);
router.put('/:id/size-table/:sizeId', authenticate, authorize('ADMIN', 'MANAGER'), updateProductSizeTable);
router.delete('/:id/size-table/:sizeId', authenticate, authorize('ADMIN', 'MANAGER'), deleteProductSizeTable);

export default router;
