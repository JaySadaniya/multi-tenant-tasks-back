import { ActivityLog, User } from '../models';

interface GetActivityLogsFilters {
  taskId?: string;
  projectId?: string;
  userId?: string;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

export const getActivityLogs = async (
  filters: GetActivityLogsFilters,
  pagination: PaginationOptions,
) => {
  const { taskId, projectId, userId } = filters;
  const { page, limit } = pagination;

  const where: any = {};

  if (taskId) {
    where.entityId = taskId;
    where.entityType = 'Task';
  }

  if (projectId) {
    where.entityId = projectId;
    where.entityType = 'Project';
  }

  if (userId) {
    where.userId = userId;
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await ActivityLog.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: [
      // Optional: Include Actor details
      // { model: User, as: 'user', attributes: ['id', 'email', 'name'] }
      // We need to verify if association exists or setup it if we want it.
      // For now, raw logs are fine/requested.
    ],
  });

  return {
    logs: rows,
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
  };
};
