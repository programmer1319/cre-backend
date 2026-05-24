import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { TypeOrmModule } from 'node_modules/@nestjs/typeorm';
import { Lead } from './leads.entity';
import { Property } from 'src/properties/property.entity';
import { NotificationModule } from 'src/notification/notification.module';
@Module({
  imports: [TypeOrmModule.forFeature([Lead, Property]), NotificationModule],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
