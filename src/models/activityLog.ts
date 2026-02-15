import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/dbConnection';

export class ActivityLog extends Model {
  public id!: string;
  public action!: string;
  public entityType!: string;
  public entityId!: string;
  public userId!: string;
  public organizationId!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ActivityLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entityType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'activity_logs',
    paranoid: false,
  }
);
