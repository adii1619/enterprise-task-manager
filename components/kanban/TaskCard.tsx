'use client';

import { useState } from 'react';
import { Task, TaskAssignee } from '@/types';
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
  const assignee = typeof task.assigneeId === 'string' ? null : (task.assigneeId as TaskAssignee | undefined);
  const initials = assignee?.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const checklist = task.checklist || [];
  const completedChecklistItems = checklist.filter((item) => item.completed).length;
  const dueStatus = getDueStatus(task.dueDate);

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

        {(checklist.length > 0 || dueStatus || task.tags?.length) && (
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {checklist.length > 0 && (
                <span className="text-[10px] font-semibold text-slate-500">
                  ✓ {completedChecklistItems}/{checklist.length}
                </span>
              )}
              {dueStatus && (
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${dueStatus.className}`}>
                  {dueStatus.label}
                </span>
              )}
            </div>
            {checklist.length > 0 && (
              <div className="h-1 overflow-hidden rounded-full bg-slate-100" aria-label={`${completedChecklistItems} of ${checklist.length} subtasks completed`}>
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${(completedChecklistItems / checklist.length) * 100}%` }}
                />
              </div>
            )}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map((tag, index) => (
                  <span
                    key={`${tag.name}-${index}`}
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {task.description && (
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
            {task.description}
          </p>
        )}
        {assignee && (
          <div className="mt-3 flex items-center gap-2 text-[10px] font-medium text-slate-500">
            {assignee.avatarUrl ? (
              <span role="img" aria-label={`${assignee.name} avatar`} style={{ backgroundImage: `url(${assignee.avatarUrl})` }} className="h-6 w-6 rounded-full bg-cover bg-center" />
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[9px] font-bold text-blue-700">{initials}</span>
            )}
            <span className="truncate">{assignee.name}</span>
          </div>
        )}
      </div>

      {isOpen && <TaskModal task={task} onClose={() => setIsOpen(false)} />}
    </>
  );
}

function getDueStatus(value?: string) {
  if (!value) return null;
  const dueDate = new Date(value);
  if (Number.isNaN(dueDate.getTime())) return null;

  const now = Date.now();
  const difference = dueDate.getTime() - now;
  const formattedDate = dueDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  if (difference < 0) {
    return {
      label: `Overdue · ${formattedDate}`,
      className: 'border-red-200 bg-red-50 text-red-700',
    };
  }

  if (difference <= 48 * 60 * 60 * 1000) {
    return {
      label: `Due soon · ${formattedDate}`,
      className: 'border-amber-200 bg-amber-50 text-amber-700',
    };
  }

  return {
    label: `Due ${formattedDate}`,
    className: 'border-slate-200 bg-slate-50 text-slate-600',
  };
}