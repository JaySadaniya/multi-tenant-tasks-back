import { ActivityLog, User } from '../models';
import { GetActivityLogsFilters, PaginationOptions } from '../types';

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
  });

  return {
    logs: rows,
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
  };
};
