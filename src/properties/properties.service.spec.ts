import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from './properties.service';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Property } from './property.entity';

describe('PropertiesService', () => {
  let service: PropertiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PropertiesService],
    }).useMocker(() => ({})).compile();

    service = module.get<PropertiesService>(PropertiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('filters draft listings from the public catalogue', async () => {
    const qb = {
      leftJoin: jest.fn().mockReturnThis(), select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(), andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(), getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    const repo = { createQueryBuilder: jest.fn().mockReturnValue(qb) };
    const subject = new PropertiesService({ get: () => 'https://example.test' } as unknown as ConfigService, repo as unknown as Repository<Property>);

    await subject.findAll({});
    expect(qb.where).toHaveBeenCalledWith('property.visibility = :visibility', { visibility: 'published' });

    qb.where.mockClear();
    await subject.findAll({}, true);
    expect(qb.where).not.toHaveBeenCalled();
  });

  it('rejects an update by a user who does not own the listing', async () => {
    const repo = { findOne: jest.fn().mockResolvedValue({ id: 7, owner: { id: 1 }, images: [] }) };
    const subject = new PropertiesService({} as ConfigService, repo as unknown as Repository<Property>);
    await expect(subject.update(7, {} as never, {}, { id: 2, role: 'agent' })).rejects.toThrow('You do not own this property');
  });
});
