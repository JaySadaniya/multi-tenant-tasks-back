import { sequelize } from '../config/dbConnection';
import { Organization } from './organization';
import { User } from './user';
import { Project } from './project';
import { Task } from './task';
import { ActivityLog } from './activityLog';
import { ProjectUser } from './projectUser';

// Associations

// Organization - User
Organization.hasMany(User, { foreignKey: 'organizationId', as: 'users' });
User.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

// Organization - Project
Organization.hasMany(Project, { foreignKey: 'organizationId', as: 'projects' });
Project.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

// Organization - ActivityLog
Organization.hasMany(ActivityLog, { foreignKey: 'organizationId', as: 'activityLogs' });
ActivityLog.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

// Project - Task
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Project - User (Membership)
Project.belongsToMany(User, { through: ProjectUser, as: 'members', foreignKey: 'projectId', otherKey: 'userId' });
User.belongsToMany(Project, { through: ProjectUser, as: 'projects', foreignKey: 'userId', otherKey: 'projectId' });

// User - Task (Assignee)
User.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

// User - ActivityLog
User.hasMany(ActivityLog, { foreignKey: 'userId', as: 'activities' });
ActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { sequelize, Organization, User, Project, Task, ActivityLog, ProjectUser };
export default sequelize;
