import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Media } from './entities/media.entity';
import { Repository } from 'typeorm';
import sharp from 'sharp/lib';
import { extname } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class MediaService {
  constructor(@InjectRepository(Media) private repo: Repository<Media>) {}

  async saveUpload(file: Express.Multer.File): Promise<Media> {
    if (!file) throw new BadRequestException('An image file is required');
    await fs.mkdir('./uploads/thumbs', { recursive: true });
    // Generate WebP thumbnail with Sharp
    const thumbName = `thumb_${file.filename.replace(extname(file.filename), '.webp')}`;
    await sharp(file.path)
      .resize(400, 300, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(`./uploads/thumbs/${thumbName}`);

    // Get original dimensions
    const meta = await sharp(file.path).metadata();

    const media = this.repo.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      url: `/uploads/${file.filename}`,
      width: meta.width,
      height: meta.height,
    });
    return this.repo.save(media);
  }

  async findAll(): Promise<Media[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async remove(id: number) {
    const media = await this.repo.findOne({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    await fs.unlink(`./uploads/${media.filename}`).catch(() => {});
    const thumbName = `thumb_${media.filename.replace(extname(media.filename), '.webp')}`;
    await fs.unlink(`./uploads/thumbs/${thumbName}`).catch(() => {});
    return this.repo.remove(media);
  }
}
