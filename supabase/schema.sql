-- ====================================================================
-- SAMPADA (સંપદા) - ROAD & BUILDING ASSET LIFECYCLE MANAGEMENT SYSTEM
-- PostgreSQL Schema, Triggers, RLS Policies & Storage Configuration
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'officer', 'inspector', 'viewer')) DEFAULT 'viewer',
    scope_asset_type TEXT NOT NULL CHECK (scope_asset_type IN ('all', 'road', 'building')) DEFAULT 'all',
    scope_sector TEXT NOT NULL DEFAULT 'all',
    department TEXT NOT NULL DEFAULT 'Roads & Buildings Department',
    district TEXT NOT NULL DEFAULT 'Gandhinagar',
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. LIFECYCLE STAGES TABLE (11 Fixed Stages)
CREATE TABLE IF NOT EXISTS public.lifecycle_stages (
    stage_no INT PRIMARY KEY CHECK (stage_no BETWEEN 1 AND 11),
    name TEXT NOT NULL,
    phase_group TEXT NOT NULL CHECK (phase_group IN ('Planning & Approval', 'Construction', 'Handover', 'In Service', 'End of Life')),
    description TEXT NOT NULL,
    is_in_service BOOLEAN NOT NULL DEFAULT false,
    requires_amount BOOLEAN NOT NULL DEFAULT false,
    amount_label TEXT,
    reference_label TEXT
);

-- Insert 11 Lifecycle Stages
INSERT INTO public.lifecycle_stages (stage_no, name, phase_group, description, is_in_service, requires_amount, amount_label, reference_label) VALUES
(1, 'Proposed', 'Planning & Approval', 'Initial infrastructure proposal submitted for feasibility evaluation.', false, false, NULL, 'Proposal Ref No.'),
(2, 'Administrative Approval', 'Planning & Approval', 'Formal Administrative Approval (AA) granted with sanctioned budget.', false, true, 'Sanctioned AA Amount (₹)', 'AA Order No.'),
(3, 'Technical Sanction', 'Planning & Approval', 'Technical Sanction (TS) design and detailed engineering estimate approved.', false, true, 'Technical Sanction Amount (₹)', 'TS Approval No.'),
(4, 'Tender / Work Order', 'Planning & Approval', 'Tender awarded and official Work Order issued to contractor.', false, true, 'Contract / Work Order Amount (₹)', 'Work Order / Tender No.'),
(5, 'Under Construction', 'Construction', 'Physical civil construction / road laying in active progress.', false, false, NULL, 'Construction Site Reg No.'),
(6, 'Completed', 'Construction', 'Civil construction completed; quality measurement book audit executed.', false, false, NULL, 'Completion Certificate No.'),
(7, 'Handed Over', 'Handover', 'Formal handover to operating municipal wing / department executed.', false, false, NULL, 'Handover Order No.'),
(8, 'Operational', 'In Service', 'Asset in active public service and normal operating condition.', true, false, NULL, 'Operation Log No.'),
(9, 'Under Maintenance', 'In Service', 'Active repair, resurfacing, or structural maintenance ongoing.', true, true, 'Maintenance Contract Amount (₹)', 'Maintenance Work Order No.'),
(10, 'Needs Attention', 'In Service', 'Distress or critical vulnerability flagged; awaiting maintenance tender.', true, false, NULL, 'Inspection Audit No.'),
(11, 'Retired', 'End of Life', 'Asset permanently decommissioned or demolished.', false, false, NULL, 'Decommission Order No.')
ON CONFLICT (stage_no) DO NOTHING;

-- 4. STAGE REQUIRED DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.stage_required_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_no INT NOT NULL REFERENCES public.lifecycle_stages(stage_no) ON DELETE CASCADE,
    doc_type TEXT NOT NULL,
    label TEXT NOT NULL,
    description TEXT NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Required Documents for Stages
