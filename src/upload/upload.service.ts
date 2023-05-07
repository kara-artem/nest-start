import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { S3 } from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload';
import * as crypto from 'crypto';
import { In, Repository, UpdateResult } from 'typeorm';

import { config } from '../common/config';
import { S3_SYMBOLS_REGEX } from '../common/constants';
import { UploadEntity } from './entities/upload.entity';
import { UploadStatusEnum } from './enums/upload.status.enum';
import { UploadTypeEnum, UploadTypeKey } from './enums/upload.type.enum';
import SendData = ManagedUpload.SendData;

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(UploadEntity)
    private readonly uploadRepo: Repository<UploadEntity>,
  ) {}

  private static generateHash(): string {
    return crypto.randomBytes(6).toString('hex');
  }

  private static setupName(hash: string, name: string): string {
    return `${hash}_${name}`;
  }

  private static fixProtocol(data: SendData): void {
    if (data.Location.search(/http:\/\//) === 0) {
      data.Location = data.Location.replace('http://', 'https://');
    }
  }

  async uploadS3(file: Buffer, name: string, mimetype: string): Promise<SendData> {
    const s3 = config.getS3();
    const Bucket = config.get('S3_BUCKET_NAME');
    if (!Bucket) {
      throw new BadRequestException('Bucket name not found, check .env');
    }
    const params: S3.Types.PutObjectRequest = {
      ACL: 'public-read',
      Bucket,
      Key: name,
      Body: file,
      ContentType: mimetype,
    };
    return new Promise((resolve, reject) => {
      s3.upload(params, (err: Error, data: SendData) => {
        if (err) {
          Logger.error(err, '', 'Config.uploadS3');
          reject(err.message);
        }

        UploadService.fixProtocol(data);
        resolve(data);
      });
    });
  }

  async getById(id: string): Promise<UploadEntity | null> {
    return this.uploadRepo.findOneById(id);
  }

  async getByIds(ids: string[]): Promise<UploadEntity[]> {
    return this.uploadRepo.findByIds(ids);
  }

  async changeFileStatus(
    id: string | string[],
    status: UploadStatusEnum = UploadStatusEnum.LINKED,
  ): Promise<UpdateResult> {
    if (!Array.isArray(id)) {
      id = [id];
    }
    return this.uploadRepo.update({ id: In(id) }, { status });
  }

  getFileType(file: Express.Multer.File): UploadTypeEnum {
    const type = file.mimetype.substring(0, file.mimetype.indexOf('/')).toUpperCase();
    return type in UploadTypeEnum ? UploadTypeEnum[type as UploadTypeKey] : UploadTypeEnum.DOCUMENT;
  }

  //TODO проверить потом поля, удалить некоторые если что
  async addFile(file: Express.Multer.File, userId: string): Promise<UploadEntity> {
    const fileName = file.originalname.split('.').slice(0, -1).join('.').concat('.jpeg');
    const fileType = !('path' in file) ? UploadTypeEnum.IMAGE : this.getFileType(file);
    const hash = UploadService.generateHash();
    const name = UploadService.setupName(hash, fileName);
    const isAllowedCharacters = S3_SYMBOLS_REGEX.test(name);
    const Key = isAllowedCharacters ? name : encodeURI(name);
    const s3File = await this.uploadS3(file.buffer, Key, 'image/jpeg');
    return this.uploadRepo.save({
      name: file.originalname,
      path: s3File?.Location,
      s3Key: s3File?.Key,
      type: fileType,
      hash,
      userId,
    });
  }

  async deleteFile(id: string): Promise<boolean> {
    try {
      return !!(await this.uploadRepo.delete(id));
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
