import { IsNotEmpty, IsString, IsObject } from 'class-validator';

export class SubmitFormDto {
  @IsNotEmpty({ message: 'Form ID cannot be empty.' })
  @IsString({ message: 'Form ID must be a string.' })
  formId: string; // This links to a FormDefinition

  @IsNotEmpty({ message: 'Form data cannot be empty.' })
  @IsObject({ message: 'Form data must be an object.' })
  formData: Record<string, any>; // The actual dynamic form data
}
