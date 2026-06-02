import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { TypeOrmModule } from 'node_modules/@nestjs/typeorm';
import { Property } from 'src/properties/property.entity';
import { Lead } from 'src/leads/leads.entity';
import { User } from 'src/users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Property,
      Lead,
      User,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService]
})
export class AnalyticsModule {}
