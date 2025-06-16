import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('form_definitions')
export class FormDefinition {
  @PrimaryColumn({ type: 'varchar', length: 100, unique: true })
  id: string; // E.g., 'contact-us', 'job-application', 'feedback'

  @Column({ type: 'jsonb', nullable: false }) // Stores the JSON Schema itself (PostgreSQL specific)
  schema: any; // Use 'any' for the JSON object in TypeORM

  @Column({ type: 'text', nullable: true })
  description: string; // Optional description for the form

  @Column({ type: 'jsonb', nullable: true })
  json_fields: object;

  @Column({ type: 'jsonb', nullable: true })
  metadata: object;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.formDefinitions)
  @JoinColumn({ name: 'userId' })
  user: User;
}
