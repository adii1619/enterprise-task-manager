import Header from '@/components/kanban/Header';
import KanbanBoard from '@/components/kanban/KanbanBoard';

export default function Home() {
  return (
    <main className="flex h-screen flex-col bg-slate-50">
      <Header />

      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>
    </main>
  );
}