export type UserRole = 'Admin' | 'Officer' | 'Inspector' | 'Viewer';

export type AssetType = 'Road' | 'Building';

export type AssetStatus =
  | 'Planned'
  | 'Under Construction'
  | 'Completed'
  | 'Operational'
  | 'Under Maintenance'
  | 'Needs Attention'
  | 'Retired';

export type AssetCondition = 'Good' | 'Fair' | 'Poor' | 'Critical';

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
  asset_code: string;
  title: string;
  asset_type: AssetType;
  sub_type: RoadSubtype | BuildingSubtype | string;
  status: AssetStatus;
  condition: AssetCondition;
  pending_target_status?: AssetStatus | null;
  location_district: string; // Focused on Gandhinagar
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
  specifications: RoadSpecifications | BuildingSpecifications | Record<string, any>;
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

// Map of required document types for each transition
export const TRANSITION_REQUIRED_DOCUMENTS: Record<string, RequiredDocumentCheck[]> = {
  'Planned->Under Construction': [
    {
      doc_type: 'ADMINISTRATIVE_APPROVAL',
      label: 'Administrative Approval (AA)',
      description: 'Official Government Order issuing Administrative Approval with budget sanction.',
      is_mandatory: true,
    },
    {
      doc_type: 'TECHNICAL_SANCTION',
      label: 'Technical Sanction (TS)',
      description: 'Approved Technical Sanction design & detailed cost estimation report.',
      is_mandatory: true,
    },
  ],
  'Under Construction->Completed': [
    {
      doc_type: 'COMPLETION_CERTIFICATE',
      label: 'Work Completion Certificate',
      description: 'Signed completion certificate by Executive Engineer.',
      is_mandatory: true,
    },
    {
      doc_type: 'MEASUREMENT_BOOK',
      label: 'Measurement Book (MB) Summary',
      description: 'Final MB bill entry excerpt signed by site auditor.',
      is_mandatory: true,
    },
    {
      doc_type: 'SITE_AUDIT_PHOTOS',
      label: 'Post-Construction Site Inspection Photos',
      description: 'Geotagged photos showing completed pavement or structural facade.',
      is_mandatory: true,
    },
  ],
  'Completed->Operational': [
    {
      doc_type: 'HANDOVER_LETTER',
      label: 'Asset Handover & Takeover Letter',
      description: 'Formal letter surrendering asset to operating municipal authority.',
      is_mandatory: true,
    },
    {
      doc_type: 'SAFETY_CLEARANCE',
      label: 'Quality & Structural Safety Clearance',
      description: 'Third-party structural safety or friction audit clearance.',
      is_mandatory: false,
    },
  ],
  'Operational->Under Maintenance': [
    {
      doc_type: 'DAMAGE_INSPECTION_REPORT',
      label: 'Inspection Audit & Damage Assessment Report',
      description: 'Detailed pavement distress or structural damage defect report.',
      is_mandatory: true,
    },
    {
      doc_type: 'DEFECT_PHOTOS',
      label: 'Defect Site Evidence Photos',
      description: 'Photographic evidence showing distress, potholes, or cracks.',
      is_mandatory: true,
    },
  ],
  'Under Maintenance->Operational': [
    {
      doc_type: 'MAINTENANCE_COMPLETION',
      label: 'Maintenance Work Completion Certificate',
      description: 'Verification that resurfacing or structural repair is completed.',
      is_mandatory: true,
    },
    {
      doc_type: 'QUALITY_TEST_REPORT',
      label: 'Post-Repair Quality Test Report',
      description: 'Asphalt compaction or concrete cube test report.',
      is_mandatory: true,
    },
  ],
  'Operational->Needs Attention': [
    {
      doc_type: 'CRITICAL_RISK_AUDIT',
      label: 'Critical Infrastructure Risk Audit Report',
      description: 'Inspector report highlighting immediate safety risk or distress.',
      is_mandatory: true,
    },
  ],
  'Needs Attention->Under Maintenance': [
    {
      doc_type: 'REPAIR_WORK_ORDER',
      label: 'Emergency Maintenance Tender Work Order',
      description: 'Official tender approval and work order allocated to contractor.',
      is_mandatory: true,
    },
  ],
  'Operational->Retired': [
    {
      doc_type: 'DECOMMISSION_APPROVAL',
      label: 'Decommissioning & Demolition Sanction',
      description: 'High-level committee approval order for asset retirement.',
      is_mandatory: true,
    },
  ],
};

export function getRequiredDocumentsForTransition(
  currentStatus: AssetStatus,
  targetStatus: AssetStatus
): RequiredDocumentCheck[] {
  const key = `${currentStatus}->${targetStatus}`;
  if (TRANSITION_REQUIRED_DOCUMENTS[key]) {
    return TRANSITION_REQUIRED_DOCUMENTS[key];
  }
  // Default fallback documents for any other transition
  return [
    {
      doc_type: 'GENERAL_AUDIT_REPORT',
      label: 'Status Transition Audit Report',
      description: 'Official inspection notes and justification for status change.',
      is_mandatory: true,
    },
    {
      doc_type: 'SITE_PHOTO',
      label: 'Current Site Condition Photo',
      description: 'Current photograph supporting the requested status change.',
      is_mandatory: true,
    },
  ];
}
