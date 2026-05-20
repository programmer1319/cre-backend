import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { UserRole } from './user-role.enum';
import { Favorite } from 'src/favourites/favourites.entity';
import { Property } from 'src/properties/property.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @OneToMany(() => Property, (property) => property.owner)
  properties!: Property[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites!: Favorite[];
}
