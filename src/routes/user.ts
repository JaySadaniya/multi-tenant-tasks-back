import express from 'express';
import * as userController from '../controllers/userController';
import validate from '../middlewares/validate';
import Joi from 'joi';
import { UserRole } from '../types';
import auth from '../middlewares/auth';

const router = express.Router();

router.get('/me', auth, userController.getMe);

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/)
    .required()
    .messages({
      'string.pattern.base':
        'Password must be at least 6 characters long and contain at least one letter and one number.',
    }),
  organizationId: Joi.string().uuid().required(),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .optional(),
});

router.post('/register', validate(registerSchema), userController.register);

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post('/login', validate(loginSchema), userController.login);

export default router;
