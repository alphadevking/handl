import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Param, Delete, ParseIntPipe, Req } from '@nestjs/common';
import { Request } from 'express'; // Import Request from express
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
   * Handles the submission of a new form for the authenticated user.
   * @param req The request object containing the authenticated user.
   * @param submitFormDto The DTO containing the form data and definition ID.
   */
  @Post()
  @HttpCode(HttpStatus.OK) // Return 200 OK on successful submission
  async submitForm(@Req() req: Request, @Body() submitFormDto: SubmitFormDto): Promise<void> {
    const userId = req.user!.id; // Assert that req.user is not undefined
    await this.formSubmissionService.handleForm(userId, submitFormDto);
  }

  /**
   * Retrieves all form entries for the authenticated user.
   * @param req The request object containing the authenticated user.
   * @returns A list of all FormEntry entities.
   */
  @Get()
  findAll(@Req() req: Request): Promise<FormEntry[]> {
    const userId = req.user!.id; // Assert that req.user is not undefined
    return this.formSubmissionService.findAll(userId);
  }

  /**
   * Retrieves a single form entry by its ID for the authenticated user.
   * @param req The request object containing the authenticated user.
   * @param id The ID of the form entry to retrieve.
   * @returns The FormEntry entity.
   */
  @Get(':id')
  findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number): Promise<FormEntry> {
    const userId = req.user!.id; // Assert that req.user is not undefined
    return this.formSubmissionService.findOne(userId, id);
  }

  /**
   * Deletes a form entry by its ID for the authenticated user.
   * @param req The request object containing the authenticated user.
   * @param id The ID of the form entry to delete.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number): Promise<void> {
    const userId = req.user!.id; // Assert that req.user is not undefined
    return this.formSubmissionService.remove(userId, id);
  }
}
