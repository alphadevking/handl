import { Controller, Get, Req, Res, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { User } from '../database/schemas/user.schema';
import { Types } from 'mongoose';
import { ConfigService } from '@nestjs/config'; // Import ConfigService
import { jwtConstants } from './constants'; // Import jwtConstants
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService, // Inject ConfigService
  ) { }

  /**
   * Initiates the Google OAuth login process.
   * @returns Redirects to Google's authentication page.
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @HttpCode(HttpStatus.OK)
  async googleAuth(@Req() req: Request) {
    // This route will redirect to Google for authentication
    // Passport will handle the redirection
  }

  /**
   * Handles the Google OAuth callback.
   * After successful authentication, Passport will attach the user to req.user.
   * @param req The request object containing the authenticated user.
   * @param res The response object for redirection.
   * @returns Redirects the user to a success or failure page.
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    // Passport will attach the user to req.user after successful authentication
    const user = req.user as User & { _id: Types.ObjectId };
    if (user) {
      // Generate JWT
      const { access_token } = await this.authService.login(user);
      // console.log('JWT generated:', access_token); // Log the generated JWT

      // Set the JWT as an HTTP-only cookie
      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production', // Use secure cookies in production
        maxAge: jwtConstants.sessionTimeout, // Use sessionTimeout from constants
        sameSite: this.configService.get('NODE_ENV') === 'production' ? 'none' : 'lax', // Set SameSite based on environment
      });
      // console.log('JWT assigned to access_token cookie.'); // Log when the cookie is set

      // Redirect to the frontend OAuth success redirect URL
      const successRedirectUrl = this.configService.get('FRONTEND_AUTH_SUCCESS_REDIRECT') || 'http://localhost:5173/dashboard'; // Provide a default fallback URL
      res.redirect(successRedirectUrl);
    } else {
      // Authentication failed, redirect to the frontend OAuth failure redirect URL
      const failureRedirectUrl = this.configService.get<string>('FRONTEND_AUTH_FAILURE_REDIRECT') || 'http://localhost:5173/login'; // Provide a default fallback URL
      res.redirect(failureRedirectUrl);
    }
  }

  /**
   * Provides a success page after Google OAuth.
   * This endpoint is primarily for direct API testing or as a fallback.
   * In a real application, the backend redirects directly to the frontend.
   * @param req The request object.
   * @returns A success message and user details.
   */
  @Get('success')
  @HttpCode(HttpStatus.OK)
  authSuccess(@Req() req: Request) {
    return { message: 'Authentication successful!', user: req.user };
  }

  /**
   * Provides a failure page after Google OAuth.
   * This endpoint is primarily for direct API testing or as a fallback.
   * In a real application, the backend redirects directly to the frontend.
   * @returns A failure message.
   */
  @Get('failure')
  @HttpCode(HttpStatus.UNAUTHORIZED)
  authFailure() {
    return { message: 'Authentication failed!' };
  }

  /**
   * Checks the current authentication status of the user.
   * This endpoint requires an active session to return the authenticated user.
   * @param req The request object.
   * @returns The authenticated user object or null if not authenticated.
   */
  @Get('status')
  @UseGuards(AuthGuard('jwt')) // Use JwtAuthGuard
  @HttpCode(HttpStatus.OK)
  authStatus(@Req() req: Request) {
    // User is authenticated via JWT, req.user will be populated by JwtStrategy
    const user = req.user as User & { _id: Types.ObjectId; };
    // console.log('Auth status user:', user);
    // Return the user details if authenticated, otherwise return null
    if (user) {
      return {
        isAuthenticated: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          apiKey: user.apiKey,
        },
      };
    } else {
      return {
        isAuthenticated: false,
        user: null,
      };
    }
  }

  /**
   * Logs out the current user by clearing the access token cookie.
   * @param res The response object for clearing cookies and redirection.
   * @returns Redirects to the login page.
   */
  @Get('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res() res: Response) {
    // Clear the access_token cookie
    res.clearCookie('access_token');

    // Redirect the user to the login page (FRONTEND_AUTH_FAILURE_REDIRECT)
    const loginRedirectUrl = this.configService.get<string>('FRONTEND_AUTH_FAILURE_REDIRECT') || 'http://localhost:5173/login';
    res.redirect(loginRedirectUrl);
  }

  /**
   * Generates a new API key for the authenticated user.
   * This route is protected by JWT, ensuring only logged-in users can generate API keys.
   * @param req The request object containing the authenticated user.
   * @returns An object containing the newly generated API key.
   */
  @Get('generate-api-key')
  @UseGuards(AuthGuard('jwt')) // Protect this route with JWT
  @HttpCode(HttpStatus.OK)
  async generateApiKey(@Req() req: Request) {
    const user = req.user as User & { _id: Types.ObjectId };
    // Generate a new API key for the user
    const newApiKey = await this.authService.generateNewApiKey(user._id.toString());
    return { apiKey: newApiKey };
  }
}
