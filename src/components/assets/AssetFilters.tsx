'use client';

import React from 'react';
import { Search, Filter, RefreshCw, X, FileCheck } from 'lucide-react';
import { AssetCondition, AssetFilterState, AssetStatus, AssetType } from '@/types';

interface AssetFiltersProps {
  filters: AssetFilterState;
  onFilterChange: (updated: Partial<AssetFilterState>) => void;
  onReset: () => void;
  totalResults: number;
}

const STATUSES: AssetStatus[] = [
  'Planned',
  'Under Construction',
  'Completed',
  'Operational',
  'Under Maintenance',
  'Needs Attention',
  'Retired',
];

const CONDITIONS: AssetCondition[] = ['Good', 'Fair', 'Poor', 'Critical'];

export function AssetFilters({
  filters,
  onFilterChange,
  onReset,
  totalResults,
}: AssetFiltersProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm mb-6 space-y-4">
      {/* Top Search Bar & Main Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Gandhinagar Assets (e.g. GND-RD-001, Mahatma Mandir, CH Road)..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Type Filter Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start md:self-auto shrink-0">
          {(['ALL', 'Road', 'Building'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onFilterChange({ assetType: type })}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                filters.assetType === type
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {type === 'ALL' ? 'All Types' : `${type}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filter Selects */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        {/* Verification Queue Toggle */}
        <div>
          <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
            Verification Queue
          </label>
          <button
            type="button"
            onClick={() =>
              onFilterChange({ pendingVerificationOnly: !filters.pendingVerificationOnly })
            }
            className={`w-full py-2 px-3 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-colors ${
              filters.pendingVerificationOnly
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>{filters.pendingVerificationOnly ? 'Pending Queue Only' : 'All Items'}</span>
          </button>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value as any })}
            className="w-full py-2 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
          >
            <option value="ALL">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Condition Filter */}
        <div>
          <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
            Condition
          </label>
          <select
            value={filters.condition}
            onChange={(e) => onFilterChange({ condition: e.target.value as any })}
            className="w-full py-2 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
          >
            <option value="ALL">All Conditions</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By Filter */}
        <div>
          <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
            Sort By
          </label>
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-') as [any, any];
              onFilterChange({ sortBy, sortOrder });
            }}
            className="w-full py-2 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="estimated_cost-desc">Highest Valuation</option>
            <option value="estimated_cost-asc">Lowest Valuation</option>
            <option value="title-asc">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Active Filter Summary Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div>
          Showing <strong>{totalResults}</strong> matching assets (Gandhinagar Circle)
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>
    </div>
  );
}
