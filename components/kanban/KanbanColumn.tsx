'use client';

import { useState } from 'react';
import { Column, Priority } from '@/types';
import { useBoardStore } from '@/lib/store';
import TaskCard from './TaskCard';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface KanbanColumnProps {
  column: Column;
}

export default function KanbanColumn({ column }: KanbanColumnProps) {
  const allTasks = useBoardStore((state) => state.tasks);
  const tasks = allTasks.filter((task) => task.columnId === column.id);
  const addTask = useBoardStore((state) => state.addTask);

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');

  // Make the column container droppable
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask(column.id, newTitle.trim(), priority);
    setNewTitle('');
    setIsAdding(false);
  };

  const taskIds = tasks.map((task) => task.id);

  return (
    <div
      ref={setNodeRef}
      className="flex h-full w-80 flex-col rounded-xl bg-slate-100 p-4"
    >
      {/* Column Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-800">
            {column.title}
          </h3>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Droppable Task List */}
      <SortableContext
        items={taskIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>

      {/* Add Task Control */}
      <div className="mt-3">
        {isAdding ? (
          <form
            onSubmit={handleAddTask}
            className="rounded-lg bg-white p-3 shadow-sm"
          >
            <input
              type="text"
              placeholder="Task title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              className="w-full rounded border border-slate-300 px-2 py-1 text-sm outline-none focus:border-blue-500"
            />
            <div className="mt-2 flex items-center justify-between">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
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
            onClick={() => setIsAdding(true)}
            className="flex w-full items-center justify-center rounded-lg border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-500 hover:border-slate-400 hover:bg-slate-50"
          >
            + Add Task
          </button>
        )}
      </div>
    </div>
  );
}