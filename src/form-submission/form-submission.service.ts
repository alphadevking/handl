import { Injectable, Logger, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SubmitFormDto } from './dto/submit-form.dto';
import { EmailService } from '../email/email.service';
import { DatabaseService } from '../database/database.service';
import { FormDefinitionService } from '../form-definition/form-definition.service';
import { FormEntry } from '../database/schemas/form-entry.schema'; // Import FormEntry schema
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

@Injectable()
export class FormSubmissionService {
  private readonly logger = new Logger(FormSubmissionService.name);
  private ajv: Ajv; // AJV instance for validation

  constructor(
    @InjectModel(FormEntry.name)
    private formEntryModel: Model<FormEntry>, // Inject FormEntry model
    private readonly emailService: EmailService,
    private readonly databaseService: DatabaseService,
    private readonly formDefinitionService: FormDefinitionService,
  ) {
    this.ajv = new Ajv({ allErrors: true }); // Initialize AJV
    addFormats(this.ajv); // Add format validators
  }

  /**
   * Retrieves all form entries for a specific user.
   * @param userId The ID of the user.
   * @returns A list of all FormEntry documents for the user.
   */
  async findAll(userId: Types.ObjectId): Promise<FormEntry[]> {
    try {
      const entries = await this.formEntryModel.find({ userId }).exec();
      this.logger.log(`Retrieved ${entries.length} form entries for user ${userId}.`);
      entries.forEach(entry => {
        this.logger.debug(`Entry ID: ${entry._id}, CreatedAt: ${entry.createdAt}`);
      });
      return entries;
    } catch (error) {
      this.logger.error(`Failed to retrieve all form entries for user ${userId}:`, error.message, error.stack);
      throw new InternalServerErrorException('Failed to retrieve form entries.');
    }
  }

  /**
   * Finds a single form entry by its ID for a specific user.
   * @param userId The ID of the user.
   * @param id The ID of the form entry to find.
   * @returns The found FormEntry document.
   * @throws NotFoundException if the form entry is not found for the given user.
   */
  async findOne(userId: Types.ObjectId, id: string): Promise<FormEntry> {
    try {
      const formEntry = await this.formEntryModel.findOne({ _id: id, userId }).exec();
      if (formEntry) {
        this.logger.log(`Retrieved form entry with ID: ${formEntry._id} for user ${userId}. CreatedAt: ${formEntry.createdAt}`);
      }
      if (!formEntry) {
        throw new NotFoundException(`Form entry with ID "${id}" not found for this user.`);
      }
      return formEntry;
    } catch (error) {
      this.logger.error(`Failed to retrieve form entry with ID "${id}" for user ${userId}:`, error.message, error.stack);
      // If it's a NotFoundException, re-throw it. Otherwise, throw InternalServerErrorException.
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve form entry.');
    }
  }

  /**
   * Deletes a form entry by its ID for a specific user.
   * @param userId The ID of the user.
   * @param id The ID of the form entry to delete.
   * @throws NotFoundException if the form entry is not found for the given user.
   */
  async remove(userId: Types.ObjectId, id: string): Promise<void> {
    try {
      const result = await this.formEntryModel.deleteOne({ _id: id, userId }).exec();
      if (result.deletedCount === 0) {
        throw new NotFoundException(`Form entry with ID "${id}" not found for this user.`);
      }
      this.logger.log(`Removed form entry: ${id} for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to remove form entry with ID "${id}" for user ${userId}:`, error.message, error.stack);
      // If it's a NotFoundException, re-throw it. Otherwise, throw InternalServerErrorException.
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove form entry.');
    }
  }

  /**
   * Handles a form submission, including validation, email notification, and saving to the database.
   * @param userId The ID of the user submitting the form.
   * @param dto The DTO containing the form submission data.
   * @returns A Promise that resolves when the form is successfully handled.
   * @throws BadRequestException if the form definition is not found or form data validation fails.
   * @throws InternalServerErrorException if there's an error during form processing.
   */
  async handleForm(userId: Types.ObjectId, dto: SubmitFormDto): Promise<void> {
    this.logger.log(`Processing form submission for Form ID: ${dto.formId} by user ${userId}`);

    // 1. Fetch the form definition (schema)
    const formDefinition = await this.formDefinitionService.findOne(userId, dto.formId)
      .catch(error => {
        if (error.status === 404) {
          throw new BadRequestException(`Form definition '${dto.formId}' not found for this user.`);
        }
        throw new InternalServerErrorException(`Failed to retrieve form definition: ${error.message}`);
      });

    // 2. Validate incoming formData against the fetched schema
    const validate = this.ajv.compile(formDefinition.schema); // Use schema
    const isValid = validate(dto.formData);

    if (!isValid) {
      this.logger.warn(`Form data for ${dto.formId} is invalid:`, validate.errors);
      throw new BadRequestException({
        message: 'Form data validation failed.',
        errors: validate.errors,
      });
    }
    this.logger.log(`Form data for ${dto.formId} successfully validated against its schema.`);

    // 3. Process the form data (email and save)
    try {
      await Promise.all([
        this.emailService.sendFormEmail(dto.formId, dto.formData),
        this.databaseService.saveFormEntry(userId, dto.formId, dto.formData), // Pass formId as formId
      ]);
      this.logger.log(`Form submission for ${dto.formId} processed successfully for user ${userId}.`);
    } catch (error) {
      this.logger.error(`Error during form processing for ${dto.formId} by user ${userId}:`, error.message, error.stack);
      throw new InternalServerErrorException(`Failed to process form submission: ${error.message}`);
    }
  }
}
