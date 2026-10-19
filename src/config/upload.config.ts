import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { BadRequestException } from '@nestjs/common';

const extensions: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'application/pdf': '.pdf',
};

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      cb(null, `${randomUUID()}${extensions[file.mimetype] ?? ''}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    cb(null, allowed.includes(file.mimetype));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
};

export const propertyUploadConfig = {
  storage: diskStorage({
    destination: './uploads',
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${extensions[file.mimetype] ?? ''}`),
  }),
  fileFilter: (_req, file, cb) => {
    const images = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    const valid = file.fieldname === 'documents'
      ? file.mimetype === 'application/pdf'
      : file.fieldname === 'images' && images.includes(file.mimetype);
    cb(valid ? null : new BadRequestException('Only supported images and PDF documents are allowed'), valid);
  },
  limits: { fileSize: 10 * 1024 * 1024, files: 15 },
};
