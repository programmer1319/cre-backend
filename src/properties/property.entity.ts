import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Property {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Index() // ← filtered + sorted
  @Column('decimal', { precision: 12, scale: 2 })
  price!: number;

  @Index() // ← filtered
  @Column()
  city!: string;

  @Index() // ← filtered
  @Column()
  propertyType!: string;

  @Index() // ← filtered
  @Column({ default: 0 })
  bedrooms!: number;

  @Column({ default: 0 })
  bathrooms!: number;

  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  latitude!: number;

  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  longitude!: number;

  @Column()
  location!: string;

  @Column('simple-array', { nullable: true })
  images!: string[];

  @Column({ default: 0 })
  area!: number;

  @ManyToOne(() => User, (user) => user.properties, { onDelete: 'CASCADE' })
  owner!: User;

  @Index() // ← default sort column
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
