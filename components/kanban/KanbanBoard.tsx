'use client';

import { useState } from 'react';
import { useBoardStore } from '@/lib/store';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';

export default function KanbanBoard() {
  const columns = useBoardStore((state) => state.columns);
  const tasks = useBoardStore((state) => state.tasks);
  const addColumn = useBoardStore((state) => state.addColumn);
  const updateTaskColumn = useBoardStore((state) => state.updateTaskColumn);

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [columnTitle, setColumnTitle] = useState('');
  
  // Track which task is actively being dragged
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const activeTask = tasks.find((t) => t.id === activeTaskId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Triggered the moment you start dragging
  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(event.active.id as string);
  };

  // Triggered when you release the dragged item
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTaskId(null); // Clear active task state
    const { active, over } = event;

    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    let targetColumnId: string | undefined;

    const isOverAColumn = columns.some((col) => col.id === overId);
    if (isOverAColumn) {
      targetColumnId = overId;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        targetColumnId = overTask.columnId;
      }
    }

    if (targetColumnId) {
      updateTaskColumn(activeTaskId, targetColumnId);
    }
  };

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!columnTitle.trim()) return;

    addColumn(columnTitle.trim());
    setColumnTitle('');
    setIsAddingColumn(false);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full w-full items-start gap-4 overflow-x-auto p-6">
        {/* Render columns */}
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column} />
        ))}

        {/* Add column form */}
        <div className="w-80 shrink-0">
          {isAddingColumn ? (
            <form
              onSubmit={handleAddColumn}
              className="rounded-xl border border-slate-200 bg-slate-100 p-4"
            >
              <input
                type="text"
                placeholder="Column title..."
                value={columnTitle}
                onChange={(e) => setColumnTitle(e.target.value)}
                autoFocus
                className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingColumn(false)}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                >
                  Add Column
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingColumn(true)}
              className="flex w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-4 text-sm font-medium text-slate-500 hover:border-slate-400 hover:bg-slate-100"
            >
              + Add New Column
            </button>
          )}
        </div>
      </div>

      {/* Floating preview attached to cursor while dragging */}
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}