import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google.strategy';
import { AuthSerializer } from './auth.serializer';
import { AuthController } from './auth.controller';
import { User, UserSchema } from '../database/schemas/user.schema';
import { ApiKeyAuthGuard } from './api-key-auth.guard';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ session: true }), // Enable session support for Passport
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // Register the User schema with Mongoose
  ],
  controllers: [AuthController], // Register AuthController
  providers: [AuthService, GoogleStrategy, AuthSerializer, ApiKeyAuthGuard], // Revert to standard providers
  exports: [AuthService, ApiKeyAuthGuard], // Export ApiKeyAuthGuard for use in other modules
})
export class AuthModule {}
