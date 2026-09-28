import { createClient } from '@/lib/supabase/client';
import {
  Asset,
  AssetCondition,
  AssetDocument,
  AssetFilterState,
  AssetLifecycleHistory,
  AssetStatus,
  DashboardMetrics,
  DocumentVerificationStatus,
  getRequiredDocumentsForTransition,
  UserProfile,
  UserRole,
} from '@/types';
import {
  INITIAL_MOCK_ASSETS,
  INITIAL_MOCK_HISTORY,
  INITIAL_MOCK_PROFILES,
} from './mockAssets';

const STORAGE_KEY_ASSETS = 'sampada_assets_v2';
const STORAGE_KEY_HISTORY = 'sampada_history_v2';
const STORAGE_KEY_ACTIVE_ROLE = 'sampada_demo_role_v2';

// Helper to check if Supabase is properly configured with real credentials
function isSupabaseConfigured(): boolean {
  if (
    typeof document !== 'undefined' &&
    document.cookie.split('; ').some((cookie) => cookie.startsWith('sampada_local_demo='))
  ) {
    return false;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes('placeholder') &&
      url.startsWith('https://') &&
      key.length > 20
  );
}

// LocalStorage helpers for demo/fallback mode
function getLocalAssets(): Asset[] {
  if (typeof window === 'undefined') return INITIAL_MOCK_ASSETS;
  try {
    const data = localStorage.getItem(STORAGE_KEY_ASSETS);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(INITIAL_MOCK_ASSETS));
      return INITIAL_MOCK_ASSETS;
    }
    return JSON.parse(data);
  } catch (err) {
    return INITIAL_MOCK_ASSETS;
  }
}

function saveLocalAssets(assets: Asset[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(assets));
  } catch (err) {
    console.error('Failed to save assets to localStorage', err);
  }
}

function getLocalHistory(): AssetLifecycleHistory[] {
  if (typeof window === 'undefined') return INITIAL_MOCK_HISTORY;
  try {
    const data = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(INITIAL_MOCK_HISTORY));
      return INITIAL_MOCK_HISTORY;
    }
    return JSON.parse(data);
  } catch (err) {
    return INITIAL_MOCK_HISTORY;
  }
}

function saveLocalHistory(history: AssetLifecycleHistory[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  } catch (err) {
    console.error('Failed to save history to localStorage', err);
  }
}

// Get active demo user profile
export function getActiveUser(): UserProfile {
  if (typeof window === 'undefined') return INITIAL_MOCK_PROFILES[0];
  try {
    const savedRole = localStorage.getItem(STORAGE_KEY_ACTIVE_ROLE) as UserRole | null;
    if (savedRole) {
      const found = INITIAL_MOCK_PROFILES.find((p) => p.role === savedRole);
      if (found) return found;
    }
  } catch (e) {
    // Ignore error
  }
  return INITIAL_MOCK_PROFILES[0];
}

export function setActiveUserRole(role: UserRole): UserProfile {
  const profile = INITIAL_MOCK_PROFILES.find((p) => p.role === role) || INITIAL_MOCK_PROFILES[0];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ROLE, role);
  }
  return profile;
}

// Data Fetching Service Functions
export async function getAssets(filters?: Partial<AssetFilterState>): Promise<Asset[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      let query = supabase.from('assets').select('*');

      if (filters?.assetType && filters.assetType !== 'ALL') {
        query = query.eq('asset_type', filters.assetType);
      }
      if (filters?.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status);
      }
      if (filters?.condition && filters.condition !== 'ALL') {
        query = query.eq('condition', filters.condition);
      }
      if (filters?.subType && filters.subType !== 'ALL') {
        query = query.eq('sub_type', filters.subType);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        let result = data as Asset[];
        if (filters?.pendingVerificationOnly) {
          result = result.filter((a) => Boolean(a.pending_target_status));
        }
        if (filters?.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          result = result.filter(
            (a) =>
              a.title.toLowerCase().includes(q) ||
              a.asset_code.toLowerCase().includes(q) ||
              a.location_address.toLowerCase().includes(q) ||
              a.managing_department.toLowerCase().includes(q)
          );
        }
        return result;
      }
    } catch (err) {
      console.warn('Supabase query failed, falling back to local store', err);
    }
  }

  // Local / Fallback path
  let assets = getLocalAssets();

  if (filters) {
    if (filters.assetType && filters.assetType !== 'ALL') {
      assets = assets.filter((a) => a.asset_type === filters.assetType);
    }
    if (filters.status && filters.status !== 'ALL') {
      assets = assets.filter((a) => a.status === filters.status);
    }
    if (filters.condition && filters.condition !== 'ALL') {
      assets = assets.filter((a) => a.condition === filters.condition);
    }
    if (filters.subType && filters.subType !== 'ALL') {
      assets = assets.filter((a) => a.sub_type === filters.subType);
    }
    if (filters.pendingVerificationOnly) {
      assets = assets.filter((a) => Boolean(a.pending_target_status));
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      assets = assets.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.asset_code.toLowerCase().includes(q) ||
          a.location_address.toLowerCase().includes(q) ||
          a.managing_department.toLowerCase().includes(q)
      );
    }

    if (filters.sortBy) {
      const field = filters.sortBy;
      const isAsc = filters.sortOrder === 'asc';
      assets = [...assets].sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        if (typeof valA === 'number' && typeof valB === 'number') {
          if (valA < valB) return isAsc ? -1 : 1;
          if (valA > valB) return isAsc ? 1 : -1;
          return 0;
        }
        const comparableA = String(valA ?? '').toLowerCase();
        const comparableB = String(valB ?? '').toLowerCase();
        if (comparableA < comparableB) return isAsc ? -1 : 1;
        if (comparableA > comparableB) return isAsc ? 1 : -1;
        return 0;
      });
    }
  }

  return assets;
}

