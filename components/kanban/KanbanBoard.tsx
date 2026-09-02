'use client';

import { useState } from 'react';
import { useBoardStore } from '@/lib/store';
import KanbanColumn from './KanbanColumn';

export default function KanbanBoard() {
  const columns = useBoardStore((state) => state.columns);
  const addColumn = useBoardStore((state) => state.addColumn);

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [columnTitle, setColumnTitle] = useState('');

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!columnTitle.trim()) return;

    addColumn(columnTitle.trim());
    setColumnTitle('');
    setIsAddingColumn(false);
  };

  return (
    <div className="flex h-full w-full items-start gap-4 overflow-x-auto p-6">
      {/* Render existing columns */}
      {columns.map((column) => (
        <KanbanColumn key={column.id} column={column} />
      ))}

      {/* Add new column button / inline form */}
      <div className="w-80 shrink-0">
        {isAddingColumn ? (
          <form
            onSubmit={handleAddColumn}
            className="rounded-xl border border-slate-200 bg-slate-100 p-4"
          >
            <input
              type="text"
              placeholder="Column title (e.g., Testing)..."
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
  );
}