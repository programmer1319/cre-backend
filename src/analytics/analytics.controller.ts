import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('stats')
  stats() {
    return this.analyticsService.stats();
  }

  @Get('revenue')
  revenue() {
    return this.analyticsService.revenue();
  }

  @Get('leads')
  leads() {
    return this.analyticsService.leads();
  }
}