import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { config } from '../../common/config';
import { UserPayloadInterface } from '../../user/interfaces/user.payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getJwtConfig().secret,
    });
  }

  async validate(payload: UserPayloadInterface): Promise<UserPayloadInterface> {
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
  }
}
