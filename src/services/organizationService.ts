import { sequelize } from '../models';
import { Organization } from '../models/organization';
import { transform } from '../transformers/organizationTransformer';
import { BadRequestError } from '../utils/errors';

export const createOrganization = async (name: string) => {
  // Check if organization already exists (case insensitive)
  const existingOrganization = await Organization.findOne({
    where: sequelize.where(
      sequelize.fn('lower', sequelize.col('name')),
      sequelize.fn('lower', name),
    ),
  });

  if (existingOrganization) {
    throw new BadRequestError('Organization already exists');
  }

  const newOrganization = await Organization.create({
    name,
  });

  return transform(newOrganization);
};

export const getOrganizationUsers = async (organizationId: string) => {
  const { User } = await import('../models');

  const users = await User.findAll({
    where: { organizationId },
    attributes: ['id', 'email', 'role', 'createdAt', 'updatedAt'],
    order: [['createdAt', 'DESC']],
  });

  return users.map((user: any) => ({
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
};
