import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express'; // Import Request from express
import { ApiKeyAuthGuard } from '../auth/api-key-auth.guard';
import { FormDefinitionService } from './form-definition.service';
import { CreateFormDefinitionDto } from './dto/create-form-definition.dto';
import { UpdateFormDefinitionDto } from './dto/update-form-definition.dto';
import { FormDefinition } from '../database/schemas/form-definition.schema'; // Import Mongoose schema
import { Types } from 'mongoose'; // Import Types for ObjectId

@UseGuards(ApiKeyAuthGuard)
@Controller('form-definitions')
export class FormDefinitionController {
  constructor(private readonly formDefinitionService: FormDefinitionService) {}

  /**
   * Creates a new form definition for the authenticated user.
   * @param req The request object containing the authenticated user.
   * @param createFormDefinitionDto The DTO containing data for the new form definition.
   * @returns The created FormDefinition document.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Req() req: Request,
    @Body() createFormDefinitionDto: CreateFormDefinitionDto,
  ): Promise<FormDefinition> {
    const userId = req.user!.id as unknown as Types.ObjectId; // Cast userId to Types.ObjectId
    return this.formDefinitionService.create(userId, createFormDefinitionDto);
  }

  /**
   * Retrieves all form definitions for the authenticated user.
   * @param req The request object containing the authenticated user.
   * @returns An array of FormDefinition documents.
   */
  @Get()
  findAll(@Req() req: Request): Promise<FormDefinition[]> {
    const userId = req.user!.id as unknown as Types.ObjectId; // Cast userId to Types.ObjectId
    return this.formDefinitionService.findAll(userId);
  }

  /**
   * Retrieves a single form definition by its name (ID) for the authenticated user.
   * @param req The request object containing the authenticated user.
   * @param name The name (ID) of the form definition to retrieve.
   * @returns The FormDefinition document.
   */
  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string): Promise<FormDefinition> {
    const userId = req.user!.id as unknown as Types.ObjectId; // Cast userId to Types.ObjectId
    return this.formDefinitionService.findOne(userId, id);
  }

  /**
   * Updates an existing form definition by its ID for the authenticated user.
   * @param req The request object containing the authenticated user.
   * @param id The ID of the form definition to update.
   * @param updateFormDefinitionDto The DTO containing data for the update.
   * @returns The updated FormDefinition document.
   */
  @Put(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateFormDefinitionDto: UpdateFormDefinitionDto,
  ): Promise<FormDefinition> {
    const userId = req.user!.id as unknown as Types.ObjectId; // Cast userId to Types.ObjectId
    return this.formDefinitionService.update(userId, id, updateFormDefinitionDto);
  }

  /**
   * Deletes a form definition by its ID for the authenticated user.
   * @param req The request object containing the authenticated user.
   * @param id The ID of the form definition to delete.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Req() req: Request, @Param('id') id: string): Promise<void> {
    const userId = req.user!.id as unknown as Types.ObjectId; // Cast userId to Types.ObjectId
    return this.formDefinitionService.remove(userId, id);
  }
}
