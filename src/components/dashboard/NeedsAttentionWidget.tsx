'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Road,
  MapPin,
  ExternalLink,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Asset } from '@/types';
import { getConditionBadgeColor, getStatusBadgeColor, formatINR } from '@/lib/utils';

interface NeedsAttentionWidgetProps {
  criticalAssets: Asset[];
  onQuickUpdateStatus?: (asset: Asset) => void;
}

export function NeedsAttentionWidget({
  criticalAssets,
  onQuickUpdateStatus,
}: NeedsAttentionWidgetProps) {
  if (!criticalAssets || criticalAssets.length === 0) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 text-center mb-8">
        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
          All Infrastructure Assets Operating Normally
        </h3>
        <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 max-w-md mx-auto">
          No critical condition warnings or urgent maintenance flags registered in Gujarat inventory.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8 overflow-hidden">
      {/* Widget Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-rose-50/50 dark:bg-rose-950/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Critical & High-Priority Assets ({criticalAssets.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Infrastructure assets flagged for urgent inspection, repair, or condition remediation
            </p>
          </div>
        </div>

        <Link
          href="/assets?status=Needs Attention"
          className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
        >
          View All Priority List <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Responsive Table / Cards */}
      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {criticalAssets.map((asset) => (
          <div
            key={asset.id}
            className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            {/* Left: Code, Title, Location */}
            <div className="flex items-start gap-3.5 max-w-2xl">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  asset.asset_type === 'Road'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                {asset.asset_type === 'Road' ? (
                  <Road className="w-5 h-5" />
                ) : (
                  <Building2 className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                    {asset.asset_code}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${getStatusBadgeColor(
                      asset.status
                    )}`}
                  >
                    {asset.status}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${getConditionBadgeColor(
                      asset.condition
                    )}`}
                  >
                    Condition: {asset.condition}
                  </span>
                </div>

                <Link
                  href={`/assets/${asset.id}`}
                  className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 text-sm line-clamp-1"
                >
                  {asset.title}
                </Link>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {asset.location_district}, {asset.location_taluka}
                  </span>
                  <span>Subtype: <strong>{asset.sub_type}</strong></span>
                  <span>Officer: <strong>{asset.assigned_officer_name}</strong></span>
                </div>
              </div>
            </div>

            {/* Right: Valuation & Action Button */}
            <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
              <div className="text-left md:text-right">
                <div className="text-xs text-slate-500 dark:text-slate-400">Estimated Cost</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatINR(asset.estimated_cost)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onQuickUpdateStatus && (
                  <button
                    onClick={() => onQuickUpdateStatus(asset)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                  >
                    Update Lifecycle
                  </button>
                )}
                <Link
                  href={`/assets/${asset.id}`}
                  className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="View Asset Details & Timeline"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
