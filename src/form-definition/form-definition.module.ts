import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormDefinitionController } from './form-definition.controller';
import { FormDefinitionService } from './form-definition.service';
import { FormDefinition, FormDefinitionSchema } from '../database/schemas/form-definition.schema';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FormDefinition.name, schema: FormDefinitionSchema }]),
    AuthModule,
  ],
  controllers: [FormDefinitionController],
  providers: [FormDefinitionService],
  exports: [FormDefinitionService] // Export if other modules need to find definitions
})
export class FormDefinitionModule {}
