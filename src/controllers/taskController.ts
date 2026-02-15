import { Request, Response, NextFunction } from 'express';
import * as taskService from '../services/taskService';

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, projectId, assigneeId, status } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and projectId are required' });
    }

    const task = await taskService.createTask({
      title,
      description,
      projectId,
      assigneeId,
      status
    });

    res.status(201).json(task);
  } catch (error: any) {
    if (error.message === 'Project not found' || error.message === 'User not found' || error.message === 'Assignee must be a member of the project') {
      res.status(400).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, status, assigneeId } = req.body;

    const task = await taskService.updateTask(id as string, {
      title,
      description,
      status,
      assigneeId
    });

    res.status(200).json(task);
  } catch (error: any) {
    if (error.message === 'Task not found') {
      res.status(404).json({ message: error.message });
    } else if (error.message === 'Project not found' || error.message === 'User not found' || error.message === 'Assignee must be a member of the project') {
      res.status(400).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await taskService.deleteTask(id as string);
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Task not found') {
      res.status(404).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, assigneeId, status, search, page = 1, limit = 10 } = req.query;

    const filters = {
      projectId: projectId as string,
      assigneeId: assigneeId as string,
      status: status as any,
      search: search as string
    };

    const pagination = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10)
    };

    const result = await taskService.getTasks(filters, pagination);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
