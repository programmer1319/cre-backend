import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private repo: Repository<Notification>,
  ) {}

  create(
    userId: number,
    message: string,
    type: Notification['type'],
    propertyId?: number,
  ) {
    return this.repo.save({
      userId,
      user: { id: userId },
      propertyId: propertyId ?? null,
      property: propertyId ? { id: propertyId } : undefined,
      message,
      type,
    });
  }

  findUserNotifications(userId: number) {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: number, userId: number) {
    return this.setRead(id, userId, true);
  }

  async markAsUnread(id: number, userId: number) {
    return this.setRead(id, userId, false);
  }

  private async setRead(id: number, userId: number, read: boolean) {
    const notification = await this.repo.findOne({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Notification not found');
    notification.read = read;
    return this.repo.save(notification);
  }
}
