import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from './favourites.entity';

@Injectable()
export class FavouritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepo: Repository<Favorite>,
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
      },
      relations: ['property'],
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
