import KanbanBoard from '@/components/kanban/KanbanBoard';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      {/* Top Navigation Header */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Sprint 14 - Platform Redesign
          </h1>
          <p className="text-xs text-slate-500">Engineering Team Workspace</p>
        </div>
      </header>

      {/* Main Board Container */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>
    </main>
  );
}