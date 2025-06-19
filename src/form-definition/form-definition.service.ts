import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FormDefinition } from '../database/schemas/form-definition.schema';
import { CreateFormDefinitionDto } from './dto/create-form-definition.dto';
import { UpdateFormDefinitionDto } from './dto/update-form-definition.dto';

@Injectable()
export class FormDefinitionService {
  private readonly logger = new Logger(FormDefinitionService.name);

  constructor(
    @InjectModel(FormDefinition.name)
    private formDefinitionModel: Model<FormDefinition>,
  ) {}

  /**
   * Creates a new form definition for a specific user.
   * @param userId The ID of the user creating the form definition.
   * @param dto The DTO containing data for the new form definition.
   * @returns The created FormDefinition document.
   * @throws ConflictException if a form definition with the same ID already exists for the user.
   */
  async create(userId: Types.ObjectId, dto: CreateFormDefinitionDto): Promise<FormDefinition> {
    // Check if a form definition with the given 'id' already exists for this user
    const existing = await this.formDefinitionModel.findOne({ id: dto.id, userId }).exec();
    if (existing) {
      throw new ConflictException(`Form definition with ID "${dto.id}" already exists for this user.`);
    }
    const newDefinition = new this.formDefinitionModel({
      id: dto.id, // Use 'id' as the unique identifier
      schema: dto.schema,
      description: dto.description,
      json_fields: dto.json_fields,
      metadata: dto.metadata,
      userId: userId,
    });
    this.logger.log(`Creating new form definition: ${dto.id} for user ${userId}`);
    try {
      return await newDefinition.save();
    } catch (error) {
      this.logger.error(`Failed to save form definition ${dto.id} for user ${userId}:`, error.message, error.stack);
      // Check for specific MongoDB duplicate key error (e.g., if unique index on 'id' was added later)
      if (error.code === 11000) { // MongoDB duplicate key error code
        throw new ConflictException(`Form definition with ID "${dto.id}" already exists (duplicate key error).`);
      }
      throw new InternalServerErrorException('Failed to create form definition.');
    }
  }

  /**
   * Finds all form definitions for a specific user.
   * @param userId The ID of the user.
   * @returns An array of FormDefinition documents.
   */
  async findAll(userId: Types.ObjectId): Promise<FormDefinition[]> {
    try {
      return await this.formDefinitionModel.find({ userId }).exec();
    } catch (error) {
      this.logger.error(`Failed to retrieve all form definitions for user ${userId}:`, error.message, error.stack);
      throw new InternalServerErrorException('Failed to retrieve form definitions.');
    }
  }

  /**
   * Finds a single form definition by its ID (which serves as its name) for a specific user.
   * @param userId The ID of the user.
   * @param name The ID (name) of the form definition to find.
   * @returns The found FormDefinition document.
   * @throws NotFoundException if the form definition is not found for the given user.
   */
  async findOne(userId: Types.ObjectId, id: string): Promise<FormDefinition> {
    try {
      const form = await this.formDefinitionModel.findOne({ id, userId }).exec();
      if (!form) {
        throw new NotFoundException(`Form definition with ID "${id}" not found for this user.`);
      }
      return form;
    } catch (error) {
      this.logger.error(`Failed to retrieve form definition with ID "${id}" for user ${userId}:`, error.message, error.stack);
      // If it's a NotFoundException, re-throw it. Otherwise, throw InternalServerErrorException.
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve form definition.');
    }
  }

  /**
   * Updates an existing form definition by its ID for a specific user.
   * @param userId The ID of the user.
   * @param id The ID of the form definition to update.
   * @param dto The DTO containing data for the update.
   * @returns The updated FormDefinition document.
   * @throws NotFoundException if the form definition is not found for the given user.
   */
  async update(userId: Types.ObjectId, id: string, dto: UpdateFormDefinitionDto): Promise<FormDefinition> {
    const form = await this.findOne(userId, id); // Throws NotFoundException if not found

    // Update properties directly
    if (dto.description !== undefined) form.description = dto.description;
    if (dto.schema !== undefined) form.schema = dto.schema;
    if (dto.json_fields !== undefined) form.json_fields = dto.json_fields;
    if (dto.metadata !== undefined) form.metadata = dto.metadata;

    this.logger.log(`Updating form definition: ${id} for user ${userId}`);
    try {
      return await form.save();
    } catch (error) {
      this.logger.error(`Failed to update form definition ${id} for user ${userId}:`, error.message, error.stack);
      // Check for specific MongoDB duplicate key error (e.g., if unique index on 'id' was added later)
      if (error.code === 11000) { // MongoDB duplicate key error code
        throw new ConflictException(`Form definition with ID "${id}" already exists (duplicate key error).`);
      }
      throw new InternalServerErrorException('Failed to update form definition.');
    }
  }

  /**
   * Deletes a form definition by its ID for a specific user.
   * @param userId The ID of the user.
   * @param id The ID of the form definition to delete.
   * @throws NotFoundException if the form definition is not found for the given user.
   */
  async remove(userId: Types.ObjectId, id: string): Promise<void> {
    try {
      const result = await this.formDefinitionModel.deleteOne({ id, userId }).exec();
      if (result.deletedCount === 0) {
        throw new NotFoundException(`Form definition with ID "${id}" not found for this user.`);
      }
      this.logger.log(`Removed form definition: ${id} for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to remove form definition with ID "${id}" for user ${userId}:`, error.message, error.stack);
      // If it's a NotFoundException, re-throw it. Otherwise, throw InternalServerErrorException.
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove form definition.');
    }
  }
}
