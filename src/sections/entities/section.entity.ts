import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Media } from 'src/media/entities/media.entity';
import { Page } from 'src/pages/entities/page.entity';
@Entity('page_sections')
export class Section {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Page, (page) => page.sections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'page_id' })
  page!: Page;

  @Column({ name: 'page_id' })
  pageId!: number;

  @Column({ name: 'section_key' })
  sectionKey!: string;

  @Column({ name: 'section_type' })
  sectionType!: string;

  @Column({ type: 'json' })
  content!: Record<string, any>;

  @ManyToOne(() => Media, {
    nullable: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'hero_image_id' })
  heroImage!: Media | null;

  @Column({ name: 'hero_image_id', type: 'int', nullable: true })
  heroImageId!: number | null;

  @ManyToOne(() => Media, {
    nullable: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'thumbnail_id' })
  thumbnail!: Media | null;

  @Column({ name: 'thumbnail_id', type: 'int', nullable: true })
  thumbnailId!: number | null;

  @Column({ name: 'gallery_ids', type: 'json' })
  galleryIds!: number[];

  @Column({ name: 'sort_order', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
