import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './settings.service';

type AuthenticatedRequest = Request & { user: { id: number } };

@Controller('settings')
@UseGuards(JwtGuard)
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  findMine(@Req() req: AuthenticatedRequest) {
    return this.settings.findForUser(Number(req.user.id));
  }

  @Patch()
  updateMine(@Req() req: AuthenticatedRequest, @Body() body: UpdateSettingsDto) {
    return this.settings.update(Number(req.user.id), body);
  }
}
