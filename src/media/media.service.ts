import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Media } from './entities/media.entity';
import { Repository } from 'typeorm';
import sharp from 'sharp';
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
    let meta;
    try {
      // Decode before persisting the media record: a claimed image MIME type is not proof of
      // valid image data, and failed uploads must not leave a public file behind.
      meta = await sharp(file.path).metadata();
      if (!['jpeg', 'png', 'webp', 'avif'].includes(meta.format ?? '')) throw new Error('Invalid image');
      await sharp(file.path)
        .resize(400, 300, { fit: 'cover' })
        .webp({ quality: 80 })
        .toFile(`./uploads/thumbs/${thumbName}`);
    } catch {
      await Promise.all([
        fs.unlink(file.path).catch(() => undefined),
        fs.unlink(`./uploads/thumbs/${thumbName}`).catch(() => undefined),
      ]);
      throw new BadRequestException('A valid image file is required');
    }

    const media = this.repo.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      url: `/uploads/${file.filename}`,
      width: meta.width,
      height: meta.height,
    });
    return this.withPublicUrl(await this.repo.save(media));
  }

  async findAll(): Promise<Media[]> {
    const media = await this.repo.find({ order: { createdAt: 'DESC' } });
    return media.map((item) => this.withPublicUrl(item));
  }

  async remove(id: number) {
    const media = await this.repo.findOne({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    await fs.unlink(`./uploads/${media.filename}`).catch(() => {});
    const thumbName = `thumb_${media.filename.replace(extname(media.filename), '.webp')}`;
    await fs.unlink(`./uploads/thumbs/${thumbName}`).catch(() => {});
    return this.repo.remove(media);
  }

  async update(id: number, values: { altText?: string }) {
    const media = await this.repo.findOne({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    return this.withPublicUrl(await this.repo.save(this.repo.merge(media, values)));
  }

  private withPublicUrl(item: Media): Media {
    const base = (process.env.BASE_URL ?? '').replace(/\/$/, '');
    item.url = item.url.startsWith('http') ? item.url : `${base}${item.url}`;
    return item;
  }
}
