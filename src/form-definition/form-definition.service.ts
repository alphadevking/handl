import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormDefinition } from '../database/entities/form-definition.entity';
import { CreateFormDefinitionDto } from './dto/create-form-definition.dto';
import { UpdateFormDefinitionDto } from './dto/update-form-definition.dto';

@Injectable()
export class FormDefinitionService {
  private readonly logger = new Logger(FormDefinitionService.name);

  constructor(
    @InjectRepository(FormDefinition)
    private formDefinitionRepository: Repository<FormDefinition>,
  ) {}

  /**
   * Creates a new form definition for a specific user.
   * @param userId The ID of the user creating the form definition.
   * @param dto The DTO containing data for the new form definition.
   * @returns The created FormDefinition entity.
   * @throws ConflictException if a form definition with the same ID already exists for the user.
   */
  async create(userId: number, dto: CreateFormDefinitionDto): Promise<FormDefinition> {
    const existing = await this.formDefinitionRepository.findOne({ where: { id: dto.id, userId } });
    if (existing) {
      throw new ConflictException(`Form definition with ID "${dto.id}" already exists for this user.`);
    }
    const newDefinition = this.formDefinitionRepository.create({ ...dto, userId });
    this.logger.log(`Creating new form definition: ${dto.id} for user ${userId}`);
    return this.formDefinitionRepository.save(newDefinition);
  }

  /**
   * Finds all form definitions for a specific user.
   * @param userId The ID of the user.
   * @returns An array of FormDefinition entities.
   */
  async findAll(userId: number): Promise<FormDefinition[]> {
    return this.formDefinitionRepository.find({ where: { userId } });
  }

  /**
   * Finds a single form definition by its ID (which serves as its name) for a specific user.
   * @param userId The ID of the user.
   * @param name The ID (name) of the form definition to find.
   * @returns The found FormDefinition entity.
   * @throws NotFoundException if the form definition is not found for the given user.
   */
  async findOne(userId: number, name: string): Promise<FormDefinition> {
    const form = await this.formDefinitionRepository.findOne({ where: { id: name, userId } });
    if (!form) {
      throw new NotFoundException(`Form definition with name "${name}" not found for this user.`);
    }
    return form;
  }

  /**
   * Updates an existing form definition by its ID (which serves as its name) for a specific user.
   * @param userId The ID of the user.
   * @param name The ID (name) of the form definition to update.
   * @param dto The DTO containing data for the update.
   * @returns The updated FormDefinition entity.
   * @throws NotFoundException if the form definition is not found for the given user.
   */
  async update(userId: number, name: string, dto: UpdateFormDefinitionDto): Promise<FormDefinition> {
    const form = await this.findOne(userId, name); // Throws NotFoundException if not found
    this.formDefinitionRepository.merge(form, dto);
    this.logger.log(`Updating form definition: ${name} for user ${userId}`);
    return this.formDefinitionRepository.save(form);
  }

  /**
   * Deletes a form definition by its ID (which serves as its name) for a specific user.
   * @param userId The ID of the user.
   * @param name The ID (name) of the form definition to delete.
   * @throws NotFoundException if the form definition is not found for the given user.
   */
  async remove(userId: number, name: string): Promise<void> {
    const result = await this.formDefinitionRepository.delete({ id: name, userId });
    if (result.affected === 0) {
      throw new NotFoundException(`Form definition with name "${name}" not found for this user.`);
    }
    this.logger.log(`Removed form definition: ${name} for user ${userId}`);
  }
}
