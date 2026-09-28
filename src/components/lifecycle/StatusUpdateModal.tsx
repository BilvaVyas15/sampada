'use client';

import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Loader2,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { Asset, AssetCondition, AssetDocument, AssetStatus } from '@/types';
import { submitStatusChangeRequest } from '@/lib/data/assetService';
import { DocumentUploadWorkflow } from './DocumentUploadWorkflow';

interface StatusUpdateModalProps {
  asset: Asset;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedAsset: Asset) => void;
}

const ALL_STATUSES: AssetStatus[] = [
  'Planned',
  'Under Construction',
  'Completed',
  'Operational',
  'Under Maintenance',
  'Needs Attention',
  'Retired',
];

const ALL_CONDITIONS: AssetCondition[] = ['Good', 'Fair', 'Poor', 'Critical'];

export function StatusUpdateModal({
  asset,
  isOpen,
  onClose,
  onSuccess,
}: StatusUpdateModalProps) {
  const [targetStatus, setTargetStatus] = useState<AssetStatus>(asset.status);
  const [newCondition, setNewCondition] = useState<AssetCondition>(asset.condition);
  const [remarks, setRemarks] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState<AssetDocument[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarks.trim()) {
      setErrorMsg('Please enter audit remarks / justification for this status transition request.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const result = await submitStatusChangeRequest(
        asset.id,
        targetStatus,
        newCondition,
        remarks,
        uploadedDocs
      );
      onSuccess(result.asset);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit status change request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
              Document-Driven Transition
            </span>
            <h3 className="text-base font-bold text-white mt-1">
              Request Status Change: {asset.asset_code}
            </h3>
            <p className="text-xs text-slate-400 truncate max-w-md">{asset.title}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 dark:bg-rose-950/50 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current vs Target Status Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                Target Lifecycle Stage <span className="text-rose-500">*</span>
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as AssetStatus)}
                className="w-full py-2.5 px-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500"
              >
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Current Status: <strong className="text-slate-700 dark:text-slate-300">{asset.status}</strong>
              </span>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                Updated Condition Rating
              </label>
              <select
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value as AssetCondition)}
                className="w-full py-2.5 px-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500"
              >
                {ALL_CONDITIONS.map((cd) => (
                  <option key={cd} value={cd}>
                    {cd}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Current Condition: <strong className="text-slate-700 dark:text-slate-300">{asset.condition}</strong>
              </span>
            </div>
          </div>

          {/* DOCUMENT-DRIVEN WORKFLOW SECTION */}
          {targetStatus !== asset.status ? (
            <DocumentUploadWorkflow
              currentStatus={asset.status}
              targetStatus={targetStatus}
              uploadedDocuments={uploadedDocs}
              onChange={setUploadedDocs}
            />
          ) : (
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 text-[11px] flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Select a different target lifecycle stage above to view required document upload checklist.</span>
            </div>
          )}

          {/* Audit Remarks */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Audit Rationale & Inspection Remarks <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Enter detailed engineer observations, site survey notes, contractor handovers, or defect remarks..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 text-xs leading-relaxed"
            />
          </div>

          {/* Submission Notice */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-[11px] text-amber-800 dark:text-amber-300">
            <strong>Verification Note:</strong> Submitting this request will flag the asset as <em>Pending Verification</em>. The status will officially transition once an authorized Officer or Admin verifies the attached documents.
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit for Document Verification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
