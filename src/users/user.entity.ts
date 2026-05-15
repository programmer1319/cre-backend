import { Property } from 'src/properties/property.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  JoinTable,
  ManyToMany,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  @Index()
  email!: string;

  @Column()
  password!: string;

  @ManyToMany(() => Property, (property) => property.likedBy)
  @JoinTable()
  favorites!: Property[];
}
