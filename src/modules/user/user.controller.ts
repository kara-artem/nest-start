import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AllowUnauthorizedRequest } from '../../shared/decorators/allow.unauthorized.request';
import { UserPayload } from './decorators/user.payload.decorator';
import { ConfirmEmailDto } from './dto/confirm.email.dto';
import { RegistrationDto } from './dto/registration.dto';
import { ResetPasswordDto } from './dto/reset.password.dto';
import { UpdatePasswordDto } from './dto/update.password.dto';
import { UpdateProfileDto } from './dto/update.profile.dto';
import { UserEntity } from './entities/user.entity';
import { UserPayloadInterface } from './interfaces/user.payload.interface';
import { ConfirmService } from './services/confirm.service';
import { UserService } from './services/user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly confirmService: ConfirmService) {}

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@UserPayload() user: UserPayloadInterface): Promise<UserEntity | null> {
    return this.userService.getById(user.id);
  }

  @AllowUnauthorizedRequest()
  @Post('registration')
  @HttpCode(HttpStatus.CREATED)
  async registration(@Body() data: RegistrationDto): Promise<UserEntity | null> {
    return this.userService.create(data);
  }

  @AllowUnauthorizedRequest()
  @Post('confirm-email')
  @HttpCode(HttpStatus.OK)
  async confirmEmail(@Body() dto: ConfirmEmailDto): Promise<boolean> {
    return this.confirmService.confirmEmail(dto.hash);
  }

  @AllowUnauthorizedRequest()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<boolean> {
    await this.userService.resetPassword(resetPasswordDto);
    return true;
  }

  @AllowUnauthorizedRequest()
  @Post('update-password')
  @HttpCode(HttpStatus.OK)
  async updatePassword(@Body() dto: UpdatePasswordDto): Promise<boolean> {
    await this.confirmService.confirmPassword(dto.hash, dto.password);
    return true;
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  async changeProfile(
    @Body() data: UpdateProfileDto,
    @UserPayload() user: UserPayloadInterface,
  ): Promise<UserEntity | null> {
    return this.userService.update(user.id, data);
  }
}
