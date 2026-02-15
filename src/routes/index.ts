import express from 'express';
import healthRoute from './health';

import userRoutes from './user';
import organizationRoutes from './organization';

const router = express.Router();

router.use('/health', healthRoute);
router.use('/users', userRoutes);
router.use('/organizations', organizationRoutes);

export default router;
