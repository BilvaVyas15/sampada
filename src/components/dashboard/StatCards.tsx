'use client';

import React from 'react';
import {
  Building2,
  Road,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  IndianRupee,
  Clock,
  Activity,
  Layers,
} from 'lucide-react';
import { DashboardMetrics } from '@/types';
import { formatINR } from '@/lib/utils';

interface StatCardsProps {
  metrics: DashboardMetrics;
}

export function StatCards({ metrics }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 1. Total Assets Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Managed Assets
          </span>
          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
          {metrics.totalAssets}
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
            <Road className="w-3.5 h-3.5" /> {metrics.totalRoads} Roads
          </span>
          <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
            <Building2 className="w-3.5 h-3.5" /> {metrics.totalBuildings} Buildings
          </span>
        </div>
      </div>

      {/* 2. Total Valuation Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Asset Valuation
          </span>
          <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
          {formatINR(metrics.totalValuation)}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 truncate">
          Sanctioned capital expenditure across active projects
        </p>
      </div>

      {/* 3. Operational & Maintenance Status */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Operational & Active
          </span>
          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
          {metrics.statusCounts['Operational'] + metrics.statusCounts['Completed']}
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">
            <Wrench className="w-3 h-3" /> {metrics.statusCounts['Under Maintenance']} Maint.
          </span>
          <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" /> {metrics.statusCounts['Under Construction']} Const.
          </span>
        </div>
      </div>

      {/* 4. Critical / Needs Attention Action Card */}
      <div className={`rounded-xl p-5 border shadow-sm transition-shadow ${
        metrics.needingAttentionCount > 0
          ? 'bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/40 dark:to-orange-950/30 border-rose-200 dark:border-rose-900/60'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
            Needs Attention / Critical
          </span>
          <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-rose-800 dark:text-rose-200 mb-1">
          {metrics.needingAttentionCount}
        </div>
        <div className="flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 pt-2 border-t border-rose-200/60 dark:border-rose-900/40">
          <Activity className="w-3.5 h-3.5" />
          <span>{metrics.conditionCounts['Critical']} Critical Condition Assets</span>
        </div>
      </div>
    </div>
  );
}
