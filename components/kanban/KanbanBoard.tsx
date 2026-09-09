'use client';

import { useState, useEffect } from 'react';
import { useBoardStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { useWorkspaceStore } from '@/lib/workspace-store';
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
  pointerWithin,
} from '@dnd-kit/core';

export default function KanbanBoard() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const columns = useBoardStore((state) => state.columns);
  const tasks = useBoardStore((state) => state.tasks);
  const clearBoard = useBoardStore((state) => state.clearBoard);
  const searchQuery = useBoardStore((state) => state.searchQuery);
  const selectedPriority = useBoardStore((state) => state.selectedPriority);
  const addColumn = useBoardStore((state) => state.addColumn);
  const updateTaskColumn = useBoardStore((state) => state.updateTaskColumn);

  // 1. Get fetchBoardData from store
  const fetchBoardData = useBoardStore((state) => state.fetchBoardData);

  // 2. Fetch live MongoDB data on page load
  useEffect(() => {
    if (isAuthenticated && currentWorkspace) {
      clearBoard();
      void fetchBoardData();
    } else if (!isAuthenticated) {
      clearBoard();
    }
  }, [clearBoard, currentWorkspace, fetchBoardData, isAuthenticated]);


  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [columnTitle, setColumnTitle] = useState('');
  
  // Track which task is actively being dragged
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const activeTask = tasks.find((t) => t._id === activeTaskId);
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      !normalizedSearch ||
      task.title.toLowerCase().includes(normalizedSearch) ||
      task.description?.toLowerCase().includes(normalizedSearch);
    const matchesPriority =
      selectedPriority === 'ALL' || task.priority === selectedPriority;

    return matchesSearch && matchesPriority;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Triggered the moment you start dragging
  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(String(event.active.id));
  };

  // Triggered when you release the dragged item
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTaskId(null); // Clear active task state
    const { active, over } = event;

    console.log('--- Drag End Event ---');
    console.log('Active ID (Dragged Task):', active.id);
    console.log('Over ID (Target):', over?.id);

    if (!over) {
      console.log('Dropped outside any target');
      return;
    }

    const activeTaskId = String(active.id);
    const overId = String(over.id);

    const targetColumn = columns.find((col) => col._id === overId);
    const overTask = tasks.find((task) => task._id === overId);
    const targetColumnId = targetColumn?._id || overTask?.columnId;

    console.log('Resolved Target Column ID:', targetColumnId);

    if (targetColumnId) {
      updateTaskColumn(activeTaskId, targetColumnId);
    }
  };

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!columnTitle.trim()) return;

    await addColumn(columnTitle.trim());
    setColumnTitle('');
    setIsAddingColumn(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Engineering workspace
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Sign in to view your board</h2>
          <p className="mt-2 text-sm text-slate-500">
            Your tasks and columns are private to your account.
          </p>
        </div>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-slate-500">
        Loading your workspace...
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full w-full items-start gap-4 overflow-x-auto p-6">
        {/* Render columns */}
        {columns.map((column) => (
          <KanbanColumn
            key={column._id}
            column={column}
            tasks={filteredTasks.filter((task) => task.columnId === column._id)}
          />
        ))}

        {/* Add column form */}
        <div className="w-80 shrink-0">
          {isAddingColumn ? (
            <form
              onSubmit={handleAddColumn}
              className="w-80 shrink-0 rounded-xl border border-slate-200 bg-slate-100 p-4"
            >
              <input
                type="text"
                placeholder="Enter column title..."
                value={columnTitle}
                onChange={(e) => setColumnTitle(e.target.value)}
                autoFocus
                className="mb-2 w-full rounded border border-slate-300 px-2 py-1 text-sm outline-none focus:border-blue-500"
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
                  Add
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingColumn(true)}
              className="h-14 w-80 shrink-0 rounded-xl border-2 border-dashed border-slate-300 text-sm font-medium text-slate-500 transition-colors hover:border-slate-400 hover:bg-slate-50"
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