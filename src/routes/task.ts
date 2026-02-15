import express from 'express';
import * as taskController from '../controllers/taskController';

const router = express.Router();

router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;
