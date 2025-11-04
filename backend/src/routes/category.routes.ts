import { Router } from 'express';
import {
  getAllCategories,
  getCategoryById,
  getSubcategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
} from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes (no authentication required)
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.get('/:parentId/subcategories', getSubcategories);
router.get('/:id/products', getCategoryProducts);

// Protected routes (admin only)
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), createCategory);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), updateCategory);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCategory);

export default router;