export async function getAssetById(id: string): Promise<Asset | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('assets').select('*').eq('id', id).single();
      if (!error && data) return data as Asset;
    } catch (err) {
      console.warn('Supabase getAssetById failed, using local store', err);
    }
  }

  const assets = getLocalAssets();
  return assets.find((a) => a.id === id) || null;
}

export async function createAsset(
  assetData: Omit<Asset, 'id' | 'created_at' | 'updated_at'>,
  user?: UserProfile
): Promise<Asset> {
  const currentUser = user || getActiveUser();
  const now = new Date().toISOString();
  const id = typeof crypto !== 'undefined' ? crypto.randomUUID() : 'asset-' + Date.now();

  const newAsset: Asset = {
    ...assetData,
    id,
    location_district: 'Gandhinagar',
    created_by: currentUser.id,
    created_at: now,
    updated_at: now,
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('assets').insert([newAsset]).select().single();
      if (!error && data) {
        return data as Asset;
      }
    } catch (err) {
      console.warn('Supabase createAsset failed, saving locally', err);
    }
  }

  // Local fallback
  const assets = getLocalAssets();
  const updatedAssets = [newAsset, ...assets];
  saveLocalAssets(updatedAssets);

  // Add initial history record
  const initialHistory: AssetLifecycleHistory = {
    id: 'hist-' + Date.now(),
    asset_id: newAsset.id,
    previous_status: null,
    target_status: newAsset.status,
    actual_status: newAsset.status,
    previous_condition: null,
    new_condition: newAsset.condition,
    action_type: 'ASSET_CREATED',
    verification_status: 'Verified',
    remarks: 'Asset registered in Sampada Gandhinagar directory.',
    changed_by_name: currentUser.full_name,
    changed_by_role: currentUser.role,
    attached_documents: newAsset.documents || [],
    created_at: now,
  };
  const history = getLocalHistory();
  saveLocalHistory([initialHistory, ...history]);

  return newAsset;
}

export async function updateAsset(
  id: string,
  assetData: Partial<Asset>,
  user?: UserProfile
): Promise<Asset> {
  const currentUser = user || getActiveUser();
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('assets')
        .update({ ...assetData, updated_at: now })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as Asset;
    } catch (err) {
      console.warn('Supabase updateAsset failed, using local store', err);
    }
  }

  const assets = getLocalAssets();
  const index = assets.findIndex((a) => a.id === id);
  if (index === -1) throw new Error('Asset not found');

  const updated: Asset = {
    ...assets[index],
    ...assetData,
    updated_at: now,
  };
  assets[index] = updated;
  saveLocalAssets(assets);

  return updated;
}

/**
 * CORE DOCUMENT-DRIVEN LIFECYCLE WORKFLOW
 * 1. Submit Status Change Request with Required Audit Documents
 */
