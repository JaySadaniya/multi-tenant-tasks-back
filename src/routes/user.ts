import express from 'express';
import * as userController from '../controllers/userController';
import validate from '../middlewares/validate';
import Joi from 'joi';
import { UserRole } from '../types';

const router = express.Router();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  organizationId: Joi.string().uuid().required(),
  role: Joi.string().valid(...Object.values(UserRole)).optional(),
});

router.post('/register', validate(registerSchema), userController.register);

export default router;
