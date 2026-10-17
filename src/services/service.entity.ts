import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('site_services')
export class SiteService {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ length: 100 })
  slug!: string;

  @Column({ length: 160 })
  title!: string;

  @Column({ length: 80 })
  icon!: string;

  @Column({ length: 300 })
  summary!: string;

  @Column({ length: 120 })
  kicker!: string;

  @Column({ type: 'simple-json' })
  body!: string[];

  @Column({ type: 'simple-json' })
  outcomes!: string[];

  @Column({ type: 'simple-json' })
  process!: { title: string; detail: string }[];

  @Column({ type: 'simple-json' })
  faqs!: { question: string; answer: string }[];

  @Column({ length: 500 })
  image!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  featured!: boolean;

  @Column({ default: 0 })
  sortOrder!: number;
}
