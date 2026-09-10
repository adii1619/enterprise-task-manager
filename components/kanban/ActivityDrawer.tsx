'use client';

import { useEffect, useState } from 'react';
import { fetchWorkspaceActivity } from '@/lib/api';
import { ActivityItem } from '@/types';

interface ActivityDrawerProps {
  workspaceId: string;
  onClose: () => void;
}

export default function ActivityDrawer({ workspaceId, onClose }: ActivityDrawerProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    void fetchWorkspaceActivity(workspaceId)
      .then((items) => {
        if (isCurrent) setActivities(items);
      })
      .catch((requestError: unknown) => {
        if (isCurrent) setError(requestError instanceof Error ? requestError.message : 'Unable to load activity');
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [workspaceId]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30" role="dialog" aria-modal="true" aria-label="Workspace activity">
      <button type="button" aria-label="Close activity" onClick={onClose} className="flex-1 cursor-default" />
      <aside className="h-full w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Workspace</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">Activity</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close activity" className="text-lg font-bold text-slate-400 hover:text-slate-700">✕</button>
        </div>

        {isLoading && <p className="py-6 text-sm text-slate-500">Loading activity...</p>}
        {error && <p className="py-6 text-sm text-red-600">{error}</p>}
        {!isLoading && !error && activities.length === 0 && <p className="py-6 text-sm text-slate-500">No activity yet.</p>}
        <div className="divide-y divide-slate-100">
          {activities.map((activity) => (
            <article key={activity._id} className="py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {getInitials(activity.actorId?.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">{activity.actorId?.name || 'A member'}</span>{' '}
                    {formatAction(activity.actionType)}
                    {activity.entityTitle && <span className="font-semibold"> {activity.entityTitle}</span>}
                  </p>
                  {activity.details && <p className="mt-1 text-xs text-slate-500">{activity.details}</p>}
                  <time className="mt-1 block text-[10px] text-slate-400" dateTime={activity.createdAt}>
                    {formatDate(activity.createdAt)}
                  </time>
                </div>
              </div>
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}

function formatAction(actionType: string) {
  return actionType.toLowerCase().replace(/_/g, ' ');
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown time' : date.toLocaleString();
}

function getInitials(name?: string) {
  return name ? name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() : '?';
}