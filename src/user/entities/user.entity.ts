import { Exclude } from 'class-transformer';
import { BeforeInsert, BeforeUpdate, Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';

import { BaseEntity } from '../../common/entities/base.entity';
import { UploadEntity } from '../../upload/entities/upload.entity';
import { UserRoleEnum } from '../enums/user.role.enum';
import bcrypt = require('bcrypt');

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ select: false })
  password: string;

  @Index()
  @Column({ type: 'varchar' })
  email: string;

  @Column({ nullable: false, default: false })
  isEmailConfirmed: boolean;

  @Column({
    type: 'enum',
    enum: UserRoleEnum,
    default: UserRoleEnum.CLIENT,
    nullable: false,
  })
  role: UserRoleEnum;

  @Exclude()
  @Column({ type: 'uuid', nullable: true })
  avatarId?: string | null;

  @OneToOne(() => UploadEntity, {
    onDelete: 'SET NULL',
    eager: true,
    nullable: true,
  })
  @JoinColumn()
  avatar?: UploadEntity | null;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      const salt = await bcrypt.genSalt(10, 'a');
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
}
