import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from '../pages/entities/page.entity';
import { Section } from '../sections/entities/section.entity';
import { ContentSeedService } from './content-seed.service';

@Module({ imports: [TypeOrmModule.forFeature([Page, Section])], providers: [ContentSeedService] })
export class SeedModule {}
