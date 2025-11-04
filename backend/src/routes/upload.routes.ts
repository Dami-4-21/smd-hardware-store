import { Router } from 'express';
import { uploadImage, uploadMultipleImages, deleteImage } from '../controllers/upload.controller';
import { upload } from '../services/upload.service';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All upload routes require authentication (admin/manager only)
router.post('/image', authenticate, authorize('ADMIN', 'MANAGER'), upload.single('image'), uploadImage);
router.post('/images', authenticate, authorize('ADMIN', 'MANAGER'), upload.array('images', 10), uploadMultipleImages);
router.delete('/image', authenticate, authorize('ADMIN', 'MANAGER'), deleteImage);

export default router;
