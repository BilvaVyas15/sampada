'use client';

import React, { useState } from 'react';
import {
  FileCheck,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import { AssetDocument, AssetStatus, getRequiredDocumentsForTransition } from '@/types';
import { uploadAssetAttachment } from '@/lib/data/assetService';

interface DocumentUploadWorkflowProps {
  currentStatus: AssetStatus;
  targetStatus: AssetStatus;
  uploadedDocuments: AssetDocument[];
  onChange: (updated: AssetDocument[]) => void;
}

export function DocumentUploadWorkflow({
  currentStatus,
  targetStatus,
  uploadedDocuments,
  onChange,
}: DocumentUploadWorkflowProps) {
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);

  const requiredChecks = getRequiredDocumentsForTransition(currentStatus, targetStatus);

  const handleFileUploadForType = async (
    docType: string,
    label: string,
    files: FileList | null
  ) => {
    if (!files || files.length === 0) return;
    setUploadingDocType(docType);

    try {
      const file = files[0];
      const uploaded = await uploadAssetAttachment(file, docType);
      uploaded.title = `${label}: ${file.name}`;

      // Replace or add document for this doc_type
      const existingFiltered = uploadedDocuments.filter((d) => d.doc_type !== docType);
      onChange([...existingFiltered, uploaded]);
    } catch (err) {
      console.error('Document upload failed', err);
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleRemoveDoc = (docId: string) => {
    onChange(uploadedDocuments.filter((d) => d.id !== docId));
  };

  return (
    <div className="space-y-4">
      {/* Required Checklist Banner */}
      <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-xl p-4 text-xs space-y-1">
        <div className="font-bold text-sky-900 dark:text-sky-200 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span>Document Verification Rule Checklist: {currentStatus} → {targetStatus}</span>
        </div>
        <p className="text-sky-700 dark:text-sky-300">
          The system enforces document-driven status transitions. Mandatory documents must be uploaded for verification before status changes.
        </p>
      </div>

      {/* Required Slots Grid */}
      <div className="space-y-3">
        {requiredChecks.map((req) => {
          const uploadedDoc = uploadedDocuments.find((d) => d.doc_type === req.doc_type);
          const isUploading = uploadingDocType === req.doc_type;

          return (
            <div
              key={req.doc_type}
              className={`p-4 rounded-xl border transition-all text-xs ${
                uploadedDoc
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                  : req.is_mandatory
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {uploadedDoc ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {req.label}
                    </span>
                    {req.is_mandatory ? (
                      <span className="text-[10px] bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2 py-0.2 rounded font-bold">
                        Mandatory
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.2 rounded font-medium">
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {req.description}
                  </p>
                </div>

                {/* Upload Action / Status Pill */}
                <div className="shrink-0">
                  {uploadedDoc ? (
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800">
                      {uploadedDoc.file_type === 'image' ? (
                        <ImageIcon className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-blue-500" />
                      )}
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                        {uploadedDoc.title.split(': ').pop()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(uploadedDoc.id)}
                        className="p-1 text-slate-400 hover:text-rose-500"
                        title="Remove uploaded document"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs shadow-sm transition-colors">
                      {isUploading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf,.doc,.docx"
                        onChange={(e) =>
                          handleFileUploadForType(req.doc_type, req.label, e.target.files)
                        }
                        className="hidden"
                        disabled={Boolean(isUploading)}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
