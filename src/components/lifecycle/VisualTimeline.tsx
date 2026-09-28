'use client';

import React from 'react';
import {
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Paperclip,
  Activity,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Calendar,
  XCircle,
  FileCheck,
} from 'lucide-react';
import { AssetLifecycleHistory } from '@/types';
import { formatDate, getConditionBadgeColor, getStatusBadgeColor } from '@/lib/utils';

interface VisualTimelineProps {
  history: AssetLifecycleHistory[];
}

export function VisualTimeline({ history }: VisualTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500 text-xs">
        No lifecycle transition records found for this asset.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-500" />
            Sampada Asset Lifecycle Audit Journey
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Document-driven chronological timeline of status transition requests, audit verification sign-offs, and compliance uploads
          </p>
        </div>
        <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
          {history.length} Audit Journey Nodes
        </span>
      </div>

      {/* Vertical Visual Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {history.map((item, index) => {
          const isFirst = index === 0;
          const isPending = item.verification_status === 'Pending';
          const isVerified = item.verification_status === 'Verified';
          const isRejected = item.verification_status === 'Rejected';

          return (
            <div key={item.id} className="relative group">
              {/* Timeline Node Icon */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full flex items-center justify-center text-white ring-4 ring-white dark:ring-slate-900 shadow-md ${
                  isPending
                    ? 'bg-amber-500 font-bold animate-pulse'
                    : isVerified
                    ? 'bg-emerald-600'
                    : isRejected
                    ? 'bg-rose-600'
                    : 'bg-blue-600'
                }`}
              >
                {isPending ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : isVerified ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : isRejected ? (
                  <XCircle className="w-3.5 h-3.5" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Event Content Card */}
              <div
                className={`border rounded-2xl p-5 transition-colors space-y-3.5 text-xs ${
                  isPending
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Header: Date, Action Type, Verification Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[11px] bg-slate-200 dark:bg-slate-800 px-2.5 py-0.5 rounded">
                      {item.action_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(item.created_at)}
                    </span>
                  </div>

                  {/* Verification Badge */}
                  <div className="flex items-center gap-2">
                    {isPending && (
                      <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3 animate-spin" /> Pending Verification
                      </span>
                    )}
                    {isVerified && (
                      <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Documents Verified
                      </span>
                    )}
                    {isRejected && (
                      <span className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Verification Rejected
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Transition Path */}
                <div className="flex flex-wrap items-center gap-3 py-1">
                  {item.previous_status && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Previous Stage:</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold border opacity-80 ${getStatusBadgeColor(
                          item.previous_status
                        )}`}
                      >
                        {item.previous_status}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Target Stage:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold border shadow-sm ${getStatusBadgeColor(
                        item.target_status
                      )}`}
                    >
                      {item.target_status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-slate-400">Condition:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold border ${getConditionBadgeColor(
                        item.new_condition
                      )}`}
                    >
                      {item.new_condition}
                    </span>
                  </div>
                </div>

                {/* Engineer Remarks */}
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Submitted by: {item.changed_by_name} ({item.changed_by_role})
                  </div>
                  &quot;{item.remarks}&quot;
                </div>

                {/* Verification Sign-Off Box if Verified/Rejected */}
                {item.verified_by_name && (
                  <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-emerald-900 dark:text-emerald-200 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Verified & Approved by {item.verified_by_name} ({item.verified_by_role || 'Superintending Officer'})</span>
                    </div>
                    {item.verification_notes && (
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                        Audit Note: &quot;{item.verification_notes}&quot;
                      </p>
                    )}
                  </div>
                )}

                {/* Attached Compliance Documents Checklist */}
                {item.attached_documents && item.attached_documents.length > 0 && (
                  <div className="pt-2">
                    <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-500" /> Attached Verification Documents ({item.attached_documents.length}):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.attached_documents.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                                {att.title}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {att.doc_type.replace(/_/g, ' ')}
                              </div>
                            </div>
                          </div>

                          <a
                            href={att.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline text-[11px] shrink-0"
                          >
                            View PDF
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
