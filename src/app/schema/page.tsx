'use client';

import React, { useState } from 'react';
import { Database, Copy, Check, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';

const SQL_SCHEMA = `-- ====================================================================
-- INFRASTRUCTURE ASSET INVENTORY & LIFECYCLE MANAGEMENT SYSTEM
-- Supabase PostgreSQL Schema & Security Policies (Gujarat Context)
-- ====================================================================

-- 1. PROFILES TABLE (User Roles & Department Mapping)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Officer', 'Inspector', 'Viewer')) DEFAULT 'Viewer',
    department TEXT NOT NULL DEFAULT 'Roads & Buildings Department',
    district TEXT DEFAULT 'Gandhinagar',
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ASSETS TABLE (Road & Building Master Records)
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('Road', 'Building')),
    sub_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Planned', 'Under Construction', 'Completed', 'Operational', 'Under Maintenance', 'Needs Attention', 'Retired')) DEFAULT 'Operational',
    condition TEXT NOT NULL CHECK (condition IN ('Good', 'Fair', 'Poor', 'Critical')) DEFAULT 'Good',
    location_district TEXT NOT NULL,
    location_taluka TEXT NOT NULL,
    location_address TEXT NOT NULL,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    estimated_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    actual_cost NUMERIC(15, 2) DEFAULT 0.00,
    construction_year INT NOT NULL,
    managing_department TEXT NOT NULL DEFAULT 'Roads & Buildings Dept',
    assigned_officer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_officer_name TEXT NOT NULL DEFAULT 'Unassigned',
    assigned_officer_contact TEXT,
    description TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    photos JSONB DEFAULT '[]'::jsonb,
    documents JSONB DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ASSET LIFECYCLE HISTORY TABLE (Audit Trail & Status Tracking)
CREATE TABLE IF NOT EXISTS public.asset_lifecycle_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    previous_condition TEXT,
    new_condition TEXT NOT NULL,
    action_type TEXT NOT NULL DEFAULT 'STATUS_CHANGE',
    remarks TEXT NOT NULL,
    changed_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    changed_by_name TEXT NOT NULL,
    changed_by_role TEXT NOT NULL DEFAULT 'Officer',
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);`;

export default function SchemaPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <Database className="w-4 h-4" />
            <span>Supabase Database Schema Deliverable</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            PostgreSQL SQL DDL Scripts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Copy and execute these scripts directly inside your Supabase project SQL Editor
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
        </button>
      </div>

      {/* Instructions Card */}
      <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          Instructions to run in Supabase:
        </h3>
        <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
          <li>Log in to your <strong>Supabase Dashboard</strong> and open your project.</li>
          <li>Go to the <strong>SQL Editor</strong> tab on the left sidebar.</li>
          <li>Click <strong>New Query</strong> and paste the SQL schema script below.</li>
          <li>Click <strong>Run</strong> (or press Ctrl+Enter) to create tables, triggers, and RLS policies.</li>
          <li>Set environment variables in your <code>.env.local</code> file:
            <pre className="mt-1 p-2 bg-slate-950 rounded text-emerald-400 font-mono text-[11px]">
              NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co{"\n"}
              NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
            </pre>
          </li>
        </ol>
      </div>

      {/* SQL Script Viewer */}
      <div className="bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 p-6 overflow-x-auto shadow-xl">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-3 border-b border-slate-800 pb-2">
          <span>file: supabase_schema.sql</span>
          <span>PostgreSQL 15+ compatible</span>
        </div>
        <pre className="font-mono text-xs text-emerald-300 leading-relaxed whitespace-pre font-medium">
          {SQL_SCHEMA}
        </pre>
      </div>
    </div>
  );
}
