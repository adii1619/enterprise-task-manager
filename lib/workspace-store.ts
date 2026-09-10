import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createWorkspace, fetchWorkspaces } from '@/lib/api';
import { ClientWorkspace, PresenceUser } from '@/types';

interface WorkspaceState {
  workspaces: ClientWorkspace[];
  currentWorkspace: ClientWorkspace | null;
  isLoading: boolean;
  error: string | null;
  presence: PresenceUser[];
  loadWorkspaces: () => Promise<void>;
  selectWorkspace: (workspaceId: string) => void;
  createWorkspace: (name: string) => Promise<void>;
  clearWorkspaces: () => void;
  setPresence: (presence: PresenceUser[]) => void;
  clearPresence: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      currentWorkspace: null,
      isLoading: false,
      error: null,
      presence: [],

      loadWorkspaces: async () => {
        set({ isLoading: true, error: null });
        try {
          let workspaces = await fetchWorkspaces();
          if (workspaces.length === 0) {
            const personalWorkspace = await createWorkspace('Personal Workspace');
            workspaces = [personalWorkspace];
          }

          const selectedId = get().currentWorkspace?._id;
          const currentWorkspace =
            workspaces.find((workspace) => workspace._id === selectedId) || workspaces[0];
          set({ workspaces, currentWorkspace, isLoading: false });
        } catch (error) {
          set({ isLoading: false, error: getErrorMessage(error) });
        }
      },

      selectWorkspace: (workspaceId) => {
        const currentWorkspace = get().workspaces.find(
          (workspace) => workspace._id === workspaceId
        );
        if (currentWorkspace) set({ currentWorkspace });
      },

      createWorkspace: async (name) => {
        const workspace = await createWorkspace(name);
        set((state) => ({
          workspaces: [...state.workspaces, workspace],
          currentWorkspace: workspace,
        }));
      },

      clearWorkspaces: () => set({ workspaces: [], currentWorkspace: null, error: null }),
      setPresence: (presence) => set({ presence }),
      clearPresence: () => set({ presence: [] }),
    }),
    {
      name: 'enterprise-task-manager-workspace',
      partialize: (state) => ({ currentWorkspace: state.currentWorkspace }),
    }
  )
);

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Workspace request failed';
}