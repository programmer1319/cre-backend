import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import { User } from 'src/users/user.entity';
import { Property } from 'src/properties/property.entity';

@Entity()
export class Favorite {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.favorites, {
    onDelete: 'CASCADE',
  })
  user!: User;

  @ManyToOne(() => Property, {
    onDelete: 'CASCADE',
  })
  property!: Property;

  @CreateDateColumn()
  createdAt!: Date;
}
