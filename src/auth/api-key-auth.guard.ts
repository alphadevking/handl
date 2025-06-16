import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedException('API Key is missing');
    }

    const isValid = await this.authService.validateApiKey(apiKey);

    if (!isValid) {
      throw new UnauthorizedException('Invalid API Key');
    }

    // API Key is valid, allow the flow to proceed.
    // No user object needs to be attached to the request for this flow.
    return true;
  }
}
