import { sequelize } from '../models';
import { Organization } from '../models/organization';
import { transform } from '../transformers/organizationTransformer';

export const createOrganization = async (name: string) => {
  // Check if organization already exists (case insensitive)
  const existingOrganization = await Organization.findOne({
    where: sequelize.where(
      sequelize.fn('lower', sequelize.col('name')),
      sequelize.fn('lower', name)
    ),
  });
  
  if (existingOrganization) {
    throw new Error('Organization already exists');
  }

  const newOrganization = await Organization.create({
    name,
  });

  return transform(newOrganization);
};
