import { environment } from '../shared/environment';

const { smtp } = environment;
export const emailConfig = {
  transport: smtp,
};
