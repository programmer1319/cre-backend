import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SiteService } from './service.entity';
import { ServicesService } from './services.service';
import { ConfigService } from '@nestjs/config';

describe('ServicesService', () => {
  const config = { get: jest.fn().mockReturnValue('http://localhost:3000') } as unknown as ConfigService;
  const value = {
    slug: 'new-service', title: 'New service', icon: 'pi-building', summary: 'A useful service',
    kicker: 'Advice', body: ['First paragraph'], outcomes: ['A result'],
    process: [{ title: 'Plan', detail: 'Agree a plan' }], faqs: [], image: 'img/04-services-facade.jpg',
    isActive: true, featured: true, sortOrder: 0,
  };

  it('rejects a seventh published featured service', async () => {
    const repo = {
      exists: jest.fn().mockResolvedValue(false),
      count: jest.fn().mockResolvedValue(6),
      create: jest.fn((item) => item),
      save: jest.fn(),
    } as unknown as Repository<SiteService>;
    const service = new ServicesService(repo, config);
    await expect(service.create(value)).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('allows a draft to be marked featured without using a home slot', async () => {
    const repo = {
      exists: jest.fn().mockResolvedValue(false),
      count: jest.fn(),
      create: jest.fn((item) => item),
      save: jest.fn(async (item) => item),
    } as unknown as Repository<SiteService>;
    const service = new ServicesService(repo, config);
    await service.create({ ...value, isActive: false });
    expect(repo.count).not.toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
  });

  it('expands uploaded images and preserves bundled frontend image paths', async () => {
    const repo = { find: jest.fn().mockResolvedValue([
      { ...value, image: 'img/04-services-facade.jpg' },
      { ...value, image: '/uploads/service.webp' },
      { ...value, image: 'https://images.example.test/service.webp' },
    ]) } as unknown as Repository<SiteService>;
    const result = await new ServicesService(repo, config).publicList();
    expect(result.map((item) => item.image)).toEqual([
      'img/04-services-facade.jpg', 'http://localhost:3000/uploads/service.webp', 'https://images.example.test/service.webp',
    ]);
  });
});
