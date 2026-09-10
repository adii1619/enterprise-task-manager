'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { getStoredAuthToken } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { useBoardStore } from '@/lib/store';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { Column, PresenceUser, Task } from '@/types';

const socketUrl = (
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000/api'
).replace(/\/api\/?$/, '');

export function useSocket(workspaceId: string | undefined) {
  const token = useWorkspaceToken();
  const applyRealtimeEvent = useBoardStore((state) => state.applyRealtimeEvent);
  const setPresence = useWorkspaceStore((state) => state.setPresence);
  const clearPresence = useWorkspaceStore((state) => state.clearPresence);

  useEffect(() => {
    if (!workspaceId || !token) {
      clearPresence();
      return;
    }

    const socket = io(socketUrl, {
      auth: { token },
    });

    const joinWorkspace = () => {
      socket.emit('joinWorkspace', workspaceId, (response: { ok: boolean; message?: string }) => {
        if (!response.ok) console.error(response.message || 'Unable to join workspace');
      });
    };

    const handlePresence = (payload: { workspaceId: string; users: PresenceUser[] }) => {
      if (payload.workspaceId === workspaceId) setPresence(payload.users);
    };
    const handleTaskCreated = (task: Task) => applyRealtimeEvent({ type: 'task:created', task });
    const handleTaskUpdated = (task: Task) => applyRealtimeEvent({ type: 'task:updated', task });
    const handleTaskMoved = (task: Task) => applyRealtimeEvent({ type: 'task:moved', task });
    const handleTaskDeleted = (payload: { id: string }) => applyRealtimeEvent({ type: 'task:deleted', id: payload.id });
    const handleColumnCreated = (column: Column) => applyRealtimeEvent({ type: 'column:created', column });
    const handleColumnUpdated = (column: Column) => applyRealtimeEvent({ type: 'column:updated', column });
    const handleColumnDeleted = (payload: { id: string }) => applyRealtimeEvent({ type: 'column:deleted', id: payload.id });

    socket.on('connect', joinWorkspace);
    socket.on('presence:updated', handlePresence);
    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:moved', handleTaskMoved);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('column:created', handleColumnCreated);
    socket.on('column:updated', handleColumnUpdated);
    socket.on('column:deleted', handleColumnDeleted);

    return () => {
      socket.emit('leaveWorkspace', workspaceId);
      socket.disconnect();
      clearPresence();
    };
  }, [applyRealtimeEvent, clearPresence, setPresence, token, workspaceId]);
}

function useWorkspaceToken() {
  const token = useAuthStore((state) => state.token);
  return token || getStoredAuthToken();
}