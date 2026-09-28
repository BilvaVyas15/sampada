'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  PlusCircle,
  BarChart3,
  Menu,
  X,
  Layers,
  LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getActiveUser } from '@/lib/data/assetService';

type HeaderProfile = {
  full_name: string;
  department: string;
  role: 'admin' | 'officer' | 'inspector' | 'viewer';
  scope_asset_type: string;
  scope_sector: string;
  isLocalDemo?: boolean;
};

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<HeaderProfile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      if (process.env.NODE_ENV !== 'production') {
        const demoRole = document.cookie
          .split('; ')
          .find((cookie) => cookie.startsWith('sampada_local_demo='))
          ?.split('=')[1];
        if (demoRole) {
          const demoUser = getActiveUser();
          if (active) {
            setUser({
              full_name: demoUser.full_name,
              department: demoUser.department,
              role: demoRole as HeaderProfile['role'],
              scope_asset_type: 'all',
              scope_sector: 'all',
              isLocalDemo: true,
            });
          }
          return;
        }
      }

      try {
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;
        const { data } = await supabase
          .from('profiles')
          .select('full_name, department, role, scope_asset_type, scope_sector')
          .eq('id', authUser.id)
          .maybeSingle();
        if (active && data) setUser({ ...(data as HeaderProfile), isLocalDemo: false });
      } catch {
        if (active) setUser(null);
      }
    };
    void loadProfile();
    return () => { active = false; };
  }, [pathname]);

  const handleSignOut = async () => {
    if (process.env.NODE_ENV !== 'production' && document.cookie.includes('sampada_local_demo=')) {
      document.cookie = 'sampada_local_demo=; Path=/; Max-Age=0; SameSite=Lax';
      localStorage.removeItem('sampada_demo_role_v2');
      window.location.assign('/login');
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign('/login');
  };

  const navItems = [
    { href: '/', label: 'Dashboard', icon: BarChart3 },
    { href: '/assets', label: 'Assets', icon: Layers },
    { href: '/assets/new', label: 'Register Asset', icon: PlusCircle, roles: ['admin', 'officer'] },
  ];

  const scopeLabel = user?.scope_asset_type === 'all' && user.scope_sector === 'all'
    ? 'Viewing: All assets'
    : `Viewing: ${user?.scope_asset_type === 'road' ? 'Roads' : user?.scope_asset_type === 'building' ? 'Buildings' : 'All assets'}${user?.scope_sector && user.scope_sector !== 'all' ? ` - ${user.scope_sector.replaceAll('_', ' ')}` : ''}`;

  if (pathname === '/login' || pathname === '/access-denied') return null;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="bg-slate-800 px-4 py-2 text-sm text-slate-100 flex flex-wrap justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="font-bold">સંપદા Sampada</span>
          <span className="hidden sm:inline text-slate-300">Road & Building Asset Lifecycle - Gandhinagar</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-300">{user?.isLocalDemo ? 'Local demo data only' : user ? scopeLabel : 'Loading profile…'}</span>
          {user && <span className="hidden sm:inline text-slate-300">{user.role}</span>}
          {user && (
            <button onClick={handleSignOut} aria-label="Sign out" title="Sign out" className="rounded p-2 text-slate-200 hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & System Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-lg leading-tight tracking-tight text-white flex items-center gap-2">
                Sampada <span className="text-xs font-medium text-emerald-400">Gandhinagar</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Document-Driven Asset Lifecycle Management
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.roles && (!user || !item.roles.includes(user.role))) {
                return null;
              }
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white font-bold shadow'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right User Profile Badge */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 border-l border-slate-800 pl-4">
              <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-xs border border-emerald-400/40">
                {user?.full_name?.charAt(0) || 'S'}
              </div>
              <div className="text-left text-xs">
                <div className="font-bold text-slate-200 truncate max-w-35">
                  {user?.full_name || 'Government Officer'}
                </div>
                <div className="text-slate-400 text-[10px] truncate max-w-35">
                  {user?.department || 'R&B Dept'}
                </div>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-2">
          {navItems.map((item) => {
            if (item.roles && (!user || !item.roles.includes(user.role))) {
              return null;
            }
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
