'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Building2, Road, ExternalLink, Info, Compass } from 'lucide-react';
import { Asset } from '@/types';
import { getConditionBadgeColor, getStatusBadgeColor, formatINR } from '@/lib/utils';

interface AssetMapProps {
  assets: Asset[];
}

export function AssetMap({ assets }: AssetMapProps) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(assets[0] || null);

  return (
    <div className="bg-slate-900 text-white rounded-xl border border-slate-800 overflow-hidden shadow-lg mb-8 grid grid-cols-1 lg:grid-cols-3">
      {/* Left / Top Map Canvas Representation */}
      <div className="lg:col-span-2 relative min-h-[360px] bg-slate-950 p-6 flex flex-col justify-between overflow-hidden">
        {/* Decorative Grid Lines / Map Background Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Map Header Overlay */}
        <div className="relative z-10 flex items-center justify-between bg-slate-900/80 backdrop-blur-md p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Compass className="w-4 h-4" />
            <span>GIS Map View • Gujarat District Infrastructure Coordinates</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {assets.length} Assets Georeferenced
          </span>
        </div>

        {/* Pins Container Area */}
        <div className="relative z-10 my-8 min-h-[220px] flex flex-wrap items-center justify-center gap-4">
          {assets.map((asset, index) => {
            const isSelected = selectedAsset?.id === asset.id;
            const isRoad = asset.asset_type === 'Road';

            return (
              <button
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`relative group transition-all transform hover:scale-110 ${
                  isSelected ? 'z-30 scale-110' : 'z-10 opacity-90'
                }`}
              >
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg border text-xs font-bold transition-colors ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300 ring-2 ring-emerald-400/50'
                      : isRoad
                      ? 'bg-blue-900/90 text-blue-200 border-blue-700 hover:bg-blue-800'
                      : 'bg-amber-900/90 text-amber-200 border-amber-700 hover:bg-amber-800'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{asset.location_district}</span>
                  <span className="font-mono text-[10px] opacity-80">({asset.asset_code})</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Map Foot Legend */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
          <span>Gujarat State Coordinates Frame (21°N to 24°N, 69°E to 73°E)</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Road
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Building
            </span>
          </div>
        </div>
      </div>

      {/* Right / Selected Asset Details Inspector */}
      <div className="p-5 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between bg-slate-900/90">
        {selectedAsset ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[11px] font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {selectedAsset.asset_code}
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${getStatusBadgeColor(
                  selectedAsset.status
                )}`}
              >
                {selectedAsset.status}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-emerald-400">
                {selectedAsset.asset_type} • {selectedAsset.sub_type}
              </span>
              <h4 className="font-bold text-white text-base mt-0.5">
                {selectedAsset.title}
              </h4>
              <p className="text-xs text-slate-400 mt-2 line-clamp-3">
                {selectedAsset.description}
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">District / Taluka:</span>
                <span className="font-medium">{selectedAsset.location_district}, {selectedAsset.location_taluka}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Coordinates:</span>
                <span className="font-mono text-emerald-400">
                  {selectedAsset.latitude ?? '23.0225'}° N, {selectedAsset.longitude ?? '72.5714'}° E
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Condition:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getConditionBadgeColor(selectedAsset.condition)}`}>
                  {selectedAsset.condition}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sanctioned Cost:</span>
                <span className="font-bold text-white">{formatINR(selectedAsset.estimated_cost)}</span>
              </div>
            </div>

            <Link
              href={`/assets/${selectedAsset.id}`}
              className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <span>View Full Lifecycle Record</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="text-center text-slate-500 my-auto text-xs">
            Select a pin on the GIS map to inspect details
          </div>
        )}
      </div>
    </div>
  );
}
