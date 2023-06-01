import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { S3 } from 'aws-sdk';

import { GetEmailOptionsInterface } from './interfaces/get.email.options.interface';
import { GetJwtConfigInterface } from './interfaces/get.jwt.config.interface';

export class Config {
  private config: ConfigService;

  constructor() {
    this.config = new ConfigService();
  }

  getFrontendUrl(): string {
    return this.get('FRONTEND_URL');
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
      port: this.get<number>('DB_PORT'),
      username: this.get('DB_USERNAME'),
      password: this.get('DB_PASSWORD'),
      database: this.get('DB_NAME'),
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
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
      host: 'smtp.yandex.ru',
      port: 465,
      secure: true,
      auth: {
        user: this.get('EMAIL_LOGIN'),
        pass: this.get('EMAIL_PASSWORD'),
      },
    };
  }

  getUploadOptions(): MulterOptions {
    return {
      limits: { fileSize: 50_000_000 }, // 50 Mb
    };
  }

  getS3(): S3 {
    return new S3({
      accessKeyId: this.get('S3_ACCESS_KEY'),
      secretAccessKey: this.get('S3_SECRET_KEY'),
      region: this.get('S3_REGION'),
      endpoint: this.get('S3_ENDPOINT'),
    });
  }
}

export const config = new Config();
