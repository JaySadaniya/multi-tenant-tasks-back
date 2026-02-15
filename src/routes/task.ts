import express from 'express';
import * as taskController from '../controllers/taskController';
import auth from '../middlewares/auth';

import checkRole from '../middlewares/checkRole';
import { UserRole } from '../types';

const router = express.Router();

router.use(auth);

router.post(
  '/',
  checkRole([UserRole.ADMIN, UserRole.MEMBER]),
  taskController.createTask,
);

router.get(
  '/',
  checkRole([UserRole.ADMIN, UserRole.MEMBER]),
  taskController.getTasks,
);

router.put(
  '/:id',
  checkRole([UserRole.ADMIN, UserRole.MEMBER]),
  taskController.updateTask,
);

router.patch(
  '/:id/status',
  checkRole([UserRole.ADMIN, UserRole.MEMBER]),
  taskController.updateTaskStatus,
);

router.patch(
  '/:id/assignee',
  checkRole([UserRole.ADMIN]),
  taskController.updateTaskAssignee,
);

router.delete('/:id', checkRole([UserRole.ADMIN]), taskController.deleteTask);

export default router;
