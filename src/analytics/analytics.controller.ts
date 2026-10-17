import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtGuard } from 'src/auth/jwt/jwt.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/users/roles.decorater';
import { UserRole } from 'src/users/user-role.enum';
import { AnalyticsRangeDto } from './analytics-range.dto';

@Controller('analytics')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.AGENT, UserRole.ADMIN)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('stats')
  stats() {
    return this.analyticsService.stats();
  }

  @Get('revenue')
  revenue(@Query() query: AnalyticsRangeDto) {
    return this.analyticsService.revenue(Number(query.months ?? 6));
  }

  @Get('holdings')
  holdings() {
    return this.analyticsService.holdings();
  }

  @Get('leads')
  leads(@Query() query: AnalyticsRangeDto) {
    return this.analyticsService.leads(Number(query.months ?? 6));
  }
}
