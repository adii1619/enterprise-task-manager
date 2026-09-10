export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type Role = 'ADMIN' | 'MANAGER' | 'MEMBER';
export type AuthRole = 'ADMIN' | 'MEMBER';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: AuthRole;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: Role;
}

export interface Task {
  _id: string; // Updated from id to match MongoDB
  columnId: string;
  title: string;
  description?: string;
  priority: Priority;
  assigneeId?: string | TaskAssignee;
  checklist?: ChecklistItem[];
  dueDate?: string;
  tags?: TaskTag[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  _id: string; // Updated from id to match MongoDB
  boardId?: string; // Optional for now since we bypass board requirement
  title: string;
  order: number;
}

export interface Board {
  id: string;
  workspaceId: string;
  title: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
}

export interface TaskAssignee {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface ClientWorkspace {
  _id: string;
  name: string;
  slug: string;
  ownerId: string;
  members: Array<{
    userId: string | TaskAssignee;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    joinedAt: string;
  }>;
}

export interface ChecklistItem {
  _id: string;
  title: string;
  completed: boolean;
}

export interface TaskTag {
  name: string;
  color: string;
}

export interface PresenceUser {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export type BoardRealtimeEvent =
  | { type: 'task:created' | 'task:updated' | 'task:moved'; task: Task }
  | { type: 'task:deleted'; id: string }
  | { type: 'column:created' | 'column:updated'; column: Column }
  | { type: 'column:deleted'; id: string };

export interface ActivityItem {
  _id: string;
  workspaceId: string;
  actorId: TaskAssignee;
  actionType: string;
  entityType: 'TASK' | 'COLUMN' | 'WORKSPACE' | 'MEMBER';
  entityId?: string;
  entityTitle?: string;
  details?: string;
  createdAt: string;
}

export interface WorkloadMetric {
  _id: string;
  name: string;
  email: string;
  taskCount: number;
}

export interface WorkspaceMetricsResponse {
  summary: {
    byStatus: Array<{ _id: string; count: number }>;
    overdue: Array<{ overdueCount: number }>;
    completed: Array<{ completedCount: number }>;
    total: Array<{ totalCount: number }>;
  };
  workload: WorkloadMetric[];
}