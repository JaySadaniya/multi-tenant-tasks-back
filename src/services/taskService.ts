import {
  Task,
  Project,
  User,
  sequelize,
  ProjectUser,
  ActivityLog,
} from '../models';
import { TaskStatus } from '../types';
import { Op } from 'sequelize';

interface CreateTaskData {
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  status?: TaskStatus;
  dueDate: Date;
}

export const createTask = async (data: CreateTaskData, userId: string) => {
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
          userId: assigneeId,
        },
        lock: true,
        transaction: t,
      });

      if (!membership) {
        throw new Error('Assignee must be a member of the project');
      }
    }

    const task = await Task.create(
      {
        ...data,
        status: data.status || TaskStatus.TODO,
      },
      { transaction: t },
    );

    await ActivityLog.create(
      {
        action: 'TASK_CREATED',
        entityType: 'Task',
        entityId: task.id,
        userId,
        organizationId: project.organizationId,
        details: {
          title: task.title,
          status: task.status,
          assigneeId: task.assigneeId,
          dueDate: task.dueDate,
        },
      },
      { transaction: t },
    );

    return task;
  });
};

interface UpdateTaskData {
  title?: string;
  description?: string;
  dueDate?: Date;
}

export const updateTask = async (
  taskId: string,
  data: UpdateTaskData,
  userId: string,
) => {
  return await sequelize.transaction(async (t: any) => {
    const task = await Task.findByPk(taskId, {
      include: [
        { model: Project, as: 'project', attributes: ['organizationId'] },
      ],
      transaction: t,
    });
    if (!task) {
      throw new Error('Task not found');
    }

    const oldData = {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
    };
    await task.update(data, { transaction: t });

    await ActivityLog.create(
      {
        action: 'TASK_UPDATED',
        entityType: 'Task',
        entityId: task.id,
        userId,
        // @ts-ignore
        organizationId: task.project?.organizationId,
        details: {
          old: oldData,
          new: data,
        },
      },
      { transaction: t },
    );

    return task;
  });
};

export const updateTaskStatus = async (
  taskId: string,
  status: TaskStatus,
  userId: string,
) => {
  return await sequelize.transaction(async (t: any) => {
    const task = await Task.findByPk(taskId, {
      include: [
        { model: Project, as: 'project', attributes: ['organizationId'] },
      ],
      lock: true,
      transaction: t,
    });

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.status === TaskStatus.DONE) {
      throw new Error('Cannot update a completed task');
    }

    if (!Object.values(TaskStatus).includes(status)) {
      throw new Error('Invalid status');
    }

    const oldStatus = task.status;
    const updates: any = { status };

    if (status === TaskStatus.DONE) {
      updates.completedAt = new Date();
    }

    await task.update(updates, { transaction: t });

    await ActivityLog.create(
      {
        action: 'TASK_STATUS_UPDATED',
        entityType: 'Task',
        entityId: task.id,
        userId,
        // @ts-ignore
        organizationId: task.project?.organizationId,
        details: {
          oldStatus,
          newStatus: status,
        },
      },
      { transaction: t },
    );

    return task;
  });
};

export const updateTaskAssignee = async (
  taskId: string,
  assigneeId: string | null,
  userId: string,
) => {
  return await sequelize.transaction(async (t: any) => {
    const task = await Task.findByPk(taskId, {
      include: [
        { model: Project, as: 'project', attributes: ['organizationId'] },
      ],
      transaction: t,
    });
    if (!task) {
      throw new Error('Task not found');
    }

    if (assigneeId && assigneeId !== task.assigneeId) {
      const user = await User.findByPk(assigneeId, { transaction: t });
      if (!user) {
        throw new Error('User not found');
      }

      const membership = await ProjectUser.findOne({
        where: {
          projectId: task.projectId,
          userId: assigneeId,
        },
        lock: true,
        transaction: t,
      });

      if (!membership) {
        throw new Error('Assignee must be a member of the project');
      }
    }

    const oldAssigneeId = task.assigneeId;
    await task.update({ assigneeId }, { transaction: t });

    await ActivityLog.create(
      {
        action: 'TASK_ASSIGNEE_UPDATED',
        entityType: 'Task',
        entityId: task.id,
        userId,
        // @ts-ignore
        organizationId: task.project?.organizationId,
        details: {
          oldAssigneeId,
          newAssigneeId: assigneeId,
        },
      },
      { transaction: t },
    );

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

export const getTasks = async (
  filters: GetTasksFilters,
  pagination: PaginationOptions,
) => {
  const { projectId, assigneeId, status, search } = filters;
  const { page, limit } = pagination;

  const where: any = {};

  if (projectId) where.projectId = projectId;
  if (assigneeId) where.assigneeId = assigneeId;
  if (status) where.status = status;
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
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
      { model: Project, as: 'project', attributes: ['id', 'name'] },
    ],
  });

  return {
    tasks: rows,
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
  };
};

export const getProjectAnalytics = async (projectId: string) => {
  const project = await Project.findByPk(projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  // 1. Tasks completed per user
  const completedTasksPerUser = await Task.findAll({
    where: {
      projectId,
      status: TaskStatus.DONE,
    },
    attributes: [
      'assigneeId',
      [sequelize.fn('COUNT', sequelize.col('Task.id')), 'completedCount'],
    ],
    group: ['assigneeId', 'assignee.id'],
    include: [
      {
        model: User,
        as: 'assignee',
        attributes: ['id', 'email'],
      },
    ],
    raw: true,
  });

  // 2. Overdue task count
  const overdueTaskCount = await Task.count({
    where: {
      projectId,
      status: {
        [Op.ne]: TaskStatus.DONE,
      },
      dueDate: {
        [Op.lt]: new Date(),
      },
    },
  });

  // 3. Average completion time (in milliseconds)
  const completedTasks = await Task.findAll({
    where: {
      projectId,
      status: TaskStatus.DONE,
      completedAt: { [Op.not]: null },
    },
    attributes: ['createdAt', 'completedAt'],
    raw: true,
  });

  let totalTime = 0;
  completedTasks.forEach((t: any) => {
    const start = new Date(t.createdAt).getTime();
    const end = new Date(t.completedAt).getTime();
    totalTime += end - start;
  });

  const averageCompletionTime =
    completedTasks.length > 0 ? totalTime / completedTasks.length : 0;

  return {
    completedTasksPerUser: completedTasksPerUser.map((t: any) => ({
      userId: t.assigneeId,
      email: t['assignee.email'],
      count: t.completedCount,
    })),
    overdueTaskCount,
    averageCompletionTime,
  };
};
