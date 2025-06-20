import { Controller, Get, Req, Res, UseGuards, HttpCode, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { User } from '../database/schemas/user.schema';
import { Types } from 'mongoose';
import { ConfigService } from '@nestjs/config'; // Import ConfigService
import { Session } from 'express-session';

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
      // User is authenticated, explicitly log in the user to establish a session
      await new Promise<void>((resolve, reject) => {
        req.login(user, (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });

      // Redirect to the frontend OAuth callback route with success status using path parameters
      res.redirect(`${this.configService.get('FRONTEND_AUTH_SUCCESS_REDIRECT')}/success/${user._id.toString()}`);
    } else {
      // Authentication failed, redirect to the frontend OAuth callback route with failure status using path parameters
      res.redirect(`${this.configService.get('FRONTEND_AUTH_FAILURE_REDIRECT')}/failure/authentication-failed`);
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
  // @UseGuards(AuthGuard('session')) // Keep AuthGuard commented out as it seems to be the issue
  @HttpCode(HttpStatus.OK)
  async authStatus(@Req() req: Request) {
    // --- OLD IMPLEMENTATION (v1) ---
    // try {
    //   const user = req.user || null;
    //   return {
    //     isAuthenticated: !!user,
    //     user: user ? { id: user.id, email: user.email, firstName: user.firstName } : null,
    //   };
    // } catch (error) {
    //   throw new InternalServerErrorException('Failed to check authentication status.');
    // }
    // --- NEW IMPLEMENTATION (v1) ---
    // console.log('AuthController: /auth/status endpoint hit (without AuthGuard)');
    // console.log('Initial req.isAuthenticated():', req.isAuthenticated());
    // console.log('Initial req.user:', req.user);

    let user = req.user as (User & { _id: Types.ObjectId }) | null; // Ensure user is User | null

    // Manually check session for Passport user ID if req.user is not populated
    const sessionWithPassport = req.session as Session as any; // Cast to any to bypass TypeScript error
    if (!user && sessionWithPassport && sessionWithPassport.passport && sessionWithPassport.passport.user) {
      console.log('Found user ID in session.passport.user:', sessionWithPassport.passport.user);
      try {
        // Attempt to deserialize the user manually
        user = await this.authService.findUserById(sessionWithPassport.passport.user);
        if (user) {
          // Manually attach user to request for this context
          req.user = user;
          console.log('Manually populated req.user:', user._id.toString());
        } else {
          console.log('User not found for ID from session:', sessionWithPassport.passport.user);
        }
      } catch (error) {
        console.error('Error manually deserializing user:', error);
      }
    }

    // console.log('Final req.isAuthenticated():', req.isAuthenticated());
    // console.log('Final req.user:', req.user);

    try {
      const isAuthenticated = !!user;
      console.log('isAuthenticated:', isAuthenticated);
      console.log('user:', user);
      return {
        isAuthenticated: isAuthenticated,
        user: user ? { id: user._id.toString(), email: user.email, firstName: user.firstName, apiKey: user.apiKey } : null,
      };
    } catch (error) {
      console.error('Error in authStatus:', error);
      throw new InternalServerErrorException('Failed to check authentication status.');
    }
  }

  /**
   * Logs out the current user.
   * @param req The request object.
   * @param res The response object for redirection.
   * @returns Redirects to the login page or sends a logout success message.
   * @throws InternalServerErrorException if logout or session destruction fails.
   */
  @Get('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res() res: Response) { // Re-added @Res() res: Response
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
