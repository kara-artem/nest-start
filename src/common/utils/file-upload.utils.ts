import { UnsupportedMediaTypeException } from '@nestjs/common';
import { Request } from 'express';
import path = require('path');

export const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: (arg0: UnsupportedMediaTypeException | null, arg1: boolean) => void,
): void => {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return callback(new UnsupportedMediaTypeException('Only image files are allowed!'), false);
  }
  callback(null, true);
};

export const editFileName = (
  _req: Request,
  file: Express.Multer.File,
  callback: (arg0: null, arg1: string) => void,
): void => {
  const name = file.originalname.split('.')[0];
  const fileExtName = path.extname(file.originalname);
  const randomName = JSON.stringify(Date.now());
  callback(null, `${name}-${randomName}${fileExtName}`);
};
