import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
const categoriesDir = path.join(uploadsDir, 'categories');
const productsDir = path.join(uploadsDir, 'products');

[uploadsDir, categoriesDir, productsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Determine destination based on upload type
    const uploadType = req.body.uploadType || 'products';
    const dest = uploadType === 'categories' ? categoriesDir : productsDir;
    cb(null, dest);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext)
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase();
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images only
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Multer upload configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Helper function to delete file
export const deleteFile = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        // Ignore if file doesn't exist
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Helper function to get file URL
export const getFileUrl = (filename: string, type: 'categories' | 'products' = 'products'): string => {
  const baseUrl = process.env.API_URL || 'http://localhost:3001';
  return `${baseUrl}/uploads/${type}/${filename}`;
};

// Helper function to extract filename from URL
export const getFilenameFromUrl = (url: string): string | null => {
  const match = url.match(/\/uploads\/(categories|products)\/(.+)$/);
  return match ? match[2] : null;
};

// Helper function to get file path from URL
export const getFilePathFromUrl = (url: string): string | null => {
  const match = url.match(/\/uploads\/(categories|products)\/(.+)$/);
  if (!match) return null;
  
  const [, type, filename] = match;
  const dir = type === 'categories' ? categoriesDir : productsDir;
  return path.join(dir, filename);
};
