import { z } from 'zod';

const supabaseEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

export type SupabaseEnv = z.infer<typeof supabaseEnvSchema>;

export type SupabaseEnvResult =
  | { ok: true; value: SupabaseEnv }
  | { ok: false; variables: string[] };

export function getSupabaseEnv(): SupabaseEnvResult {
  const candidate = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
  const result = supabaseEnvSchema.safeParse(candidate);

  if (!result.success) {
    const variables = [...new Set(result.error.issues.map((issue) => String(issue.path[0])))];
    return { ok: false, variables };
  }

  return { ok: true, value: result.data };
}

export class SupabaseConfigurationError extends Error {
  constructor(readonly variables: string[]) {
    super(`Supabase is not configured. Check: ${variables.join(', ')}.`);
    this.name = 'SupabaseConfigurationError';
  }
}

export function requireSupabaseEnv(): SupabaseEnv {
  const result = getSupabaseEnv();
  if (!result.ok) throw new SupabaseConfigurationError(result.variables);
  return result.value;
}