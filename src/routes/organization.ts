import express from 'express';
import * as organizationController from '../controllers/organizationController';
import validate from '../middlewares/validate';
import Joi from 'joi';

const router = express.Router();

const createOrganizationSchema = Joi.object({
  name: Joi.string().min(2).required(),
});

router.post('/', validate(createOrganizationSchema), organizationController.create);

export default router;
