import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all banner slides (public - for customer shop)
 */
export const getAllBannerSlides = async (req: Request, res: Response) => {
  try {
    const slides = await prisma.bannerSlide.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
      include: {
        linkedProduct: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        linkedCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: slides,
    });
  } catch (error) {
    console.error('Error fetching banner slides:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch banner slides',
      },
    });
  }
};

/**
 * Get all banner slides (admin - includes inactive)
 */
export const getAllBannerSlidesAdmin = async (req: Request, res: Response) => {
  try {
    const slides = await prisma.bannerSlide.findMany({
      orderBy: {
        displayOrder: 'asc',
      },
      include: {
        linkedProduct: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        linkedCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: slides,
    });
  } catch (error) {
    console.error('Error fetching banner slides:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch banner slides',
      },
    });
  }
};

/**
 * Get single banner slide
 */
export const getBannerSlide = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const slide = await prisma.bannerSlide.findUnique({
      where: { id },
      include: {
        linkedProduct: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        linkedCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!slide) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Banner slide not found',
        },
      });
    }

    res.json({
      success: true,
      data: slide,
    });
  } catch (error) {
    console.error('Error fetching banner slide:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch banner slide',
      },
    });
  }
};

/**
 * Create banner slide
 */
export const createBannerSlide = async (req: Request, res: Response) => {
  try {
    const {
      title,
      subtitle,
      buttonText,
      slideType,
      imageUrl,
      backgroundColor,
      textColor,
      linkType,
      linkedProductId,
      linkedCategoryId,
      displayOrder,
      isActive,
    } = req.body;

    // Validation
    if (!slideType || !['IMAGE', 'TEXT'].includes(slideType)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid slide type. Must be IMAGE or TEXT',
        },
      });
    }

    if (slideType === 'IMAGE' && !imageUrl) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Image URL is required for IMAGE slide type',
        },
      });
    }

    if (slideType === 'TEXT' && !backgroundColor) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Background color is required for TEXT slide type',
        },
      });
    }

    const slide = await prisma.bannerSlide.create({
      data: {
        title,
        subtitle,
        buttonText,
        slideType,
        imageUrl,
        backgroundColor,
        textColor: textColor || '#FFFFFF',
        linkType,
        linkedProductId,
        linkedCategoryId,
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        linkedProduct: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        linkedCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: slide,
    });
  } catch (error) {
    console.error('Error creating banner slide:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create banner slide',
      },
    });
  }
};

/**
 * Update banner slide
 */
export const updateBannerSlide = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle,
      buttonText,
      slideType,
      imageUrl,
      backgroundColor,
      textColor,
      linkType,
      linkedProductId,
      linkedCategoryId,
      displayOrder,
      isActive,
    } = req.body;

    const slide = await prisma.bannerSlide.update({
      where: { id },
      data: {
        title,
        subtitle,
        buttonText,
        slideType,
        imageUrl,
        backgroundColor,
        textColor,
        linkType,
        linkedProductId,
        linkedCategoryId,
        displayOrder,
        isActive,
      },
      include: {
        linkedProduct: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        linkedCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: slide,
    });
  } catch (error) {
    console.error('Error updating banner slide:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update banner slide',
      },
    });
  }
};

/**
 * Delete banner slide
 */
export const deleteBannerSlide = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.bannerSlide.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Banner slide deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting banner slide:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete banner slide',
      },
    });
  }
};

/**
 * Reorder banner slides
 */
export const reorderBannerSlides = async (req: Request, res: Response) => {
  try {
    const { slides } = req.body; // Array of { id, displayOrder }

    if (!Array.isArray(slides)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Slides must be an array',
        },
      });
    }

    // Update all slides in a transaction
    await prisma.$transaction(
      slides.map((slide: { id: string; displayOrder: number }) =>
        prisma.bannerSlide.update({
          where: { id: slide.id },
          data: { displayOrder: slide.displayOrder },
        })
      )
    );

    res.json({
      success: true,
      message: 'Banner slides reordered successfully',
    });
  } catch (error) {
    console.error('Error reordering banner slides:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to reorder banner slides',
      },
    });
  }
};
