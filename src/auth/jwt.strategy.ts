import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { jwtConstants } from './constants';
import { AuthService } from './auth.service';
import { User } from '../database/schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(request) => {
        let token = null;
        if (request && request.cookies) {
          token = request.cookies['access_token'];
          console.log('JWT extracted from cookie:', token ? 'Token found' : 'No token found'); // Log token extraction
        }
        return token;
      }]),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any): Promise<User> {
    // TODO: Implement user validation based on payload.sub (user ID)
    // For now, return a dummy user or fetch from DB
    const user = await this.authService.findUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
