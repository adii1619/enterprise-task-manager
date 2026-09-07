import { create } from 'zustand';
import { Task, Column, Priority } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface BoardState {
  columns: Column[];
  tasks: Task[];
  
  // Async Data Fetching
  fetchBoardData: () => Promise<void>;

  // Task Actions
  addTask: (columnId: string, title: string, priority?: Priority) => Promise<void>;
  updateTaskColumn: (taskId: string, newColumnId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  
  // Column Actions
  addColumn: (title: string) => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  columns: [],
  tasks: [],

  // Load live data from MongoDB on app start
  fetchBoardData: async () => {
    try {
      const [colsRes, tasksRes] = await Promise.all([
        fetch(`${API_BASE_URL}/columns`),
        fetch(`${API_BASE_URL}/tasks`),
      ]);
      const columns = await colsRes.json();
      const tasks = await tasksRes.json();
      set({ columns, tasks });
    } catch (err) {
      console.error('Failed to load board data:', err);
    }
  },

  // Add task to Express API
  addTask: async (columnId, title, priority = 'MEDIUM') => {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnId, title, priority }),
      });
      const newTask = await res.json();
      set((state) => ({ tasks: [...state.tasks, newTask] }));
    } catch (err) {
      console.error('Failed to add task:', err);
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
      await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
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
      const res = await fetch(`${API_BASE_URL}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, order }),
      });
      const newColumn = await res.json();
      set((state) => ({ columns: [...state.columns, newColumn] }));
    } catch (err) {
      console.error('Failed to add column:', err);
    }
  },
}));