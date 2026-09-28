'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Road,
  PlusCircle,
  BarChart3,
  Layers,
  ArrowRight,
  ShieldAlert,
  MapPin,
  Clock,
  Sparkles,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import { Asset, DashboardMetrics } from '@/types';
import { getDashboardMetrics, getAssets } from '@/lib/data/assetRepository';
import { StatCards } from '@/components/dashboard/StatCards';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { NeedsAttentionWidget } from '@/components/dashboard/NeedsAttentionWidget';
import { PendingVerificationsWidget } from '@/components/dashboard/PendingVerificationsWidget';
import { StatusUpdateModal } from '@/components/lifecycle/StatusUpdateModal';
import { AssetCard } from '@/components/assets/AssetCard';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentAssets, setRecentAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssetForUpdate, setSelectedAssetForUpdate] = useState<Asset | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getDashboardMetrics();
      const allAssets = await getAssets();
      setMetrics(data);
      setRecentAssets(allAssets.slice(0, 3));
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Background Emblem Graphic Pattern */}
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Building2 className="w-80 h-80 text-emerald-400" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sampada • Gandhinagar Roads & Buildings System</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Infrastructure Asset Lifecycle Management System
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Document-driven lifecycle status transitions, audit verification sign-offs, and condition tracking for Road networks, Bridges, Underpasses, and Administrative building assets in Gandhinagar.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/assets/new"
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register New Infrastructure Asset</span>
            </Link>

            <Link
              href="/assets"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition-colors"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Explore Complete Inventory</span>
            </Link>

            <button
              onClick={loadData}
              className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors ml-auto"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {loading || !metrics ? (
        /* Loading Skeleton */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <StatCards metrics={metrics} />

          {/* Pending Document Verification Queue (Heart of Sampada Workflow) */}
          <PendingVerificationsWidget
            pendingAssets={metrics.pendingVerificationAssets}
            historyLogs={metrics.recentHistory}
            onRefresh={loadData}
          />

          {/* Critical / Needs Attention Widget */}
          <NeedsAttentionWidget
            criticalAssets={metrics.criticalAssets}
            onQuickUpdateStatus={(asset) => setSelectedAssetForUpdate(asset)}
          />

          {/* Interactive Recharts Visualization */}
          <DashboardCharts metrics={metrics} />

          {/* Recent Assets Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-500" />
                  Featured Gandhinagar Infrastructure Assets
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Active Road corridors, Bridges, and Administrative Complexes
                </p>
              </div>

              <Link
                href="/assets"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                View All Assets <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onQuickUpdateStatus={(a) => setSelectedAssetForUpdate(a)}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Lifecycle Request Modal */}
      {selectedAssetForUpdate && (
        <StatusUpdateModal
          asset={selectedAssetForUpdate}
          isOpen={Boolean(selectedAssetForUpdate)}
          onClose={() => setSelectedAssetForUpdate(null)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
}
