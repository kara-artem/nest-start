import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmEmailDto {
  @IsNotEmpty()
  @IsString()
  hash: string;
}
