import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { createError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendCustomerCredentials } from '../services/email.service.js';

/**
 * Generate a random password
 */
const generatePassword = (length: number = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

/**
 * Create a new customer (Admin only)
 */
export const createCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      email,
      username,
      password,
      firstName,
      lastName,
      phone,
      companyName,
      rneNumber,
      rnePdfUrl,
      taxId,
      customerType,
      address,
    } = req.body;

    // Validation
    if (!email) {
      throw createError('Email is required', 400);
    }

    if (!firstName || !lastName) {
      throw createError('First name and last name are required', 400);
    }

    if (!companyName) {
      throw createError('Company name is required', 400);
    }

    if (!rneNumber) {
      throw createError('Commercial Registration Number (RNE) is required', 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          username ? { username } : {},
          { rneNumber },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw createError('A customer with this email already exists', 409);
      }
      if (existingUser.username === username) {
        throw createError('This username is already taken', 409);
      }
      if (existingUser.rneNumber === rneNumber) {
        throw createError('A customer with this RNE number already exists', 409);
      }
    }

    // Generate or use provided password
    const plainPassword = password || generatePassword();
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    // Create customer
    const customer = await prisma.user.create({
      data: {
        email,
        username: username || email.split('@')[0],
        passwordHash,
        firstName,
        lastName,
        phone,
        companyName,
        rneNumber,
        rnePdfUrl,
        taxId,
        customerType,
        role: 'CUSTOMER',
        isActive: true,
        emailVerified: true, // Admin-created accounts are pre-verified
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        companyName: true,
        rneNumber: true,
        rnePdfUrl: true,
        taxId: true,
        customerType: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Create address if provided
    if (address) {
      await prisma.address.create({
        data: {
          userId: customer.id,
          label: 'Company Address',
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country || 'Tunisia',
          isDefault: true,
        },
      });
    }

    // Send credentials via email
    try {
      await sendCustomerCredentials({
        customerEmail: customer.email,
        customerName: `${customer.firstName} ${customer.lastName}`,
        username: customer.username!,
        password: plainPassword,
        companyName: customer.companyName || undefined,
      });
    } catch (emailError) {
      console.error('Failed to send credentials email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: {
        customer,
        credentials: {
          username: customer.username,
          password: plainPassword, // Return password to admin for display
          email: customer.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all customers (Admin only)
 */
export const getAllCustomers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, search, customerType, isActive } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause
    const where: any = {
      role: 'CUSTOMER',
    };

    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { companyName: { contains: search as string, mode: 'insensitive' } },
        { rneNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (customerType) {
      where.customerType = customerType;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Get customers with pagination
    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          phone: true,
          companyName: true,
          rneNumber: true,
          rnePdfUrl: true,
          taxId: true,
          customerType: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get customer by ID (Admin only)
 */
export const getCustomerById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const customer = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        companyName: true,
        rneNumber: true,
        rnePdfUrl: true,
        taxId: true,
        customerType: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        addresses: {
          select: {
            id: true,
            label: true,
            street: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
            isDefault: true,
          },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!customer) {
      throw createError('Customer not found', 404);
    }

    if (customer.role !== 'CUSTOMER') {
      throw createError('User is not a customer', 400);
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update customer (Admin only)
 */
export const updateCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      phone,
      companyName,
      rneNumber,
      rnePdfUrl,
      taxId,
      customerType,
      isActive,
    } = req.body;

    // Check if customer exists
    const existingCustomer = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      throw createError('Customer not found', 404);
    }

    if (existingCustomer.role !== 'CUSTOMER') {
      throw createError('User is not a customer', 400);
    }

    // Check for duplicate RNE if updating
    if (rneNumber && rneNumber !== existingCustomer.rneNumber) {
      const duplicateRNE = await prisma.user.findFirst({
        where: {
          rneNumber,
          id: { not: id },
        },
      });

      if (duplicateRNE) {
        throw createError('A customer with this RNE number already exists', 409);
      }
    }

    // Update customer
    const updatedCustomer = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        phone,
        companyName,
        rneNumber,
        rnePdfUrl,
        taxId,
        customerType,
        isActive,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        companyName: true,
        rneNumber: true,
        rnePdfUrl: true,
        taxId: true,
        customerType: true,
        isActive: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: updatedCustomer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete customer (Admin only)
 */
export const deleteCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if customer exists
    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!customer) {
      throw createError('Customer not found', 404);
    }

    if (customer.role !== 'CUSTOMER') {
      throw createError('User is not a customer', 400);
    }

    // Check if customer has orders
    if (customer._count.orders > 0) {
      // Soft delete by deactivating instead of hard delete
      await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });

      return res.json({
        success: true,
        message: 'Customer has orders and has been deactivated instead of deleted',
      });
    }

    // Hard delete if no orders
    await prisma.user.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset customer password (Admin only)
 */
export const resetCustomerPassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    // Check if customer exists
    const customer = await prisma.user.findUnique({
      where: { id },
    });

    if (!customer) {
      throw createError('Customer not found', 404);
    }

    if (customer.role !== 'CUSTOMER') {
      throw createError('User is not a customer', 400);
    }

    // Generate or use provided password
    const plainPassword = password || generatePassword();
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    // Send new credentials via email
    try {
      await sendCustomerCredentials({
        customerEmail: customer.email,
        customerName: `${customer.firstName} ${customer.lastName}`,
        username: customer.username || customer.email,
        password: plainPassword,
        companyName: customer.companyName || undefined,
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
    }

    res.json({
      success: true,
      message: 'Password reset successfully',
      data: {
        newPassword: plainPassword,
      },
    });
  } catch (error) {
    next(error);
  }
};
