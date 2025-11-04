import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Customer routes (authenticated customers)
 */

// Get customer's own orders (must be before GET /)
router.get('/my-orders', authenticate, getMyOrders);

// Create new order (authenticated customers)
router.post('/', authenticate, createOrder);

// Cancel order (customer can cancel their own pending orders)
router.put('/:id/cancel', authenticate, cancelOrder);

/**
 * Admin routes (admin/manager only)
 */

// Get all orders (admin only) - must be before GET /:id
router.get('/', authenticate, authorize('ADMIN', 'MANAGER'), getAllOrders);

// Update order status (admin only)
router.put('/:id/status', authenticate, authorize('ADMIN', 'MANAGER'), updateOrderStatus);

// Get specific order (customer can only see their own, admin can see all)
router.get('/:id', authenticate, getOrderById);

export default router;
