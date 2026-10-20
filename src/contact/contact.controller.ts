import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../users/roles.decorater';
import { UserRole } from '../users/user-role.enum';
import { CreateContactDto } from './contact.dto';
import { ContactService } from './contact.service';
import type { ContactStatus } from './contact-message.entity';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('contact')
export class ContactController {
  constructor(private readonly contact: ContactService) {}
  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 6, ttl: 60_000 } })
  create(@Body() dto: CreateContactDto) { return this.contact.create(dto); }
  @Get() @UseGuards(JwtGuard, RolesGuard) @Roles(UserRole.ADMIN, UserRole.AGENT) findAll() { return this.contact.findAll(); }
  @Patch(':id/status') @UseGuards(JwtGuard, RolesGuard) @Roles(UserRole.ADMIN, UserRole.AGENT) update(@Param('id', ParseIntPipe) id: number, @Body('status') status: ContactStatus) { return this.contact.updateStatus(id, status); }
  @Delete(':id') @UseGuards(JwtGuard, RolesGuard) @Roles(UserRole.ADMIN) remove(@Param('id', ParseIntPipe) id: number) { return this.contact.remove(id); }
}
