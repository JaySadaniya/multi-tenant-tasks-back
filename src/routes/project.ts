import express from 'express';
import * as projectController from '../controllers/projectController';

const router = express.Router();

router.post('/', projectController.createProject);
router.post('/:projectId/users', projectController.addUserToProject);
router.get('/:projectId/users', projectController.getProjectUsers);

export default router;
