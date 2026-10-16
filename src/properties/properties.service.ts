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
import { ConfigService } from '@nestjs/config';

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
    private configService: ConfigService,

    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,
  ) {}

  // ── CREATE ───────────────────────────────────────────────
  async create(data: Partial<Property>) {
    const property = this.propertyRepo.create(data);
    const saved = await this.propertyRepo.save(property);
    return this.findOne(String(saved.id));
  }

  async findFeatured() {
    const result = await this.findAll({ page: '1', limit: '6', sort: 'latest' });
    return result.data;
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

    const transformed = data.map((p) => this.appendImageUrls(p));

    return {
      data: transformed,
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
    return this.appendImageUrls(property);
  }

  // ── UPDATE (owner or admin only) ─────────────────────────
  async update(
    id: number,
    body: any,
    files: Express.Multer.File[],
    requestingUser: { id: number; role: string },
  ) {
    const existing = await this.propertyRepo.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!existing) throw new NotFoundException('Property not found');

    this.assertOwnerOrAdmin(existing, requestingUser);

    const keptUrls: string[] = body.keepImages
      ? Array.isArray(body.keepImages)
        ? body.keepImages
        : [body.keepImages]
      : [];
    const kept = keptUrls.map((value) => {
      try {
        return decodeURIComponent(new URL(value, 'http://local').pathname.split('/').pop() ?? '');
      } catch {
        return value.split('/').pop() ?? value;
      }
    }).filter(Boolean);

    const newImages = files?.length ? files.map((f) => f.filename) : [];

    const images = [...kept, ...newImages];
    const { keepImages, ...raw } = body;
    const numeric = ['price', 'area', 'bedrooms', 'bathrooms', 'latitude', 'longitude'];
    const rest = Object.fromEntries(
      Object.entries(raw).map(([key, value]) => [key, numeric.includes(key) ? Number(value) : value]),
    );

    await this.propertyRepo.save({
      ...existing,
      ...rest,
      images: images.length ? images : existing.images,
    });
    return this.findOne(String(id));
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
    const properties = await this.propertyRepo
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

    return properties.map((p) => this.appendImageUrls(p));
  }

  // ── PRIVATE ──────────────────────────────────────────────
  private assertOwnerOrAdmin(
    property: Property,
    user: { id: number; role: string },
  ) {
    const isOwner = Number(property.owner?.id) === Number(user.id);
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You do not own this property');
    }
  }

  private appendImageUrls(property: Property) {
    const baseUrl = (this.configService.get<string>('BASE_URL') ?? 'http://api.local.test:3000').replace(/\/$/, '');

    return {
      ...property,
      images: property.images?.map((img) => /^https?:\/\//.test(img) ? img : `${baseUrl}/uploads/${img}`) ?? [],
    };
  }
}
