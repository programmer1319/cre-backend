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

  it('returns usable image and brochure URLs for saved listings', async () => {
    const favorites = { find: jest.fn().mockResolvedValue([
      { id: 1, property: { id: 9, images: ['office.jpg'], documents: [{ title: 'Brochure', url: '/uploads/brochure.pdf' }] } },
    ]) };
    const subject = new FavouritesService(favorites as unknown as Repository<Favorite>, {} as Repository<Property>);
    const base = (process.env.BASE_URL ?? 'http://api.local.test:3000').replace(/\/$/, '');
    const result = await subject.getUserFavorites(4);
    expect(result[0].property.images).toEqual([`${base}/uploads/office.jpg`]);
    expect(result[0].property.documents[0].url).toBe(`${base}/uploads/brochure.pdf`);
  });
});
