import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function AccessDeniedPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 text-center">
      <ShieldAlert aria-hidden="true" className="h-12 w-12 text-red-700" />
      <h1 className="text-2xl font-bold text-slate-900">Access restricted</h1>
      <p className="text-base text-slate-700">
        Your account is inactive, has no Sampada profile, or does not have permission to view this page.
        Contact your system administrator.
      </p>
      <Link className="rounded border border-slate-300 px-4 py-2 font-semibold text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2" href="/login">
        Return to sign in
      </Link>
    </section>
  );
}