export async function submitStatusChangeRequest(
  assetId: string,
  targetStatus: AssetStatus,
  newCondition: AssetCondition,
  remarks: string,
  uploadedDocuments: AssetDocument[],
  user?: UserProfile
): Promise<{ asset: Asset; history: AssetLifecycleHistory }> {
  const currentUser = user || getActiveUser();
  const now = new Date().toISOString();

  const currentAsset = await getAssetById(assetId);
  if (!currentAsset) throw new Error('Asset not found');

  const requiredChecks = getRequiredDocumentsForTransition(currentAsset.status, targetStatus);
  const mandatoryTypes = requiredChecks.filter((c) => c.is_mandatory).map((c) => c.doc_type);

  // Validate that mandatory documents are uploaded
  const uploadedTypes = uploadedDocuments.map((d) => d.doc_type);
  const missingMandatory = mandatoryTypes.filter((type) => !uploadedTypes.includes(type));

  if (missingMandatory.length > 0) {
    const missingLabels = requiredChecks
      .filter((c) => missingMandatory.includes(c.doc_type))
      .map((c) => c.label)
      .join(', ');
    throw new Error(
      `Document Verification Required: Please upload mandatory compliance documents: ${missingLabels}`
    );
  }

  // Tag documents as Pending verification
  const pendingDocs: AssetDocument[] = uploadedDocuments.map((doc) => ({
    ...doc,
    asset_id: assetId,
    verification_status: 'Pending',
    uploaded_by: currentUser.id,
    uploaded_by_name: currentUser.full_name,
    uploaded_at: now,
  }));

  const historyRecord: AssetLifecycleHistory = {
    id: 'hist-' + Date.now(),
    asset_id: assetId,
    previous_status: currentAsset.status,
    target_status: targetStatus,
    actual_status: currentAsset.status, // Status remains unchanged until verified!
    previous_condition: currentAsset.condition,
    new_condition: newCondition,
    action_type: 'STATUS_CHANGE_REQUEST',
    verification_status: 'Pending',
    remarks,
    changed_by_id: currentUser.id,
    changed_by_name: currentUser.full_name,
    changed_by_role: currentUser.role,
    verification_notes: 'Pending document verification by Superintending Engineer / Executive Officer.',
    attached_documents: pendingDocs,
    created_at: now,
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      await supabase
        .from('assets')
        .update({
          pending_target_status: targetStatus,
          updated_at: now,
        })
        .eq('id', assetId);

      await supabase.from('asset_lifecycle_history').insert([historyRecord]);
      if (pendingDocs.length > 0) {
        await supabase.from('asset_documents').insert(pendingDocs);
      }
    } catch (err) {
      console.warn('Supabase submitStatusChangeRequest failed, using local store', err);
    }
  }

  // Local fallback
  const assets = getLocalAssets();
  const idx = assets.findIndex((a) => a.id === assetId);
  if (idx !== -1) {
    assets[idx] = {
      ...assets[idx],
      pending_target_status: targetStatus,
      documents: [...(assets[idx].documents || []), ...pendingDocs],
      updated_at: now,
    };
    saveLocalAssets(assets);
  }

  const historyLogs = getLocalHistory();
  saveLocalHistory([historyRecord, ...historyLogs]);

  return { asset: assets[idx] || currentAsset, history: historyRecord };
}

/**
 * CORE VERIFICATION ACTION
 * 2. Verify or Reject Document-Driven Status Change Request
 */
export async function verifyDocumentAndTransition(
  historyId: string,
  action: 'APPROVE' | 'REJECT',
  verificationNotes: string,
  user?: UserProfile
): Promise<{ asset: Asset; history: AssetLifecycleHistory }> {
  const currentUser = user || getActiveUser();
  const now = new Date().toISOString();

  const historyLogs = getLocalHistory();
  const histIdx = historyLogs.findIndex((h) => h.id === historyId);
  if (histIdx === -1) throw new Error('Lifecycle history request record not found');

  const targetHist = historyLogs[histIdx];
  const asset = await getAssetById(targetHist.asset_id);
  if (!asset) throw new Error('Asset record not found');

  const newVerifStatus: DocumentVerificationStatus = action === 'APPROVE' ? 'Verified' : 'Rejected';

  let updatedAsset: Asset = asset;

  if (action === 'APPROVE') {
    // Transition status and condition
    updatedAsset = {
      ...asset,
      status: targetHist.target_status,
      condition: targetHist.new_condition,
      pending_target_status: null,
      updated_at: now,
    };
  } else {
    // Reject request: Clear pending target status, keep actual status
    updatedAsset = {
      ...asset,
      pending_target_status: null,
      updated_at: now,
    };
  }

  // Update history record
  const updatedHistory: AssetLifecycleHistory = {
    ...targetHist,
    actual_status: action === 'APPROVE' ? targetHist.target_status : asset.status,
    verification_status: newVerifStatus,
    action_type: action === 'APPROVE' ? 'DOCUMENT_VERIFIED' : 'DOCUMENT_REJECTED',
    verified_by_name: currentUser.full_name,
    verified_by_role: currentUser.role,
    verification_notes: verificationNotes || (action === 'APPROVE' ? 'Documents verified and approved.' : 'Rejected due to incomplete documentation.'),
    attached_documents: targetHist.attached_documents.map((d) => ({
      ...d,
      verification_status: newVerifStatus,
      verified_by_name: currentUser.full_name,
      verified_at: now,
      verification_notes: verificationNotes,
    })),
    updated_at: now,
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      await supabase
        .from('assets')
        .update({
          status: updatedAsset.status,
          condition: updatedAsset.condition,
          pending_target_status: null,
          updated_at: now,
        })
        .eq('id', asset.id);

      await supabase
        .from('asset_lifecycle_history')
        .update({
          actual_status: updatedHistory.actual_status,
          verification_status: newVerifStatus,
          action_type: updatedHistory.action_type,
          verified_by_name: currentUser.full_name,
          verification_notes: verificationNotes,
          updated_at: now,
        })
        .eq('id', historyId);
    } catch (err) {
      console.warn('Supabase verifyDocumentAndTransition failed, using local store', err);
    }
  }

  // Save to local store
  const assets = getLocalAssets();
  const aIdx = assets.findIndex((a) => a.id === asset.id);
  if (aIdx !== -1) {
    assets[aIdx] = updatedAsset;
    saveLocalAssets(assets);
  }

  historyLogs[histIdx] = updatedHistory;
  saveLocalHistory(historyLogs);

  return { asset: updatedAsset, history: updatedHistory };
}