INSERT INTO public.stage_required_documents (stage_no, doc_type, label, description, is_mandatory) VALUES
(2, 'ADMINISTRATIVE_APPROVAL', 'Administrative Approval (AA) Order', 'Signed Government Order granting Administrative Approval with budget allocation.', true),
(3, 'TECHNICAL_SANCTION', 'Technical Sanction (TS) Report', 'Detailed engineering estimate and structural design sanction letter.', true),
(4, 'WORK_ORDER', 'Contract Agreement & Work Order', 'Awarded contractor agreement and official Work Order.', true),
(5, 'SITE_INSPECTION_PHOTO', 'Groundbreaking & Site Photos', 'Geotagged site photographs prior to construction start.', true),
(6, 'COMPLETION_CERTIFICATE', 'Work Completion Certificate', 'Signed completion certificate by Executive Engineer.', true),
(6, 'MEASUREMENT_BOOK', 'Measurement Book (MB) Excerpt', 'MB entry summary signed by site auditor.', true),
(7, 'HANDOVER_LETTER', 'Handover & Takeover Letter', 'Signed handover letter between R&B construction wing and operating department.', true),
(8, 'SAFETY_CLEARANCE', 'Public Safety Clearance', 'Quality test and road friction / structural safety clearance.', true),
(9, 'DAMAGE_REPORT', 'Damage Assessment & Defect Audit', 'Detailed defect audit report specifying required repair works.', true),
(9, 'MAINTENANCE_WORK_ORDER', 'Maintenance Repair Work Order', 'Approved maintenance contract or tender order.', true),
(10, 'DISTRESS_SURVEY', 'Critical Distress Inspection Report', 'Inspector audit highlighting safety risks or severe pavement rutting.', true),
(11, 'DECOMMISSION_ORDER', 'Decommissioning Sanction', 'High-level committee approval order for asset retirement.', true)
ON CONFLICT DO NOTHING;

-- 5. ASSETS TABLE
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('road', 'building')),
    sub_type TEXT NOT NULL,
    current_stage_no INT NOT NULL REFERENCES public.lifecycle_stages(stage_no) DEFAULT 1,
    current_condition TEXT NOT NULL CHECK (current_condition IN ('Good', 'Fair', 'Poor', 'Critical', 'Not Assessed')) DEFAULT 'Not Assessed',
    pending_target_stage_no INT REFERENCES public.lifecycle_stages(stage_no),
    location_district TEXT NOT NULL DEFAULT 'Gandhinagar',
    location_sector TEXT NOT NULL DEFAULT 'sector_11',
    location_address TEXT NOT NULL,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    estimated_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    construction_year INT NOT NULL DEFAULT 2024,
    managing_department TEXT NOT NULL DEFAULT 'Roads & Buildings Department, Gandhinagar',
    assigned_officer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_officer_name TEXT NOT NULL DEFAULT 'Unassigned Officer',
    description TEXT,
    specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Assets
CREATE INDEX IF NOT EXISTS idx_assets_type ON public.assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_assets_stage ON public.assets(current_stage_no);
CREATE INDEX IF NOT EXISTS idx_assets_condition ON public.assets(current_condition);
CREATE INDEX IF NOT EXISTS idx_assets_sector ON public.assets(location_sector);

-- 6. ASSET LIFECYCLE HISTORY TABLE (Audit Trail & Status Verification Requests)
CREATE TABLE IF NOT EXISTS public.asset_lifecycle_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    from_stage_no INT REFERENCES public.lifecycle_stages(stage_no),
    to_stage_no INT NOT NULL REFERENCES public.lifecycle_stages(stage_no),
    previous_condition TEXT,
    target_condition TEXT,
    verification_status TEXT NOT NULL CHECK (verification_status IN ('Pending', 'Verified', 'Rejected')) DEFAULT 'Pending',
    reference_number TEXT,
    amount NUMERIC(15, 2),
    effective_date DATE DEFAULT CURRENT_DATE,
    remarks TEXT NOT NULL,
    requested_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    requested_by_name TEXT NOT NULL,
    requested_by_role TEXT NOT NULL,
    verified_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_by_name TEXT,
    verified_by_role TEXT,
    verified_at TIMESTAMPTZ,
    rejection_remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_asset ON public.asset_lifecycle_history(asset_id);
CREATE INDEX IF NOT EXISTS idx_history_status ON public.asset_lifecycle_history(verification_status);

