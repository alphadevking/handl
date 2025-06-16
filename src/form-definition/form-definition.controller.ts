import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiKeyAuthGuard } from '../auth/api-key-auth.guard';
import { FormDefinitionService } from './form-definition.service';
import { CreateFormDefinitionDto } from './dto/create-form-definition.dto';
import { UpdateFormDefinitionDto } from './dto/update-form-definition.dto';
import { FormDefinition } from '../database/entities/form-definition.entity';

@UseGuards(ApiKeyAuthGuard)
@Controller('form-definitions')
export class FormDefinitionController {
  constructor(private readonly formDefinitionService: FormDefinitionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createFormDefinitionDto: CreateFormDefinitionDto): Promise<FormDefinition> {
    return this.formDefinitionService.create(createFormDefinitionDto);
  }

  @Get()
  findAll(): Promise<FormDefinition[]> {
    return this.formDefinitionService.findAll();
  }

  /**
   * Retrieves a single form definition by its name (ID).
   * @param name The name (ID) of the form definition to retrieve.
   * @returns The FormDefinition entity.
   */
  @Get(':name')
  findOne(@Param('name') name: string): Promise<FormDefinition> {
    return this.formDefinitionService.findOne(name);
  }

  /**
   * Updates an existing form definition by its name (ID).
   * @param name The name (ID) of the form definition to update.
   * @param updateFormDefinitionDto The DTO containing data for the update.
   * @returns The updated FormDefinition entity.
   */
  @Put(':name')
  update(@Param('name') name: string, @Body() updateFormDefinitionDto: UpdateFormDefinitionDto): Promise<FormDefinition> {
    return this.formDefinitionService.update(name, updateFormDefinitionDto);
  }

  /**
   * Deletes a form definition by its name (ID).
   * @param name The name (ID) of the form definition to delete.
   */
  @Delete(':name')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('name') name: string): Promise<void> {
    return this.formDefinitionService.remove(name);
  }
}
