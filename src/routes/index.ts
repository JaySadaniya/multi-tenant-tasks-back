import express from 'express';
import healthRoute from './health';

import userRoutes from './user';
import organizationRoutes from './organization';
import projectRoutes from './project';
import taskRoutes from './task';
import activityRoutes from './activity';

const router = express.Router();

router.use('/health', healthRoute);
router.use('/users', userRoutes);
router.use('/organizations', organizationRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/activity', activityRoutes);

export default router;
