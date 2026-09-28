'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2,
  Road,
  MapPin,
  Calendar,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Asset } from '@/types';
import { getConditionBadgeColor, getStatusBadgeColor, formatINR } from '@/lib/utils';

interface AssetCardProps {
  asset: Asset;
  onQuickUpdateStatus?: (asset: Asset) => void;
}

export function AssetCard({ asset, onQuickUpdateStatus }: AssetCardProps) {
  const isRoad = asset.asset_type === 'Road';
  const photoUrl = asset.photos && asset.photos.length > 0 ? asset.photos[0] : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      {/* Top Banner / Image */}
      <div className="relative h-44 bg-slate-800 overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={asset.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-500">
            {isRoad ? <Road className="w-12 h-12 mb-1" /> : <Building2 className="w-12 h-12 mb-1" />}
            <span className="text-xs">No Site Photo Available</span>
          </div>
        )}

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span
            className={`text-xs px-2.5 py-1 rounded-md font-bold shadow-md border ${
              isRoad
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-amber-600 text-white border-amber-400'
            }`}
          >
            {asset.asset_type}
          </span>

          <span className="text-[11px] font-mono font-bold bg-slate-900/90 text-white px-2.5 py-1 rounded-md shadow backdrop-blur-sm border border-slate-700">
            {asset.asset_code}
          </span>
        </div>

        {/* Bottom Floating Status Badges */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
          <span
            className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold shadow backdrop-blur-sm border ${getStatusBadgeColor(
              asset.status
            )}`}
          >
            {asset.status}
          </span>
          <span
            className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold shadow backdrop-blur-sm border ${getConditionBadgeColor(
              asset.condition
            )}`}
          >
            {asset.condition}
          </span>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
            {asset.sub_type}
          </div>
          <Link
            href={`/assets/${asset.id}`}
            className="font-bold text-base text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-2"
          >
            {asset.title}
          </Link>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {asset.description}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg p-2.5">
          <div>
            <span className="text-slate-400 text-[10px] block">Location</span>
            <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              {asset.location_district}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] block">Valuation</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {formatINR(asset.estimated_cost)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] block">Built / Opened</span>
            <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
              {asset.construction_year}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] block">
              {isRoad ? 'Length & Lanes' : 'Floors & Built-up'}
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
              {isRoad
                ? `${('length_km' in asset.specifications ? asset.specifications.length_km : 0) || 0} km • ${('lane_count' in asset.specifications ? asset.specifications.lane_count : 2) || 2}L`
                : `${('number_of_floors' in asset.specifications ? asset.specifications.number_of_floors : 1) || 1} Flr • ${('builtup_area_sqm' in asset.specifications ? asset.specifications.builtup_area_sqm : 0) || 0} m²`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {onQuickUpdateStatus && (
            <button
              onClick={() => onQuickUpdateStatus(asset)}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors"
            >
              Update Lifecycle
            </button>
          )}

          <Link
            href={`/assets/${asset.id}`}
            className="ml-auto text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
          >
            Details & Timeline <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
