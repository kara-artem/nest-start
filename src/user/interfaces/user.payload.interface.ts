import { UserRoleEnum } from '../enums/user.role.enum';

export interface UserPayloadInterface {
  id: string;
  email: string;
  role: UserRoleEnum;
}
