import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SiteService } from './service.entity';
import { ServicesService } from './services.service';

describe('ServicesService', () => {
  const value = {
    slug: 'new-service', title: 'New service', icon: 'pi-building', summary: 'A useful service',
    kicker: 'Advice', body: ['First paragraph'], outcomes: ['A result'],
    process: [{ title: 'Plan', detail: 'Agree a plan' }], faqs: [], image: 'img/04-services-facade.jpg',
    isActive: true, featured: true, sortOrder: 0,
  };

  it('rejects a tenth published featured service', async () => {
    const repo = {
      exists: jest.fn().mockResolvedValue(false),
      count: jest.fn().mockResolvedValue(9),
      create: jest.fn((item) => item),
      save: jest.fn(),
    } as unknown as Repository<SiteService>;
    const service = new ServicesService(repo);
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
    const service = new ServicesService(repo);
    await service.create({ ...value, isActive: false });
    expect(repo.count).not.toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
  });
});
