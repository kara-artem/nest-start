import { Injectable } from '@nestjs/common';

import { RedisManagerService } from '../../redis-manager/redis-manager.service';
import { RefreshPayloadInterface } from '../interfaces/refresh.payload.interface';

@Injectable()
export class VerifyService {
  constructor(private readonly redisService: RedisManagerService) {}

  async verifyRefresh(refreshPayload: RefreshPayloadInterface, refreshToken: string): Promise<boolean> {
    const { hash, id, email } = refreshPayload;
    const key = `${id}_${hash}`;
    const storedToken = await this.redisService.get<string>(key);
    await this.redisService.remove(key);
    return (email && storedToken && storedToken === refreshToken) || false;
  }
}
