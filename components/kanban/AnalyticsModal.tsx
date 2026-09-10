'use client';

import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchWorkspaceMetrics } from '@/lib/api';
import { WorkspaceMetricsResponse } from '@/types';

const chartColors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface AnalyticsModalProps {
  workspaceId: string;
  onClose: () => void;
}

export default function AnalyticsModal({ workspaceId, onClose }: AnalyticsModalProps) {
  const [metrics, setMetrics] = useState<WorkspaceMetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    void fetchWorkspaceMetrics(workspaceId)
      .then((response) => {
        if (isCurrent) setMetrics(response);
      })
      .catch((requestError: unknown) => {
        if (isCurrent) setError(requestError instanceof Error ? requestError.message : 'Unable to load analytics');
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [workspaceId]);

  const totalTasks = metrics?.summary.total[0]?.totalCount || 0;
  const completedTasks = metrics?.summary.completed[0]?.completedCount || 0;
  const overdueTasks = metrics?.summary.overdue[0]?.overdueCount || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Workspace analytics">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Workspace</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Analytics</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close analytics" className="text-lg font-bold text-slate-400 hover:text-slate-700">✕</button>
        </div>

        {isLoading && <p className="py-10 text-center text-sm text-slate-500">Calculating workspace metrics...</p>}
        {error && <p className="py-10 text-center text-sm text-red-600">{error}</p>}
        {!isLoading && !error && metrics && (
          <>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <MetricCard label="Total tasks" value={totalTasks} tone="blue" />
              <MetricCard label="Completed tasks" value={completedTasks} tone="emerald" />
              <MetricCard label="Overdue tasks" value={overdueTasks} tone="red" />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ChartPanel title="Tasks by column">
                {metrics.summary.byStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={metrics.summary.byStatus} dataKey="count" nameKey="_id" cx="50%" cy="45%" outerRadius={88} label>
                        {metrics.summary.byStatus.map((entry, index) => <Cell key={entry._id} fill={chartColors[index % chartColors.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyChart message="No tasks to chart yet." />}
              </ChartPanel>

              <ChartPanel title="Task allocation by member">
                {metrics.workload.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={metrics.workload} margin={{ left: 0, right: 12, bottom: 12 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="taskCount" name="Tasks" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyChart message="No assigned tasks yet." />}
              </ChartPanel>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: number; tone: 'blue' | 'red' | 'emerald' }) {
  const colors = { blue: 'bg-blue-50 text-blue-700', red: 'bg-red-50 text-red-700', emerald: 'bg-emerald-50 text-emerald-700' };
  return <div className={`rounded-lg p-4 ${colors[tone]}`}><p className="text-xs font-semibold uppercase tracking-wide">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>;
}

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-lg border border-slate-200 p-4"><h3 className="mb-2 text-sm font-semibold text-slate-700">{title}</h3>{children}</section>;
}

function EmptyChart({ message }: { message: string }) {
  return <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">{message}</div>;
}