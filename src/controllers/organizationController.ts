import { Request, Response, NextFunction } from 'express';
import * as organizationService from '../services/organizationService';

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name } = req.body;

    const result = await organizationService.createOrganization(name);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getOrganizationUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get user's organization ID
    const user = await import('../models').then((m) => m.User.findByPk(userId));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const users = await organizationService.getOrganizationUsers(
      user.organizationId,
    );
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};
