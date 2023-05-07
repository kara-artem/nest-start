import { ForbiddenException, Injectable } from '@nestjs/common';

import { RedisService } from '../../redis/redis.service';
import { UserPayloadInterface } from '../interfaces/user.payload.interface';
import { EmailMessageType } from '../types/users.types';
import { LetterService } from './letter.service';
import { UserService } from './user.service';

@Injectable()
export class ConfirmService {
  constructor(
    private readonly redisService: RedisService,
    private readonly userService: UserService,
    private readonly letterService: LetterService,
  ) {}

  async confirmPassword(hash: string, password: string): Promise<boolean> {
    const key = this.letterService.getRedisCode(hash, EmailMessageType.RESET_PASSWORD);
    const res: UserPayloadInterface | undefined = await this.redisService.get(key);
    if (!res) {
      throw new ForbiddenException('Срок жизни hash истек');
    }
    await this.userService.savePassword(res.email, password);
    await this.redisService.del(key);

    await this.letterService.sendEmailCongrats(res.email, EmailMessageType.RESET_PASSWORD);

    return true;
  }

  async confirmEmail(code: string): Promise<boolean> {
    const key = this.letterService.getRedisCode(code, EmailMessageType.EMAIL);
    const res: { email: string } | undefined = await this.redisService.get(key);
    if (!res) {
      throw new ForbiddenException('The hash has expired');
    }
    await this.userService.saveEmail(res.email);
    await this.redisService.del(key);

    await this.letterService.sendEmailCongrats(res.email, EmailMessageType.EMAIL);

    return true;
  }
}
