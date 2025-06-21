import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FormSubmissionModule } from './form-submission/form-submission.module';
import { EmailModule } from './email/email.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { FormDefinitionModule } from './form-definition/form-definition.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from './database/database.module';
import { jwtConstants } from './auth/constants'; // Import jwtConstants

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Configure Throttler for rate limiting
    ThrottlerModule.forRoot([{
      ttl: jwtConstants.throttleTtl, // Use throttleTtl from constants
      limit: jwtConstants.throttleLimit, // Use throttleLimit from constants
    }]),
    // Configure Mongoose for database connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    // Feature modules
    FormSubmissionModule,
    EmailModule,
    FormDefinitionModule,
    AuthModule,
    DatabaseModule,
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
