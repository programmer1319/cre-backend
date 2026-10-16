import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { User } from 'src/users/user.entity';
import { JwtGuard } from 'src/auth/jwt/jwt.guard';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(JwtGuard)
  @Get()
  findUserNotifications(@Req() req: Request & { user: User }) {
    return this.notificationService.findUserNotifications(Number(req.user.id));
  }

  /** Mark a single notification as READ */
  @UseGuards(JwtGuard)
  @Patch(':id/read')
  markAsRead(@Param('id') id: number, @Req() req: Request & { user: User }) {
    return this.notificationService.markAsRead(Number(id), Number(req.user.id));
  }

  /** Mark a single notification as UNREAD */
  @UseGuards(JwtGuard)
  @Patch(':id/unread')
  markAsUnread(@Param('id') id: number, @Req() req: Request & { user: User }) {
    return this.notificationService.markAsUnread(Number(id), Number(req.user.id));
  }
}
