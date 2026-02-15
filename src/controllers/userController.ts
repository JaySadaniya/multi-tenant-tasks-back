import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, organizationId, role } = req.body;

    const result = await userService.register(email, password, organizationId, role);

    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'User already exists' || error.message === 'Organization not found') {
      res.status(400).json({ message: error.message });
    } else {
      next(error);
    }
  }
};
