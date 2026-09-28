'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Lock, Mail, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { setActiveUserRole } from '@/lib/data/assetService';
import type { UserRole } from '@/types';

const LOCAL_DEMO_PASSWORD = 'SampadaDemo2026!';
const LOCAL_DEMO_ACCOUNTS: { email: string; role: UserRole }[] = [
  { email: 'admin.demo@sampada.local', role: 'Admin' },
  { email: 'officer.demo@sampada.local', role: 'Officer' },
  { email: 'inspector.demo@sampada.local', role: 'Inspector' },
  { email: 'viewer.demo@sampada.local', role: 'Viewer' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const localDemoAccount = LOCAL_DEMO_ACCOUNTS.find(
        (account) => account.email === email.trim().toLowerCase()
      );
      if (
        process.env.NODE_ENV !== 'production' &&
        localDemoAccount &&
        password === LOCAL_DEMO_PASSWORD
      ) {
        document.cookie = `sampada_local_demo=${localDemoAccount.role.toLowerCase()}; Path=/; Max-Age=28800; SameSite=Lax`;
        setActiveUserRole(localDemoAccount.role);
        router.replace('/');
        router.refresh();
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) setErrorMsg(error.message);
      else {
        router.push('/');
        router.refresh();
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Login failed. Check your Supabase configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/30">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Gujarat Infrastructure Portal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to manage Roads & Buildings lifecycle assets
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
            {errorMsg}
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Official Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="officer@gujarat.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Account Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 text-xs transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
          </button>
        </form>

        <p className="border-t border-slate-200 pt-4 text-center text-sm text-slate-600">
          Accounts are provisioned by your Sampada administrator.
        </p>

        {process.env.NODE_ENV !== 'production' && (
          <section aria-label="Local demo accounts" className="space-y-3 border-t border-amber-300 bg-amber-50 p-4 text-sm text-slate-800">
            <div>
              <h3 className="font-bold">Local demo access</h3>
              <p>Development only. These accounts use sample data in this browser, not Supabase.</p>
            </div>
            <ul className="space-y-2">
              {LOCAL_DEMO_ACCOUNTS.map((account) => (
                <li key={account.email} className="flex flex-wrap items-center justify-between gap-2">
                  <span>{account.role}: <code>{account.email}</code></span>
                  <button
                    type="button"
                    className="rounded border border-slate-400 px-2 py-1 font-semibold hover:bg-white"
                    onClick={() => {
                      setEmail(account.email);
                      setPassword(LOCAL_DEMO_PASSWORD);
                    }}
                  >
                    Use account
                  </button>
                </li>
              ))}
            </ul>
            <p>Password for all four: <code>{LOCAL_DEMO_PASSWORD}</code></p>
          </section>
        )}
      </div>
    </div>
  );
}
