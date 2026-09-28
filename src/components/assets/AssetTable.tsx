'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  Road,
  MapPin,
  ExternalLink,
  Edit,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { Asset } from '@/types';
import { getConditionBadgeColor, getStatusBadgeColor, formatINR } from '@/lib/utils';

interface AssetTableProps {
  assets: Asset[];
  onQuickUpdateStatus?: (asset: Asset) => void;
}

export function AssetTable({ assets, onQuickUpdateStatus }: AssetTableProps) {
  if (assets.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
        No assets found matching the selected filter criteria.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Asset Code & Title</th>
              <th className="py-3.5 px-4">Type & Subtype</th>
              <th className="py-3.5 px-4">District & Taluka</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Condition</th>
              <th className="py-3.5 px-4">Valuation</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {assets.map((asset) => (
              <tr
                key={asset.id}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
              >
                {/* Code & Title */}
                <td className="py-3.5 px-4 max-w-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {asset.asset_code}
                    </span>
                  </div>
                  <Link
                    href={`/assets/${asset.id}`}
                    className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 text-sm line-clamp-1"
                  >
                    {asset.title}
                  </Link>
                  <div className="text-[11px] text-slate-400 truncate">
                    Officer: {asset.assigned_officer_name}
                  </div>
                </td>

                {/* Type & Subtype */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                    {asset.asset_type === 'Road' ? (
                      <Road className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Building2 className="w-4 h-4 text-amber-500" />
                    )}
                    <span>{asset.asset_type}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {asset.sub_type}
                  </div>
                </td>

                {/* Location */}
                <td className="py-3.5 px-4">
                  <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {asset.location_district}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                    {asset.location_taluka}
                  </div>
                </td>

                {/* Status Badge */}
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${getStatusBadgeColor(
                      asset.status
                    )}`}
                  >
                    {asset.status}
                  </span>
                </td>

                {/* Condition Badge */}
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${getConditionBadgeColor(
                      asset.condition
                    )}`}
                  >
                    {asset.condition}
                  </span>
                </td>

                {/* Valuation */}
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                  {formatINR(asset.estimated_cost)}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onQuickUpdateStatus && (
                      <button
                        onClick={() => onQuickUpdateStatus(asset)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors"
                        title="Change Status / Condition"
                      >
                        Lifecycle
                      </button>
                    )}
                    <Link
                      href={`/assets/${asset.id}`}
                      className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                      title="View Details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
