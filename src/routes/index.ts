import express from 'express';
import healthRoute from './health';

import userRoutes from './user';
import organizationRoutes from './organization';
import projectRoutes from './project';
import taskRoutes from './task';

const router = express.Router();

router.use('/health', healthRoute);
router.use('/users', userRoutes);
router.use('/organizations', organizationRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);

export default router;
