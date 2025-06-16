import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('form_entries')
export class FormEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  formId: string; // To link back to the FormDefinition

  @Column({ type: 'jsonb', nullable: false }) // Store the entire form data as JSONB (PostgreSQL specific)
  formData: Record<string, any>; // The dynamic data object

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt: Date;
}
