import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtGuard } from 'src/auth/jwt/jwt.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/users/roles.decorater';
import { UserRole } from 'src/users/user-role.enum';
import { CreateLeadDto } from './create-lead.dto';

@Controller('leads')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Post()
  create(@Body() body: CreateLeadDto) {
    return this.leadsService.create(body);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  @Get()
  findAll() {
    return this.leadsService.findAll();
  }
}