export async function getAssetLifecycleHistory(assetId: string): Promise<AssetLifecycleHistory[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('asset_lifecycle_history')
        .select('*')
        .eq('asset_id', assetId)
        .order('created_at', { ascending: false });

      if (!error && data) return data as AssetLifecycleHistory[];
    } catch (err) {
      console.warn('Supabase getAssetLifecycleHistory failed, using local store', err);
    }
  }

  const allHistory = getLocalHistory();
  return allHistory
    .filter((h) => h.asset_id === assetId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const assets = await getAssets();
  const history = getLocalHistory();

  const statusCounts: Record<AssetStatus, number> = {
    Planned: 0,
    'Under Construction': 0,
    Completed: 0,
    Operational: 0,
    'Under Maintenance': 0,
    'Needs Attention': 0,
    Retired: 0,
  };

  const conditionCounts: Record<AssetCondition, number> = {
    Good: 0,
    Fair: 0,
    Poor: 0,
    Critical: 0,
  };

  let totalValuation = 0;
  let totalRoads = 0;
  let totalBuildings = 0;

  assets.forEach((asset) => {
    if (asset.status && statusCounts[asset.status] !== undefined) {
      statusCounts[asset.status]++;
    }
    if (asset.condition && conditionCounts[asset.condition] !== undefined) {
      conditionCounts[asset.condition]++;
    }
    if (asset.asset_type === 'Road') totalRoads++;
    if (asset.asset_type === 'Building') totalBuildings++;
    totalValuation += Number(asset.estimated_cost) || 0;
  });

  const pendingVerificationAssets = assets.filter((a) => Boolean(a.pending_target_status));
  const criticalAssets = assets.filter(
    (a) => a.condition === 'Critical' || a.status === 'Needs Attention' || a.condition === 'Poor'
  );

  return {
    totalAssets: assets.length,
    totalRoads,
    totalBuildings,
    totalValuation,
    statusCounts,
    conditionCounts,
    pendingVerificationCount: pendingVerificationAssets.length,
    needingAttentionCount: criticalAssets.length,
    recentHistory: history.slice(0, 10),
    pendingVerificationAssets,
    criticalAssets,
  };
}

export async function uploadAssetAttachment(file: File, docType = 'GENERAL_DOC'): Promise<AssetDocument> {
  const fileExt = file.name.split('.').pop() || 'file';
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const isImage = file.type.startsWith('image/');
  const currentUser = getActiveUser();

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const bucketName = 'asset-documents';
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        return {
          id: 'doc-' + Date.now(),
          asset_id: '',
          doc_type: docType,
          title: file.name,
          file_url: publicUrlData.publicUrl,
          file_type: isImage ? 'image' : 'document',
          file_size: file.size,
          uploaded_by: currentUser.id,
          uploaded_by_name: currentUser.full_name,
          uploaded_at: new Date().toISOString(),
          verification_status: 'Pending',
        };
      }
    } catch (err) {
      console.warn('Supabase storage upload failed, fallback to local URL preview', err);
    }
  }

  // Local fallback preview URL using Blob URL
  const objectUrl = typeof window !== 'undefined' ? URL.createObjectURL(file) : '#';
  return {
    id: 'doc-' + Date.now(),
    asset_id: '',
    doc_type: docType,
    title: file.name,
    file_url: objectUrl,
    file_type: isImage ? 'image' : 'document',
    file_size: file.size,
    uploaded_by: currentUser.id,
    uploaded_by_name: currentUser.full_name,
    uploaded_at: new Date().toISOString(),
    verification_status: 'Pending',
  };
}
