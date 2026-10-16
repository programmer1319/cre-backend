import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn() id!: number;
  @Column()
  filename!: string;
  @Column({ name: 'original_name', nullable: true })
  originalName!: string;
  @Column({ name: 'mime_type', nullable: true })
  mimeType!: string;
  @Column({ name: 'size_bytes', nullable: true })
  sizeBytes!: number;
  @Column() url!: string;
  @Column({ name: 'alt_text', nullable: true })
  altText!: string;
  @Column({ nullable: true })
  width!: number;
  @Column({ nullable: true })
  height!: number;
  @CreateDateColumn() createdAt!: Date;
}
