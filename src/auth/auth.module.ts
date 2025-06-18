import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google.strategy';
import { AuthSerializer } from './auth.serializer';
import { AuthController } from './auth.controller';
import { User } from '../database/entities/user.entity';
import { ApiKeyAuthGuard } from './api-key-auth.guard';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ session: true }), // Enable session support for Passport
    TypeOrmModule.forFeature([User]), // Register the User entity with TypeORM
  ],
  controllers: [AuthController], // Register AuthController
  providers: [AuthService, GoogleStrategy, AuthSerializer, ApiKeyAuthGuard], // Revert to standard providers
  exports: [AuthService, ApiKeyAuthGuard], // Export ApiKeyAuthGuard for use in other modules
})
export class AuthModule {}
