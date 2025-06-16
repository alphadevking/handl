import { Injectable, UnauthorizedException, Logger } from '@nestjs/common'; // Import Logger
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name); // Initialize Logger

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3000/auth/google/callback';

    super({
      clientID: clientID,
      clientSecret: clientSecret,
      callbackURL: callbackURL,
      scope: ['email', 'profile'],
    });

    // Initialize Logger after super() call
    this.logger = new Logger(GoogleStrategy.name);

    // Log the Google OAuth configuration for debugging purposes
    // WARNING: Do not log clientSecret in production environments!
    // this.logger.debug(`Google Client ID: ${clientID}`);
    // this.logger.debug(`Google Callback URL: ${callbackURL}`);
    // this.logger.debug(`Google Client Secret: ${clientSecret}`); // Uncomment for extreme debugging, but be cautious!
  }

  async validate(
    _accessToken: string, // Prefix with underscore to indicate unused parameter
    _refreshToken: string, // Prefix with underscore to indicate unused parameter
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    try {
      const user = await this.authService.findOrCreateGoogleUser(profile);
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  }
}
