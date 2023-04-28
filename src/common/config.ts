import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { GetEmailOptionsInterface } from './interfaces/get.email.options.interface';
import { GetJwtConfigInterface } from './interfaces/get.jwt.config.interface';

export class Config {
  private config: ConfigService;

  constructor() {
    this.config = new ConfigService();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get<T>(propertyPath: string, defaultValue?: T) {
    return this.config.get(propertyPath, defaultValue);
  }

  public isDevelopment(): boolean {
    return this.get<string>('NODE_ENV') === 'development';
  }

  public isProduction(): boolean {
    return this.get<string>('NODE_ENV') === 'production';
  }

  public getDatabaseOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.get('DB_HOST'),
      port: this.get('DB_PORT'),
      username: this.get('DB_USERNAME'),
      password: this.get('DB_PASSWORD'),
      database: this.get('DB_NAME'),
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
      migrationsRun: false,
      logging: false,
    };
  }

  getJwtConfig(): GetJwtConfigInterface {
    return {
      secret: this.get('JWT_SECRET'),
      signOptions: { expiresIn: this.get('JWT_EXPIRES') },
    };
  }

  getJwtRefreshExpires(): number {
    return parseInt(this.get('JWT_REFRESH_EXPIRES', 9600));
  }

  getEmailOptions(): GetEmailOptionsInterface {
    return {
      host: 'smtp.mail.ru',
      port: 465,
      secure: true,
      auth: {
        user: this.get('EMAIL_LOGIN'),
        pass: this.get('EMAIL_PASSWORD'),
      },
    };
  }
}

export const config = new Config();
