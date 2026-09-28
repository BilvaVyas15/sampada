'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Building2,
  Road,
  PlusCircle,
  LayoutGrid,
  Table as TableIcon,
  MapPin,
  RefreshCw,
  Layers,
  Filter,
} from 'lucide-react';
import { Asset, AssetFilterState, AssetType } from '@/types';
import { getAssets } from '@/lib/data/assetRepository';
import { getCurrentProfile } from '@/lib/data/profileService';
import { AssetFilters } from '@/components/assets/AssetFilters';
import { AssetCard } from '@/components/assets/AssetCard';
import { AssetTable } from '@/components/assets/AssetTable';
import { AssetMap } from '@/components/assets/AssetMap';
import { StatusUpdateModal } from '@/components/lifecycle/StatusUpdateModal';

const DEFAULT_FILTERS: AssetFilterState = {
  searchQuery: '',
  assetType: 'ALL',
  status: 'ALL',
  condition: 'ALL',
  subType: 'ALL',
  pendingVerificationOnly: false,
  sortBy: 'created_at',
  sortOrder: 'desc',
};

const VALID_STATUS_FILTERS: AssetFilterState['status'][] = [
  'ALL', 'Proposed', 'Administrative Approval', 'Technical Sanction',
  'Tender / Work Order', 'Under Construction', 'Completed', 'Handed Over',
  'Operational', 'Under Maintenance', 'Needs Attention', 'Retired', 'Planned',
];

function AssetsInventoryContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type') as AssetType | null;
  const statusParam = searchParams.get('status');
  const pendingParam = searchParams.get('pending') === 'true';

  const [filters, setFilters] = useState<AssetFilterState>({
    ...DEFAULT_FILTERS,
    assetType: typeParam || 'ALL',
    status: (statusParam && VALID_STATUS_FILTERS.includes(statusParam as AssetFilterState['status'])
      ? statusParam as AssetFilterState['status']
      : 'ALL'),
    pendingVerificationOnly: pendingParam,
  });

  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'map'>('grid');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssetForUpdate, setSelectedAssetForUpdate] = useState<Asset | null>(null);
  const [user, setUser] = useState<Awaited<ReturnType<typeof getCurrentProfile>>>(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const [data, profile] = await Promise.all([getAssets(filters), getCurrentProfile()]);
      setAssets(data);
      setUser(profile);
    } catch (err) {
      console.error('Failed to fetch asset inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [filters]);

  const canCreate = user ? ['admin', 'officer'].includes(user.role) : false;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <Layers className="w-4 h-4" />
            <span>State Public Works Repository</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Infrastructure Assets Inventory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse, filter, and inspect Road stretches and Building facilities across Gujarat
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden md:inline">Grid</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Tabular Data View"
            >
              <TableIcon className="w-4 h-4" />
              <span className="hidden md:inline">Table</span>
            </button>

            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="GIS Map View"
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden md:inline">GIS Map</span>
            </button>
          </div>

          {canCreate && (
            <Link
              href="/assets/new"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Asset</span>
            </Link>
          )}
        </div>
      </div>

      {/* Advanced Filter Component */}
      <AssetFilters
        filters={filters}
        onFilterChange={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        totalResults={assets.length}
      />

      {/* Content Rendering based on View Mode */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Infrastructure Assets Match Filters
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
            Try adjusting your search query, district selection, or asset status filters.
          </p>
          <button
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onQuickUpdateStatus={(a) => setSelectedAssetForUpdate(a)}
            />
          ))}
        </div>
      ) : viewMode === 'table' ? (
        <AssetTable
          assets={assets}
          onQuickUpdateStatus={(a) => setSelectedAssetForUpdate(a)}
        />
      ) : (
        <AssetMap assets={assets} />
      )}

      {/* Status Update Modal */}
      {selectedAssetForUpdate && (
        <StatusUpdateModal
          asset={selectedAssetForUpdate}
          isOpen={Boolean(selectedAssetForUpdate)}
          onClose={() => setSelectedAssetForUpdate(null)}
          onSuccess={() => fetchInventory()}
        />
      )}
    </div>
  );
}

export default function AssetsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
          Loading Infrastructure Assets...
        </div>
      }
    >
      <AssetsInventoryContent />
    </Suspense>
  );
}
