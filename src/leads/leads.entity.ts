import { Property } from "src/properties/property.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Lead {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  message!: string;

  @Column({ type: 'enum', enum: ['new', 'contacted', 'qualified', 'closed'], default: 'new' })
  status!: 'new' | 'contacted' | 'qualified' | 'closed';

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  property!: Property;

  @CreateDateColumn()
  createdAt!: Date;
}
