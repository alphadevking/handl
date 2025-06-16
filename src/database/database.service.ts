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

  /**
   * Saves a new form entry to the database.
   * @param userId The ID of the user who submitted the form.
   * @param formId The ID of the form definition.
   * @param formData The data submitted in the form.
   * @returns The saved FormEntry entity.
   * @throws InternalServerErrorException if the form entry fails to save.
   */
  async saveFormEntry(userId: number, formId: string, formData: Record<string, any>): Promise<FormEntry> {
    try {
      const newEntry = this.formEntryRepository.create({
        userId: userId, // Assign the userId
        formId: formId,
        formData: formData,
      });
      await this.formEntryRepository.save(newEntry);
      this.logger.log(`Form entry saved to database for form ${formId} by user ${userId} with ID: ${newEntry.id}`);
      return newEntry;
    } catch (error) {
      this.logger.error(`Failed to save form entry for form ${formId} by user ${userId} to database:`, error.message, error.stack);
      throw new InternalServerErrorException('Failed to save form data to database.');
    }
  }
}
