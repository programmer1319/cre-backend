import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './property.entity';
import { FilterPropertyDto } from './filter-property.dto';
import { MapBoundsDto } from './map-bounds.dto';
import type { Express } from 'express';

const LIST_COLUMNS = [
  'property.id',
  'property.title',
  'property.price',
  'property.city',
  'property.location',
  'property.propertyType',
  'property.bedrooms',
  'property.bathrooms',
  'property.area',
  'property.images',
  'property.createdAt',
  // owner fields — safe subset only
  'owner.id',
  'owner.name',
  'owner.email',
];

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,
  ) {}

  // ── CREATE ───────────────────────────────────────────────
  async create(data: Partial<Property>) {
    const property = this.propertyRepo.create(data);
    return this.propertyRepo.save(property);
  }

  // ── LIST (public + my-properties) ────────────────────────
  async findAll(query: FilterPropertyDto) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(48, Math.max(1, Number(query.limit || 12)));

    const qb = this.propertyRepo
      .createQueryBuilder('property')
      .leftJoin('property.owner', 'owner')
      .select(LIST_COLUMNS);

    // Scope to one owner (used by dashboard "my properties")
    if (query.ownerId) {
      qb.andWhere('owner.id = :ownerId', { ownerId: Number(query.ownerId) });
    }

    if (query.search?.trim()) {
      qb.andWhere(
        `(LOWER(property.title)        LIKE LOWER(:s)
          OR LOWER(property.city)       LIKE LOWER(:s)
          OR LOWER(property.propertyType) LIKE LOWER(:s))`,
        { s: `%${query.search.trim()}%` },
      );
    }

    if (query.city?.trim()) {
      qb.andWhere('LOWER(property.city) LIKE LOWER(:city)', {
        city: `%${query.city.trim()}%`,
      });
    }

    if (query.propertyType) {
      qb.andWhere('property.propertyType = :pt', { pt: query.propertyType });
    }

    if (query.minPrice) {
      qb.andWhere('property.price >= :min', { min: Number(query.minPrice) });
    }

    if (query.maxPrice) {
      qb.andWhere('property.price <= :max', { max: Number(query.maxPrice) });
    }

    if (query.bedrooms) {
      qb.andWhere('property.bedrooms >= :bed', { bed: Number(query.bedrooms) });
    }

    switch (query.sort) {
      case 'price_asc':
        qb.orderBy('property.price', 'ASC');
        break;
      case 'price_desc':
        qb.orderBy('property.price', 'DESC');
        break;
      default:
        qb.orderBy('property.createdAt', 'DESC');
        break;
    }

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ── DETAIL ───────────────────────────────────────────────
  async findOne(id: string) {
    const property = await this.propertyRepo
      .createQueryBuilder('property')
      .leftJoin('property.owner', 'owner')
      .addSelect(['owner.id', 'owner.name', 'owner.email'])
      .where('property.id = :id', { id: parseInt(id) })
      .getOne();

    if (!property) throw new NotFoundException('Property not found');
    return property;
  }

  // ── UPDATE (owner or admin only) ─────────────────────────
  async update(
    id: number,
    body: any,
    files: Express.Multer.File[],
    baseUrl: string,
    requestingUser: { id: number; role: string },
  ) {
    const existing = await this.propertyRepo.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!existing) throw new NotFoundException('Property not found');

    this.assertOwnerOrAdmin(existing, requestingUser);

    const kept: string[] = body.keepImages
      ? Array.isArray(body.keepImages)
        ? body.keepImages
        : [body.keepImages]
      : [];

    const newImages = files?.length
      ? files.map((f) => `${baseUrl}/uploads/${f.filename}`)
      : [];

    const images = [...kept, ...newImages];
    const { keepImages, ...rest } = body;

    return this.propertyRepo.save({
      ...existing,
      ...rest,
      images: images.length ? images : existing.images,
    });
  }

  // ── DELETE (owner or admin only) ─────────────────────────
  async remove(id: string, requestingUser: { id: number; role: string }) {
    const property = await this.propertyRepo.findOne({
      where: { id: parseInt(id) },
      relations: ['owner'],
    });

    if (!property) throw new NotFoundException('Property not found');

    this.assertOwnerOrAdmin(property, requestingUser);

    await this.propertyRepo.remove(property);
    return { message: 'Property removed successfully' };
  }

  // ── MAP BOUNDS ───────────────────────────────────────────
  async findWithinBounds(bounds: MapBoundsDto) {
    return this.propertyRepo
      .createQueryBuilder('property')
      .leftJoin('property.owner', 'owner')
      .select(LIST_COLUMNS)
      .where('property.latitude  BETWEEN :south AND :north', {
        south: bounds.south,
        north: bounds.north,
      })
      .andWhere('property.longitude BETWEEN :west AND :east', {
        west: bounds.west,
        east: bounds.east,
      })
      .getMany();
  }

  // ── PRIVATE ──────────────────────────────────────────────
  private assertOwnerOrAdmin(
    property: Property,
    user: { id: number; role: string },
  ) {
    const isOwner = property.owner?.id === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You do not own this property');
    }
  }
}
