import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  resetCustomerPassword,
} from '../controllers/customer.controller.js';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN', 'MANAGER'));

/**
 * @route   POST /api/customers
 * @desc    Create a new customer
 * @access  Admin only
 */
router.post('/', createCustomer);

/**
 * @route   GET /api/customers
 * @desc    Get all customers with pagination and filters
 * @access  Admin only
 */
router.get('/', getAllCustomers);

/**
 * @route   GET /api/customers/:id
 * @desc    Get customer by ID
 * @access  Admin only
 */
router.get('/:id', getCustomerById);

/**
 * @route   PUT /api/customers/:id
 * @desc    Update customer
 * @access  Admin only
 */
router.put('/:id', updateCustomer);

/**
 * @route   DELETE /api/customers/:id
 * @desc    Delete customer (soft delete if has orders)
 * @access  Admin only
 */
router.delete('/:id', deleteCustomer);

/**
 * @route   POST /api/customers/:id/reset-password
 * @desc    Reset customer password
 * @access  Admin only
 */
router.post('/:id/reset-password', resetCustomerPassword);

export default router;
