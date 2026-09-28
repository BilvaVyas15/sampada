import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSupabaseEnv } from '@/lib/env';

export async function GET() {
  if (!getSupabaseEnv().ok) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from('lifecycle_stages').select('stage_no').limit(1);
    return NextResponse.json({ ok: !error }, { status: error ? 503 : 200 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}