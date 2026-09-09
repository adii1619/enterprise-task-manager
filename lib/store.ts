import { create } from 'zustand';
import { Task, Column, Priority } from '@/types';
import { apiFetch } from '@/lib/api';

interface BoardState {
  columns: Column[];
  tasks: Task[];
  searchQuery: string;
  selectedPriority: Priority | 'ALL';
  boardTitle: string;

  setSearchQuery: (query: string) => void;
  setSelectedPriority: (priority: Priority | 'ALL') => void;
  setBoardTitle: (title: string) => void;
  
  // Async Data Fetching
  fetchBoardData: () => Promise<void>;
  clearBoard: () => void;

  // Task Actions
  addTask: (columnId: string, title: string, priority?: Priority) => Promise<void>;
  updateTask: (
    taskId: string,
    updates: Partial<Pick<Task, 'title' | 'description' | 'priority'>>
  ) => Promise<void>;
  updateTaskColumn: (taskId: string, newColumnId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  
  // Column Actions
  addColumn: (title: string) => Promise<void>;
  updateColumnTitle: (id: string, title: string) => Promise<void>;
  deleteColumn: (id: string) => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  columns: [],
  tasks: [],
  searchQuery: '',
  selectedPriority: 'ALL',
  boardTitle: 'Sprint 14 - Platform Redesign',

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedPriority: (priority) => set({ selectedPriority: priority }),
  setBoardTitle: (title) => set({ boardTitle: title }),

  // Load live data from MongoDB on app start
  fetchBoardData: async () => {
    try {
      const [columns, tasks] = await Promise.all([
        apiFetch<Column[]>('/columns'),
        apiFetch<Task[]>('/tasks'),
      ]);
      set({ columns, tasks });
    } catch (err) {
      console.error('Failed to load board data:', err);
    }
  },

  clearBoard: () => set({ columns: [], tasks: [] }),

  // Add task to Express API
  addTask: async (columnId, title, priority = 'MEDIUM') => {
    try {
      const newTask = await apiFetch<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify({ columnId, title, priority }),
      });
      set((state) => ({ tasks: [...state.tasks, newTask] }));
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  },

  // Update task details via API (Optimistic UI update first)
  updateTask: async (taskId, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task._id === taskId
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      ),
    }));

    try {
      await apiFetch(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  },

  // Update task column via API (Optimistic UI update first)
  updateTaskColumn: async (taskId, newColumnId) => {
    // 1. Update local UI state immediately
    set((state) => ({
      tasks: state.tasks.map((task) =>
        (task._id || (task as unknown as { id: string }).id) === taskId
          ? { ...task, columnId: newColumnId, updatedAt: new Date().toISOString() }
          : task
      ),
    }));

    // 2. Sync change with backend
    try {
      await apiFetch(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ columnId: newColumnId }),
      });
    } catch (err) {
      console.error('Failed to update task column:', err);
    }
  },

  // Delete task via API
  deleteTask: async (taskId) => {
    // 1. Remove from UI state
    set((state) => ({
      tasks: state.tasks.filter(
        (task) => (task._id || (task as unknown as { id: string }).id) !== taskId
      ),
    }));

    // 2. Delete from MongoDB
    try {
      await apiFetch(`/tasks/${taskId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  },

  // Add column to Express API
  addColumn: async (title) => {
    try {
      const order = get().columns.length + 1;
      const newColumn = await apiFetch<Column>('/columns', {
        method: 'POST',
        body: JSON.stringify({ title, order }),
      });
      set((state) => ({ columns: [...state.columns, newColumn] }));
    } catch (err) {
      console.error('Failed to add column:', err);
    }
  },

  // Update column title via API
  updateColumnTitle: async (id, title) => {
    try {
      await apiFetch(`/columns/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title }),
      });
      set((state) => ({
        columns: state.columns.map((column) =>
          column._id === id ? { ...column, title } : column
        ),
      }));
    } catch (err) {
      console.error('Failed to update column:', err);
    }
  },

  // Delete an empty column via API
  deleteColumn: async (id) => {
    try {
      await apiFetch(`/columns/${id}`, {
        method: 'DELETE',
      });
      set((state) => ({
        columns: state.columns.filter((column) => column._id !== id),
        tasks: state.tasks.filter((task) => task.columnId !== id),
      }));
    } catch (err) {
      console.error('Failed to delete column:', err);
    }
  },
}));