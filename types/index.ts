export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type Role = 'ADMIN' | 'MANAGER' | 'MEMBER';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: Role;
}

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  priority: Priority;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  boardId: string;
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