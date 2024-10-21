import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../../shared/entities/base.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { UploadStatusEnum } from '../enums/upload.status.enum';
import { UploadTypeEnum } from '../enums/upload.type.enum';

@Entity('uploads')
export class UploadEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  path: string;

  @Column({ type: 'varchar' })
  s3Key: string;

  @Column({ type: 'varchar' })
  hash: string;

  @Column({
    type: 'enum',
    enum: UploadStatusEnum,
    default: UploadStatusEnum.WAIT_FOR_LINKING,
  })
  status: UploadStatusEnum;

  @Column({ type: 'enum', enum: UploadTypeEnum, nullable: false })
  type: UploadTypeEnum;

  @Exclude()
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  user: UserEntity;
}
