import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/dbConnection';
import { TaskStatus } from '../types';

export class Task extends Model {
  public id!: string;
  public title!: string;
  public description!: string | null;
  public status!: TaskStatus;
  public projectId!: string;
  public assigneeId!: string | null;
  public dueDate!: Date;
  public completedAt!: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date;
}

Task.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TaskStatus)),
      allowNull: false,
      defaultValue: TaskStatus.TODO,
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    assigneeId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'tasks',
    paranoid: true, // Soft delete
  },
);
