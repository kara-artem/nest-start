import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { config } from '../common/config';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { VerifyService } from './services/verify.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => config.getJwtConfig(),
    }),
  ],
  providers: [AuthService, TokenService, VerifyService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
