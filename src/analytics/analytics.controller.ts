import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
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

  @Get('overview')
  overview(
    @Query() query: AnalyticsRangeDto,
    @Req() req: Request & { user: { id: number; role: string } },
  ) {
    return this.analyticsService.overview(Number(query.months ?? 6), req.user);
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
