import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../database/schemas/user.schema';
import { Profile } from 'passport-google-oauth20';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) { }

  /**
   * Validates an API key by looking it up in the database.
   * @param apiKey The API key to validate.
   * @returns The User object if the API key is valid and active, otherwise null.
   */
  async validateApiKey(apiKey: string): Promise<User | null> {
    const user = await this.userModel.findOne({ apiKey }).exec();
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
    let user = await this.userModel.findOne({
      $or: [{ googleId: profile.id }, { email: profile.emails[0].value }],
    }).exec();

    // If user does not exist, create a new one
    if (!user) {
      // Create a new user document
      user = new this.userModel({
        googleId: profile.id,
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        picture: profile.photos[0]?.value,
        apiKey: uuidv4(), // Generate a unique API key for the new user
        json_fields: {},
        metadata: {},
      });
    } else {
      // If user exists, update their profile information
      user.firstName = profile.name.givenName;
      user.lastName = profile.name.familyName;
      user.picture = profile.photos[0]?.value;

      // If user exists but googleId is missing, update it
      if (!user.googleId) {
        user.googleId = profile.id;
      }
    }

    // Ensure API key exists for existing users (e.g., for legacy data or if it was somehow removed)
    if (!user.apiKey) {
      user.apiKey = uuidv4();
    }

    // Save the user (either new or updated)
    await user.save();

    return user;
  }

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
  async findUserById(id: string): Promise<User | null> {
    try {
      const user = await this.userModel.findById(id).exec();
      return user;
    } catch (error) {
      return null;
    }
  }
}
