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

  async create(dto: CreateFormDefinitionDto): Promise<FormDefinition> {
    const existing = await this.formDefinitionRepository.findOne({ where: { id: dto.id } });
    if (existing) {
      throw new ConflictException(`Form definition with ID "${dto.id}" already exists.`);
    }
    const newDefinition = this.formDefinitionRepository.create(dto);
    this.logger.log(`Creating new form definition: ${dto.id}`);
    return this.formDefinitionRepository.save(newDefinition);
  }

  async findAll(): Promise<FormDefinition[]> {
    return this.formDefinitionRepository.find();
  }

  /**
   * Finds a single form definition by its ID (which serves as its name).
   * @param name The ID (name) of the form definition to find.
   * @returns The found FormDefinition entity.
   * @throws NotFoundException if the form definition is not found.
   */
  async findOne(name: string): Promise<FormDefinition> {
    const form = await this.formDefinitionRepository.findOne({ where: { id: name } });
    if (!form) {
      throw new NotFoundException(`Form definition with name "${name}" not found.`);
    }
    return form;
  }

  /**
   * Updates an existing form definition by its ID (which serves as its name).
   * @param name The ID (name) of the form definition to update.
   * @param dto The DTO containing data for the update.
   * @returns The updated FormDefinition entity.
   * @throws NotFoundException if the form definition is not found.
   */
  async update(name: string, dto: UpdateFormDefinitionDto): Promise<FormDefinition> {
    const form = await this.findOne(name); // Throws NotFoundException if not found
    this.formDefinitionRepository.merge(form, dto);
    this.logger.log(`Updating form definition: ${name}`);
    return this.formDefinitionRepository.save(form);
  }

  /**
   * Deletes a form definition by its ID (which serves as its name).
   * @param name The ID (name) of the form definition to delete.
   * @throws NotFoundException if the form definition is not found.
   */
  async remove(name: string): Promise<void> {
    const result = await this.formDefinitionRepository.delete(name);
    if (result.affected === 0) {
      throw new NotFoundException(`Form definition with name "${name}" not found.`);
    }
    this.logger.log(`Removed form definition: ${name}`);
  }
}
