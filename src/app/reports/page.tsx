'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileCode,
  Printer,
  Building2,
  Road,
  CheckCircle2,
  IndianRupee,
  Layers,
  FileCheck,
} from 'lucide-react';
import { Asset, DashboardMetrics } from '@/types';
import { getAssets, getDashboardMetrics } from '@/lib/data/assetService';
import { formatINR } from '@/lib/utils';

export default function ReportsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getAssets();
        const m = await getDashboardMetrics();
        setAssets(data);
        setMetrics(m);
      } catch (err) {
        console.error('Failed to load reports data', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleExportCSV = () => {
    if (assets.length === 0) return;

    const headers = [
      'Asset Code',
      'Title',
      'Asset Type',
      'Subtype',
      'Status',
      'Condition',
      'District',
      'Taluka',
      'Address',
      'Estimated Cost (INR)',
      'Construction Year',
      'Managing Department',
      'Assigned Officer',
    ];

    const rows = assets.map((a) => [
      `"${a.asset_code}"`,
      `"${a.title.replace(/"/g, '""')}"`,
      `"${a.asset_type}"`,
      `"${a.sub_type}"`,
      `"${a.status}"`,
      `"${a.condition}"`,
      `"${a.location_district}"`,
      `"${a.location_taluka}"`,
      `"${a.location_address.replace(/"/g, '""')}"`,
      a.estimated_cost,
      a.construction_year,
      `"${a.managing_department}"`,
      `"${a.assigned_officer_name}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sampada_Gandhinagar_Assets_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (assets.length === 0) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(assets, null, 2)
    )}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', `Sampada_Gandhinagar_Assets_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-16 print:p-0 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Executive Analytics & Audit Reports</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Sampada Gandhinagar Infrastructure Audit Report
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Export complete asset inventory, document verification logs, and financial valuations
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <FileCode className="w-4 h-4 text-purple-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl border border-slate-300 dark:border-slate-700 flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {loading || !metrics ? (
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
      ) : (
        <div className="space-y-8">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Gandhinagar Assets
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {metrics.totalAssets}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                {metrics.totalRoads} Roads • {metrics.totalBuildings} Buildings
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Capital Valuation
              </span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatINR(metrics.totalValuation)}
              </div>
              <div className="text-xs text-slate-500 mt-2">Sanctioned capital budget</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                Pending Document Verification
              </span>
              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {metrics.pendingVerificationCount}
              </div>
              <div className="text-xs text-amber-600 mt-2 font-medium">Awaiting Chief Officer sign-off</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                Critical Distress Warnings
              </span>
              <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                {metrics.needingAttentionCount}
              </div>
              <div className="text-xs text-rose-500 mt-2 font-medium">Require immediate maintenance</div>
            </div>
          </div>

          {/* Asset Summary Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Gandhinagar Infrastructure Asset Inventory Breakdown
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 uppercase">
                  <tr>
                    <th className="py-3 px-4">Asset Code</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Type & Subtype</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Condition</th>
                    <th className="py-3 px-4">Sanctioned Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {asset.asset_code}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {asset.title}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {asset.asset_type} ({asset.sub_type})
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                        {asset.status}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {asset.condition}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {formatINR(asset.estimated_cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
