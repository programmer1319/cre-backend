import { Module } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { Page } from './entities/page.entity';
import { Section } from 'src/sections/entities/section.entity';
import { TypeOrmModule } from 'node_modules/@nestjs/typeorm';

@Module({
  imports: [
    CacheModule.register({ ttl: 300, max: 100 }),
    TypeOrmModule.forFeature([Page, Section]),
  ],
  controllers: [PagesController],
  providers: [PagesService],
})
export class PagesModule {}
