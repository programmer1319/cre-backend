import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

export type AppearanceTheme = 'light' | 'dark' | 'system';

@Entity('user_settings')
export class UserSettings {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  userId!: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ default: true })
  emailNewLeads!: boolean;

  @Column({ default: true })
  pushNewLeads!: boolean;

  @Column({ default: false })
  weeklyDigest!: boolean;

  @Column({ type: 'enum', enum: ['light', 'dark', 'system'], default: 'system' })
  theme!: AppearanceTheme;

  @Column({ default: false })
  compactMode!: boolean;

  @Column({ default: false })
  reducedMotion!: boolean;

  @UpdateDateColumn()
  updatedAt!: Date;
}
