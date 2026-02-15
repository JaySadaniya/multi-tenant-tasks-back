import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { Organization } from '../models/organization';
import { UserRole } from '../types';
import { transform } from '../transformers/userTransformer';
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
    throw new Error('Organization not found');
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser = await User.create({
    email,
    password: hashedPassword,
    organizationId,
    role,
  });

  const token = generateToken(newUser);

  const user = transform(newUser);

  return { user, token };
};

export const login = async (email: string, password: string) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user);

  const userDetails = transform(user);

  return { user: userDetails, token };
};

export const getUser = async (userId: string) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('User not found');
  }

  return transform(user);
};
