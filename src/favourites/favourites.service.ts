import { Injectable } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from 'src/properties/property.entity';

@Injectable()
export class FavouritesService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,
  ) {}

  async addFavorite(userId: number, propertyId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });

    if (!user) return null;

    const property = await this.propertyRepo.findOneBy({
      id: propertyId,
    });

    if (!property) return null;

    const alreadyExists = user.favorites.some((p) => p.id === propertyId);

    if (alreadyExists) {
      return user.favorites;
    }

    user.favorites.push(property);

    return this.userRepo.save(user);
  }

  async removeFavorite(userId: number, propertyId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });

    if (!user) return null;
    user.favorites = user.favorites.filter((p) => p.id !== Number(propertyId));
    return this.userRepo.save(user);
  }

  async getFavorites(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });

    if (!user) return null;
    return user.favorites;
  }
}
