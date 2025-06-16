import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Profile } from 'passport-google-oauth20';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Validates an API key by looking it up in the database.
   * @param apiKey The API key to validate.
   * @returns The User object if the API key is valid and active, otherwise null.
   */
  async validateApiKey(apiKey: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { apiKey } });
    // In a real application, you might also check for an 'isActive' flag on the API key
    return user || null;
  }

  /**
   * Finds a user by their Google ID or email, or creates a new user if not found.
   * Generates a unique API key for new users.
   * @param profile The Google profile object.
   * @returns The User object.
   */
  async findOrCreateGoogleUser(profile: Profile): Promise<User> {
    let user = await this.usersRepository.findOne({
      where: [{ googleId: profile.id }, { email: profile.emails[0].value }],
    });

    if (!user) {
      user = this.usersRepository.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        picture: profile.photos[0]?.value,
        apiKey: uuidv4(), // Generate a unique API key for the new user
        json_fields: {}, // Initialize json_fields
        metadata: {}, // Initialize metadata
      });
      await this.usersRepository.save(user);
    } else {
      // Update user profile if necessary (e.g., picture, name)
      user.firstName = profile.name.givenName;
      user.lastName = profile.name.familyName;
      user.picture = profile.photos[0]?.value;
      await this.usersRepository.save(user);
    }

    return user;
  }

  /**
   * Retrieves the global API key from configuration.
   * This method is kept for compatibility if some parts still rely on a global key,
   * but for user-specific access, validateApiKey should be used.
   * @returns The global API key string.
   */
  /**
   * Retrieves the global API key from configuration.
   * This method is kept for compatibility if some parts still rely on a global key,
   * but for user-specific access, validateApiKey should be used.
   * @returns The global API key string.
   */
  getGlobalApiKey(): string {
    return this.configService.get<string>('API_KEY')!;
  }

  /**
   * Finds a user by their ID.
   * @param id The ID of the user to find.
   * @returns The User object if found, otherwise null.
   */
  async findUserById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }
}
