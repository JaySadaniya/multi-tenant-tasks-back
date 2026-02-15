import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/dbConnection';

export class Project extends Model {
  public id!: string;
  public name!: string;
  public organizationId!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date;
}

Project.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'projects',
    paranoid: true, // Soft delete
  }
);
