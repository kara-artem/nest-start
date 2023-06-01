import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';

import { ResponseException } from '../../common/exceptions/response.exception';
import { RegistrationDto } from '../dto/registration.dto';
import { ResetPasswordDto } from '../dto/reset.password.dto';
import { UpdateProfileDto } from '../dto/update.profile.dto';
import { UserEntity } from '../entities/user.entity';
import { EmailMessageType } from '../types/users.types';
import { LetterService } from './letter.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly letterService: LetterService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteUnconfirmedUsers(): Promise<void> {
    try {
      await this.userRepo.delete({
        isEmailConfirmed: false,
      });
    } catch (e) {
      console.log(e);
    }
  }

  async getById(id: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({
      where: {
        id,
      },
    });
  }

  async getByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({
      where: { email: email },
    });
  }

  async getForAuth(dto: { id?: string; email?: string }): Promise<UserEntity | null> {
    const where: FindOptionsWhere<UserEntity>[] = [];

    if (dto.id) {
      where.push({ id: dto.id });
    }
    if (dto.email) {
      where.push({ email: ILike(dto.email) });
    }

    if (!where.length) {
      throw new BadRequestException('User search parameters are not set');
    }

    return this.userRepo.findOne({
      select: ['id', 'password', 'email', 'role'],
      where,
    });
  }

  async create(dto: RegistrationDto): Promise<UserEntity | null> {
    let user = await this.userRepo.create(dto);

    await this.checkEmailAndSendConfirmLetter(dto.email);

    user = await this.userRepo.save(user);
    return this.getById(user.id);
  }

  async update(id: string, dto: UpdateProfileDto): Promise<UserEntity | null> {
    const user: UserEntity | null = await this.getById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      await this.userRepo.save({
        ...user,
        ...dto,
      });

      return this.getById(id);
    } catch (e) {
      Logger.error(e, 'UserService.update');
      throw new ResponseException(HttpStatus.BAD_REQUEST, e instanceof Error ? e.message : '');
    }
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepo.delete({ id });
  }

  async saveEmail(email: string): Promise<boolean> {
    const user: UserEntity | null = await this.getByEmail(email);
    if (user) {
      user.email = email;
      user.isEmailConfirmed = true;
      await this.userRepo.save(user);
      return true;
    }
    throw new NotFoundException('User not found');
  }

  async savePassword(email: string, password: string): Promise<void> {
    const user: UserEntity | null = await this.getByEmail(email);
    if (user) {
      user.password = password;
      await this.userRepo.save(user);
    } else {
      throw new NotFoundException('User not found');
    }
  }

  async checkEmailAndSendConfirmLetter(email: string): Promise<void> {
    if (await this.checkExistEmail(email)) {
      const hash = await this.letterService.setHash({ email }, EmailMessageType.EMAIL);
      await this.letterService.sendLetter(hash, email, EmailMessageType.EMAIL);
    }
  }

  async checkExistEmail(email: string): Promise<boolean> {
    const user = await this.getByEmail(email);
    if (user && user.isEmailConfirmed) {
      throw new ConflictException('This email address is already registered in the system');
    } else if (user) {
      await this.deleteUser(user.id);
    }
    return true;
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const messageType = EmailMessageType.RESET_PASSWORD;
    const user = await this.getByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('User not found');
    } else {
      const hash = await this.letterService.setHash({ email: user.email }, messageType);
      await this.letterService.sendLetter(hash, dto.email, messageType);
    }
  }
}
