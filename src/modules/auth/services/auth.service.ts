import { Injectable, UnauthorizedException } from '@nestjs/common';

import { UserService } from '../../user/services/user.service';
import { LoginDto } from '../dto/login.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { RequestInterface } from '../interfaces/request.interface';
import { TokensInterface } from '../interfaces/tokens.interface';
import { TokenService } from './token.service';
import { VerifyService } from './verify.service';
import bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly verifyingService: VerifyService,
    private readonly userService: UserService,
  ) {}

  async login(loginDto: LoginDto, req: RequestInterface): Promise<TokensInterface> {
    const user = await this.userService.getForAuth(loginDto);

    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordMatch = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordMatch) {
      throw new UnauthorizedException();
    }

    return this.tokenService.generateJwt(user, req);
  }

  async updateRefresh(data: RefreshDto, req: RequestInterface): Promise<TokensInterface> {
    const refreshPayload = this.tokenService.decodeRefresh(data.refreshToken);
    if (!refreshPayload) {
      throw new UnauthorizedException('Wrong refresh token');
    }
    const hasAccess = await this.verifyingService.verifyRefresh(refreshPayload, data.refreshToken);
    const user = await this.userService.getForAuth(refreshPayload);

    if (!hasAccess || !user) {
      throw new UnauthorizedException();
    }

    return this.tokenService.generateJwt(user, req);
  }

  async logout(id: string, req: RequestInterface): Promise<void> {
    await this.tokenService.deleteByUserId(id, req);
  }
}
