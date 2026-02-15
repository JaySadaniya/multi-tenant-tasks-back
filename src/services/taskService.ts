import { Task, Project, User, sequelize, ProjectUser } from '../models';
import { TaskStatus } from '../types';

interface CreateTaskData {
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  status?: TaskStatus;
}

export const createTask = async (data: CreateTaskData) => {
  return await sequelize.transaction(async (t: any) => {
  const { projectId, assigneeId } = data;

    const project = await Project.findByPk(projectId, { transaction: t });
  if (!project) {
    throw new Error('Project not found');
  }

  if (assigneeId) {
      const user = await User.findByPk(assigneeId, { transaction: t });
    if (!user) {
      throw new Error('User not found');
    }

      const membership = await ProjectUser.findOne({
        where: {
          projectId,
          userId: assigneeId
        },
        lock: true,
        transaction: t
      });

      if (!membership) {
      throw new Error('Assignee must be a member of the project');
    }
  }

    return await Task.create({
      ...data,
      status: data.status || TaskStatus.TODO
    }, { transaction: t });
  });
};

interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  assigneeId?: string | null;
}

export const updateTask = async (taskId: string, data: UpdateTaskData) => {
  return await sequelize.transaction(async (t: any) => {
    const task = await Task.findByPk(taskId, { transaction: t });
    if (!task) {
      throw new Error('Task not found');
    }

    // If assigneeId is being updated and is not null
    if (data.assigneeId && data.assigneeId !== task.assigneeId) {
      const project = await Project.findByPk(task.projectId, { transaction: t });
      if (!project) {
        throw new Error('Project not found');
      }
      
      const user = await User.findByPk(data.assigneeId, { transaction: t });
      if (!user) {
        throw new Error('User not found');
      }

      const membership = await ProjectUser.findOne({
        where: {
          projectId: task.projectId,
          userId: data.assigneeId
        },
        lock: true,
        transaction: t
      });

      if (!membership) {
        throw new Error('Assignee must be a member of the project');
      }
    }

    await task.update(data, { transaction: t });
    return task;
  });
};

export const deleteTask = async (taskId: string) => {
  const task = await Task.findByPk(taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  await task.destroy();
  return { message: 'Task deleted successfully' };
};

interface GetTasksFilters {
  projectId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  search?: string;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

export const getTasks = async (filters: GetTasksFilters, pagination: PaginationOptions) => {
  const { projectId, assigneeId, status, search } = filters;
  const { page, limit } = pagination;

  const where: any = {};

  if (projectId) where.projectId = projectId;
  if (assigneeId) where.assigneeId = assigneeId;
  if (status) where.status = status;
  if (search) {
    // Basic search on title or description
    const { Op } = require('sequelize');
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } }
    ];
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Task.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']], // Default sort
    include: [
      { model: User, as: 'assignee', attributes: ['id', 'email'] },
      { model: Project, as: 'project', attributes: ['id', 'name'] }
    ]
  });

  return {
    tasks: rows,
    total: count,
    page,
    totalPages: Math.ceil(count / limit)
  };
};
