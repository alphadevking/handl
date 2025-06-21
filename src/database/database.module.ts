import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseService } from './database.service';
import { FormEntry, FormEntrySchema } from './schemas/form-entry.schema';
import { FormDefinition, FormDefinitionSchema } from './schemas/form-definition.schema';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FormEntry.name, schema: FormEntrySchema },
      { name: FormDefinition.name, schema: FormDefinitionSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService], // Export if other modules need to save form entries
})
export class DatabaseModule {}
