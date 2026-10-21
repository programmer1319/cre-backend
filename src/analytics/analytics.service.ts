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

  /** One dashboard read prevents a normal page load from bursting the hosting gateway. */
  async overview(months: number, user: { id: number; role: string }) {
    const [stats, revenue, holdings, recentLeads] = await Promise.all([
      this.stats(),
      this.revenue(months),
      this.holdings(),
      this.recentLeads(user),
    ]);
    return { stats, revenue, holdings, recentLeads };
  }

  private recentLeads(user: { id: number; role: string }) {
    const query = this.leadRepo
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.property', 'property')
      .leftJoin('property.owner', 'owner')
      .select(['lead.id', 'lead.name', 'lead.createdAt', 'property.id', 'property.title'])
      .orderBy('lead.createdAt', 'DESC')
      .take(4);

    if (user.role !== 'admin') query.where('owner.id = :ownerId', { ownerId: user.id });
    return query.getMany();
  }

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

  /**
   * Portfolio composition by asset class.
   *
   * Lives in analytics rather than being derived on the client from a page of listings: the
   * share of the portfolio has to be computed over every row, not over whichever page happens
   * to be loaded.
   */
  async holdings() {
    const rows = await this.propertyRepo
      .createQueryBuilder('property')
      .select('property.propertyType', 'type')
      .addSelect('COUNT(property.id)', 'count')
      .addSelect('COALESCE(SUM(property.price), 0)', 'value')
      .where('property.propertyType IS NOT NULL')
      .andWhere("property.propertyType <> ''")
      .groupBy('property.propertyType')
      .orderBy('count', 'DESC')
      .getRawMany<{ type: string; count: string; value: string }>();

    const total = rows.reduce((sum, row) => sum + Number(row.count), 0);

    return rows.map((row) => ({
      type: row.type,
      count: Number(row.count),
      value: Number(row.value),
      share: total ? Math.round((Number(row.count) / total) * 100) : 0,
    }));
  }

  /**
   * Monthly sums over a trailing window.
   *
   * `months` is clamped to an integer before it reaches the SQL. MySQL will not accept a bound
   * parameter inside an `INTERVAL` literal, so the value is interpolated — safe only because
   * `clampMonths` has already reduced it to an integer between 1 and 36.
   */
  async revenue(months = 6) {
    const window = clampMonths(months);

    const rows = await this.propertyRepo
      .createQueryBuilder('property')
      .select("DATE_FORMAT(property.createdAt, '%Y-%m')", 'month')
      .addSelect('SUM(property.price)', 'revenue')
      .where(`property.createdAt >= DATE_SUB(CURRENT_DATE, INTERVAL ${window} MONTH)`)
      .groupBy("DATE_FORMAT(property.createdAt, '%Y-%m')")
      .orderBy('month', 'ASC')
      .getRawMany<{ month: string; revenue: string }>();

    return rows.map((row) => ({ month: row.month, revenue: Number(row.revenue) }));
  }

  async leads(months = 6) {
    const window = clampMonths(months);

    const rows = await this.leadRepo
      .createQueryBuilder('lead')
      .select("DATE_FORMAT(lead.createdAt, '%Y-%m')", 'month')
      .addSelect('COUNT(*)', 'leads')
      .where(`lead.createdAt >= DATE_SUB(CURRENT_DATE, INTERVAL ${window} MONTH)`)
      .groupBy("DATE_FORMAT(lead.createdAt, '%Y-%m')")
      .orderBy('month', 'ASC')
      .getRawMany<{ month: string; leads: string }>();

    return rows.map((row) => ({ month: row.month, leads: Number(row.leads) }));
  }
}

/** Keeps the trailing window an integer between 1 and 36 months. */
function clampMonths(months: number): number {
  const n = Math.trunc(Number(months));
  return Number.isFinite(n) && n > 0 ? Math.min(36, n) : 6;
}
