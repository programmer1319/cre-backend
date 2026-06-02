import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Property } from 'src/properties/property.entity';
import { Lead } from 'src/leads/leads.entity';
import { User } from 'src/users/user.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,

    @InjectRepository(Lead)
    private leadRepo: Repository<Lead>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async stats() {
    const properties = await this.propertyRepo.count();
    const leads = await this.leadRepo.count();
    const users = await this.userRepo.count();

    return {
      properties,
      leads,
      users,
      revenue: 125000,
    };
  }

  async revenue() {
    return [
      { month: 'Jan', revenue: 12000 },
      { month: 'Feb', revenue: 18000 },
      { month: 'Mar', revenue: 22000 },
      { month: 'Apr', revenue: 31000 },
      { month: 'May', revenue: 45000 },
    ];
  }

  async leads() {
    return [
      { month: 'Jan', leads: 20 },
      { month: 'Feb', leads: 35 },
      { month: 'Mar', leads: 55 },
      { month: 'Apr', leads: 80 },
    ];
  }
}