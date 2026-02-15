import { TaskStatus } from './index';

export interface CreateTaskData {
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  status?: TaskStatus;
  dueDate: Date;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  dueDate?: Date;
}

export interface GetTasksFilters {
  projectId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  search?: string;
}
