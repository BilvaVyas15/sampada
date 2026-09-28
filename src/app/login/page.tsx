'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Lock, Mail, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getProfileById } from '@/lib/data/profileService';

const ROLE_HOME: Record<string, string> = {
  admin: '/',
  officer: '/assets',
  inspector: '/assets',
  viewer: '/assets',
};

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
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        setErrorMsg(error?.message ?? 'Login failed. Check your email and password.');
        return;
      }

      let profile;
      try {
        profile = await getProfileById(data.user.id);
      } catch {
        await supabase.auth.signOut();
        setErrorMsg('Unable to verify your account. Please try again or contact your administrator.');
        return;
      }

      if (!profile || !profile.is_active) {
        await supabase.auth.signOut();
        setErrorMsg('Access restricted');
        return;
      }

      router.replace(ROLE_HOME[profile.role] ?? '/access-denied');
      router.refresh();
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

        {/* Demo Credentials */}
        <div className="border-t border-slate-200 pt-4 space-y-2">
          <p className="text-xs text-center font-bold text-slate-500 uppercase tracking-wider">
            Demo Credentials (Click to fill)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '🛡️ Admin', email: 'admin@sampada.demo', pass: 'Demo1234!' },
              { label: '👷 Officer', email: 'officer@sampada.demo', pass: 'Demo1234!' },
              { label: '🔍 Inspector', email: 'inspector@sampada.demo', pass: 'Demo1234!' },
              { label: '👁️ Viewer', email: 'viewer@sampada.demo', pass: 'Demo1234!' },
            ].map((demo) => (
              <button
                key={demo.email}
                type="button"
                onClick={() => { setEmail(demo.email); setPassword(demo.pass); }}
                className="text-left p-2 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
              >
                <div className="text-xs font-bold text-slate-800">{demo.label}</div>
                <div className="text-[10px] text-slate-500 font-mono truncate">{demo.email}</div>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-center text-slate-400">
            Password for all demo accounts: <span className="font-mono font-bold">Demo1234!</span>
          </p>
        </div>

      </div>
    </div>
  );
}
