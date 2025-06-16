import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('form_entries')
export class FormEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  formId: string; // To link back to the FormDefinition

  @Column({ type: 'jsonb', nullable: false }) // Store the entire form data as JSONB (PostgreSQL specific)
  formData: Record<string, any>; // The dynamic data object

  @Column({ type: 'jsonb', nullable: true })
  json_fields: object;

  @Column({ type: 'jsonb', nullable: true })
  metadata: object;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt: Date;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.formEntries)
  @JoinColumn({ name: 'userId' })
  user: User;
}
