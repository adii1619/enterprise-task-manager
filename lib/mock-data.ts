import { Workspace, Board, Column, Task, User } from '@/types';

export const mockUser: User = {
  id: 'usr-1',
  name: 'Alex Johnson',
  email: 'alex@enterprise.com',
  role: 'ADMIN',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
};

export const mockWorkspace: Workspace = {
  id: 'ws-1',
  name: 'Engineering Team',
  slug: 'engineering-team',
  ownerId: 'usr-1',
};

export const mockBoard: Board = {
  id: 'brd-1',
  workspaceId: 'ws-1',
  title: 'Sprint 14 - Platform Redesign',
};

export const mockColumns: Column[] = [
  { _id: 'col-1', boardId: 'brd-1', title: 'To Do', order: 0 },
  { _id: 'col-2', boardId: 'brd-1', title: 'In Progress', order: 1 },
  { _id: 'col-3', boardId: 'brd-1', title: 'In Review', order: 2 },
  { _id: 'col-4', boardId: 'brd-1', title: 'Done', order: 3 },
];

export const mockTasks: Task[] = [
  {
    _id: 'task-1',
    columnId: 'col-1',
    title: 'Setup Next.js 14 App Router layout',
    description: 'Configure TypeScript, Tailwind CSS, and global styles.',
    priority: 'HIGH',
    assigneeId: 'usr-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'task-2',
    columnId: 'col-1',
    title: 'Design Kanban UI wireframes',
    description: 'Sketch layout in Figma before component construction.',
    priority: 'MEDIUM',
    assigneeId: 'usr-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'task-3',
    columnId: 'col-2',
    title: 'Implement Zustand local state store',
    description: 'Handle offline CRUD operations for columns and tasks.',
    priority: 'URGENT',
    assigneeId: 'usr-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'task-4',
    columnId: 'col-4',
    title: 'Define TypeScript interfaces',
    description: 'Created core domain models in types/index.ts.',
    priority: 'LOW',
    assigneeId: 'usr-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];