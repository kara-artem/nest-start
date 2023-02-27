import { HttpException, HttpStatus } from '@nestjs/common';

export class ResponseException<T> extends HttpException {
  constructor(statusCode: HttpStatus, message?: string, data?: T) {
    const res = {
      statusCode: statusCode,
      message: [message],
      data,
    };
    super(res, statusCode);
  }
}
