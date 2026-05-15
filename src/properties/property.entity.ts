import { User } from 'src/users/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';

@Entity()
export class Property {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column()
  @Index()
  city!: string;

  @Column()
  location!: string;

  @Column()
  @Index()
  propertyType!: string;

  @Column()
  @Index()
  price!: number;

  @Column()
  @Index()
  area!: number;

  @Column()
  @Index()
  bedrooms!: number;

  @Column()
  @Index()
  bathrooms!: number;

  @Column('simple-array')
  images!: string[];

  @CreateDateColumn()
  @Index()
  createdAt!: Date;

  @ManyToMany(() => User, (user) => user.favorites)
  likedBy!: User[];

  @UpdateDateColumn()
  updatedAt!: Date;
}
