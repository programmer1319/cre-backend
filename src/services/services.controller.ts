import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../users/roles.decorater';
import { UserRole } from '../users/user-role.enum';
import { CreateServiceDto, UpdateServiceDto } from './service.dto';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(private readonly services: ServicesService) {}

  @Get() list() { return this.services.publicList(); }
  @Get('featured') featured() { return this.services.featured(); }
  @UseGuards(JwtGuard, RolesGuard) @Roles(UserRole.ADMIN)
  @Get('admin') adminList() { return this.services.adminList(); }
  @Get(':slug') findOne(@Param('slug') slug: string) { return this.services.findOne(slug); }
  @UseGuards(JwtGuard, RolesGuard) @Roles(UserRole.ADMIN)
  @Post() create(@Body() dto: CreateServiceDto) { return this.services.create(dto); }
  @UseGuards(JwtGuard, RolesGuard) @Roles(UserRole.ADMIN)
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServiceDto) { return this.services.update(id, dto); }
  @UseGuards(JwtGuard, RolesGuard) @Roles(UserRole.ADMIN)
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.services.remove(id); }
}
