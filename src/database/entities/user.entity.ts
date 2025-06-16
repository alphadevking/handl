import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert } from 'typeorm';
import { FormDefinition } from './form-definition.entity';
import { FormEntry } from './form-entry.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  googleId: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ unique: true })
  apiKey: string;

  @Column({ type: 'jsonb', nullable: true })
  json_fields: object;

  @Column({ type: 'jsonb', nullable: true })
  metadata: object;

  @OneToMany(() => FormDefinition, (formDefinition) => formDefinition.user)
  formDefinitions: FormDefinition[];

  @OneToMany(() => FormEntry, (formEntry) => formEntry.user)
  formEntries: FormEntry[];

  @BeforeInsert()
  generateApiKey() {
    if (!this.apiKey) {
      this.apiKey = uuidv4();
    }
  }
}
