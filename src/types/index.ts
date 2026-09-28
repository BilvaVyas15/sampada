export type UserRole = 'Admin' | 'Officer' | 'Inspector' | 'Viewer';

export type AssetType = 'Road' | 'Building';

export type AssetStatus =
  | 'Proposed'
  | 'Administrative Approval'
  | 'Technical Sanction'
  | 'Tender / Work Order'
  | 'Handed Over'
  | 'Planned'
  | 'Under Construction'
  | 'Completed'
  | 'Operational'
  | 'Under Maintenance'
  | 'Needs Attention'
  | 'Retired';

export type AssetCondition = 'Good' | 'Fair' | 'Poor' | 'Critical' | 'Not Assessed';

export type DocumentVerificationStatus = 'Pending' | 'Verified' | 'Rejected';

export type RoadSubtype =
  | 'State Highway'
  | 'Major District Road'
  | 'Urban Arterial Road'
  | 'Bridge'
  | 'Flyover'
  | 'Underpass'
  | 'Culvert'
  | 'Footpath / Sidewalk'
  | 'Retaining Wall'
  | 'Roadside Stormwater Drain';

export type BuildingSubtype =
  | 'Administrative Office'
  | 'Government Hospital / PHC'
  | 'School / College Building'
  | 'Residential Quarter'
  | 'Police Station'
  | 'Community Hall / Cultural Complex'
  | 'Fire Station'
  | 'Compound Wall'
  | 'Building Drainage System';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department: string;
  district: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface RequiredDocumentCheck {
  doc_type: string;
  label: string;
  description: string;
  is_mandatory: boolean;
}

export interface AssetDocument {
  id: string;
  asset_id: string;
  history_id?: string;
  file_path?: string;
  doc_type: string;
  title: string;
  file_url: string;
  file_type: 'image' | 'document';
  file_size?: number;
  uploaded_by: string;
  uploaded_by_name: string;
  uploaded_at: string;
  verification_status: DocumentVerificationStatus;
  verified_by?: string;
  verified_by_name?: string;
  verified_at?: string;
  verification_notes?: string;
}

export interface RoadSpecifications {
  length_km: number;
  width_m: number;
  lane_count: number;
  pavement_type: 'Asphalt / BT' | 'Cement Concrete (CC)' | 'Paver Block' | 'WBM / Unpaved';
  start_chainage?: string;
  end_chainage?: string;
  traffic_category?: 'Heavy Commercial' | 'Medium Traffic' | 'Light / Residential';
  has_drainage?: boolean;
  has_footpath?: boolean;
  has_streetlights?: boolean;
}

export interface BuildingSpecifications {
  number_of_floors: number;
  plot_area_sqm: number;
  builtup_area_sqm: number;
  structure_type: 'RCC Frame' | 'Load Bearing Masonry' | 'Steel Structural' | 'Prefabricated';
  occupancy_status: 'Fully Occupied' | 'Partially Occupied' | 'Vacant' | 'Under Renovation';
  sanctioned_capacity?: number;
  fire_safety_noc?: boolean;
  solar_installed?: boolean;
  has_compound_wall?: boolean;
  has_dedicated_drainage?: boolean;
}

export interface Asset {
  id: string;
  current_stage_no?: number;
  asset_code: string;
  title: string;
  asset_type: AssetType;
  sub_type: RoadSubtype | BuildingSubtype | string;
  status: AssetStatus;
  condition: AssetCondition;
  pending_target_status?: AssetStatus | null;
  location_district: string; // Focused on Gandhinagar
  location_sector?: string;
  location_taluka: string;
  location_address: string;
  latitude?: number;
  longitude?: number;
  estimated_cost: number;
  actual_cost?: number;
  construction_year: number;
  managing_department: string;
  assigned_officer_id?: string;
  assigned_officer_name: string;
  assigned_officer_contact?: string;
  description: string;
  specifications: RoadSpecifications | BuildingSpecifications | Record<string, unknown>;
  photos: string[];
  documents: AssetDocument[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AssetLifecycleHistory {
  id: string;
  asset_id: string;
  previous_status: AssetStatus | null;
  target_status: AssetStatus;
  actual_status: AssetStatus;
  previous_condition: AssetCondition | null;
  new_condition: AssetCondition;
  action_type:
    | 'STATUS_CHANGE_REQUEST'
    | 'DOCUMENT_VERIFIED'
    | 'DOCUMENT_REJECTED'
    | 'CONDITION_UPDATE'
    | 'ASSET_CREATED'
    | 'EDIT_DETAILS';
  verification_status: DocumentVerificationStatus;
  from_stage_no?: number | null;
  to_stage_no?: number;
  reference_number?: string | null;
  amount?: number | null;
  effective_date?: string | null;
  rejection_remarks?: string | null;
  verified_at?: string | null;
  remarks: string;
  changed_by_id?: string;
  changed_by_name: string;
  changed_by_role: UserRole;
  verified_by_name?: string;
  verified_by_role?: UserRole;
  verification_notes?: string;
  attached_documents: AssetDocument[];
  created_at: string;
  updated_at?: string;
}

export interface AssetFilterState {
  searchQuery: string;
  assetType: 'ALL' | AssetType;
  status: 'ALL' | AssetStatus;
  condition: 'ALL' | AssetCondition;
  subType: 'ALL' | string;
  pendingVerificationOnly: boolean;
  sortBy: 'created_at' | 'title' | 'estimated_cost' | 'condition' | 'status';
  sortOrder: 'asc' | 'desc';
}

export interface DashboardMetrics {
  totalAssets: number;
  totalRoads: number;
  totalBuildings: number;
  totalValuation: number;
  statusCounts: Record<AssetStatus, number>;
  conditionCounts: Record<AssetCondition, number>;
  pendingVerificationCount: number;
  needingAttentionCount: number;
  recentHistory: AssetLifecycleHistory[];
  pendingVerificationAssets: Asset[];
  criticalAssets: Asset[];
}

