import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

import { UserPayload } from '../user/decorators/user.payload.decorator';
import { UserPayloadInterface } from '../user/interfaces/user.payload.interface';
import { GetByIdsDto } from './dto/get.by.ids.dto';
import { UploadDto } from './dto/upload.dto';
import { UploadEntity } from './entities/upload.entity';
import { UploadService } from './upload.service';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getByIds(@Body() dto: GetByIdsDto): Promise<UploadEntity[]> {
    return this.uploadService.getByIds(dto.uploadIds);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getById(@Param('id', ParseUUIDPipe) id: string): Promise<UploadEntity | null> {
    return this.uploadService.getById(id);
  }

  @Post()
  @ApiBody({ type: UploadDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50_000_000 } }))
  @HttpCode(HttpStatus.CREATED)
  async addFile(
    @UploadedFile() file: Express.Multer.File,
    @UserPayload() user: UserPayloadInterface,
  ): Promise<UploadEntity> {
    if (file) {
      return this.uploadService.addFile(file, user.id);
    }
    throw new BadRequestException('File is empty');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteFile(@Param('id', ParseUUIDPipe) id: string): Promise<boolean> {
    return this.uploadService.deleteFile(id);
  }
}
