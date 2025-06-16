import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FormSubmissionModule } from './form-submission/form-submission.module';
import { EmailModule } from './email/email.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { FormEntry } from './database/entities/form-entry.entity';
import { FormDefinition } from './database/entities/form-definition.entity'; // NEW: Import this entity
import { FormDefinitionModule } from './form-definition/form-definition.module'; // NEW: Import this module

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Configure Throttler for rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 10, // 10 requests per minute
    }]),
    // Configure TypeORM for database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<any>('DATABASE_TYPE'),
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [FormEntry, FormDefinition], // List all your database entities here
        synchronize: configService.get<string>('NODE_ENV') !== 'production', // Auto-create tables in dev, disable in prod
        logging: ['error'], // Log only errors from TypeORM
      }),
    }),
    // Feature modules
    FormSubmissionModule,
    EmailModule,
    DatabaseModule,
    FormDefinitionModule,
    AuthModule, // Add AuthModule here
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
