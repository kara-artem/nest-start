import { ApiProperty } from '@nestjs/swagger';

export class UploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  public file: Express.Multer.File;
}
