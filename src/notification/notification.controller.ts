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
    const userId = req.user.id;
    return this.notificationService.findUserNotifications(Number(userId));
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  markAllNotificationsAsRead(@Param('id') id: number) {
    return this.notificationService.markAsRead(Number(id));
  }
}
