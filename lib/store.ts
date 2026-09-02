import { create } from 'zustand';
import { Task, Column, Priority } from '@/types';
import { mockColumns, mockTasks } from '@/lib/mock-data';

interface BoardState {
  columns: Column[];
  tasks: Task[];
  
  // Task Actions
  addTask: (columnId: string, title: string, priority?: Priority) => void;
  updateTaskColumn: (taskId: string, newColumnId: string) => void;
  deleteTask: (taskId: string) => void;
  
  // Column Actions
  addColumn: (title: string) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  columns: mockColumns,
  tasks: mockTasks,

  addTask: (columnId, title, priority = 'MEDIUM') =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        {
          id: `task-${Date.now()}`,
          columnId,
          title,
          priority,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),

  updateTaskColumn: (taskId, newColumnId) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, columnId: newColumnId, updatedAt: new Date().toISOString() }
          : task
      ),
    })),

  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    })),

  addColumn: (title) =>
    set((state) => ({
      columns: [
        ...state.columns,
        {
          id: `col-${Date.now()}`,
          boardId: 'brd-1',
          title,
          order: state.columns.length,
        },
      ],
    })),
}));