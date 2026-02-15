import express from 'express';
import * as activityLogController from '../controllers/activityLogController';
import auth from '../middlewares/auth';
import checkRole from '../middlewares/checkRole';
import { UserRole } from '../types';

const router = express.Router();

router.get(
  '/',
  auth,
  checkRole([UserRole.ADMIN]),
  activityLogController.getActivityLogs,
);

export default router;
