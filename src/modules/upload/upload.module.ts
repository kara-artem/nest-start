import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UploadEntity } from './entities/upload.entity';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UploadEntity])],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
