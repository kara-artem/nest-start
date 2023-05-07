import { UserRoleEnum } from '../../user/enums/user.role.enum';

export interface RefreshPayloadInterface {
  id: string;
  email: string;
  role: UserRoleEnum;
  hash: string;
}
