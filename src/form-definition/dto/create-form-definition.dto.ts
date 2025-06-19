import { IsNotEmpty, IsString, IsObject, IsOptional } from 'class-validator';

export class CreateFormDefinitionDto {
  @IsNotEmpty()
  @IsString()
  id: string; // Unique identifier for the form (e.g., 'contact-us')

  @IsNotEmpty()
  @IsObject()
  schema: Record<string, any>; // The JSON Schema for the form data

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  json_fields?: object;

  @IsOptional()
  @IsObject()
  metadata?: object;
}
