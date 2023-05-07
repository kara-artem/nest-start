import { Injectable } from '@nestjs/common';

import { RedisService } from '../../redis/redis.service';
import { RefreshPayloadInterface } from '../interfaces/refresh.payload.interface';

@Injectable()
export class VerifyService {
  constructor(private readonly redisService: RedisService) {}

  async verifyRefresh(refreshPayload: RefreshPayloadInterface, refreshToken: string): Promise<boolean> {
    const { hash, id, email } = refreshPayload;
    const key = `${id}_${hash}`;
    const storedToken = await this.redisService.get<string>(key);
    await this.redisService.del(key);
    return (email && storedToken && storedToken === refreshToken) || false;
  }
}
