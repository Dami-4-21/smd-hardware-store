import { Request, Response } from 'express';
import { PrismaClient, QuotationStatus, PaymentTerm } from '@prisma/client';

const prisma = new PrismaClient();

function generateQuotationNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `QUO-${timestamp}-${random}`;
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

function calculateDueDate(paymentTerm?: PaymentTerm | null): Date | null {
  if (!paymentTerm || paymentTerm === 'IMMEDIATE') return null;
  const daysMap = { NET_30: 30, NET_60: 60, NET_90: 90, NET_120: 120 };
  const days = daysMap[paymentTerm] || 0;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + days);
  return dueDate;
}

export const createQuotation = async (req: Request, res: Response) => {
  try {
    const { items, shippingAddressId, shippingAddress, notes } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    if (!items?.length) {
      return res.status(400).json({ success: false, error: { message: 'Items required' } });
    }

    let subtotal = 0;
    const quotationItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return res.status(404).json({ success: false, error: { message: `Product ${item.productId} not found` } });
      }

      const unitPrice = item.unitPrice || product.basePrice;
      const totalPrice = unitPrice * item.quantity;
      subtotal += Number(totalPrice);

      quotationItems.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        selectedSize: item.selectedSize,
        selectedUnitType: item.selectedUnitType,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });
    }

    const taxAmount = subtotal * 0.19;
    const totalAmount = subtotal + taxAmount;
    const anticipatedOutstanding = Number(user.currentOutstanding || 0) + totalAmount;

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber: generateQuotationNumber(),
        userId,
        status: 'DRAFT',
        subtotal,
        taxAmount,
        totalAmount,
        anticipatedOutstanding,
        shippingAddressId,
        shippingAddress,
        notes,
        items: { create: quotationItems },
      },
      include: {
        items: { include: { product: true } },
        user: true,
      },
    });

    res.status(201).json({ success: true, data: quotation });
  } catch (error) {
    console.error('Error creating quotation:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to create quotation' } });
  }
};

export const getAllQuotations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { status, customerId } = req.query;

    const where: any = {};
    if (userRole === 'CUSTOMER') where.userId = userId;
    if ((userRole === 'ADMIN' || userRole === 'MANAGER') && customerId) where.userId = customerId;
    if (status) where.status = status;

    const quotations = await prisma.quotation.findMany({
      where,
      include: {
        items: { include: { product: true } },
        user: true,
        reviewer: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: quotations });
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch quotations' } });
  }
};

export const getQuotationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        items: { include: { product: { include: { images: { take: 1 } } } } },
        user: true,
        shippingAddr: true,
        reviewer: true,
        convertedOrder: true,
      },
    });

    if (!quotation) {
      return res.status(404).json({ success: false, error: { message: 'Quotation not found' } });
    }

    if (userRole === 'CUSTOMER' && quotation.userId !== userId) {
      return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    }

    res.json({ success: true, data: quotation });
  } catch (error) {
    console.error('Error fetching quotation:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch quotation' } });
  }
};

export const submitQuotation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const quotation = await prisma.quotation.findUnique({ where: { id } });
    if (!quotation) {
      return res.status(404).json({ success: false, error: { message: 'Quotation not found' } });
    }

    if (quotation.userId !== userId) {
      return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    }

    if (quotation.status !== 'DRAFT') {
      return res.status(400).json({ success: false, error: { message: 'Only drafts can be submitted' } });
    }

    const updated = await prisma.quotation.update({
      where: { id },
      data: { status: 'PENDING_APPROVAL' },
      include: { items: true, user: true },
    });

    res.json({ success: true, data: updated, message: 'Quotation submitted for approval' });
  } catch (error) {
    console.error('Error submitting quotation:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to submit quotation' } });
  }
};

export const approveQuotation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUserId = req.user?.id;
    const userRole = req.user?.role;

    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    }

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { user: true, items: { include: { product: true } }, shippingAddr: true },
    });

    if (!quotation) {
      return res.status(404).json({ success: false, error: { message: 'Quotation not found' } });
    }

    if (quotation.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({ success: false, error: { message: 'Only pending quotations can be approved' } });
    }

    const customer = quotation.user;
    const creditWarning = Number(quotation.anticipatedOutstanding) > Number(customer.financialLimit || 0);

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: customer.id,
          customerName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email,
          customerEmail: customer.email,
          customerPhone: customer.phone || '',
          shippingAddressId: quotation.shippingAddressId,
          shippingAddress: quotation.shippingAddress,
          status: 'PENDING',
          paymentMethod: 'NET_TERMS',
          paymentStatus: 'PENDING',
          paymentTerm: customer.paymentTerm || 'NET_30',
          dueDate: calculateDueDate(customer.paymentTerm),
          subtotal: quotation.subtotal,
          taxAmount: quotation.taxAmount,
          totalAmount: quotation.totalAmount,
          quotationId: quotation.id,
          notes: quotation.notes,
        },
      });

      for (const item of quotation.items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            productSku: item.productSku,
            selectedSize: item.selectedSize,
            selectedUnitType: item.selectedUnitType,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'PENDING',
          notes: 'Order created from approved quotation',
        },
      });

      await tx.quotation.update({
        where: { id },
        data: {
          status: 'CONVERTED_TO_ORDER',
          convertedToOrderId: order.id,
          reviewedBy: adminUserId,
          reviewedAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: customer.id },
        data: { currentOutstanding: { increment: Number(quotation.totalAmount) } },
      });

      return { order, creditWarning };
    });

    res.json({
      success: true,
      data: result,
      message: result.creditWarning ? 'Order created - Customer exceeds credit limit' : 'Order created successfully',
    });
  } catch (error) {
    console.error('Error approving quotation:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to approve quotation' } });
  }
};

export const declineQuotation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUserId = req.user?.id;
    const userRole = req.user?.role;
    const { reason } = req.body;

    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    }

    if (!reason?.trim()) {
      return res.status(400).json({ success: false, error: { message: 'Decline reason required' } });
    }

    const quotation = await prisma.quotation.findUnique({ where: { id } });
    if (!quotation) {
      return res.status(404).json({ success: false, error: { message: 'Quotation not found' } });
    }

    if (quotation.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({ success: false, error: { message: 'Only pending quotations can be declined' } });
    }

    const updated = await prisma.quotation.update({
      where: { id },
      data: {
        status: 'DECLINED',
        adminDecisionReason: reason,
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
      },
      include: { user: true, reviewer: true },
    });

    res.json({ success: true, data: updated, message: 'Quotation declined' });
  } catch (error) {
    console.error('Error declining quotation:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to decline quotation' } });
  }
};

export const deleteQuotation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const quotation = await prisma.quotation.findUnique({ where: { id } });
    if (!quotation) {
      return res.status(404).json({ success: false, error: { message: 'Quotation not found' } });
    }

    if (quotation.userId !== userId) {
      return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    }

    if (quotation.status !== 'DRAFT') {
      return res.status(400).json({ success: false, error: { message: 'Only drafts can be deleted' } });
    }

    await prisma.quotation.delete({ where: { id } });
    res.json({ success: true, message: 'Quotation deleted' });
  } catch (error) {
    console.error('Error deleting quotation:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to delete quotation' } });
  }
};
