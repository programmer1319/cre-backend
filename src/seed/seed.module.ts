import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from '../pages/entities/page.entity';
import { Section } from '../sections/entities/section.entity';
import { ContentSeedService } from './content-seed.service';
import { DemoSeedService } from './demo-seed.service';

@Module({ imports: [TypeOrmModule.forFeature([Page, Section])], providers: [ContentSeedService, DemoSeedService] })
export class SeedModule {}
