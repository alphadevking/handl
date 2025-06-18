import { User } from '../database/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      user: User | null; // Change to User | null
      login(user: User, done: (err: any) => void): void; // Add login method
      logout(done: (err: any) => void): void;
      isAuthenticated(): boolean; // Add isAuthenticated method
      session: {
        destroy(callback: (err: any) => void): void;
        passport?: { user: number }; // Add passport property to session
      };
    }
    }
  }
