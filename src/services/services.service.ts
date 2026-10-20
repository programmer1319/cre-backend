import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateServiceDto, UpdateServiceDto } from './service.dto';
import { SiteService } from './service.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(SiteService) private readonly repo: Repository<SiteService>,
    private readonly config: ConfigService,
  ) {}

  async publicList() {
    return (await this.repo.find({ where: { isActive: true }, order: { sortOrder: 'ASC', id: 'ASC' } })).map((item) => this.withPublicImage(item));
  }

  async featured() {
    return (await this.repo.find({ where: { isActive: true, featured: true }, order: { sortOrder: 'ASC', id: 'ASC' }, take: 6 })).map((item) => this.withPublicImage(item));
  }

  async adminList() {
    return (await this.repo.find({ order: { sortOrder: 'ASC', id: 'ASC' } })).map((item) => this.withPublicImage(item));
  }

  async findOne(slug: string) {
    const service = await this.repo.findOne({ where: { slug, isActive: true } });
    if (!service) throw new NotFoundException('Service not found');
    return this.withPublicImage(service);
  }

  async create(dto: CreateServiceDto) {
    if (await this.repo.exists({ where: { slug: dto.slug } })) throw new ConflictException('This URL slug is already in use');
    await this.assertFeaturedLimit(dto.featured && dto.isActive);
    return this.withPublicImage(await this.repo.save(this.repo.create(dto)));
  }

  async update(id: number, dto: UpdateServiceDto) {
    const service = await this.repo.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    if (dto.slug && dto.slug !== service.slug && await this.repo.exists({ where: { slug: dto.slug } })) {
      throw new ConflictException('This URL slug is already in use');
    }
    const merged = this.repo.merge(service, dto);
    await this.assertFeaturedLimit(merged.featured && merged.isActive, id);
    return this.withPublicImage(await this.repo.save(merged));
  }

  async remove(id: number) {
    const service = await this.repo.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    await this.repo.remove(service);
    return { message: 'Service deleted' };
  }

  private async assertFeaturedLimit(featured: boolean, excludeId?: number) {
    if (!featured) return;
    const count = await this.repo.count({ where: { featured: true, isActive: true } });
    const currentlyFeatured = excludeId ? await this.repo.exists({ where: { id: excludeId, featured: true, isActive: true } }) : false;
    if (count - Number(currentlyFeatured) >= 6) throw new BadRequestException('At most six published services can be featured');
  }

  private withPublicImage(service: SiteService) {
    const base = (this.config.get<string>('BASE_URL') ?? '').replace(/\/$/, '');
    return {
      ...service,
      image: /^https?:\/\//.test(service.image) ? service.image : `${base}${service.image}`,
    };
  }
}
