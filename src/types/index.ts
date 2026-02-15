export enum UserRole {
  ADMIN = 'Admin',
  MEMBER = 'Member',
}

export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
}

// Export all type definitions
export * from './task.types';
export * from './activityLog.types';
export * from './common.types';
