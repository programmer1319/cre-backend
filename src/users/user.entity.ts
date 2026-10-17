import { Entity, Column, PrimaryGeneratedColumn, Index, OneToMany } from 'typeorm';
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

  @Column({ name: 'job_title', nullable: true, length: 120 })
  jobTitle?: string;

  @Column({ nullable: true, length: 40 })
  phone?: string;

  @Column({ nullable: true, length: 1200 })
  bio?: string;

  @Column()
  password!: string;

  @Column({ name: 'token_version', default: 0 })
  tokenVersion!: number;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @OneToMany(() => Property, (property) => property.owner)
  properties!: Property[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites!: Favorite[];
}
