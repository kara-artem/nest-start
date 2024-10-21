import { HttpStatus } from '@nestjs/common';

export interface StatusCodeResponse<T> {
  statusCode: HttpStatus;
  message?: (string | undefined)[];
  response: T;
}
