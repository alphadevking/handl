import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FormEntry } from './schemas/form-entry.schema';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @InjectModel(FormEntry.name)
    private formEntryModel: Model<FormEntry>,
  ) {}

  /**
   * Saves a new form entry to the database.
   * @param userId The ID of the user who submitted the form.
   * @param formId The ID of the form definition.
   * @param formData The data submitted in the form.
   * @returns The saved FormEntry document.
   * @throws InternalServerErrorException if the form entry fails to save.
   */
  async saveFormEntry(userId: Types.ObjectId, formId: string, formData: Record<string, any>): Promise<FormEntry> {
    try {
      const newEntry = new this.formEntryModel({
        userId: userId,
        formId: formId,
        formData: formData,
      });
      await newEntry.save();
      // Log the auto-generated _id and createdAt timestamp
      this.logger.log(`Form entry saved to database for form ${formId} by user ${userId}. ID: ${newEntry._id}, CreatedAt: ${newEntry.createdAt}`);
      return newEntry;
    } catch (error) {
      this.logger.error(`Failed to save form entry for form ${formId} by user ${userId} to database:`, error.message, error.stack);
      throw new InternalServerErrorException('Failed to save form data to database.');
    }
  }
}
