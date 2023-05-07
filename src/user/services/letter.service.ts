import { Injectable } from '@nestjs/common';

import { config } from '../../common/config';
import { PATHS_AND_PREFIXES } from '../../common/constants';
import { generateHash, getFrontendUrl } from '../../common/utils';
import { EmailSendingResponse, EmailService } from '../../email/email.service';
import { RedisService } from '../../redis/redis.service';
import { EmailMessageType } from '../types/users.types';

@Injectable()
export class LetterService {
  constructor(private readonly emailService: EmailService, private readonly redisService: RedisService) {}

  getRedisCode(hash: string, type: EmailMessageType): string {
    return `${PATHS_AND_PREFIXES[type]?.redisPrefix}:${hash}`;
  }

  getEmailData(url: string, type: EmailMessageType): { title: string; message: string } {
    switch (type) {
      case EmailMessageType.EMAIL: {
        return {
          title: `Подтверждение email`,
          message: `Чтобы подтвердить свою электронную почту, перейдите по <a href="${url}" target="_blank">ссылке</a>.`,
        };
      }
      case EmailMessageType.RESET_PASSWORD: {
        return {
          title: `Подтверждение пароля`,
          message: `Чтобы подтвердить свой пароль, перейдите по <a href="${url}" target="_blank">ссылке</a>.`,
        };
      }
    }
  }

  async setHash<T>(obj: T, type: EmailMessageType): Promise<string> {
    const hash = generateHash();
    await this.redisService.set(this.getRedisCode(hash, type), obj, config.get('CONFIRM_CODE_EXPIRES'));
    return hash;
  }

  async sendLetter(hash: string, email: string, type: EmailMessageType): Promise<EmailSendingResponse> {
    const url = getFrontendUrl({
      pathname: PATHS_AND_PREFIXES[type]?.path || '',
      params: { hash },
    });
    const emailData = this.getEmailData(url, type);
    return this.emailService.send({
      email,
      title: emailData.title,
      message: emailData.message,
    });
  }

  async sendEmailCongrats(email: string, type: EmailMessageType): Promise<EmailSendingResponse> {
    switch (type) {
      case EmailMessageType.EMAIL: {
        const title = 'Ваш email подтвержден.';
        const message = `Ваша почта была успешно подтверждена.`;
        return this.emailService.send({ email, title, message });
      }
      case EmailMessageType.RESET_PASSWORD: {
        const title = 'Ваш пароль изменен.';
        const message = `Ваш пароль был успешно изменен.`;
        return this.emailService.send({ email, title, message });
      }
    }
  }
}
