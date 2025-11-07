import { Router } from 'express';
import {
  getAllBannerSlides,
  getAllBannerSlidesAdmin,
  getBannerSlide,
  createBannerSlide,
  updateBannerSlide,
  deleteBannerSlide,
  reorderBannerSlides,
} from '../controllers/banner.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllBannerSlides);
router.get('/:id', getBannerSlide);

// Admin routes
router.get('/admin/all', authenticate, authorize('ADMIN', 'MANAGER'), getAllBannerSlidesAdmin);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), createBannerSlide);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), updateBannerSlide);
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), deleteBannerSlide);
router.post('/reorder', authenticate, authorize('ADMIN', 'MANAGER'), reorderBannerSlides);

export default router;
