import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/dbConnection';

export class ProjectUser extends Model {
  public projectId!: string;
  public userId!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProjectUser.init(
  {
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'projects',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'project_users',
    timestamps: true,
  }
);
