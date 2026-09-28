import { getSupabaseEnv } from '@/lib/env';

export default function SupabaseNotConfiguredPage() {
  const config = getSupabaseEnv();
  const variables = config.ok ? [] : config.variables;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-5 px-6 py-12">
      <p className="text-sm font-semibold uppercase text-amber-800">Configuration required</p>
      <h1 className="text-3xl font-bold text-slate-950">Supabase is not configured</h1>
      <p className="text-base text-slate-700">
        Set the following environment variable{variables.length === 1 ? '' : 's'} and restart the application:
      </p>
      <ul className="list-inside list-disc space-y-2 rounded border border-slate-300 bg-white p-5 font-mono text-sm text-slate-900">
        {variables.map((variable) => <li key={variable}>{variable}</li>)}
      </ul>
    </main>
  );
}