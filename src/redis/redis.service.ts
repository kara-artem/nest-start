import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly $cacheManager: Cache,
  ) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.$cacheManager.get<T>(key);
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    return this.$cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    return this.$cacheManager.del(key);
  }

  async reset(): Promise<void> {
    return this.$cacheManager.reset();
  }
}
