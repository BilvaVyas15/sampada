'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, PlusCircle, Building2 } from 'lucide-react';
import { AssetForm } from '@/components/assets/AssetForm';

export default function NewAssetPage() {
  return (
    <div className="space-y-6 pb-16">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <Link
            href="/assets"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mb-1"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Assets Inventory
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-emerald-500" />
            Register New Infrastructure Asset
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Add a new Road or Building infrastructure record to the Gujarat state master directory
          </p>
        </div>
      </div>

      {/* Main Asset Registration Form Wizard */}
      <AssetForm />
    </div>
  );
}
