import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './property.entity';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,
  ) {}

  async create(property: Partial<Property>) {
    const newProperty = this.propertyRepo.create(property);
    return this.propertyRepo.save(newProperty);
  }

  async findAll() {
    return this.propertyRepo.find();
  }

  async findOne(id: string) {
    const property = await this.propertyRepo.findOneBy({ id: parseInt(id) });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }

  async update(id: string, updates: Partial<Property>) {
    const property = await this.findOne(id);

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    Object.assign(property, updates);
    return this.propertyRepo.save(property);
  }

  async remove(id: string) {
    const property = await this.findOne(id);

    if (!property) {
      throw new Error('Property not found');
    }
    await this.propertyRepo.remove(property);
    return { message: 'Property removed successfully' };
  }
}
