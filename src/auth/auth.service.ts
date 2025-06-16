import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly validApiKey: string; // Added a comment to trigger re-compilation

  constructor(private configService: ConfigService) {
    this.validApiKey = this.configService.get<string>('API_KEY')!;
    if (!this.validApiKey) {
      console.warn('API_KEY is not configured. API key authentication will not work.');
    }
  }

  /**
   * Validates an API key.
   * In a real application, this would involve checking a database for valid API keys
   * and associating them with users or clients.
   * @param apiKey The API key to validate.
   * @returns A user object (or a representation of the authenticated client) if valid, otherwise null.
   */
  async validateApiKey(apiKey: string): Promise<any> {
    // In a real application, fetch API key from a database
    // and associate it with a user or client.
    // For now, we'll use a simple hardcoded check against a single API_KEY from .env.
    if (this.validApiKey && apiKey === this.validApiKey) {
      // API Key is valid, allow the flow to proceed
      return true;
    }
    return null;
  }
}
