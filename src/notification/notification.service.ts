import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private repo: Repository<Notification>,
  ) {}

  create(userId: number, message: string, type: Notification['type']) {
    return this.repo.save({
      user: { id: userId },
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

  markAsRead(id: number) {
    return this.repo.update(id, { read: true });
  }
}
