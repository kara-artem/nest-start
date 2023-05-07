import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class GetByIdsDto {
  @IsNotEmpty()
  @IsArray()
  @IsUUID('all', { each: true })
  uploadIds: string[];
}
