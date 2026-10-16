import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtGuard } from 'src/auth/jwt/jwt.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/users/roles.decorater';
import { UserRole } from 'src/users/user-role.enum';

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
  revenue() {
    return this.analyticsService.revenue();
  }

  @Get('leads')
  leads() {
    return this.analyticsService.leads();
  }
}
