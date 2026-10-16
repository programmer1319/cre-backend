import { Section } from 'src/sections/entities/section.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pages')
export class Page {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  slug!: string;

  @Column()
  title!: string;

  @Column({ name: 'meta_title', nullable: true })
  metaTitle!: string;

  @Column({ name: 'meta_description', nullable: true, type: 'text' })
  metaDescription!: string;

  @Column()
  isActive!: boolean;

  @OneToMany(() => Section, (section) => section.page, {
    cascade: true,
    eager: true,
  })
  sections!: Section[];
}
