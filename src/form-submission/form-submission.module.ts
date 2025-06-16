import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Import TypeOrmModule
import { FormSubmissionController } from './form-submission.controller';
import { FormSubmissionService } from './form-submission.service';
import { EmailModule } from '../email/email.module';
import { DatabaseModule } from '../database/database.module';
import { FormDefinitionModule } from '../form-definition/form-definition.module';
import { AuthModule } from '../auth/auth.module';
import { FormEntry } from '../database/entities/form-entry.entity'; // Import FormEntry entity

@Module({
  imports: [
    TypeOrmModule.forFeature([FormEntry]), // Provide FormEntry repository
    EmailModule,
    DatabaseModule,
    FormDefinitionModule,
    AuthModule,
  ],
  controllers: [FormSubmissionController],
  providers: [FormSubmissionService],
})
export class FormSubmissionModule {}
