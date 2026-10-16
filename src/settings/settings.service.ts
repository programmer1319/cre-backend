import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UserSettings } from './settings.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private readonly repo: Repository<UserSettings>,
  ) {}

  async findForUser(userId: number) {
    return (await this.repo.findOne({ where: { userId } })) ?? this.createDefaults(userId);
  }

  async update(userId: number, values: UpdateSettingsDto) {
    const settings = await this.findForUser(userId);
    return this.repo.save(this.repo.merge(settings, values));
  }

  private createDefaults(userId: number) {
    return this.repo.save(this.repo.create({ userId, user: { id: userId } }));
  }
}
