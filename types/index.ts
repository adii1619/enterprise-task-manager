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