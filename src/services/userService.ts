import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { Organization } from '../models/organization';
import { UserRole } from '../types';
import { transform } from '../transformers/userTransformer';
import config from '../config';

const SALT_ROUNDS = config.SALT_ROUNDS;
const JWT_SECRET = config.JWT_SECRET;

export const register = async (email: string, password: string, organizationId: string, role: UserRole = UserRole.MEMBER) => {
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

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, organizationId: newUser.organizationId },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const user = transform(newUser);

  return { user, token };
};
