import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './database.service';
import { FormEntry } from './entities/form-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FormEntry])],
  providers: [DatabaseService],
  exports: [DatabaseService], // Export if other modules need to save form entries
})
export class DatabaseModule {}
