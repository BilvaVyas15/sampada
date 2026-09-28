import { createClient } from '@/lib/supabase/client';
import { getProfileById, type AppProfile } from '@/lib/data/profileService';
import { getAllowedNextStages, getLifecycleStage, LIFECYCLE_STAGES } from '@/lib/lifecycle';
import {
  Asset,
  AssetCondition,
  AssetDocument,
  AssetFilterState,
  AssetLifecycleHistory,
  AssetStatus,
  DashboardMetrics,
  DocumentVerificationStatus,
  RequiredDocumentCheck,
  UserRole,
} from '@/types';

type AssetRow = {
  id: string;
  asset_code: string;
  title: string;
  asset_type: 'road' | 'building';
  sub_type: string;
  current_stage_no: number;
  current_condition: string;
  pending_target_stage_no: number | null;
  location_district: string;
  location_sector: string;
  location_address: string;
  latitude: number | null;
  longitude: number | null;
  estimated_cost: number;
  construction_year: number;
  managing_department: string;
  assigned_officer_id: string | null;
  assigned_officer_name: string;
  description: string | null;
  specifications: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type HistoryRow = {
  id: string;
  asset_id: string;
  from_stage_no: number | null;
  to_stage_no: number;
  previous_condition: string | null;
  target_condition: string | null;
  verification_status: DocumentVerificationStatus;
  reference_number: string | null;
  amount: number | null;
  effective_date: string | null;
  remarks: string;
  requested_by_id: string | null;
  requested_by_name: string;
  requested_by_role: string;
  verified_by_id: string | null;
  verified_by_name: string | null;
  verified_by_role: string | null;
  verified_at: string | null;
  rejection_remarks: string | null;
  created_at: string;
  updated_at: string;
};

type DocumentRow = {
  id: string;
  asset_id: string;
  history_id: string | null;
  stage_no: number;
  doc_type: string;
  title: string;
  file_path: string;
  file_url: string;
  file_type: 'image' | 'document';
  file_size: number | null;
  uploaded_by_id: string | null;
  uploaded_by_name: string;
  uploaded_at: string;
};

async function getActor(): Promise<{ id: string; profile: AppProfile }> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Sign in is required to perform this action.');
  const profile = await getProfileById(data.user.id);
  if (!profile || !profile.is_active) throw new Error('Access restricted');
  return { id: data.user.id, profile };
}

function stageName(stageNo: number | null | undefined): AssetStatus {
  return getLifecycleStage(stageNo ?? 1)?.name ?? 'Proposed';
}

export function getStageNumberForStatus(status: AssetStatus): number {
  if (status === 'Planned') return 1;
  const stage = LIFECYCLE_STAGES.find((candidate) => candidate.name === status);
  if (!stage) throw new Error(`Unknown lifecycle stage: ${status}`);
  return stage.stageNo;
}

