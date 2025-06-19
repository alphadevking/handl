import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormSubmissionController } from './form-submission.controller';
import { FormSubmissionService } from './form-submission.service';
import { EmailModule } from '../email/email.module';
import { DatabaseModule } from '../database/database.module';
import { FormDefinitionModule } from '../form-definition/form-definition.module';
import { AuthModule } from '../auth/auth.module';
import { FormEntry, FormEntrySchema } from '../database/schemas/form-entry.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FormEntry.name, schema: FormEntrySchema }]), // Provide FormEntry schema
    EmailModule,
    DatabaseModule,
    FormDefinitionModule,
    AuthModule,
  ],
  controllers: [FormSubmissionController],
  providers: [FormSubmissionService],
})
export class FormSubmissionModule {}
