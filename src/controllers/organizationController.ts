import { Request, Response, NextFunction } from 'express';
import * as organizationService from '../services/organizationService';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;

    const result = await organizationService.createOrganization(name);

    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'Organization already exists') {
      res.status(400).json({ message: error.message });
    } else {
      next(error);
    }
  }
};
