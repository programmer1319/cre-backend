import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lead } from './leads.entity';
import { Repository } from 'typeorm';
import { Property } from 'src/properties/property.entity';
import { NotificationsGateway } from 'src/notification/notification.gateway';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class LeadsService {
  constructor(
    private notificationService: NotificationService,
    private gateway: NotificationsGateway,
    @InjectRepository(Lead)
    private leadRepo: Repository<Lead>,
    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,
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
    const notification = await this.notificationService.create(
      property.owner.id,
      `New inquiry for ${property.title}`,
      'lead',
      property.id,
    );
    this.gateway.sendNotification(property.owner.id, notification);

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
