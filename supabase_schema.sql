-- ====================================================================
-- SAMPADA - INFRASTRUCTURE ASSET LIFECYCLE MANAGEMENT SYSTEM (GANDHINAGAR)
-- Supabase PostgreSQL Schema & Security Policies
-- ====================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. PROFILES TABLE (User Roles & Department Mapping)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Officer', 'Inspector', 'Viewer')) DEFAULT 'Viewer',
    department TEXT NOT NULL DEFAULT 'Roads & Buildings Department, Gandhinagar',
    district TEXT NOT NULL DEFAULT 'Gandhinagar',
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for profile queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- --------------------------------------------------------------------
-- 2. ASSETS TABLE (Road & Building Master Records - Gandhinagar)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('Road', 'Building')),
    sub_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN (
        'Planned',
        'Under Construction',
        'Completed',
        'Operational',
        'Under Maintenance',
        'Needs Attention',
        'Retired'
    )) DEFAULT 'Operational',
    condition TEXT NOT NULL CHECK (condition IN (
        'Good',
        'Fair',
        'Poor',
        'Critical'
    )) DEFAULT 'Good',
    pending_target_status TEXT CHECK (pending_target_status IN (
        'Planned',
        'Under Construction',
        'Completed',
        'Operational',
        'Under Maintenance',
        'Needs Attention',
        'Retired'
    )),
    location_district TEXT NOT NULL DEFAULT 'Gandhinagar',
    location_taluka TEXT NOT NULL DEFAULT 'Gandhinagar City',
    location_address TEXT NOT NULL,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    estimated_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    actual_cost NUMERIC(15, 2) DEFAULT 0.00,
    construction_year INT NOT NULL,
    managing_department TEXT NOT NULL DEFAULT 'R&B Department, Gandhinagar Circle',
    assigned_officer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_officer_name TEXT NOT NULL DEFAULT 'Unassigned Nodal Officer',
    assigned_officer_contact TEXT,
    description TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    photos JSONB DEFAULT '[]'::jsonb,
    documents JSONB DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_assets_type ON public.assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_condition ON public.assets(condition);
CREATE INDEX IF NOT EXISTS idx_assets_district ON public.assets(location_district);
CREATE INDEX IF NOT EXISTS idx_assets_code ON public.assets(asset_code);

-- --------------------------------------------------------------------
-- 3. ASSET DOCUMENTS TABLE (Document-Driven Verification System)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.asset_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    history_id UUID,
    doc_type TEXT NOT NULL,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('image', 'document')),
    file_size INT,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    uploaded_by_name TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    verification_status TEXT NOT NULL CHECK (verification_status IN ('Pending', 'Verified', 'Rejected')) DEFAULT 'Pending',
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_by_name TEXT,
    verified_at TIMESTAMPTZ,
    verification_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_documents_asset_id ON public.asset_documents(asset_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.asset_documents(verification_status);

-- --------------------------------------------------------------------
-- 4. ASSET LIFECYCLE HISTORY TABLE (Audit Trail & Status Tracking)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.asset_lifecycle_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    previous_status TEXT,
    target_status TEXT NOT NULL,
    actual_status TEXT NOT NULL,
    previous_condition TEXT,
    new_condition TEXT NOT NULL,
    action_type TEXT NOT NULL DEFAULT 'STATUS_CHANGE_REQUEST',
    verification_status TEXT NOT NULL CHECK (verification_status IN ('Pending', 'Verified', 'Rejected')) DEFAULT 'Pending',
    remarks TEXT NOT NULL,
    changed_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    changed_by_name TEXT NOT NULL,
    changed_by_role TEXT NOT NULL DEFAULT 'Officer',
    verified_by_name TEXT,
    verified_by_role TEXT,
    verification_notes TEXT,
    attached_documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_asset_id ON public.asset_lifecycle_history(asset_id);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON public.asset_lifecycle_history(created_at DESC);

-- --------------------------------------------------------------------
-- 5. AUTOMATIC TRIGGERS & FUNCTIONS
-- --------------------------------------------------------------------

-- Function: Handle user signup profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, department, district)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'Officer'),
        COALESCE(NEW.raw_user_meta_data->>'department', 'Roads & Buildings Department, Gandhinagar'),
        'Gandhinagar'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Fire on auth.users creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_assets_timestamp ON public.assets;
CREATE TRIGGER trigger_update_assets_timestamp
    BEFORE UPDATE ON public.assets
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- --------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_lifecycle_history ENABLE ROW LEVEL SECURITY;

-- Read Access: All Authenticated & Anonymous
CREATE POLICY "Public profiles reading" ON public.profiles FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Anyone can view assets" ON public.assets FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Anyone can view documents" ON public.asset_documents FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Anyone can view history" ON public.asset_lifecycle_history FOR SELECT TO authenticated, anon USING (true);

-- Insert/Update Policies (Admin, Officer, Inspector)
CREATE POLICY "Authorized write assets" ON public.assets FOR ALL TO authenticated USING (true);
CREATE POLICY "Authorized write documents" ON public.asset_documents FOR ALL TO authenticated USING (true);
CREATE POLICY "Authorized write history" ON public.asset_lifecycle_history FOR ALL TO authenticated USING (true);

-- --------------------------------------------------------------------
-- 7. STORAGE BUCKET SETUP (asset-documents)
-- --------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES
    ('asset-documents', 'asset-documents', true),
    ('asset-files', 'asset-files', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access for Asset Documents" ON storage.objects FOR SELECT TO public USING (bucket_id IN ('asset-documents', 'asset-files'));
CREATE POLICY "Authenticated Users Upload Asset Documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('asset-documents', 'asset-files'));
