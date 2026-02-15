import { User } from '../models/user';

export interface SanitizedUser {
  id: string;
  email: string;
  role: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const transform = (user: User): SanitizedUser => {
  const userJson = user.get({ plain: true });
  delete (userJson as any).password;
  delete (userJson as any).deletedAt;
  return userJson as SanitizedUser;
};
