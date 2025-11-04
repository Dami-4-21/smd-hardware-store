import { Request, Response } from 'express';
import { getFileUrl, deleteFile, getFilePathFromUrl } from '../services/upload.service';

/**
 * Upload single image
 */
export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No file uploaded',
        },
      });
    }

    const uploadType = req.body.uploadType || 'products';
    const fileUrl = getFileUrl(req.file.filename, uploadType as 'categories' | 'products');

    res.status(201).json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl,
      },
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to upload image',
      },
    });
  }
};

/**
 * Upload multiple images
 */
export const uploadMultipleImages = async (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No files uploaded',
        },
      });
    }

    const uploadType = req.body.uploadType || 'products';
    const files = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: getFileUrl(file.filename, uploadType as 'categories' | 'products'),
    }));

    res.status(201).json({
      success: true,
      data: {
        files,
        count: files.length,
      },
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to upload images',
      },
    });
  }
};

/**
 * Delete image by URL
 */
export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Image URL is required',
        },
      });
    }

    const filePath = getFilePathFromUrl(url);
    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid image URL',
        },
      });
    }

    await deleteFile(filePath);

    res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete image',
      },
    });
  }
};
