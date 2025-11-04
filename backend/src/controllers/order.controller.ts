import { Request, Response } from 'express';
import { PrismaClient, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate unique order number
 */
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Create a new order
 * POST /api/orders
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      items,
      shippingAddressId,
      shippingAddress,
      paymentMethod,
      notes,
    } = req.body;

    // Get authenticated user
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          where: { isDefault: true },
          take: 1,
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ITEMS',
          message: 'Order must contain at least one item',
        },
      });
    }

    // Calculate totals and validate products
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: `Product ${item.productId} not found`,
          },
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'PRODUCT_INACTIVE',
            message: `Product ${product.name} is not available`,
          },
        });
      }

      const unitPrice = Number(item.price || product.basePrice);
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        selectedSize: item.selectedSize || null,
        selectedUnitType: item.selectedUnitType || null,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });
    }

    // Calculate tax (10%)
    const taxAmount = subtotal * 0.1;
    const totalAmount = subtotal + taxAmount;

    // Determine shipping address
    let finalShippingAddress = shippingAddress;
    let finalShippingAddressId = shippingAddressId;

    if (!finalShippingAddress && !finalShippingAddressId) {
      // Use default address if available
      if (user.addresses.length > 0) {
        const defaultAddress = user.addresses[0];
        finalShippingAddressId = defaultAddress.id;
        finalShippingAddress = `${defaultAddress.street}, ${defaultAddress.city}${
          defaultAddress.postalCode ? ', ' + defaultAddress.postalCode : ''
        }, ${defaultAddress.country}`;
      }
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: user.id,
        customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        customerEmail: user.email,
        customerPhone: user.phone || '',
        shippingAddressId: finalShippingAddressId,
        shippingAddress: finalShippingAddress,
        status: OrderStatus.PENDING,
        paymentMethod: paymentMethod || PaymentMethod.CASH_ON_DELIVERY,
        paymentStatus: PaymentStatus.PENDING,
        subtotal,
        taxAmount,
        totalAmount,
        notes,
        items: {
          create: orderItems,
        },
        statusHistory: {
          create: {
            status: OrderStatus.PENDING,
            notes: 'Order created',
          },
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            companyName: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully',
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create order',
        details: error.message,
      },
    });
  }
};

/**
 * Get all orders (Admin only)
 * GET /api/orders
 */
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      search,
      userId,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search as string, mode: 'insensitive' } },
        { customerName: { contains: search as string, mode: 'insensitive' } },
        { customerEmail: { contains: search as string, mode: 'insensitive' } },
        { customerPhone: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              companyName: true,
              customerType: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    console.error('Get orders error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch orders',
        details: error.message,
      },
    });
  }
};

/**
 * Get order by ID
 * GET /api/orders/:id
 */
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                sku: true,
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            companyName: true,
            customerType: true,
          },
        },
        statusHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    // Check authorization (customer can only see their own orders)
    if (userRole === 'CUSTOMER' && order.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this order',
        },
      });
    }

    return res.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error('Get order error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch order',
        details: error.message,
      },
    });
  }
};

/**
 * Get customer's orders
 * GET /api/orders/my-orders
 */
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    const {
      page = '1',
      limit = '20',
      status,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                },
              },
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    console.error('Get my orders error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch orders',
        details: error.message,
      },
    });
  }
};

/**
 * Update order status (Admin only)
 * PUT /api/orders/:id/status
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status || !Object.values(OrderStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid order status',
        },
      });
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        statusHistory: {
          create: {
            status,
            notes: notes || `Status updated to ${status}`,
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            companyName: true,
          },
        },
        statusHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return res.json({
      success: true,
      data: order,
      message: 'Order status updated successfully',
    });
  } catch (error: any) {
    console.error('Update order status error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update order status',
        details: error.message,
      },
    });
  }
};

/**
 * Cancel order
 * PUT /api/orders/:id/cancel
 */
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    // Check authorization
    if (userRole === 'CUSTOMER' && order.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to cancel this order',
        },
      });
    }

    // Check if order can be cancelled
    if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_CANCEL',
          message: `Cannot cancel order with status ${order.status}`,
        },
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELLED,
        statusHistory: {
          create: {
            status: OrderStatus.CANCELLED,
            notes: reason || 'Order cancelled by user',
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      data: updatedOrder,
      message: 'Order cancelled successfully',
    });
  } catch (error: any) {
    console.error('Cancel order error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to cancel order',
        details: error.message,
      },
    });
  }
};
