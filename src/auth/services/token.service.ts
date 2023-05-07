import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { config } from '../../common/config';
import { RedisService } from '../../redis/redis.service';
import { UserRoleEnum } from '../../user/enums/user.role.enum';
import { UserPayloadInterface } from '../../user/interfaces/user.payload.interface';
import { RefreshPayloadInterface } from '../interfaces/refresh.payload.interface';
import { RequestInterface } from '../interfaces/request.interface';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService, private readonly redisService: RedisService) {}

  async generateJwt(
    user: UserPayloadInterface,
    req: RequestInterface,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const jwtRefreshExpires = config.getJwtRefreshExpires();

    const accessToken = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = this.jwtService.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        hash: req.fingerprint.hash,
      },
      {
        expiresIn: jwtRefreshExpires,
      },
    );

    await this.redisService.set(`${user.id}_${req.fingerprint.hash}`, refreshToken, jwtRefreshExpires);

    return { accessToken, refreshToken };
  }

  decodeRefresh(refreshToken: string): RefreshPayloadInterface {
    return this.jwtService.decode(refreshToken) as {
      id: string;
      email: string;
      role: UserRoleEnum;
      hash: string;
    };
  }

  public decodeAccess(accessToken: string): UserPayloadInterface {
    return this.jwtService.decode(accessToken) as UserPayloadInterface;
  }

  async deleteByUserId(id: string, req: RequestInterface): Promise<void> {
    await this.redisService.del(`${id}_${req.fingerprint.hash}`);
  }
}
