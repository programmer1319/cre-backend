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

/**
 * DECIMAL columns arrive from mysql2 as **strings**, not numbers.
 *
 * Without this transformer the API emits `"latitude": "40.712800"` and `"price": "500000.00"`,
 * which contradicts the declared `number` type on both sides of the contract. The practical
 * consequence was that every `typeof value === 'number'` coordinate check in the frontend map
 * failed, so the map silently plotted nothing — the listings were there, the pins were not.
 *
 * Applied at the column rather than fixed in one query, so every read path agrees: the paged
 * list, the detail record, the map viewport query and the pin feed.
 */
const decimalAsNumber = {
  from: (value: string | number | null): number | null =>
    value === null || value === undefined ? null : Number(value),
  to: (value: number | null) => value,
};

@Entity()
export class Property {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Index() // ← filtered + sorted
  @Column('decimal', { precision: 12, scale: 2, transformer: decimalAsNumber })
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

  @Column('decimal', {
    precision: 10,
    scale: 6,
    nullable: true,
    transformer: decimalAsNumber,
  })
  latitude!: number | null;

  @Column('decimal', {
    precision: 10,
    scale: 6,
    nullable: true,
    transformer: decimalAsNumber,
  })
  longitude!: number | null;

  @Column()
  location!: string;

  @Column('simple-array', { nullable: true })
  images!: string[];

  @Column({ type: 'varchar', length: 20, default: 'sale' })
  transactionType!: 'sale' | 'lease' | 'sale-lease';

  @Column({ type: 'varchar', length: 20, default: 'available' })
  status!: 'available' | 'under-offer' | 'leased' | 'sold' | 'withdrawn';

  @Column({ type: 'varchar', length: 20, default: 'published' })
  visibility!: 'published' | 'draft';

  @Column({ type: 'varchar', length: 80, nullable: true })
  priceUnit!: string | null;

  @Column({ default: false })
  featured!: boolean;

  @Column({ type: 'simple-json', nullable: true })
  amenities!: string[] | null;

  @Column({ type: 'simple-json', nullable: true })
  documents!: { title: string; url: string }[] | null;
  get imageUrls(): string[] {
    const baseUrl = process.env.BASE_URL;

    return this.images?.map((img) => `${baseUrl}/uploads/${img}`) ?? [];
  }
  @Column({ default: 0 })
  area!: number;

  @Column({ type: 'varchar', length: 60, nullable: true })
  floor!: string | null;

  @Column({ default: 0 })
  workstations!: number;

  @Column({ default: 0 })
  parkingSpaces!: number;

  @ManyToOne(() => User, (user) => user.properties, { onDelete: 'CASCADE' })
  owner!: User;

  @Index() // ← default sort column
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
