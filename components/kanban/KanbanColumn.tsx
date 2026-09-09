'use client';

import { useState } from 'react';
import { Column, Priority, Task } from '@/types';
import { useBoardStore } from '@/lib/store';
import TaskCard from './TaskCard';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
}

export default function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  const addTask = useBoardStore((state) => state.addTask);
  const updateColumnTitle = useBoardStore((state) => state.updateColumnTitle);
  const deleteColumn = useBoardStore((state) => state.deleteColumn);

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(column.title);

  // Make the column container droppable
  const { setNodeRef } = useDroppable({
    id: column._id,
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    await addTask(column._id, taskTitle.trim(), priority);
    setTaskTitle('');
    setPriority('MEDIUM');
    setIsAddingTask(false);
  };

  const handleTitleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim() === column.title) {
      setTitle(column.title);
      setIsEditingTitle(false);
      return;
    }

    await updateColumnTitle(column._id, title.trim());
    setIsEditingTitle(false);
  };

  const handleDelete = async () => {
    if (tasks.length > 0) {
      window.alert('Please move or delete all tasks in this column before deleting it.');
      return;
    }

    if (window.confirm(`Delete column "${column.title}"?`)) {
      await deleteColumn(column._id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className="flex min-h-[500px] h-full w-80 flex-col rounded-xl bg-slate-100 p-4"
    >
      {/* Column Header */}
      <div className="mb-3 flex items-center justify-between">
        {isEditingTitle ? (
          <form onSubmit={handleTitleSubmit} className="mr-2 flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              autoFocus
              className="w-full rounded border border-blue-500 bg-white px-1.5 py-0.5 text-sm font-semibold text-slate-700 outline-none"
            />
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingTitle(true)}
            className="flex items-center gap-2 text-left"
          >
            <h3 className="text-sm font-semibold text-slate-800 transition-colors hover:text-blue-600">
              {column.title}
            </h3>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600">
              {tasks.length}
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={handleDelete}
          className="rounded px-1 py-0.5 text-xs font-bold text-slate-400 transition-colors hover:text-red-600"
          title="Delete column"
          aria-label={`Delete ${column.title} column`}
        >
          ✕
        </button>
      </div>

      {/* Droppable Task List */}
      <SortableContext
        items={tasks.map((task) => task._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      </SortableContext>

      {/* Add Task Control */}
      <div className="mt-3">
        {isAddingTask ? (
          <form
            onSubmit={handleCreateTask}
            className="space-y-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
          >
            <input
              type="text"
              placeholder="Enter task title..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              autoFocus
              className="w-full rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:border-blue-500"
            />
            <div className="flex items-center justify-between">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingTask(true)}
            className="w-full rounded-lg border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-500 transition-colors hover:border-slate-400 hover:bg-slate-200/50"
          >
            + Add Task
          </button>
        )}
      </div>
    </div>
  );
}