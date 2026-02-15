import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/dbConnection';
import { UserRole } from '../types';

export class User extends Model {
  public id!: string;
  public email!: string;
  public password!: string;
  public role!: UserRole;
  public organizationId!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.MEMBER,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    paranoid: true, // Soft delete
  }
);
