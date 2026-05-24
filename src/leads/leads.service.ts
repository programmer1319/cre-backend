import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lead } from './leads.entity';
import { Repository } from 'typeorm';
import { NotificationService } from 'src/notification/notification.service';
import { Property } from 'src/properties/property.entity';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadRepo: Repository<Lead>,
    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,
    private notificationsService: NotificationService,
  ) {}

  async create(data: any) {
    const property = await this.propertyRepo.findOne({
      where: {
        id: Number(data.property),
      },
      relations: ['owner'],
    });

    if (!property) {
      throw new Error('Property not found');
    }

    await this.notificationsService.create(
      property.owner.id,
      `New inquiry for ${property.title}`,
      'lead',
    );

    const lead = this.leadRepo.create({
      name: data.name,
      email: data.email,
      message: data.message,
      property,
    });

    return this.leadRepo.save(lead);
  }

  findAll() {
    return this.leadRepo.find({
      relations: ['property'],
      order: { createdAt: 'DESC' },
    });
  }
}
