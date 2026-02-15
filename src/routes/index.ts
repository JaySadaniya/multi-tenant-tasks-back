import express from 'express';
import healthRoute from './health';

import userRoutes from './user';

const router = express.Router();

router.use('/health', healthRoute);
router.use('/users', userRoutes);

export default router;
