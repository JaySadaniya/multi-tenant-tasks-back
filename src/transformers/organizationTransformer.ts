import { Organization } from '../models/organization';

export interface SanitizedOrganization {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export const transform = (organization: Organization): SanitizedOrganization => {
  const organizationJson = organization.get({ plain: true });
  delete (organizationJson as any).deletedAt;
  return organizationJson as SanitizedOrganization;
};
