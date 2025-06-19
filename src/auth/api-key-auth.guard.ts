import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { User } from '../database/schemas/user.schema';
import { Document } from 'mongoose';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedException('API Key is missing');
    }

    const user = await this.authService.validateApiKey(apiKey);

    if (!user) {
      throw new UnauthorizedException('Invalid API Key');
    }

    // Attach the user object to the request for further use in controllers/services
    // Explicitly cast to ensure TypeScript recognizes it as a Mongoose Document
    request.user = user as User & Document;

    return true;
  }
}
