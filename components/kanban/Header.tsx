'use client';

import { useState } from 'react';
import { useBoardStore } from '@/lib/store';
import { Priority } from '@/types';
import AuthModal from '@/components/auth/AuthModal';
import UserMenu from '@/components/auth/UserMenu';

const workspaces = ['Engineering Team', 'Product Team', 'Design Team'];

export default function Header() {
  const {
    boardTitle,
    setBoardTitle,
    searchQuery,
    setSearchQuery,
    selectedPriority,
    setSelectedPriority,
  } = useBoardStore();
  const [workspace, setWorkspace] = useState('Engineering Team');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(boardTitle);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempTitle.trim()) setBoardTitle(tempTitle.trim());
    setIsEditingTitle(false);
  };

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
              Workspace
            </span>
            <select
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
              aria-label="Select workspace"
              className="bg-transparent text-xs font-medium text-slate-500 outline-none"
            >
              {workspaces.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} className="mt-1">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                autoFocus
                aria-label="Board title"
                className="border-b-2 border-blue-600 bg-transparent text-xl font-bold text-slate-800 outline-none"
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setTempTitle(boardTitle);
                setIsEditingTitle(true);
              }}
              title="Click to edit title"
              className="mt-1 text-left text-xl font-bold text-slate-800 transition-colors hover:text-blue-600"
            >
              {boardTitle}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="relative">
            <span className="sr-only">Search tasks</span>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 pl-8 text-xs outline-none transition-all focus:border-blue-500 focus:bg-white sm:w-64"
            />
            <svg
              className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </label>

          <label>
            <span className="sr-only">Filter by priority</span>
            <select
              value={selectedPriority}
              onChange={(e) =>
                setSelectedPriority(e.target.value as Priority | 'ALL')
              }
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </label>

          <UserMenu onSignIn={() => setIsAuthOpen(true)} />
        </div>
      </div>
      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
    </header>
  );
}
