import { BeforeInsert, BeforeUpdate, Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '../../common/entities/base.entity';
import { UserRoleEnum } from '../enums/user.role.enum';
import bcrypt = require('bcrypt');

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

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

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      const salt = await bcrypt.genSalt(10, 'a');
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
}
