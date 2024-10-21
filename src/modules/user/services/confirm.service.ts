import { ForbiddenException, Injectable } from '@nestjs/common';

import { RedisManagerService } from '../../redis-manager/redis-manager.service';
import { UserPayloadInterface } from '../interfaces/user.payload.interface';
import { EmailMessageType } from '../types/users.types';
import { LetterService } from './letter.service';
import { UserService } from './user.service';

@Injectable()
export class ConfirmService {
  constructor(
    private readonly redisService: RedisManagerService,
    private readonly userService: UserService,
    private readonly letterService: LetterService,
  ) {}

  async confirmPassword(hash: string, password: string): Promise<boolean> {
    const key = this.letterService.getRedisCode(hash, EmailMessageType.RESET_PASSWORD);
    const res: UserPayloadInterface | null = await this.redisService.get(key);
    if (!res) {
      throw new ForbiddenException('Срок жизни hash истек');
    }
    await this.userService.savePassword(res.email, password);
    await this.redisService.remove(key);

    await this.letterService.sendEmailCongrats(res.email, EmailMessageType.RESET_PASSWORD);

    return true;
  }

  async confirmEmail(code: string): Promise<boolean> {
    const key = this.letterService.getRedisCode(code, EmailMessageType.EMAIL);
    const res: { email: string } | null = await this.redisService.get(key);
    if (!res) {
      throw new ForbiddenException('The hash has expired');
    }
    await this.userService.saveEmail(res.email);
    await this.redisService.remove(key);

    await this.letterService.sendEmailCongrats(res.email, EmailMessageType.EMAIL);

    return true;
  }
}
