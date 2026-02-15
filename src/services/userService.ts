import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { Organization } from '../models/organization';
import { UserRole } from '../types';
import { transform } from '../transformers/userTransformer';
import {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} from '../utils/errors';
import config from '../config';

const SALT_ROUNDS = config.SALT_ROUNDS;
const JWT_SECRET = config.JWT_SECRET;

const generateToken = (user: User) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    },
    JWT_SECRET,
    { expiresIn: '1h' },
  );
};

export const register = async (
  email: string,
  password: string,
  organizationId: string,
  role: UserRole = UserRole.MEMBER,
) => {
  const organization = await Organization.findByPk(organizationId);
  if (!organization) {
    throw new NotFoundError('Organization');
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new BadRequestError('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser = await User.create({
    email,
    password: hashedPassword,
    organizationId,
    role,
  });

  // Fetch user with organization to get organization name
  const userWithOrg = await User.findByPk(newUser.id, {
    include: [
      { model: Organization, as: 'organization', attributes: ['name'] },
    ],
  });

  const token = generateToken(newUser);

  return { user: transform(userWithOrg!), token };
};

export const login = async (email: string, password: string) => {
  const user = await User.findOne({
    where: { email },
    include: [
      { model: Organization, as: 'organization', attributes: ['name'] },
    ],
  });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = generateToken(user);

  return { user: transform(user), token };
};

export const getUser = async (userId: string) => {
  const user = await User.findByPk(userId, {
    include: [
      { model: Organization, as: 'organization', attributes: ['name'] },
    ],
  });
  if (!user) {
    throw new NotFoundError('User');
  }

  return transform(user);
};
