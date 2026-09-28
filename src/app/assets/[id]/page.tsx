'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2,
  Road,
  MapPin,
  Calendar,
  IndianRupee,
  User,
  Clock,
  Edit,
  RefreshCw,
  FileText,
  ImageIcon,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  Share2,
  Download,
  Shield,
  Layers,
} from 'lucide-react';
import { Asset, AssetLifecycleHistory } from '@/types';
import { getAssetById, getAssetLifecycleHistory, getActiveUser } from '@/lib/data/assetService';
import { getConditionBadgeColor, getStatusBadgeColor, formatINR, formatDate } from '@/lib/utils';
import { VisualTimeline } from '@/components/lifecycle/VisualTimeline';
import { StatusUpdateModal } from '@/components/lifecycle/StatusUpdateModal';

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [history, setHistory] = useState<AssetLifecycleHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'files'>('overview');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const currentUser = getActiveUser();

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const data = await getAssetById(id);
      if (data) {
        setAsset(data);
        const logs = await getAssetLifecycleHistory(id);
        setHistory(logs);
      }
    } catch (err) {
      console.error('Failed to load asset details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 py-8">
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-md mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Asset Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The requested infrastructure asset record (ID: {id}) could not be located in Gujarat inventory.
        </p>
        <Link
          href="/assets"
          className="inline-block px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg text-xs"
        >
          Return to Inventory
        </Link>
      </div>
    );
  }

  const isRoad = asset.asset_type === 'Road';
  const specs: any = asset.specifications || {};
  const canEdit = ['Admin', 'Officer'].includes(currentUser.role);
  const canUpdateStatus = ['Admin', 'Officer', 'Inspector'].includes(currentUser.role);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          href="/assets"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Assets List
        </Link>

        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/assets/${asset.id}/edit`}
              className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </Link>
          )}

          {canUpdateStatus && (
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-2 transition-all hover:scale-105"
            >
              <Clock className="w-4 h-4" />
              <span>Update Status & Condition</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Hero Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded">
                {asset.asset_code}
              </span>
              <span className="text-xs font-semibold text-slate-300">
                {asset.asset_type} • {asset.sub_type}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {asset.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                {asset.location_district}, {asset.location_taluka}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Constructed {asset.construction_year}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-400" />
                {asset.assigned_officer_name}
              </span>
            </div>
          </div>

          {/* Status & Condition Badges */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span
              className={`text-xs px-3 py-1 rounded-full font-bold shadow border ${getStatusBadgeColor(
                asset.status
              )}`}
            >
              Status: {asset.status}
            </span>
            <span
              className={`text-xs px-3 py-1 rounded-full font-bold shadow border ${getConditionBadgeColor(
                asset.condition
              )}`}
            >
              Condition: {asset.condition}
            </span>
          </div>
        </div>

        {/* Quick Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Sanctioned Valuation</span>
            <span className="text-lg font-bold text-white">{formatINR(asset.estimated_cost)}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Managing Wing</span>
            <span className="text-xs font-medium text-slate-200 truncate block">
              {asset.managing_department}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase">
              {isRoad ? 'Pavement Type' : 'Structure Type'}
            </span>
            <span className="text-xs font-bold text-emerald-400">
              {isRoad ? specs.pavement_type || 'Asphalt' : specs.structure_type || 'RCC Frame'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase">
              {isRoad ? 'Length & Lanes' : 'Storeys & Area'}
            </span>
            <span className="text-xs font-bold text-white">
              {isRoad
                ? `${specs.length_km || 0} km • ${specs.lane_count || 2} Lanes`
                : `${specs.number_of_floors || 1} Flrs • ${specs.builtup_area_sqm || 0} m²`}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Technical Specifications & Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`py-3 px-5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'timeline'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Lifecycle History Timeline ({history.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('files')}
          className={`py-3 px-5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'files'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Paperclip className="w-4 h-4" />
          <span>Photos & Documents ({asset.documents?.length || asset.photos?.length || 0})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & TECHNICAL SPECIFICATIONS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Description & Type Specific Specs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Box */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Project Summary & Scope
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {asset.description || 'No detailed scope description provided.'}
              </p>
            </div>

            {/* Specialized Technical Parameters */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {isRoad ? <Road className="w-5 h-5 text-blue-500" /> : <Building2 className="w-5 h-5 text-amber-500" />}
                {asset.asset_type} Engineering Parameters
              </h3>

              {isRoad ? (
                /* Road Attributes */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Total Corridor Length</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {specs.length_km || 0} km
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Carriageway Width</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {specs.width_m || 0} m
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Lanes Count</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {specs.lane_count || 2} Lanes
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Pavement Type</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {specs.pavement_type || 'Asphalt / BT'}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Traffic Rating</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {specs.traffic_category || 'Commercial'}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Chainage Span</span>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {specs.start_chainage || '0+000'} to {specs.end_chainage || 'End'}
                    </span>
                  </div>
                </div>
              ) : (
                /* Building Attributes */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Number of Floors</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {specs.number_of_floors || 1} Storeys
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Plot Area</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {specs.plot_area_sqm || 0} m²
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Total Built-up Area</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {specs.builtup_area_sqm || 0} m²
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Structural Superstructure</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {specs.structure_type || 'RCC Frame'}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Occupancy Status</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {specs.occupancy_status || 'Occupied'}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Sanctioned Capacity</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {specs.sanctioned_capacity || 'N/A'} Persons
                    </span>
                  </div>
                </div>
              )}

              {/* Compliance & Amenities Checkbox Indicators */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 text-xs">
                {isRoad ? (
                  <>
                    <span className={`px-2.5 py-1 rounded-full font-semibold border ${specs.has_drainage ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                      {specs.has_drainage ? '✓ Stormwater Drain Built' : '✗ No Dedicated Drain'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full font-semibold border ${specs.has_footpath ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                      {specs.has_footpath ? '✓ Pedestrian Sidewalk' : '✗ No Sidewalk'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full font-semibold border ${specs.has_streetlights ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                      {specs.has_streetlights ? '✓ LED Streetlights' : '✗ No Streetlights'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className={`px-2.5 py-1 rounded-full font-semibold border ${specs.fire_safety_noc ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                      {specs.fire_safety_noc ? '✓ Fire Safety NOC Valid' : '⚠ Fire NOC Pending'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full font-semibold border ${specs.solar_installed ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                      {specs.solar_installed ? '✓ Rooftop Solar Power' : '✗ No Solar Installed'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full font-semibold border ${specs.has_compound_wall ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                      {specs.has_compound_wall ? '✓ Compound Wall Enclosure' : '✗ Open Perimeter'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Location, Financials, Assigned Officer */}
          <div className="space-y-6">
            {/* Financial Analysis */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-500" />
                Financial Expenditure
              </h3>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Sanctioned Estimate:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatINR(asset.estimated_cost)}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Actual Expended Cost:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {asset.actual_cost ? formatINR(asset.actual_cost) : 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 dark:text-slate-400">Budget Variance:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {asset.actual_cost && asset.estimated_cost
                      ? `${(((asset.estimated_cost - asset.actual_cost) / asset.estimated_cost) * 100).toFixed(1)}% Under Budget`
                      : 'On Track'}
                  </span>
                </div>
              </div>
            </div>

            {/* Officer & Department Info */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-500" />
                Administrative Officer
              </h3>

              <div className="space-y-2">
                <div>
                  <span className="text-slate-400 text-[10px] block">Assigned Nodal Officer</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {asset.assigned_officer_name}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Contact Details</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {asset.assigned_officer_contact || 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Nodal Department</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {asset.managing_department}
                  </span>
                </div>
              </div>
            </div>

            {/* Location & GIS Preview */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-500" />
                Geographic Location
              </h3>

              <div className="space-y-1.5">
                <div className="font-bold text-slate-900 dark:text-white">
                  {asset.location_district} District • {asset.location_taluka} Taluka
                </div>
                <div className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  {asset.location_address}
                </div>
                <div className="font-mono text-emerald-600 dark:text-emerald-400 text-[11px] pt-1">
                  Lat: {asset.latitude || 23.2156}° N | Lng: {asset.longitude || 72.6369}° E
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIFECYCLE HISTORY & VISUAL TIMELINE */}
      {activeTab === 'timeline' && <VisualTimeline history={history} />}

      {/* TAB 3: PHOTOS & DOCUMENTS GALLERY */}
      {activeTab === 'files' && (
        <div className="space-y-6">
          {/* Photos Grid */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-500" />
              Site Inspection Photos ({asset.photos?.length || 0})
            </h3>

            {asset.photos && asset.photos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {asset.photos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="relative h-48 bg-slate-800 rounded-xl overflow-hidden group shadow"
                  >
                    <img
                      src={photo}
                      alt={`Site Photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a
                        href={photo}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-white text-slate-900 font-bold rounded-lg text-xs"
                      >
                        View Full Image
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No site inspection photos attached.</p>
            )}
          </div>

          {/* Audit Documents List */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Compliance & Inspection Documents ({asset.documents?.length || 0})
            </h3>

            {asset.documents && asset.documents.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {asset.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="py-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg px-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{doc.title}</div>
                        <div className="text-[11px] text-slate-400">
                          Uploaded on {formatDate(doc.uploaded_at)}
                        </div>
                      </div>
                    </div>

                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg font-semibold flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No compliance documents attached.</p>
            )}
          </div>
        </div>
      )}

      {/* Lifecycle Status Modal */}
      <StatusUpdateModal
        asset={asset}
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={() => fetchDetails()}
      />
    </div>
  );
}
