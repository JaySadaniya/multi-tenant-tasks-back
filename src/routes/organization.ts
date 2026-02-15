import express from 'express';
import * as organizationController from '../controllers/organizationController';
import validate from '../middlewares/validate';
import Joi from 'joi';
import checkRole from '../middlewares/checkRole';
import { UserRole } from '../types';
import auth from '../middlewares/auth';

const router = express.Router();

router.get(
  '/users',
  auth,
  checkRole([UserRole.ADMIN, UserRole.MEMBER]),
  organizationController.getOrganizationUsers,
);

const createOrganizationSchema = Joi.object({
  name: Joi.string().min(2).required(),
});

router.post(
  '/',
  auth,
  checkRole([UserRole.ADMIN]),
  validate(createOrganizationSchema),
  organizationController.create,
);

export default router;
