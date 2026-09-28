'use client';

import React, { useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, X, CheckCircle2, Loader2 } from 'lucide-react';
import { AssetDocument } from '@/types';
import { uploadAssetAttachment } from '@/lib/data/assetRepository';

interface FileUploaderProps {
  attachments: AssetDocument[];
  onChange: (updated: AssetDocument[]) => void;
  maxFiles?: number;
}

export function FileUploader({ attachments, onChange, maxFiles = 5 }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      const newAttachments: AssetDocument[] = [...attachments];
      for (let i = 0; i < files.length; i++) {
        if (newAttachments.length >= maxFiles) break;
        const file = files[i];
        const uploaded = await uploadAssetAttachment(file);
        newAttachments.push(uploaded);
      }
      onChange(newAttachments);
    } catch (err) {
      console.error('File upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (id: string) => {
    onChange(attachments.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-3">
      {/* Dropzone Container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors ${
          dragOver
            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <input
          type="file"
          id="file-upload-input"
          multiple
          accept="image/*,application/pdf,.doc,.docx"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={uploading || attachments.length >= maxFiles}
        />

        <label
          htmlFor="file-upload-input"
          className="cursor-pointer flex flex-col items-center justify-center space-y-2"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <UploadCloud className="w-5 h-5" />
            )}
          </div>

          <div className="text-xs">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
              Click to upload files
            </span>{' '}
            <span className="text-slate-500 dark:text-slate-400">or drag and drop</span>
          </div>

          <p className="text-[11px] text-slate-400">
            Inspection Photos (JPG, PNG) or Audit Documents (PDF, DOCX) up to 10MB each
          </p>
        </label>
      </div>

      {/* Uploaded File Pill Items */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
            >
              <div className="flex items-center gap-2 truncate">
                {att.file_type === 'image' ? (
                  <ImageIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                )}
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                  {att.title}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(att.id)}
                className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
