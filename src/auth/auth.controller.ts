import { Controller, Get, Req, Res, UseGuards, HttpCode, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { User } from '../database/entities/user.entity';
import { ConfigService } from '@nestjs/config'; // Import ConfigService

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService, // Inject ConfigService
  ) {}

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
    const user = req.user as User;
    if (user) {
      // User is authenticated, redirect to frontend success URL with user ID
      const successRedirectUrl = this.configService.get<string>('FRONTEND_AUTH_SUCCESS_REDIRECT') || 'http://localhost:5173/dashboard';
      res.redirect(`${successRedirectUrl}?userId=${user.id}`);
    } else {
      // Authentication failed, redirect to frontend failure URL
      const failureRedirectUrl = this.configService.get<string>('FRONTEND_AUTH_FAILURE_REDIRECT') || 'http://localhost:5173/login';
      res.redirect(failureRedirectUrl);
    }
  }

  /**
   * Provides a success page after Google OAuth.
   * In a real application, this would be a frontend route.
   * @param req The request object.
   * @returns A success message and user details.
   */
  // The /auth/success and /auth/failure routes are now handled by frontend redirects.
  // These endpoints are no longer directly hit by the browser after OAuth.
  // Keeping them as examples or for direct API testing if needed, but they won't be part of the OAuth flow.

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
   * @param req The request object.
   * @returns The authenticated user object or null if not authenticated.
   */
  @Get('status')
  @HttpCode(HttpStatus.OK)
  authStatus(@Req() req: Request) {
    return req.user || null;
  }

  /**
   * Logs out the current user.
   * @param req The request object.
   * @param res The response object for redirection.
   * @returns Redirects to the login page or sends a logout success message.
   */
  /**
   * Logs out the current user.
   * @param req The request object.
   * @param res The response object for redirection.
   * @returns Redirects to the login page or sends a logout success message.
   * @throws InternalServerErrorException if logout or session destruction fails.
   */
  /**
   * Logs out the current user.
   * @param req The request object.
   * @param res The response object for redirection.
   * @returns Redirects to the login page or sends a logout success message.
   * @throws InternalServerErrorException if logout or session destruction fails.
   */
  @Get('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      await new Promise<void>((resolve, reject) => {
        req.logout((err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });

      await new Promise<void>((resolve, reject) => {
        req.session.destroy((err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });

      res.clearCookie('connect.sid'); // Clear the session cookie
      const loginRedirectUrl = this.configService.get<string>('FRONTEND_AUTH_FAILURE_REDIRECT') || 'http://localhost:5173/login'; // Redirect to login page
      res.redirect(loginRedirectUrl);
    } catch (err) {
      throw new InternalServerErrorException(`Logout failed: ${err.message}`);
    }
  }
}
