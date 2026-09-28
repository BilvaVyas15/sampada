'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, Edit, AlertTriangle } from 'lucide-react';
import { Asset } from '@/types';
import { getAssetById } from '@/lib/data/assetRepository';
import { AssetForm } from '@/components/assets/AssetForm';

export default function EditAssetPage() {
  const params = useParams();
  const id = params.id as string;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getAssetById(id);
        if (data) setAsset(data);
      } catch (err) {
        console.error('Failed to load asset for editing', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 py-8 max-w-4xl mx-auto">
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-md mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Asset Not Found</h2>
        <Link
          href="/assets"
          className="inline-block px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg text-xs"
        >
          Back to Assets List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <Link
            href={`/assets/${asset.id}`}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mb-1"
          >
            <ChevronLeft className="w-4 h-4" /> Cancel & Back to Details
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Edit className="w-6 h-6 text-emerald-500" />
            Edit Technical Specifications: {asset.asset_code}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{asset.title}</p>
        </div>
      </div>

      <AssetForm initialAsset={asset} isEdit={true} />
    </div>
  );
}
