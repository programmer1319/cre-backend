import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { Repository } from 'typeorm';
import { Property } from '../properties/property.entity';

describe('LeadsService', () => {
  let service: LeadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeadsService],
    }).useMocker(() => ({})).compile();

    service = module.get<LeadsService>(LeadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects enquiries for unpublished properties', async () => {
    const propertyRepo = { findOne: jest.fn().mockResolvedValue(null) };
    const subject = new LeadsService({} as never, {} as never, {} as never, {} as never, {} as never, propertyRepo as unknown as Repository<Property>);

    await expect(subject.create({ name: 'Visitor', email: 'visitor@example.test', message: 'Could you send details?', property: 12 })).rejects.toThrow('Property not found');
    expect(propertyRepo.findOne).toHaveBeenCalledWith({ where: { id: 12, visibility: 'published' }, relations: ['owner'] });
  });

  it('does not return the loaded owner credentials after a status update', async () => {
    const lead = { id: 3, status: 'new', property: { id: 9, title: 'Office', owner: { id: 1, password: 'private-hash', tokenVersion: 7 } } };
    const repo = { findOne: jest.fn().mockResolvedValue(lead), save: jest.fn(async (item) => item) };
    const subject = new LeadsService({} as never, {} as never, {} as never, {} as never, repo as never, {} as never);
    const result = await subject.updateStatus(3, 'contacted', { id: 1, role: 'agent' });
    expect(result.property).toEqual({ id: 9, title: 'Office' });
    expect(JSON.stringify(result)).not.toContain('private-hash');
    expect(JSON.stringify(result)).not.toContain('tokenVersion');
  });
});
