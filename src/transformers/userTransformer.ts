import { User } from '../models/user';

export interface SanitizedUser {
  id: string;
  email: string;
  role: string;
  organizationId: string;
  organizationName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const transform = (user: User): SanitizedUser => {
  const userJson = user.get({ plain: true });
  delete (userJson as any).password;
  delete (userJson as any).deletedAt;

  // Extract organizationName from included organization if present
  if ((userJson as any).organization?.name) {
    (userJson as any).organizationName = (userJson as any).organization.name;
  }

  // Remove the organization object to keep response clean
  delete (userJson as any).organization;

  return userJson as SanitizedUser;
};
