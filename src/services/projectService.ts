import { Op } from 'sequelize';
import { sequelize } from '../models';
import { Project, User } from '../models';
import { BadRequestError, NotFoundError } from '../utils/errors';

export const createProject = async (
  organizationId: string,
  name: string,
  userId: string,
) => {
  // Check if project already exists in the organization (case insensitive)
  const existingProject = await Project.findOne({
    where: {
      organizationId,
      [Op.and]: sequelize.where(
        sequelize.fn('lower', sequelize.col('name')),
        sequelize.fn('lower', name),
      ),
    },
  });

  if (existingProject) {
    throw new BadRequestError('Project already exists in this organization');
  }

  const project = await Project.create({ organizationId, name });
  const user = await User.findByPk(userId);
  if (user) {
    // @ts-ignore
    await project.addMember(user);
  }
  return project;
};

export const addUserToProject = async (projectId: string, userId: string) => {
  const project = await Project.findByPk(projectId);
  if (!project) {
    throw new NotFoundError('Project');
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError('User');
  }

  // @ts-ignore
  await project.addMember(user);

  return { message: 'User added to project successfully' };
};

export const getProjectUsers = async (projectId: string) => {
  const project = await Project.findByPk(projectId, {
    include: [
      {
        model: User,
        as: 'members',
        attributes: ['id', 'email', 'role'],
        through: { attributes: [] },
      },
    ],
  });

  if (!project) {
    throw new NotFoundError('Project');
  }

  // @ts-ignore
  return project.members;
};

export const getUserProjects = async (userId: string) => {
  const user = await User.findByPk(userId, {
    include: [
      {
        model: Project,
        as: 'projects',
        attributes: ['id', 'name', 'organizationId', 'createdAt', 'updatedAt'],
        through: { attributes: [] },
      },
    ],
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  // @ts-ignore
  return user.projects || [];
};
