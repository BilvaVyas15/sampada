import React from 'react';
import Link from 'next/link';
import { Building2, ShieldCheck, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <span>Sampada – Infrastructure Asset Lifecycle System</span>
            </div>
            <p className="text-slate-400 max-w-md leading-relaxed">
              Official document-driven asset inventory, condition tracking, and verification management portal for Road and Building public infrastructure across Gandhinagar district.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              <span className="bg-slate-800 text-emerald-300 border border-slate-700 px-2.5 py-0.5 rounded">
                Next.js 15 App Router
              </span>
              <span className="bg-slate-800 text-sky-300 border border-slate-700 px-2.5 py-0.5 rounded">
                Supabase Auth & Storage
              </span>
              <span className="bg-slate-800 text-amber-300 border border-slate-700 px-2.5 py-0.5 rounded">
                Document-Driven Verification
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold mb-3 text-sm">System Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">
                  Dashboard Overview
                </Link>
              </li>
              <li>
                <Link href="/assets?type=Road" className="hover:text-emerald-400 transition-colors">
                  Road Assets Inventory
                </Link>
              </li>
              <li>
                <Link href="/assets?type=Building" className="hover:text-emerald-400 transition-colors">
                  Building Assets Inventory
                </Link>
              </li>
              <li>
                <Link href="/assets?pending=true" className="hover:text-emerald-400 transition-colors">
                  Pending Verification Queue
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold mb-3 text-sm">Database & Setup</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/schema" className="hover:text-emerald-400 transition-colors">
                  View Supabase SQL Schema
                </Link>
              </li>
              <li>
                <Link href="/assets/new" className="hover:text-emerald-400 transition-colors">
                  Register New Asset Form
                </Link>
              </li>
              <li>
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors"
                >
                  Supabase Cloud <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Roads & Buildings Department, Government of Gujarat. Gandhinagar Circle.
          </div>
          <div>
            Sampada • Document-Driven Infrastructure Governance
          </div>
        </div>
      </div>
    </footer>
  );
}
