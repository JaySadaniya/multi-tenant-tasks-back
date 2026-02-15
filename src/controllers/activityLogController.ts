import { Request, Response, NextFunction } from 'express';
import * as activityLogService from '../services/activityLogService';

export const getActivityLogs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { taskId, page = 1, limit = 20 } = req.query;

    if (!taskId) {
      return res.status(400).json({ message: 'taskId is required' });
    }

    const logs = await activityLogService.getActivityLogs(
      { taskId: taskId as string },
      { page: Number(page), limit: Number(limit) },
    );

    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};
