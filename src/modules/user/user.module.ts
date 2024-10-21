import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from './entities/user.entity';
import { ConfirmService } from './services/confirm.service';
import { LetterService } from './services/letter.service';
import { UserService } from './services/user.service';
import { UserController } from './user.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [ConfirmService, UserService, LetterService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
