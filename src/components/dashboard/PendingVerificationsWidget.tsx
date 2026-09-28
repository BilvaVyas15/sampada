'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  Clock,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Building2,
  Road,
  CheckCircle2,
} from 'lucide-react';
import { Asset, AssetLifecycleHistory } from '@/types';
import { VerificationApprovalModal } from '@/components/lifecycle/VerificationApprovalModal';

interface PendingVerificationsWidgetProps {
  pendingAssets: Asset[];
  historyLogs: AssetLifecycleHistory[];
  onRefresh: () => void;
}

export function PendingVerificationsWidget({
  pendingAssets,
  historyLogs,
  onRefresh,
}: PendingVerificationsWidgetProps) {
  const [selectedPending, setSelectedPending] = useState<{
    asset: Asset;
    history: AssetLifecycleHistory;
  } | null>(null);

  if (!pendingAssets || pendingAssets.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-900/90 rounded-2xl border border-amber-200 dark:border-amber-900/50 p-6 shadow-sm mb-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-200/80 dark:border-amber-900/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center shadow-md">
            <FileCheck className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Pending Document Verification Queue ({pendingAssets.length})
            </h3>
            <p className="text-xs text-amber-800 dark:text-amber-300">
              Mandatory audit documents uploaded by engineers awaiting Chief / Superintending Officer verification
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-amber-200/60 dark:divide-slate-800">
        {pendingAssets.map((asset) => {
          const hist = historyLogs.find(
            (h) => h.asset_id === asset.id && h.verification_status === 'Pending'
          );
          if (!hist) return null;

          return (
            <div
              key={asset.id}
              className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  {asset.asset_type === 'Road' ? (
                    <Road className="w-4 h-4" />
                  ) : (
                    <Building2 className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-[11px] bg-slate-900 text-white px-2 py-0.5 rounded">
                      {asset.asset_code}
                    </span>
                    <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold">
                      Pending Verification
                    </span>
                  </div>

                  <Link
                    href={`/assets/${asset.id}`}
                    className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 text-sm line-clamp-1"
                  >
                    {asset.title}
                  </Link>

                  <div className="text-slate-600 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                    <span>
                      Requested Transition: <strong>{asset.status} → {hist.target_status}</strong>
                    </span>
                    <span>By: <strong>{hist.changed_by_name}</strong></span>
                    <span>Docs Attached: <strong>{hist.attached_documents?.length || 0}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSelectedPending({ asset, history: hist })}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-transform hover:scale-105"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Review & Verify Documents</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedPending && (
        <VerificationApprovalModal
          asset={selectedPending.asset}
          historyItem={selectedPending.history}
          isOpen={Boolean(selectedPending)}
          onClose={() => setSelectedPending(null)}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
