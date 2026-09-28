-- ====================================================================
-- SAMPADA Demo Users Setup
-- Run this in Supabase SQL Editor AFTER running schema.sql and seed.sql
-- 
-- IMPORTANT: These are demo users for hackathon/demo purposes only.
-- In production, create users via Supabase Auth Dashboard and add profiles.
--
-- Step 1: Go to Supabase Dashboard → Authentication → Users → Add User
-- Create the following users manually:
--   admin@sampada.demo    password: Demo1234!
--   officer@sampada.demo  password: Demo1234!
--   inspector@sampada.demo password: Demo1234!
--   viewer@sampada.demo   password: Demo1234!
--
-- Step 2: After creating users in Auth, run this SQL replacing the UUIDs
-- with the actual UUIDs from the Auth dashboard.
-- ====================================================================

-- NOTE: Replace the UUIDs below with actual auth.users IDs after creating the users
-- You can find UUIDs in: Supabase Dashboard → Authentication → Users

-- Demo Admin User
INSERT INTO public.profiles (id, email, full_name, role, scope_asset_type, scope_sector, department, district, is_active)
SELECT 
  id,
  'admin@sampada.demo',
  'Demo Admin',
  'admin',
  'all',
  'all',
  'Roads & Buildings Department, Gandhinagar',
  'Gandhinagar',
  true
FROM auth.users WHERE email = 'admin@sampada.demo'
ON CONFLICT (id) DO UPDATE SET 
  full_name = 'Demo Admin',
  role = 'admin',
  is_active = true;

-- Demo Officer A
INSERT INTO public.profiles (id, email, full_name, role, scope_asset_type, scope_sector, department, district, is_active)
SELECT 
  id,
  'officer@sampada.demo',
  'Demo Officer A',
  'officer',
  'all',
  'all',
  'Roads & Buildings Department, Gandhinagar',
  'Gandhinagar',
  true
FROM auth.users WHERE email = 'officer@sampada.demo'
ON CONFLICT (id) DO UPDATE SET 
  full_name = 'Demo Officer A',
  role = 'officer',
  is_active = true;

-- Demo Inspector
INSERT INTO public.profiles (id, email, full_name, role, scope_asset_type, scope_sector, department, district, is_active)
SELECT 
  id,
  'inspector@sampada.demo',
  'Demo Inspector',
  'inspector',
  'all',
  'all',
  'Roads & Buildings Department, Gandhinagar',
  'Gandhinagar',
  true
FROM auth.users WHERE email = 'inspector@sampada.demo'
ON CONFLICT (id) DO UPDATE SET 
  full_name = 'Demo Inspector',
  role = 'inspector',
  is_active = true;

-- Demo Viewer
INSERT INTO public.profiles (id, email, full_name, role, scope_asset_type, scope_sector, department, district, is_active)
SELECT 
  id,
  'viewer@sampada.demo',
  'Demo Viewer',
  'viewer',
  'all',
  'all',
  'Roads & Buildings Department, Gandhinagar',
  'Gandhinagar',
  true
FROM auth.users WHERE email = 'viewer@sampada.demo'
ON CONFLICT (id) DO UPDATE SET 
  full_name = 'Demo Viewer',
  role = 'viewer',
  is_active = true;

-- Verify profiles were created
SELECT id, email, full_name, role, is_active FROM public.profiles ORDER BY role;