-- 7. ASSET DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.asset_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    history_id UUID REFERENCES public.asset_lifecycle_history(id) ON DELETE CASCADE,
    stage_no INT NOT NULL REFERENCES public.lifecycle_stages(stage_no),
    doc_type TEXT NOT NULL,
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('image', 'document')),
    file_size INT,
    uploaded_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    uploaded_by_name TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_asset ON public.asset_documents(asset_id);
CREATE INDEX IF NOT EXISTS idx_documents_history ON public.asset_documents(history_id);

-- 8. CONDITION LOGS TABLE
CREATE TABLE IF NOT EXISTS public.condition_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    previous_condition TEXT NOT NULL,
    new_condition TEXT NOT NULL CHECK (new_condition IN ('Good', 'Fair', 'Poor', 'Critical')),
    remarks TEXT NOT NULL,
    photos JSONB NOT NULL DEFAULT '[]'::jsonb,
    recorded_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recorded_by_name TEXT NOT NULL,
    recorded_by_role TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_condition_asset ON public.condition_logs(asset_id);

-- --------------------------------------------------------------------
-- 9. TRIGGERS & AUTOMATION
-- --------------------------------------------------------------------

-- Auto Profile Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, scope_asset_type, scope_sector, department, district)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'officer'),
        COALESCE(NEW.raw_user_meta_data->>'scope_asset_type', 'all'),
        COALESCE(NEW.raw_user_meta_data->>'scope_sector', 'all'),
        COALESCE(NEW.raw_user_meta_data->>'department', 'Roads & Buildings Department'),
        'Gandhinagar'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: When history row is Verified -> Update asset.current_stage_no and current_condition
CREATE OR REPLACE FUNCTION public.handle_history_verification()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.verification_status = 'Verified' AND OLD.verification_status <> 'Verified') THEN
        -- Allow database update of current_stage_no and condition
        UPDATE public.assets
        SET
            current_stage_no = NEW.to_stage_no,
            current_condition = COALESCE(NEW.target_condition, current_condition, 'Good'),
            pending_target_stage_no = NULL,
            updated_at = NOW()
        WHERE id = NEW.asset_id;
    ELSIF (NEW.verification_status = 'Rejected' AND OLD.verification_status <> 'Rejected') THEN
        UPDATE public.assets
        SET
            pending_target_stage_no = NULL,
            updated_at = NOW()
        WHERE id = NEW.asset_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_history_verification ON public.asset_lifecycle_history;
CREATE TRIGGER trigger_history_verification
    AFTER UPDATE ON public.asset_lifecycle_history
    FOR EACH ROW EXECUTE FUNCTION public.handle_history_verification();

-- Trigger: Update asset condition from condition_logs
CREATE OR REPLACE FUNCTION public.handle_condition_log_inserted()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.assets
    SET
        current_condition = NEW.new_condition,
        updated_at = NOW()
    WHERE id = NEW.asset_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_condition_log ON public.condition_logs;
CREATE TRIGGER trigger_condition_log
    AFTER INSERT ON public.condition_logs
    FOR EACH ROW EXECUTE FUNCTION public.handle_condition_log_inserted();

-- --------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifecycle_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_required_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_lifecycle_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condition_logs ENABLE ROW LEVEL SECURITY;

-- Read Access: Authenticated & Anon
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Public stages read" ON public.lifecycle_stages FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Public req docs read" ON public.stage_required_documents FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Public assets read" ON public.assets FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Public history read" ON public.asset_lifecycle_history FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Public documents read" ON public.asset_documents FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Public condition logs read" ON public.condition_logs FOR SELECT TO authenticated, anon USING (true);

-- Write Access: Authenticated Users
CREATE POLICY "Auth write profiles" ON public.profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth write stages" ON public.lifecycle_stages FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth write req docs" ON public.stage_required_documents FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth write assets" ON public.assets FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth write history" ON public.asset_lifecycle_history FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth write documents" ON public.asset_documents FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth write condition logs" ON public.condition_logs FOR ALL TO authenticated USING (true);

-- --------------------------------------------------------------------
-- 11. STORAGE BUCKET CONFIGURATION (asset-documents)
-- --------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('asset-documents', 'asset-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Storage Select Policy" ON storage.objects FOR SELECT TO authenticated, anon USING (bucket_id = 'asset-documents');
CREATE POLICY "Storage Insert Policy" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'asset-documents');
