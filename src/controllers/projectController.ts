import { Request, Response, NextFunction } from 'express';
import * as projectService from '../services/projectService';

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organizationId, name } = req.body;
    if (!organizationId || !name) {
      return res.status(400).json({ message: 'organizationId and name are required' });
    }
    const project = await projectService.createProject(organizationId, name);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

export const addUserToProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const result = await projectService.addUserToProject(projectId as string, userId);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'Project not found' || error.message === 'User not found') {
      res.status(404).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const getProjectUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const users = await projectService.getProjectUsers(projectId as string);
    res.status(200).json(users);
  } catch (error: any) {
    if (error.message === 'Project not found') {
      res.status(404).json({ message: error.message });
    } else {
      next(error);
    }
  }
};
