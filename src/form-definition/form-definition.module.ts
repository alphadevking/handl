import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormDefinitionController } from './form-definition.controller';
import { FormDefinitionService } from './form-definition.service';
import { FormDefinition } from '../database/entities/form-definition.entity';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule

@Module({
  imports: [
    TypeOrmModule.forFeature([FormDefinition]),
    AuthModule,
  ],
  controllers: [FormDefinitionController],
  providers: [FormDefinitionService],
  exports: [FormDefinitionService] // Export if other modules need to find definitions
})
export class FormDefinitionModule {}
