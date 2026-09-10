'use client';

import { useEffect, useState } from 'react';
import { useBoardStore } from '@/lib/store';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { Priority } from '@/types';
import AuthModal from '@/components/auth/AuthModal';
import UserMenu from '@/components/auth/UserMenu';
import { useAuthStore } from '@/lib/auth-store';
import InviteMemberModal from '@/components/auth/InviteMemberModal';
import ActivityDrawer from './ActivityDrawer';

export default function Header() {
  const {
    boardTitle,
    setBoardTitle,
    searchQuery,
    setSearchQuery,
    selectedPriority,
    setSelectedPriority,
  } = useBoardStore();
  const {
    workspaces,
    currentWorkspace,
    presence,
    isLoading: isWorkspaceLoading,
    loadWorkspaces,
    selectWorkspace,
    createWorkspace,
    clearWorkspaces,
  } = useWorkspaceStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(boardTitle);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) void loadWorkspaces();
    else clearWorkspaces();
  }, [clearWorkspaces, isAuthenticated, loadWorkspaces]);

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempTitle.trim()) setBoardTitle(tempTitle.trim());
    setIsEditingTitle(false);
  };

  const handleCreateWorkspace = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newWorkspaceName.trim()) return;
    await createWorkspace(newWorkspaceName.trim());
    setNewWorkspaceName('');
    setIsCreatingWorkspace(false);
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
              value={currentWorkspace?._id || ''}
              onChange={(e) => selectWorkspace(e.target.value)}
              aria-label="Select workspace"
              className="bg-transparent text-xs font-medium text-slate-500 outline-none"
            >
              {isWorkspaceLoading && <option value="">Loading workspaces...</option>}
              {workspaces.map((workspace) => (
                <option key={workspace._id} value={workspace._id}>
                  {workspace.name}
                </option>
              ))}
            </select>
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setIsCreatingWorkspace((value) => !value)}
                aria-label="Create workspace"
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                +
              </button>
            )}
          </div>

          {isCreatingWorkspace && (
            <form onSubmit={handleCreateWorkspace} className="mt-2 flex gap-2">
              <input
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="Workspace name"
                autoFocus
                className="w-40 rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-blue-500"
              />
              <button type="submit" className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                Add
              </button>
            </form>
          )}

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
          {isAuthenticated && currentWorkspace && (
            <button
              type="button"
              onClick={() => setIsActivityOpen(true)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
            >
              Activity
            </button>
          )}
          {isAuthenticated && currentWorkspace && presence.length > 0 && (
            <div className="flex items-center gap-1" aria-label={`${presence.length} active workspace members`}>
              <div className="flex -space-x-2">
                {presence.slice(0, 5).map((member) => {
                  const initials = member.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();
                  return member.avatarUrl ? (
                    <span
                      key={member._id}
                      role="img"
                      aria-label={`${member.name} active`}
                      title={member.name}
                      className="h-7 w-7 rounded-full border-2 border-white bg-cover bg-center"
                      style={{ backgroundImage: `url(${member.avatarUrl})` }}
                    />
                  ) : (
                    <span
                      key={member._id}
                      title={member.name}
                      className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-blue-100 text-[9px] font-bold text-blue-700"
                    >
                      {initials}
                    </span>
                  );
                })}
              </div>
              {presence.length > 5 && (
                <span className="text-[10px] font-semibold text-slate-500">+{presence.length - 5}</span>
              )}
            </div>
          )}
          {isAuthenticated && currentWorkspace && (
            <button
              type="button"
              onClick={() => setIsInviteOpen(true)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
            >
              Invite Member
            </button>
          )}
        </div>
      </div>
      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
      {isInviteOpen && currentWorkspace && (
        <InviteMemberModal workspaceId={currentWorkspace._id} onClose={() => setIsInviteOpen(false)} />
      )}
      {isActivityOpen && currentWorkspace && (
        <ActivityDrawer workspaceId={currentWorkspace._id} onClose={() => setIsActivityOpen(false)} />
      )}
    </header>
  );
}
