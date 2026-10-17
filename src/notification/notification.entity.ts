import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Property } from 'src/properties/property.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 20 })
  type!: 'lead' | 'property' | 'system';

  @Column()
  message!: string;

  @Column({ default: false })
  read!: boolean;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column()
  userId!: number;

  @ManyToOne(() => Property, { nullable: true, onDelete: 'SET NULL' })
  property!: Property | null;

  @Column({ type: 'int', nullable: true })
  propertyId!: number | null;

  @CreateDateColumn()
  createdAt!: Date;
}
