'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Road,
  MapPin,
  IndianRupee,
  Calendar,
  User,
  FileText,
  Save,
  Loader2,
  AlertTriangle,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import {
  Asset,
  AssetCondition,
  AssetDocument,
  AssetStatus,
  AssetType,
  BuildingSpecifications,
  BuildingSubtype,
  RoadSpecifications,
  RoadSubtype,
} from '@/types';
import { createAsset, updateAsset } from '@/lib/data/assetService';
import { FileUploader } from '@/components/common/FileUploader';

interface AssetFormProps {
  initialAsset?: Asset;
  isEdit?: boolean;
}

const ROAD_SUBTYPES: RoadSubtype[] = [
  'State Highway',
  'Major District Road',
  'Urban Arterial Road',
  'Bridge',
  'Flyover',
  'Underpass',
  'Culvert',
  'Footpath / Sidewalk',
  'Retaining Wall',
  'Roadside Stormwater Drain',
];

const BUILDING_SUBTYPES: BuildingSubtype[] = [
  'Administrative Office',
  'Government Hospital / PHC',
  'School / College Building',
  'Residential Quarter',
  'Police Station',
  'Community Hall / Cultural Complex',
  'Fire Station',
  'Compound Wall',
  'Building Drainage System',
];

const STATUSES: AssetStatus[] = [
  'Planned',
  'Under Construction',
  'Completed',
  'Operational',
  'Under Maintenance',
  'Needs Attention',
  'Retired',
];

const CONDITIONS: AssetCondition[] = ['Good', 'Fair', 'Poor', 'Critical'];

