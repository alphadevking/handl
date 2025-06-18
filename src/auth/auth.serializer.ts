import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { User } from '../database/entities/user.entity';

@Injectable()
export class AuthSerializer extends PassportSerializer {
  constructor(private authService: AuthService) {
    super();
  }

  /**
   * Serializes the user into the session.
   * @param user The user object to serialize.
   * @param done The callback function to call after serialization.
   */
  serializeUser(user: User, done: (err: Error | null, id: number) => void): void {
    done(null, user.id);
  }

  /**
   * Deserializes the user from the session.
   * @param payload The user ID from the session.
   * @param done The callback function to call after deserialization.
   */
  async deserializeUser(
    payload: number,
    done: (err: Error | null, user: User | null) => void,
  ): Promise<void> {
    try {
      // Use the public method from AuthService to find the user
      const user = await this.authService.findUserById(payload);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
