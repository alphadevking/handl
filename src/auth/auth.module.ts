import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
  ],
  providers: [AuthService], // Updated providers
  exports: [AuthService],
})
export class AuthModule {}
