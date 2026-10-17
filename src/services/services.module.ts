import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteService } from './service.entity';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

@Module({ imports: [TypeOrmModule.forFeature([SiteService])], controllers: [ServicesController], providers: [ServicesService] })
export class ServicesModule {}
