'use client';

import { useState } from 'react';
import { Task } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskModal from './TaskModal';

interface TaskCardProps {
  task: Task;
}

const priorityColors: Record<Task['priority'], string> = {
  LOW: 'bg-slate-100 text-slate-700 border-slate-300',
  MEDIUM: 'bg-blue-100 text-blue-700 border-blue-300',
  HIGH: 'bg-amber-100 text-amber-700 border-amber-300',
  URGENT: 'bg-red-100 text-red-700 border-red-300',
};

export default function TaskCard({ task }: TaskCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setIsOpen(true)}
        className={`group relative cursor-grab rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md active:cursor-grabbing ${
          isDragging ? 'opacity-40 ring-2 ring-blue-500' : ''
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
              priorityColors[task.priority]
            }`}
          >
            {task.priority}
          </span>
        </div>

        <h4 className="mt-2 text-sm font-medium text-slate-900">{task.title}</h4>

        {task.description && (
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
            {task.description}
          </p>
        )}
      </div>

      {isOpen && <TaskModal task={task} onClose={() => setIsOpen(false)} />}
    </>
  );
}