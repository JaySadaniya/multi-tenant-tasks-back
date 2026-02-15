import {
  Task,
  Project,
  User,
  sequelize,
  ProjectUser,
  ActivityLog,
} from '../models';
import {
  TaskStatus,
  CreateTaskData,
  UpdateTaskData,
  GetTasksFilters,
  PaginationOptions,
} from '../types';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { Op } from 'sequelize';

export const createTask = async (data: CreateTaskData, userId: string) => {
  return await sequelize.transaction(async (t: any) => {
    const { projectId, assigneeId } = data;

    const project = await Project.findByPk(projectId, { transaction: t });
    if (!project) {
      throw new NotFoundError('Project');
    }

    if (assigneeId) {
      const user = await User.findByPk(assigneeId, { transaction: t });
      if (!user) {
        throw new NotFoundError('User');
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
        throw new BadRequestError('Assignee must be a member of the project');
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
      throw new NotFoundError('Task');
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
        {
          model: Project,
          as: 'project',
          attributes: ['organizationId'],
          required: true,
        },
      ],
      lock: true,
      transaction: t,
    });

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.status === TaskStatus.DONE) {
      throw new BadRequestError('Cannot update a completed task');
    }

    if (!Object.values(TaskStatus).includes(status)) {
      throw new BadRequestError('Invalid status');
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
      throw new NotFoundError('Task');
    }

    if (assigneeId && assigneeId !== task.assigneeId) {
      const user = await User.findByPk(assigneeId, { transaction: t });
      if (!user) {
        throw new NotFoundError('User');
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
        throw new BadRequestError('Assignee must be a member of the project');
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
    throw new NotFoundError('Task');
  }

  await task.destroy();
  return { message: 'Task deleted successfully' };
};

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
    throw new NotFoundError('Project');
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
  const result: any = await Task.findOne({
    where: {
      projectId,
      status: TaskStatus.DONE,
      completedAt: { [Op.not]: null },
    },
    attributes: [
      [
        sequelize.fn(
          'AVG',
          sequelize.literal(
            'EXTRACT(EPOCH FROM ("completedAt" - "createdAt")) * 1000',
          ),
        ),
        'avgCompletionTime',
      ],
    ],
    raw: true,
  });

  const averageCompletionTime = result?.avgCompletionTime
    ? parseFloat(result.avgCompletionTime as string)
    : 0;

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
