import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google.strategy';
import { AuthController } from './auth.controller';
import { User, UserSchema } from '../database/schemas/user.schema';
import { ApiKeyAuthGuard } from './api-key-auth.guard';
import { JwtModule } from '@nestjs/jwt'; // Import JwtModule
import { jwtConstants } from './constants'; // Import jwtConstants
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule, // Remove session: true
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: `${jwtConstants.sessionTimeout}ms` }, // Configure JWT expiration using SESSION_TIMEOUT from constants
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // Register the User schema with Mongoose
  ],
  controllers: [AuthController], // Register AuthController
  providers: [AuthService, GoogleStrategy, ApiKeyAuthGuard, JwtStrategy], // Remove AuthSerializer, Add JwtStrategy
  exports: [AuthService, ApiKeyAuthGuard], // Export ApiKeyAuthGuard for use in other modules
})
export class AuthModule {}
