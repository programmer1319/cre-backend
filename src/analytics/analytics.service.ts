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
    const [properties, leads, users, revenueRow] = await Promise.all([
      this.propertyRepo.count(),
      this.leadRepo.count(),
      this.userRepo.count(),
      this.propertyRepo.createQueryBuilder('property').select('COALESCE(SUM(property.price), 0)', 'revenue').getRawOne<{ revenue: string }>(),
    ]);

    return {
      properties,
      leads,
      users,
      revenue: Number(revenueRow?.revenue ?? 0),
    };
  }

  async revenue() {
    return this.propertyRepo.createQueryBuilder('property')
      .select("DATE_FORMAT(property.createdAt, '%Y-%m')", 'month')
      .addSelect('SUM(property.price)', 'revenue')
      .where('property.createdAt >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)')
      .groupBy("DATE_FORMAT(property.createdAt, '%Y-%m')")
      .orderBy('month', 'ASC')
      .getRawMany();
  }

  async leads() {
    const rows = await this.leadRepo.createQueryBuilder('lead')
      .select("DATE_FORMAT(lead.createdAt, '%Y-%m')", 'month')
      .addSelect('COUNT(*)', 'leads')
      .where('lead.createdAt >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)')
      .groupBy("DATE_FORMAT(lead.createdAt, '%Y-%m')")
      .orderBy('month', 'ASC')
      .getRawMany<{ month: string; leads: string }>();
    return rows.map((row) => ({ month: row.month, leads: Number(row.leads) }));
  }
}
