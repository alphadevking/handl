import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('form_definitions')
export class FormDefinition {
  @PrimaryColumn({ type: 'varchar', length: 100, unique: true })
  id: string; // E.g., 'contact-us', 'job-application', 'feedback'

  @Column({ type: 'jsonb', nullable: false }) // Stores the JSON Schema itself (PostgreSQL specific)
  schema: any; // Use 'any' for the JSON object in TypeORM

  @Column({ type: 'text', nullable: true })
  description: string; // Optional description for the form

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
