import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type ContactStatus = 'new' | 'replied' | 'archived';

@Entity('contact_messages')
export class ContactMessage {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ length: 120 }) name!: string;
  @Column({ length: 190 }) email!: string;
  @Column({ length: 160, nullable: true }) company!: string | null;
  @Column({ type: 'text' }) message!: string;
  @Column({ type: 'enum', enum: ['new', 'replied', 'archived'], default: 'new' }) status!: ContactStatus;
  @CreateDateColumn() createdAt!: Date;
}
