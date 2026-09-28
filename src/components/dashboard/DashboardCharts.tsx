'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { DashboardMetrics } from '@/types';

interface DashboardChartsProps {
  metrics: DashboardMetrics;
}

const STATUS_COLORS: Record<string, string> = {
  Operational: '#10b981', // emerald
  Completed: '#3b82f6', // blue
  'Under Construction': '#f59e0b', // amber
  'Under Maintenance': '#8b5cf6', // purple
  'Needs Attention': '#f43f5e', // rose
  Planned: '#0ea5e9', // sky
  Retired: '#64748b', // slate
};

const CONDITION_COLORS: Record<string, string> = {
  Good: '#10b981', // emerald
  Fair: '#eab308', // yellow
  Poor: '#f97316', // orange
  Critical: '#ef4444', // red
};

export function DashboardCharts({ metrics }: DashboardChartsProps) {
  // 1. Prepare Status Chart Data
  const statusData = Object.entries(metrics.statusCounts)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: status,
      value: count,
      color: STATUS_COLORS[status] || '#64748b',
    }));

  // 2. Prepare Condition Chart Data
  const conditionData = Object.entries(metrics.conditionCounts).map(([condition, count]) => ({
    name: condition,
    value: count,
    color: CONDITION_COLORS[condition] || '#64748b',
  }));

  // 3. Prepare Type Breakdown (Roads vs Buildings)
  const categoryData = [
    { category: 'Road Infrastructure', count: metrics.totalRoads },
    { category: 'Building Facilities', count: metrics.totalBuildings },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Chart 1: Category Distribution Bar Chart */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Gandhinagar Asset Category Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Road networks, bridges, underpasses vs Administrative and hospital building complexes
            </p>
          </div>
          <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-300">
            Gandhinagar Circle
          </span>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" name="Assets Count" fill="#059669" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Asset Health Condition Donut */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
            Condition Health Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Quality rating of assets (Good, Fair, Poor, Critical)
          </p>
        </div>

        <div className="h-[220px] w-full my-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={conditionData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {conditionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Status Distribution */}
      <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
          Lifecycle Stage Distribution
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Distribution of assets across the 7 mandatory lifecycle stages
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(metrics.statusCounts).map(([status, count]) => (
            <div
              key={status}
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-center"
            >
              <div
                className="w-3 h-3 rounded-full mx-auto mb-1.5"
                style={{ backgroundColor: STATUS_COLORS[status] || '#64748b' }}
              />
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate">
                {status}
              </div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                {count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
