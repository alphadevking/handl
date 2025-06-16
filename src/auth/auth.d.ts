import { User } from '../database/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      logout(done: (err: any) => void): void;
      session: {
        destroy(callback: (err: any) => void): void;
      };
    }
  }
}
