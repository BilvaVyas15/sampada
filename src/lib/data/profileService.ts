import { createClient } from '@/lib/supabase/client';

export type ProfileRole = 'admin' | 'officer' | 'inspector' | 'viewer';

export interface AppProfile {
  id: string;
  email: string;
  full_name: string;
  role: ProfileRole;
  department: string;
  district: string;
  scope_asset_type: string;
  scope_sector: string;
  is_active: boolean;
}

export async function getProfileById(userId: string): Promise<AppProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, department, district, scope_asset_type, scope_sector, is_active')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as AppProfile | null;
}

export async function getCurrentProfile(): Promise<AppProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) return null;
  return getProfileById(data.user.id);
}