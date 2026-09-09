'use client';

import { useState } from 'react';
import { inviteWorkspaceMember } from '@/lib/api';
import { useWorkspaceStore } from '@/lib/workspace-store';

interface InviteMemberModalProps {
  workspaceId: string;
  onClose: () => void;
}

export default function InviteMemberModal({ workspaceId, onClose }: InviteMemberModalProps) {
  const loadWorkspaces = useWorkspaceStore((state) => state.loadWorkspaces);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;

    setError('');
    setIsSubmitting(true);
    try {
      await inviteWorkspaceMember(workspaceId, { email: email.trim(), role });
      await loadWorkspaces();
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to invite member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Workspace</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Invite a member</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close invite dialog" className="text-xl text-slate-400 hover:text-slate-700">
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Member email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="teammate@company.com"
              autoFocus
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Workspace role</span>
            <select value={role} onChange={(event) => setRole(event.target.value as 'ADMIN' | 'MEMBER')} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500">
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {isSubmitting ? 'Inviting...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
