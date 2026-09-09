'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { useBoardStore } from '@/lib/store';
import { useWorkspaceStore } from '@/lib/workspace-store';

interface UserMenuProps {
  onSignIn: () => void;
}

export default function UserMenu({ onSignIn }: UserMenuProps) {
  const { user, isAuthenticated, hydrateSession, logout } = useAuthStore();
  const clearBoard = useBoardStore((state) => state.clearBoard);
  const clearWorkspaces = useWorkspaceStore((state) => state.clearWorkspaces);

  useEffect(() => {
    void hydrateSession();
  }, [hydrateSession]);

  if (!isAuthenticated || !user) {
    return (
      <button
        type="button"
        onClick={onSignIn}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700"
      >
        Sign In
      </button>
    );
  }

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
      {user.avatarUrl ? (
        <span
          role="img"
          aria-label={`${user.name} avatar`}
          style={{ backgroundImage: `url(${user.avatarUrl})` }}
          className="h-8 w-8 rounded-full border border-slate-200 object-cover"
        />
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
          {initials}
        </span>
      )}
      <div className="hidden min-w-0 sm:block">
        <p className="max-w-32 truncate text-xs font-semibold text-slate-800">{user.name}</p>
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{user.role}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          logout();
          clearBoard();
          clearWorkspaces();
        }}
        className="text-xs font-medium text-slate-500 hover:text-red-600"
      >
        Log out
      </button>
    </div>
  );
}
