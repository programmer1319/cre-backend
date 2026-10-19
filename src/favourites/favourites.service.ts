import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from './favourites.entity';
import { Property } from '../properties/property.entity';

@Injectable()
export class FavouritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepo: Repository<Favorite>,
    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,
  ) {}

  async toggle(userId: number, propertyId: number) {
    const existing = await this.favoriteRepo.findOne({
      where: {
        user: { id: userId },
        property: { id: propertyId },
      },
      relations: ['user', 'property'],
    });
    // REMOVE
    if (existing) {
      await this.favoriteRepo.remove(existing);

      return {
        favorited: false,
      };
    }

    if (!(await this.propertyRepo.exists({ where: { id: propertyId, visibility: 'published' } }))) {
      throw new NotFoundException('Property not found');
    }

    // CREATE
    const favorite = this.favoriteRepo.create({
      user: { id: userId },
      property: { id: propertyId },
    });

    await this.favoriteRepo.save(favorite);

    return {
      favorited: true,
    };
  }

  async getUserFavorites(userId: number) {
    return this.favoriteRepo.find({
      where: {
        user: { id: userId },
        property: { visibility: 'published' },
      },
      relations: ['property'],
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