export function AssetForm({ initialAsset, isEdit = false }: AssetFormProps) {
  const router = useRouter();

  // Basic Details State
  const [assetType, setAssetType] = useState<AssetType>(initialAsset?.asset_type || 'Road');
  const [assetCode, setAssetCode] = useState(
    initialAsset?.asset_code || `GND-${assetType === 'Road' ? 'RD' : 'BLD'}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [title, setTitle] = useState(initialAsset?.title || '');
  const [subType, setSubType] = useState<string>(
    initialAsset?.sub_type || (assetType === 'Road' ? ROAD_SUBTYPES[0] : BUILDING_SUBTYPES[0])
  );
  const [status, setStatus] = useState<AssetStatus>(initialAsset?.status || 'Planned');
  const [condition, setCondition] = useState<AssetCondition>(initialAsset?.condition || 'Good');

  // Location State
  const district = 'Gandhinagar';
  const [taluka, setTaluka] = useState(initialAsset?.location_taluka || 'Gandhinagar City');
  const [address, setAddress] = useState(initialAsset?.location_address || '');
  const [latitude, setLatitude] = useState<number | undefined>(initialAsset?.latitude || 23.2156);
  const [longitude, setLongitude] = useState<number | undefined>(initialAsset?.longitude || 72.6369);

  // Financial & Administration State
  const [estimatedCost, setEstimatedCost] = useState<number>(initialAsset?.estimated_cost || 5000000);
  const [actualCost, setActualCost] = useState<number | undefined>(initialAsset?.actual_cost || 4800000);
  const [constructionYear, setConstructionYear] = useState<number>(
    initialAsset?.construction_year || new Date().getFullYear()
  );
  const [managingDepartment, setManagingDepartment] = useState(
    initialAsset?.managing_department || 'R&B Department - Gandhinagar Executive Circle'
  );
  const [assignedOfficerName, setAssignedOfficerName] = useState(
    initialAsset?.assigned_officer_name || 'Er. Rajesh Patel (Executive Engineer, R&B)'
  );
  const [assignedOfficerContact, setAssignedOfficerContact] = useState(
    initialAsset?.assigned_officer_contact || '+91 98250 11223'
  );
  const [description, setDescription] = useState(initialAsset?.description || '');

  // Files & Attachments
  const [documents, setDocuments] = useState<AssetDocument[]>(initialAsset?.documents || []);
  const [photoUrls, setPhotoUrls] = useState<string[]>(initialAsset?.photos || []);

  // Road Specific Specifications
  const [roadSpecs, setRoadSpecs] = useState<RoadSpecifications>({
    length_km: (initialAsset?.specifications as RoadSpecifications)?.length_km || 3.5,
    width_m: (initialAsset?.specifications as RoadSpecifications)?.width_m || 18.0,
    lane_count: (initialAsset?.specifications as RoadSpecifications)?.lane_count || 4,
    pavement_type: (initialAsset?.specifications as RoadSpecifications)?.pavement_type || 'Asphalt / BT',
    start_chainage: (initialAsset?.specifications as RoadSpecifications)?.start_chainage || '0+000 km',
    end_chainage: (initialAsset?.specifications as RoadSpecifications)?.end_chainage || '3+500 km',
    traffic_category: (initialAsset?.specifications as RoadSpecifications)?.traffic_category || 'Heavy Commercial',
    has_drainage: (initialAsset?.specifications as RoadSpecifications)?.has_drainage ?? true,
    has_footpath: (initialAsset?.specifications as RoadSpecifications)?.has_footpath ?? true,
    has_streetlights: (initialAsset?.specifications as RoadSpecifications)?.has_streetlights ?? true,
  });

  // Building Specific Specifications
  const [bldgSpecs, setBldgSpecs] = useState<BuildingSpecifications>({
    number_of_floors: (initialAsset?.specifications as BuildingSpecifications)?.number_of_floors || 5,
    plot_area_sqm: (initialAsset?.specifications as BuildingSpecifications)?.plot_area_sqm || 3200,
    builtup_area_sqm: (initialAsset?.specifications as BuildingSpecifications)?.builtup_area_sqm || 8500,
    structure_type: (initialAsset?.specifications as BuildingSpecifications)?.structure_type || 'RCC Frame',
    occupancy_status: (initialAsset?.specifications as BuildingSpecifications)?.occupancy_status || 'Fully Occupied',
    sanctioned_capacity: (initialAsset?.specifications as BuildingSpecifications)?.sanctioned_capacity || 400,
    fire_safety_noc: (initialAsset?.specifications as BuildingSpecifications)?.fire_safety_noc ?? true,
    solar_installed: (initialAsset?.specifications as BuildingSpecifications)?.solar_installed ?? true,
    has_compound_wall: (initialAsset?.specifications as BuildingSpecifications)?.has_compound_wall ?? true,
    has_dedicated_drainage: (initialAsset?.specifications as BuildingSpecifications)?.has_dedicated_drainage ?? true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTypeToggle = (type: AssetType) => {
    setAssetType(type);
    if (!isEdit) {
      setSubType(type === 'Road' ? ROAD_SUBTYPES[0] : BUILDING_SUBTYPES[0]);
      setAssetCode(`GND-${type === 'Road' ? 'RD' : 'BLD'}-${Math.floor(100 + Math.random() * 900)}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !taluka.trim() || !address.trim()) {
      setErrorMsg('Please complete all required fields marked with *');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const specifications = assetType === 'Road' ? roadSpecs : bldgSpecs;
      const photoArray = documents.filter((d) => d.file_type === 'image').map((d) => d.file_url);

      const payload = {
        asset_code: assetCode,
        title,
        asset_type: assetType,
        sub_type: subType,
        status,
        condition,
        location_district: district,
        location_taluka: taluka,
        location_address: address,
        latitude,
        longitude,
        estimated_cost: Number(estimatedCost) || 0,
        actual_cost: Number(actualCost) || 0,
        construction_year: Number(constructionYear) || new Date().getFullYear(),
        managing_department: managingDepartment,
        assigned_officer_name: assignedOfficerName,
        assigned_officer_contact: assignedOfficerContact,
        description,
        specifications,
        photos: photoArray.length > 0 ? photoArray : photoUrls,
        documents,
      };

      if (isEdit && initialAsset) {
        await updateAsset(initialAsset.id, payload);
        router.push(`/assets/${initialAsset.id}`);
      } else {
        const created = await createAsset(payload);
        router.push(`/assets/${created.id}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit asset form.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 dark:bg-rose-950/50 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Asset Category Selector Toggle */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-500" />
          1. Asset Category & Classification
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Select whether this asset represents a Road corridor/bridge or a Building facility in Gandhinagar
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleTypeToggle('Road')}
            className={`p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${
              assetType === 'Road'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow">
              <Road className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm">Road Infrastructure</div>
              <p className="text-xs opacity-75">
                Roads, Bridges, Underpasses, Culverts, Footpaths, Retaining Walls
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleTypeToggle('Building')}
            className={`p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${
              assetType === 'Building'
                ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xl shadow">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm">Building Facility</div>
              <p className="text-xs opacity-75">
                Offices, Hospitals/PHCs, Residential Quarters, Schools, Compound Walls
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Basic Asset Info Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
          2. Basic Identification & Lifecycle Stage
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Asset Code (Gandhinagar Format) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={assetCode}
              onChange={(e) => setAssetCode(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Subtype Subcategory <span className="text-rose-500">*</span>
            </label>
            <select
              value={subType}
              onChange={(e) => setSubType(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold"
            >
              {assetType === 'Road'
                ? ROAD_SUBTYPES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))
                : BUILDING_SUBTYPES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Construction / Commission Year <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min={1950}
              max={2030}
              value={constructionYear}
              onChange={(e) => setConstructionYear(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="text-xs">
          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
            Asset Title / Official Designation <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. CH-Road Flyover (Sector 11 to 17) OR Mahatma Mandir Annex Complex"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Initial Lifecycle Stage
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AssetStatus)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Initial Condition Health Rating
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as AssetCondition)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold"
            >
              {CONDITIONS.map((cd) => (
                <option key={cd} value={cd}>
                  {cd}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Technical Specifications */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          {assetType === 'Road' ? (
            <Road className="w-5 h-5 text-blue-500" />
          ) : (
            <Building2 className="w-5 h-5 text-amber-500" />
          )}
          3. Technical Parameters ({assetType}-Specific)
        </h3>

        {assetType === 'Road' ? (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Length (Kilometers)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={roadSpecs.length_km}
                  onChange={(e) =>
                    setRoadSpecs({ ...roadSpecs, length_km: Number(e.target.value) })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Carriageway Width (Meters)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={roadSpecs.width_m}
                  onChange={(e) =>
                    setRoadSpecs({ ...roadSpecs, width_m: Number(e.target.value) })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Lanes Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={roadSpecs.lane_count}
                  onChange={(e) =>
                    setRoadSpecs({ ...roadSpecs, lane_count: Number(e.target.value) })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Pavement Surface Type
                </label>
                <select
                  value={roadSpecs.pavement_type}
                  onChange={(e) =>
                    setRoadSpecs({ ...roadSpecs, pavement_type: e.target.value as any })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Asphalt / BT">Asphalt / Bituminous Concrete (BT)</option>
                  <option value="Cement Concrete (CC)">Cement Concrete (CC Pavement)</option>
                  <option value="Paver Block">Interlocking Paver Block</option>
                  <option value="WBM / Unpaved">Water Bound Macadam (WBM)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Traffic Load Rating
                </label>
                <select
                  value={roadSpecs.traffic_category}
                  onChange={(e) =>
                    setRoadSpecs({ ...roadSpecs, traffic_category: e.target.value as any })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Heavy Commercial">Heavy Commercial Freight Corridor</option>
                  <option value="Medium Traffic">Medium Traffic (District Road)</option>
                  <option value="Light / Residential">Light / Sector Access</option>
                </select>
              </div>
            </div>

            {/* Checkbox Amenities */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={roadSpecs.has_drainage}
                  onChange={(e) => setRoadSpecs({ ...roadSpecs, has_drainage: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>Stormwater Drain Included</span>
              </label>

              <label className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={roadSpecs.has_footpath}
                  onChange={(e) => setRoadSpecs({ ...roadSpecs, has_footpath: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>Pedestrian Sidewalk Built</span>
              </label>

              <label className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={roadSpecs.has_streetlights}
                  onChange={(e) => setRoadSpecs({ ...roadSpecs, has_streetlights: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>LED Streetlights Installed</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Number of Floors (Storeys)
                </label>
                <input
                  type="number"
                  min="1"
                  value={bldgSpecs.number_of_floors}
                  onChange={(e) =>
                    setBldgSpecs({ ...bldgSpecs, number_of_floors: Number(e.target.value) })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Plot Area (Sq. Meters)
                </label>
                <input
                  type="number"
                  min="0"
                  value={bldgSpecs.plot_area_sqm}
                  onChange={(e) =>
                    setBldgSpecs({ ...bldgSpecs, plot_area_sqm: Number(e.target.value) })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Total Built-up Area (Sq. Meters)
                </label>
                <input
                  type="number"
                  min="0"
                  value={bldgSpecs.builtup_area_sqm}
                  onChange={(e) =>
                    setBldgSpecs({ ...bldgSpecs, builtup_area_sqm: Number(e.target.value) })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Structural Framework
                </label>
                <select
                  value={bldgSpecs.structure_type}
                  onChange={(e) =>
                    setBldgSpecs({ ...bldgSpecs, structure_type: e.target.value as any })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="RCC Frame">Reinforced Cement Concrete (RCC Frame)</option>
                  <option value="Load Bearing Masonry">Load Bearing Masonry Structure</option>
                  <option value="Steel Structural">Steel Structural Framework</option>
                  <option value="Prefabricated">Prefabricated / Modular System</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Occupancy Status
                </label>
                <select
                  value={bldgSpecs.occupancy_status}
                  onChange={(e) =>
                    setBldgSpecs({ ...bldgSpecs, occupancy_status: e.target.value as any })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Fully Occupied">Fully Occupied</option>
                  <option value="Partially Occupied">Partially Occupied</option>
                  <option value="Vacant">Vacant</option>
                  <option value="Under Renovation">Under Major Renovation</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bldgSpecs.fire_safety_noc}
                  onChange={(e) => setBldgSpecs({ ...bldgSpecs, fire_safety_noc: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>Fire Safety NOC Compliant</span>
              </label>

              <label className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bldgSpecs.solar_installed}
                  onChange={(e) => setBldgSpecs({ ...bldgSpecs, solar_installed: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>Rooftop Solar Array Installed</span>
              </label>

              <label className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bldgSpecs.has_compound_wall}
                  onChange={(e) => setBldgSpecs({ ...bldgSpecs, has_compound_wall: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>Compound Wall Enclosure</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 4. Location & Financial Information */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
          4. Location, Budget & Administration (Gandhinagar Circle)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              District
            </label>
            <input
              type="text"
              readOnly
              value="Gandhinagar"
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Taluka / Sector <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Gandhinagar City, Sector 11, GIFT City, Koba..."
              value={taluka}
              onChange={(e) => setTaluka(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="text-xs">
          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
            Site Address & Landmark <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Full physical site address in Gandhinagar"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Sanctioned Cost (₹ INR) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Actual Expended Cost (₹ INR)
            </label>
            <input
              type="number"
              min="0"
              value={actualCost ?? ''}
              onChange={(e) => setActualCost(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Assigned Executive Nodal Officer
            </label>
            <input
              type="text"
              value={assignedOfficerName}
              onChange={(e) => setAssignedOfficerName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Officer Contact Phone
            </label>
            <input
              type="text"
              value={assignedOfficerContact}
              onChange={(e) => setAssignedOfficerContact(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="text-xs">
          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
            Detailed Scope Description
          </label>
          <textarea
            rows={3}
            placeholder="Detailed description of infrastructure features and scope..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* 5. Documents & Initial Photos */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
          5. Initial Inspection Photos & Verification Documents
        </h3>
        <FileUploader attachments={documents} onChange={setDocuments} maxFiles={5} />
      </div>

      {/* Form Submission Buttons */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={submitting}
          className="px-5 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Asset Record...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEdit ? 'Save Changes' : 'Register Asset in Sampada Directory'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
