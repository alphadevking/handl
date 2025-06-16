import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormEntry } from './entities/form-entry.entity';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @InjectRepository(FormEntry)
    private formEntryRepository: Repository<FormEntry>,
  ) {}

  async saveFormEntry(formId: string, formData: Record<string, any>): Promise<FormEntry> {
    try {
      const newEntry = this.formEntryRepository.create({
        formId: formId,
        formData: formData,
      });
      await this.formEntryRepository.save(newEntry);
      this.logger.log(`Form entry saved to database for form ${formId} with ID: ${newEntry.id}`);
      return newEntry;
    } catch (error) {
      this.logger.error(`Failed to save form entry for form ${formId} to database:`, error.message, error.stack);
      throw new InternalServerErrorException('Failed to save form data to database.');
    }
  }
}
