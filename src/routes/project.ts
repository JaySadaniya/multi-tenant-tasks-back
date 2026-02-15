import express from 'express';
import * as projectController from '../controllers/projectController';
import auth from '../middlewares/auth';
import checkRole from '../middlewares/checkRole';
import { UserRole } from '../types';

const router = express.Router();

router.post(
  '/',
  auth,
  checkRole([UserRole.ADMIN]),
  projectController.createProject,
);

router.post(
  '/:projectId/users',
  auth,
  checkRole([UserRole.ADMIN]),
  projectController.addUserToProject,
);

router.get(
  '/:projectId/users',
  auth,
  checkRole([UserRole.ADMIN, UserRole.MEMBER]),
  projectController.getProjectUsers,
);

router.get(
  '/:projectId/analytics',
  auth,
  checkRole([UserRole.ADMIN]),
  projectController.getProjectAnalytics,
);

export default router;
