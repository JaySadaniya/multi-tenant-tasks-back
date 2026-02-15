import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';

const checkRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return res
        .status(403)
        .json({ message: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};

export default checkRole;