function mapAsset(row: AssetRow): Asset {
  return {
    id: row.id,
    current_stage_no: row.current_stage_no,
    asset_code: row.asset_code,
    title: row.title,
    asset_type: row.asset_type === 'building' ? 'Building' : 'Road',
    sub_type: row.sub_type,
    status: stageName(row.current_stage_no),
    condition: row.current_condition as AssetCondition,
    pending_target_status: row.pending_target_stage_no ? stageName(row.pending_target_stage_no) : null,
    location_district: row.location_district,
    location_sector: row.location_sector,
    location_taluka: row.location_sector,
    location_address: row.location_address,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    estimated_cost: Number(row.estimated_cost),
    construction_year: row.construction_year,
    managing_department: row.managing_department,
    assigned_officer_id: row.assigned_officer_id ?? undefined,
    assigned_officer_name: row.assigned_officer_name,
    description: row.description ?? '',
    specifications: row.specifications ?? {},
    photos: [],
    documents: [],
    created_by: row.created_by ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function roleLabel(role: string | null | undefined): UserRole {
  switch (role?.toLowerCase()) {
    case 'admin': return 'Admin';
    case 'inspector': return 'Inspector';
    case 'viewer': return 'Viewer';
    default: return 'Officer';
  }
}

function mapHistory(row: HistoryRow, documents: AssetDocument[] = []): AssetLifecycleHistory {
  const previousStatus = row.from_stage_no ? stageName(row.from_stage_no) : null;
  const targetStatus = stageName(row.to_stage_no);
  const status = row.verification_status;
  return {
    id: row.id,
    asset_id: row.asset_id,
    from_stage_no: row.from_stage_no,
    to_stage_no: row.to_stage_no,
    previous_status: previousStatus,
    target_status: targetStatus,
    actual_status: status === 'Verified' ? targetStatus : previousStatus ?? targetStatus,
    previous_condition: row.previous_condition as AssetCondition | null,
    new_condition: (row.target_condition ?? row.previous_condition ?? 'Not Assessed') as AssetCondition,
    action_type: status === 'Rejected' ? 'DOCUMENT_REJECTED' : status === 'Verified' ? 'DOCUMENT_VERIFIED' : 'STATUS_CHANGE_REQUEST',
    verification_status: status,
    reference_number: row.reference_number,
    amount: row.amount,
    effective_date: row.effective_date,
    remarks: row.remarks,
    changed_by_id: row.requested_by_id ?? undefined,
    changed_by_name: row.requested_by_name,
    changed_by_role: roleLabel(row.requested_by_role),
    verified_by_name: row.verified_by_name ?? undefined,
    verified_by_role: row.verified_by_role ? roleLabel(row.verified_by_role) : undefined,
    verified_at: row.verified_at,
    rejection_remarks: row.rejection_remarks,
    verification_notes: row.rejection_remarks ?? undefined,
    attached_documents: documents,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function mapDocument(row: DocumentRow, status: DocumentVerificationStatus = 'Pending'): Promise<AssetDocument> {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from('asset-documents').createSignedUrl(row.file_path, 3600);
  if (error) throw new Error(`Could not create a secure document link: ${error.message}`);
  return {
    id: row.id,
    asset_id: row.asset_id,
    history_id: row.history_id ?? undefined,
    file_path: row.file_path,
    doc_type: row.doc_type,
    title: row.title,
    file_url: data.signedUrl,
    file_type: row.file_type,
    file_size: row.file_size ?? undefined,
    uploaded_by: row.uploaded_by_id ?? '',
    uploaded_by_name: row.uploaded_by_name,
    uploaded_at: row.uploaded_at,
    verification_status: status,
  };
}

export async function getRequiredDocumentsForStage(stageNo: number): Promise<RequiredDocumentCheck[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('stage_required_documents')
    .select('doc_type, label, description, is_mandatory')
    .eq('stage_no', stageNo);
  if (error) throw new Error(error.message);
  return (data ?? []) as RequiredDocumentCheck[];
}

async function persistDocuments(
  assetId: string,
  historyId: string | null,
  stageNo: number,
  documents: AssetDocument[],
  actor: { id: string; profile: AppProfile }
): Promise<void> {
  if (documents.length === 0) return;
  const supabase = createClient();
  const storage = supabase.storage.from('asset-documents');
  const rows: Omit<DocumentRow, 'id' | 'uploaded_at'>[] = [];

  for (const document of documents) {
    if (!document.file_path) throw new Error(`Upload ${document.title} again before submitting.`);
    let filePath = document.file_path;
    if (filePath.startsWith(`staging/${actor.id}/`)) {
      const filename = document.title.split(': ').pop()?.replace(/[^a-zA-Z0-9._-]/g, '_') ?? 'file';
      const destination = `${assetId}/${historyId ?? 'initial'}/${Date.now()}-${filename}`;
      const { error } = await storage.move(filePath, destination);
      if (error) throw new Error(`Could not attach ${document.title}: ${error.message}`);
      filePath = destination;
    }
    rows.push({
      asset_id: assetId,
      history_id: historyId,
      stage_no: stageNo,
      doc_type: document.doc_type,
      title: document.title,
      file_path: filePath,
      file_url: filePath,
      file_type: document.file_type,
      file_size: document.file_size ?? null,
      uploaded_by_id: actor.id,
      uploaded_by_name: actor.profile.full_name,
    });
  }

  const { error } = await supabase.from('asset_documents').insert(rows);
  if (error) throw new Error(error.message);
}

export async function getAssets(filters?: Partial<AssetFilterState>): Promise<Asset[]> {
  const supabase = createClient();
  let query = supabase.from('assets').select('*');

  if (filters?.assetType && filters.assetType !== 'ALL') {
    query = query.eq('asset_type', filters.assetType.toLowerCase());
  }
  if (filters?.status && filters.status !== 'ALL') {
    query = query.eq('current_stage_no', getStageNumberForStatus(filters.status));
  }
  if (filters?.condition && filters.condition !== 'ALL') {
    query = query.eq('current_condition', filters.condition);
  }
  if (filters?.subType && filters.subType !== 'ALL') query = query.eq('sub_type', filters.subType);
  if (filters?.pendingVerificationOnly) query = query.not('pending_target_stage_no', 'is', null);

  const columns = {
    created_at: 'created_at',
    title: 'title',
    estimated_cost: 'estimated_cost',
    condition: 'current_condition',
    status: 'current_stage_no',
  } as const;
  const orderColumn = filters?.sortBy ? columns[filters.sortBy] : 'created_at';
  const { data, error } = await query.order(orderColumn, { ascending: filters?.sortOrder === 'asc' });
  if (error) throw new Error(error.message);

  let assets = ((data ?? []) as AssetRow[]).map(mapAsset);
  const search = filters?.searchQuery?.trim().toLocaleLowerCase();
  if (search) {
    assets = assets.filter((asset) =>
      [asset.title, asset.asset_code, asset.location_address, asset.managing_department]
        .some((value) => value.toLocaleLowerCase().includes(search))
    );
  }
  return assets;
}

export async function getAssetById(id: string): Promise<Asset | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from('assets').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const asset = mapAsset(data as AssetRow);
  asset.documents = await getAssetDocuments(id);
  return asset;
}

export async function getAssetDocuments(assetId: string): Promise<AssetDocument[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('asset_documents')
    .select('*')
    .eq('asset_id', assetId)
    .order('uploaded_at', { ascending: false });
  if (error) throw new Error(error.message);
  return Promise.all(((data ?? []) as DocumentRow[]).map((row) => mapDocument(row)));
}

export async function createAsset(
  assetData: Omit<Asset, 'id' | 'created_at' | 'updated_at'>
): Promise<Asset> {
  const supabase = createClient();
  const actor = await getActor();
  const row = {
    asset_code: assetData.asset_code,
    title: assetData.title,
    asset_type: assetData.asset_type.toLowerCase(),
    sub_type: assetData.sub_type,
    location_district: assetData.location_district,
    location_sector: assetData.location_sector ?? assetData.location_taluka,
    location_address: assetData.location_address,
    latitude: assetData.latitude ?? null,
    longitude: assetData.longitude ?? null,
    estimated_cost: assetData.estimated_cost,
    construction_year: assetData.construction_year,
    managing_department: assetData.managing_department,
    assigned_officer_id: assetData.assigned_officer_id ?? null,
    assigned_officer_name: assetData.assigned_officer_name,
    description: assetData.description,
    specifications: assetData.specifications,
    created_by: actor.id,
  };
  const { data, error } = await supabase.from('assets').insert(row).select('*').single();
  if (error) throw new Error(error.message);

  const asset = mapAsset(data as AssetRow);
  await persistDocuments(asset.id, null, 1, assetData.documents ?? [], actor);
  return asset;
}

export async function updateAsset(id: string, assetData: Partial<Asset>): Promise<Asset> {
  const update: Record<string, unknown> = {};
  if (assetData.asset_code !== undefined) update.asset_code = assetData.asset_code;
  if (assetData.title !== undefined) update.title = assetData.title;
  if (assetData.asset_type !== undefined) update.asset_type = assetData.asset_type.toLowerCase();
  if (assetData.sub_type !== undefined) update.sub_type = assetData.sub_type;
  if (assetData.location_district !== undefined) update.location_district = assetData.location_district;
  if (assetData.location_sector !== undefined || assetData.location_taluka !== undefined) {
    update.location_sector = assetData.location_sector ?? assetData.location_taluka;
  }
  if (assetData.location_address !== undefined) update.location_address = assetData.location_address;
  if (assetData.latitude !== undefined) update.latitude = assetData.latitude;
  if (assetData.longitude !== undefined) update.longitude = assetData.longitude;
  if (assetData.estimated_cost !== undefined) update.estimated_cost = assetData.estimated_cost;
  if (assetData.construction_year !== undefined) update.construction_year = assetData.construction_year;
  if (assetData.managing_department !== undefined) update.managing_department = assetData.managing_department;
  if (assetData.assigned_officer_id !== undefined) update.assigned_officer_id = assetData.assigned_officer_id;
  if (assetData.assigned_officer_name !== undefined) update.assigned_officer_name = assetData.assigned_officer_name;
  if (assetData.description !== undefined) update.description = assetData.description;
  if (assetData.specifications !== undefined) update.specifications = assetData.specifications;

  if (Object.keys(update).length === 0) {
    const asset = await getAssetById(id);
    if (!asset) throw new Error('Asset not found');
    return asset;
  }

  const supabase = createClient();
  const { data, error } = await supabase.from('assets').update(update).eq('id', id).select('*').single();
  if (error) throw new Error(error.message);
  return mapAsset(data as AssetRow);
}

export async function submitStatusChangeRequest(
  assetId: string,
  targetStatus: AssetStatus,
  newCondition: AssetCondition,
  remarks: string,
  uploadedDocuments: AssetDocument[],
  details: { referenceNumber?: string; amount?: number; effectiveDate?: string } = {}
): Promise<{ asset: Asset; history: AssetLifecycleHistory }> {
  const supabase = createClient();
  const actor = await getActor();
  const asset = await getAssetById(assetId);
  if (!asset) throw new Error('Asset not found');
  const fromStageNo = asset.current_stage_no ?? getStageNumberForStatus(asset.status);
  const toStageNo = getStageNumberForStatus(targetStatus);
  if (!getAllowedNextStages(fromStageNo).includes(toStageNo as never)) {
    throw new Error('That lifecycle stage is not a valid next step. Refresh the asset and try again.');
  }

  const requirements = await getRequiredDocumentsForStage(toStageNo);
  const uploadedTypes = new Set(uploadedDocuments.map((document) => document.doc_type));
  const missing = requirements.filter((required) => required.is_mandatory && !uploadedTypes.has(required.doc_type));
  if (missing.length > 0) throw new Error(`Missing required documents: ${missing.map((document) => document.label).join(', ')}`);

  const { data: pending, error: pendingError } = await supabase
    .from('asset_lifecycle_history')
    .select('id')
    .eq('asset_id', assetId)
    .eq('verification_status', 'Pending')
    .limit(1);
  if (pendingError) throw new Error(pendingError.message);
  if (pending && pending.length > 0) throw new Error('This asset already has a pending request.');

  const { data, error } = await supabase.from('asset_lifecycle_history').insert({
    asset_id: assetId,
    from_stage_no: fromStageNo,
    to_stage_no: toStageNo,
    previous_condition: asset.condition,
    target_condition: newCondition,
    verification_status: 'Pending',
    reference_number: details.referenceNumber ?? null,
    amount: details.amount ?? null,
    effective_date: details.effectiveDate ?? new Date().toISOString().slice(0, 10),
    remarks,
    requested_by_id: actor.id,
    requested_by_name: actor.profile.full_name,
    requested_by_role: actor.profile.role,
  }).select('*').single();
  if (error) throw new Error(error.message);

  const historyRow = data as HistoryRow;
  await persistDocuments(assetId, historyRow.id, toStageNo, uploadedDocuments, actor);
  const documents = await getHistoryDocuments([historyRow.id], 'Pending');
  return {
    asset: { ...asset, pending_target_status: targetStatus },
    history: mapHistory(historyRow, documents.get(historyRow.id) ?? []),
  };
}

async function getHistoryDocuments(
  historyIds: string[],
  status: DocumentVerificationStatus
): Promise<Map<string, AssetDocument[]>> {
  const result = new Map<string, AssetDocument[]>();
  if (historyIds.length === 0) return result;
  const supabase = createClient();
  const { data, error } = await supabase.from('asset_documents').select('*').in('history_id', historyIds);
  if (error) throw new Error(error.message);
  const docs = await Promise.all(((data ?? []) as DocumentRow[]).map((row) => mapDocument(row, status)));
  for (const document of docs) {
    if (!document.history_id) continue;
    result.set(document.history_id, [...(result.get(document.history_id) ?? []), document]);
  }
  return result;
}

export async function verifyDocumentAndTransition(
  historyId: string,
  action: 'APPROVE' | 'REJECT',
  verificationNotes: string
): Promise<{ asset: Asset; history: AssetLifecycleHistory }> {
  const supabase = createClient();
  const actor = await getActor();
  if (!['admin', 'officer'].includes(actor.profile.role)) throw new Error('Your role cannot verify requests.');
  if (action === 'REJECT' && !verificationNotes.trim()) throw new Error('Rejection remarks are required.');

  const { data: request, error: requestError } = await supabase
    .from('asset_lifecycle_history')
    .select('*')
    .eq('id', historyId)
    .maybeSingle();
  if (requestError) throw new Error(requestError.message);
  if (!request) throw new Error('Lifecycle request not found.');
  const historyRow = request as HistoryRow;
  if (historyRow.verification_status !== 'Pending') throw new Error('This request is no longer pending.');
  if (historyRow.requested_by_id === actor.id) throw new Error('You cannot verify your own request.');

  if (action === 'APPROVE') {
    const requirements = await getRequiredDocumentsForStage(historyRow.to_stage_no);
    const { data: documents, error: documentsError } = await supabase
      .from('asset_documents')
      .select('doc_type')
      .eq('history_id', historyId);
    if (documentsError) throw new Error(documentsError.message);
    const attached = new Set((documents ?? []).map((document) => document.doc_type));
    const missing = requirements.filter((required) => required.is_mandatory && !attached.has(required.doc_type));
    if (missing.length > 0) throw new Error(`Cannot verify. Missing: ${missing.map((document) => document.label).join(', ')}`);
  }

  const { data: updated, error: updateError } = await supabase
    .from('asset_lifecycle_history')
    .update({
      verification_status: action === 'APPROVE' ? 'Verified' : 'Rejected',
      verified_by_id: actor.id,
      verified_by_name: actor.profile.full_name,
      verified_by_role: actor.profile.role,
      verified_at: new Date().toISOString(),
      rejection_remarks: action === 'REJECT' ? verificationNotes.trim() : null,
    })
    .eq('id', historyId)
    .eq('verification_status', 'Pending')
    .select('*')
    .single();
  if (updateError) throw new Error(updateError.message);

  const asset = await getAssetById(historyRow.asset_id);
  if (!asset) throw new Error('Asset not found after verification.');
  const docs = await getHistoryDocuments([historyId], action === 'APPROVE' ? 'Verified' : 'Rejected');
  return { asset, history: mapHistory(updated as HistoryRow, docs.get(historyId) ?? []) };
}

export async function getAssetLifecycleHistory(assetId: string): Promise<AssetLifecycleHistory[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('asset_lifecycle_history')
    .select('*')
    .eq('asset_id', assetId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as HistoryRow[];
  const docsByHistory = new Map<string, AssetDocument[]>();
  for (const status of ['Pending', 'Verified', 'Rejected'] as const) {
    const ids = rows.filter((row) => row.verification_status === status).map((row) => row.id);
    const documents = await getHistoryDocuments(ids, status);
    for (const [id, docs] of documents) docsByHistory.set(id, docs);
  }
  return rows.map((row) => mapHistory(row, docsByHistory.get(row.id) ?? []));
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = createClient();
  const [assets, recentResult, pendingResult] = await Promise.all([
    getAssets(),
    supabase.from('asset_lifecycle_history').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('asset_lifecycle_history').select('asset_id, to_stage_no').eq('verification_status', 'Pending'),
  ]);
  if (recentResult.error) throw new Error(recentResult.error.message);
  if (pendingResult.error) throw new Error(pendingResult.error.message);

  const statuses = ['Proposed', 'Administrative Approval', 'Technical Sanction', 'Tender / Work Order', 'Under Construction', 'Completed', 'Handed Over', 'Operational', 'Under Maintenance', 'Needs Attention', 'Retired', 'Planned'] as AssetStatus[];
  const statusCounts = Object.fromEntries(statuses.map((status) => [status, 0])) as Record<AssetStatus, number>;
  const conditionCounts = Object.fromEntries(['Good', 'Fair', 'Poor', 'Critical', 'Not Assessed'].map((condition) => [condition, 0])) as Record<AssetCondition, number>;
  let totalValuation = 0;
  let totalRoads = 0;
  let totalBuildings = 0;
  for (const asset of assets) {
    statusCounts[asset.status] += 1;
    conditionCounts[asset.condition] += 1;
    if (asset.asset_type === 'Road') totalRoads += 1;
    if (asset.asset_type === 'Building') totalBuildings += 1;
    totalValuation += Number(asset.estimated_cost) || 0;
  }

  const pendingByAsset = new Map((pendingResult.data ?? []).map((row) => [row.asset_id, row.to_stage_no]));
  const pendingVerificationAssets = assets
    .filter((asset) => pendingByAsset.has(asset.id))
    .map((asset) => ({ ...asset, pending_target_status: stageName(pendingByAsset.get(asset.id)) }));
  const criticalAssets = assets.filter((asset) =>
    asset.condition === 'Critical' || asset.condition === 'Poor' || asset.status === 'Needs Attention'
  );

  return {
    totalAssets: assets.length,
    totalRoads,
    totalBuildings,
    totalValuation,
    statusCounts,
    conditionCounts,
    pendingVerificationCount: pendingResult.data?.length ?? 0,
    needingAttentionCount: criticalAssets.length,
    recentHistory: ((recentResult.data ?? []) as HistoryRow[]).map((row) => mapHistory(row)),
    pendingVerificationAssets,
    criticalAssets,
  };
}

export async function uploadAssetAttachment(file: File, docType = 'GENERAL_DOC'): Promise<AssetDocument> {
  const actor = await getActor();
  const supabase = createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `staging/${actor.id}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage
    .from('asset-documents')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data, error: urlError } = await supabase.storage.from('asset-documents').createSignedUrl(filePath, 3600);
  if (urlError) throw new Error(`Could not preview the uploaded file: ${urlError.message}`);

  return {
    id: crypto.randomUUID(),
    asset_id: '',
    doc_type: docType,
    title: file.name,
    file_path: filePath,
    file_url: data.signedUrl,
    file_type: file.type.startsWith('image/') ? 'image' : 'document',
    file_size: file.size,
    uploaded_by: actor.id,
    uploaded_by_name: actor.profile.full_name,
    uploaded_at: new Date().toISOString(),
    verification_status: 'Pending',
  };
}
