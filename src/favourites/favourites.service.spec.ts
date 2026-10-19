import { Test, TestingModule } from '@nestjs/testing';
import { FavouritesService } from './favourites.service';
import { Repository } from 'typeorm';
import { Favorite } from './favourites.entity';
import { Property } from '../properties/property.entity';

describe('FavouritesService', () => {
  let service: FavouritesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FavouritesService],
    }).useMocker(() => ({})).compile();

    service = module.get<FavouritesService>(FavouritesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('cannot save an unpublished property', async () => {
    const favorites = { findOne: jest.fn().mockResolvedValue(null) };
    const properties = { exists: jest.fn().mockResolvedValue(false) };
    const subject = new FavouritesService(favorites as unknown as Repository<Favorite>, properties as unknown as Repository<Property>);

    await expect(subject.toggle(4, 22)).rejects.toThrow('Property not found');
    expect(properties.exists).toHaveBeenCalledWith({ where: { id: 22, visibility: 'published' } });
  });
});
