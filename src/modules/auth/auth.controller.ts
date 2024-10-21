import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AllowUnauthorizedRequest } from '../../shared/decorators/allow.unauthorized.request';
import { UserPayload } from '../user/decorators/user.payload.decorator';
import { UserPayloadInterface } from '../user/interfaces/user.payload.interface';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RequestInterface } from './interfaces/request.interface';
import { TokensInterface } from './interfaces/tokens.interface';
import { AuthService } from './services/auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @AllowUnauthorizedRequest()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() data: LoginDto, @Req() req: RequestInterface): Promise<TokensInterface> {
    return this.authService.login(data, req);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@UserPayload() user: UserPayloadInterface, @Req() req: RequestInterface): Promise<boolean> {
    await this.authService.logout(user.id, req);
    return true;
  }

  @AllowUnauthorizedRequest()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() data: RefreshDto, @Req() req: RequestInterface): Promise<TokensInterface> {
    return this.authService.updateRefresh(data, req);
  }
}
