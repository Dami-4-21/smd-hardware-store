import express from 'express';
import {
  createQuotation,
  getAllQuotations,
  getQuotationById,
  submitQuotation,
  approveQuotation,
  declineQuotation,
  deleteQuotation,
} from '../controllers/quotation.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Customer routes
router.post('/', createQuotation);                    // Create draft quotation
router.get('/', getAllQuotations);                    // List quotations (filtered by role)
router.get('/:id', getQuotationById);                 // Get quotation details
router.post('/:id/submit', submitQuotation);          // Submit for approval
router.delete('/:id', deleteQuotation);               // Delete draft

// Admin/Manager routes
router.put('/:id/approve', approveQuotation);         // Approve & convert to order
router.put('/:id/decline', declineQuotation);         // Decline quotation

export default router;
