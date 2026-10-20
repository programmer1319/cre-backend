import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtGuard } from 'src/auth/jwt/jwt.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/users/roles.decorater';
import { UserRole } from 'src/users/user-role.enum';
import { CreateLeadDto } from './create-lead.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('leads')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 6, ttl: 60_000 } })
  create(@Body() body: CreateLeadDto) {
    return this.leadsService.create(body);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  @Get()
  findAll(@Req() req: any) {
    return this.leadsService.findAll(req.user);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'new' | 'contacted' | 'qualified' | 'closed',
    @Req() req: any,
  ) {
    // Ownership is enforced in the service, which is the only place that knows which property
    // the enquiry belongs to.
    return this.leadsService.updateStatus(id, status, req.user);
  }

  @UseGuards(JwtGuard, RolesGuard)
  // Deletion stays admin-only: an enquiry is a record of contact, and agents removing their own
  // is a policy decision for the business, not a default. Agents update status instead.
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.leadsService.remove(id, req.user);
  }
}
