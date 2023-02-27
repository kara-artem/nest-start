import { HttpStatus } from '@nestjs/common';

export class StatusCodeResponseDto {
  statusCode: HttpStatus;
  message: Array<string>;
}
