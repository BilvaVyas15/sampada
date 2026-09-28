'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  User,
  Clock,
} from 'lucide-react';
import { Asset, AssetLifecycleHistory } from '@/types';
import { verifyDocumentAndTransition } from '@/lib/data/assetRepository';

interface VerificationApprovalModalProps {
  asset: Asset;
  historyItem: AssetLifecycleHistory;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function VerificationApprovalModal({
  asset,
  historyItem,
  isOpen,
  onClose,
  onSuccess,
}: VerificationApprovalModalProps) {
  const [verificationNotes, setVerificationNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    setSubmitting(true);
    setErrorMsg('');

    try {
      await verifyDocumentAndTransition(historyItem.id, action, verificationNotes);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Verification action failed.');
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
            <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold">
              Pending Document Verification Queue
            </span>
            <h3 className="text-base font-bold text-white mt-1">
              Verify Transition Request: {asset.asset_code}
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

        {/* Content */}
        <div className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Requested Transition Info */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Requested By</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {historyItem.changed_by_name} ({historyItem.changed_by_role})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Target Lifecycle Status</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {asset.status} → {historyItem.target_status}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-300">
              <strong>Engineer Remarks:</strong> &quot;{historyItem.remarks}&quot;
            </div>
          </div>

          {/* Uploaded Documents List */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              Uploaded Audit Documents for Verification ({historyItem.attached_documents?.length || 0})
            </h4>

            {historyItem.attached_documents && historyItem.attached_documents.length > 0 ? (
              <div className="space-y-2">
                {historyItem.attached_documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white truncate max-w-[260px]">
                          {doc.title}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Type: {doc.doc_type.replace(/_/g, ' ')}
                        </div>
                      </div>
                    </div>

                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold rounded text-[11px] flex items-center gap-1"
                    >
                      <span>Inspect Document</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic">No documents attached.</p>
            )}
          </div>

          {/* Verification Notes */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Verification Audit Notes / Sign-off Rationale
            </label>
            <textarea
              rows={2}
              placeholder="Add audit sign-off notes or rejection reasons..."
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleAction('REJECT')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Request</span>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleAction('APPROVE')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Documents & Update Status</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
