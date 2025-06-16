import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiKeyAuthGuard } from '../auth/api-key-auth.guard';
import { FormSubmissionService } from './form-submission.service';
import { SubmitFormDto } from './dto/submit-form.dto';
import { FormEntry } from '../database/entities/form-entry.entity'; // Import FormEntry entity

/**
 * Controller for managing form submissions and retrieving/deleting form entries.
 * All routes are protected by ApiKeyAuthGuard.
 */
@UseGuards(ApiKeyAuthGuard)
@Controller('form-submissions') // Changed base path to align with RESTful conventions
export class FormSubmissionController {
  /**
   * @param formSubmissionService The service responsible for form submission and entry management.
   */
  constructor(private readonly formSubmissionService: FormSubmissionService) {}

  /**
   * Handles the submission of a new form.
   * @param submitFormDto The DTO containing the form data and definition ID.
   */
  @Post()
  @HttpCode(HttpStatus.OK) // Return 200 OK on successful submission
  async submitForm(@Body() submitFormDto: SubmitFormDto): Promise<void> {
    await this.formSubmissionService.handleForm(submitFormDto);
  }

  /**
   * Retrieves all form entries.
   * @returns A list of all FormEntry entities.
   */
  @Get()
  findAll(): Promise<FormEntry[]> {
    return this.formSubmissionService.findAll();
  }

  /**
   * Retrieves a single form entry by its ID.
   * @param id The ID of the form entry to retrieve.
   * @returns The FormEntry entity.
   */
  /**
   * Retrieves a single form entry by its ID.
   * @param id The ID of the form entry to retrieve.
   * @returns The FormEntry entity.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<FormEntry> {
    return this.formSubmissionService.findOne(id);
  }

  /**
   * Deletes a form entry by its ID.
   * @param id The ID of the form entry to delete.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.formSubmissionService.remove(id);
  }
}
