import { User } from '../database/schemas/user.schema';
import { Document, Types } from 'mongoose';

declare global {
  namespace Express {
    // Extend the User interface to include Mongoose Document properties
    interface User extends User, Document<Types.ObjectId> {}

    interface Request {
      user: User | null;
      login(user: User, done: (err: any) => void): void;
      logout(done: (err: any) => void): void;
      isAuthenticated(): boolean;
      session: {
        destroy(callback: (err: any) => void): void;
        passport?: { user: string }; // Change to string for Mongoose _id
      };
    }
  }
}
