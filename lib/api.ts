const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const AUTH_STORAGE_KEY = 'enterprise-task-manager-auth';
const WORKSPACE_STORAGE_KEY = 'enterprise-task-manager-workspace';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    return (JSON.parse(stored) as { state?: { token?: string | null } }).state?.token ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getStoredAuthToken();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const workspaceId = getStoredWorkspaceId();
  if (workspaceId) headers.set('x-workspace-id', workspaceId);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(body?.message || 'Request failed', response.status);
  }

  return body as T;
}

export interface AuthResponse {
  token: string;
  user: import('@/types').AuthUser;
}

export function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function loginUser(data: { email: string; password: string }) {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function fetchCurrentUser() {
  return apiFetch<{ user: import('@/types').AuthUser }>('/auth/me');
}

export async function fetchColumns() {
  const res = await fetch(`${API_BASE_URL}/columns`);
  if (!res.ok) throw new Error('Failed to fetch columns');
  return res.json();
}

export async function fetchTasks() {
  const res = await fetch(`${API_BASE_URL}/tasks`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function createKanbanTask(taskData: {
  title: string;
  description?: string;
  columnId: string;
  priority?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

function getStoredWorkspaceId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!stored) return null;
    return (JSON.parse(stored) as { state?: { currentWorkspace?: { _id?: string } } })
      .state?.currentWorkspace?._id ?? null;
  } catch {
    return null;
  }
}

export function fetchWorkspaces() {
  return apiFetch<import('@/types').ClientWorkspace[]>('/workspaces');
}

export function createWorkspace(name: string) {
  return apiFetch<import('@/types').ClientWorkspace>('/workspaces', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function inviteWorkspaceMember(
  workspaceId: string,
  data: { email: string; role: 'ADMIN' | 'MEMBER' }
) {
  return apiFetch<{ user: import('@/types').TaskAssignee; role: 'ADMIN' | 'MEMBER' }>(
    `/workspaces/${workspaceId}/members`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}