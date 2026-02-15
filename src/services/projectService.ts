import { Project, User } from '../models';

export const createProject = async (organizationId: string, name: string) => {
  return await Project.create({ organizationId, name });
};

export const addUserToProject = async (projectId: string, userId: string) => {
  const project = await Project.findByPk(projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // 'addMember' comes from 'as: members' in the association definition
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
    throw new Error('Project not found');
  }

  // @ts-ignore
  return project.members;
};
