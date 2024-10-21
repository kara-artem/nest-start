import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { environment } from '../../../shared/environment';
import { UserPayloadInterface } from '../../user/interfaces/user.payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: environment.tokenKeys.accessKey,
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
