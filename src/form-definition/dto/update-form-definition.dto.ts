import { PartialType } from '@nestjs/mapped-types';
import { CreateFormDefinitionDto } from './create-form-definition.dto';

export class UpdateFormDefinitionDto extends PartialType(CreateFormDefinitionDto) {
  // The ID is passed as a param, not in the body, so it's not here.
  // Schema and description can be partially updated.
}
