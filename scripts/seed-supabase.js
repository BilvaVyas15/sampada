const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach((line) => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('Supabase URL or Key missing in .env.local');
  process.exit(1);
}

console.log('Connecting to Supabase at:', url);
const supabase = createClient(url, key);

const initialAssets = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    asset_code: 'GND-RD-001',
    title: 'CH-Road Arterial Flyover & Metro Corridor (Sector 11 to Sector 17)',
    asset_type: 'Road',
    sub_type: 'Flyover',
    status: 'Operational',
    condition: 'Good',
    location_district: 'Gandhinagar',
    location_taluka: 'Gandhinagar City',
    location_address: 'CH Road Central Axis, Connecting Sector 11 Square to Sector 17',
    latitude: 23.2185,
    longitude: 72.637,
    estimated_cost: 1850000000,
    actual_cost: 1820000000,
    construction_year: 2022,
    managing_department: 'R&B Department - Gandhinagar Executive Circle',
    assigned_officer_name: 'Er. Rajesh Patel (Executive Engineer, R&B)',
    assigned_officer_contact: '+91 98250 11223',
    description:
      '6-Lane elevated prestressed concrete flyover spanning 2.8 km over central Gandhinagar sectors with integrated LED illumination and sub-surface stormwater drainage.',
    specifications: {
      length_km: 2.8,
      width_m: 24.0,
      lane_count: 6,
      pavement_type: 'Asphalt / BT',
      start_chainage: '0+000 km',
      end_chainage: '2+800 km',
      traffic_category: 'Heavy Commercial',
      has_drainage: true,
      has_footpath: true,
      has_streetlights: true,
    },
    photos: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000',
      'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=1000',
    ],
    documents: [
      {
        id: 'doc-101',
        asset_id: 'a1111111-1111-1111-1111-111111111111',
        doc_type: 'HANDOVER_LETTER',
        title: 'Final Handover & Safety Clearance Certificate.pdf',
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        file_type: 'document',
        uploaded_by_name: 'Er. Rajesh Patel',
        uploaded_at: '2022-11-15T10:00:00Z',
        verification_status: 'Verified',
        verified_by_name: 'Dr. Vikramaditya Parmar (Superintending Engineer)',
        verified_at: '2022-11-18T14:00:00Z',
        verification_notes: 'Verified against design specifications and structural friction test.',
      },
    ],
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    asset_code: 'GND-BLD-014',
    title: 'Mahatma Mandir Convention Annex & Administrative Complex',
    asset_type: 'Building',
    sub_type: 'Administrative Office',
    status: 'Operational',
    condition: 'Good',
    location_district: 'Gandhinagar',
    location_taluka: 'Gandhinagar City',
    location_address: 'Sector 13C, KH Road, Capitol Complex Perimeter, Gandhinagar',
    latitude: 23.2156,
    longitude: 72.6369,
    estimated_cost: 1250000000,
    actual_cost: 1235000000,
    construction_year: 2020,
    managing_department: 'General Administration Dept & R&B Department',
    assigned_officer_name: 'Er. Sunita Mehta (Superintending Engineer)',
    assigned_officer_contact: '+91 98795 44321',
    description:
      'Multi-storey administrative secretariat annex with 300 kW rooftop solar array, central auditorium, and zero-discharge rainwater harvesting setup.',
    specifications: {
      number_of_floors: 8,
      plot_area_sqm: 14500,
      builtup_area_sqm: 31200,
      structure_type: 'RCC Frame',
      occupancy_status: 'Fully Occupied',
      sanctioned_capacity: 1500,
      fire_safety_noc: true,
      solar_installed: true,
      has_compound_wall: true,
      has_dedicated_drainage: true,
    },
    photos: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000',
      'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=1000',
    ],
    documents: [
      {
        id: 'doc-102',
        asset_id: 'a2222222-2222-2222-2222-222222222222',
        doc_type: 'FIRE_SAFETY_NOC',
        title: 'Fire_Safety_NOC_Gandhinagar_2025.pdf',
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        file_type: 'document',
        uploaded_by_name: 'Er. Sunita Mehta',
        uploaded_at: '2025-01-10T12:30:00Z',
        verification_status: 'Verified',
        verified_by_name: 'Chief Fire Officer Gandhinagar',
        verified_at: '2025-01-12T16:00:00Z',
        verification_notes: 'Compliance checked for sprinklers and fire exits.',
      },
    ],
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    asset_code: 'GND-RD-042',
    title: 'GIFT City - PDPU Bridge & Access Underpass (KH-6 Circle)',
    asset_type: 'Road',
    sub_type: 'Underpass',
    status: 'Under Maintenance',
    condition: 'Poor',
    location_district: 'Gandhinagar',
    location_taluka: 'Gandhinagar City',
    location_address: 'KH-6 Circle, PDPU Road Junction, Gandhinagar',
    latitude: 23.161,
    longitude: 72.6841,
    estimated_cost: 740000000,
    actual_cost: 730000000,
    construction_year: 2021,
    managing_department: 'GIFT Urban Development & R&B Division',
    assigned_officer_name: 'Er. Jitesh Shah (Deputy Executive Engineer)',
    assigned_officer_contact: '+91 94268 77112',
    description:
      '4-Lane depressed underpass carrying GIFT City commuter traffic. Post-monsoon asphalt resurfacing and storm pump maintenance ongoing.',
    specifications: {
      length_km: 1.2,
      width_m: 18.0,
      lane_count: 4,
      pavement_type: 'Asphalt / BT',
      start_chainage: '0+000 km',
      end_chainage: '1+200 km',
      traffic_category: 'Heavy Commercial',
      has_drainage: true,
      has_footpath: true,
      has_streetlights: true,
    },
    photos: [
      'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=1000',
    ],
    documents: [
      {
        id: 'doc-103',
        asset_id: 'a3333333-3333-3333-3333-333333333333',
        doc_type: 'DAMAGE_INSPECTION_REPORT',
        title: 'Post_Monsoon_Inspection_Defect_Audit.pdf',
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        file_type: 'document',
        uploaded_by_name: 'Er. Jitesh Shah',
        uploaded_at: '2026-08-14T09:15:00Z',
        verification_status: 'Verified',
        verified_by_name: 'Er. Rajesh Patel',
        verified_at: '2026-08-15T11:00:00Z',
        verification_notes: 'Inspection report verified. Maintenance work order allocated.',
      },
    ],
  },
  {
    id: 'a4444444-4444-4444-4444-444444444444',
    asset_code: 'GND-BLD-088',
    title: 'Sector 21 Civil Hospital New Emergency Care Block',
    asset_type: 'Building',
    sub_type: 'Government Hospital / PHC',
    status: 'Under Construction',
    condition: 'Fair',
    pending_target_status: 'Completed',
    location_district: 'Gandhinagar',
    location_taluka: 'Gandhinagar City',
    location_address: 'Sector 21 Main Road, Opposite District Panchayat, Gandhinagar',
    latitude: 23.2301,
    longitude: 72.6512,
    estimated_cost: 490000000,
    actual_cost: 350000000,
    construction_year: 2025,
    managing_department: 'Health & Family Welfare Dept / R&B Gandhinagar',
    assigned_officer_name: 'Er. Bhavin Trivedi (Assistant Engineer)',
    assigned_officer_contact: '+91 97129 33884',
    description:
      'G+6 200-Bed Trauma & Critical Care Block. Structural frame complete; medical gas piping and interior finishing currently in progress.',
    specifications: {
      number_of_floors: 7,
      plot_area_sqm: 7800,
      builtup_area_sqm: 15400,
      structure_type: 'RCC Frame',
      occupancy_status: 'Vacant',
      sanctioned_capacity: 200,
      fire_safety_noc: false,
      solar_installed: true,
      has_compound_wall: true,
      has_dedicated_drainage: true,
    },
    photos: [
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1000',
    ],
    documents: [
      {
        id: 'doc-104',
        asset_id: 'a4444444-4444-4444-4444-444444444444',
        doc_type: 'MEASUREMENT_BOOK',
        title: 'Measurement_Book_Phase3_Excerpt.pdf',
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        file_type: 'document',
        uploaded_by_name: 'Er. Bhavin Trivedi',
        uploaded_at: '2026-09-10T14:20:00Z',
        verification_status: 'Pending',
        verification_notes: 'Pending Chief Engineer sign-off on completion certificate.',
      },
    ],
  },
];

async function seed() {
  console.log('Seeding Supabase Database...');

  for (const asset of initialAssets) {
    const { data, error } = await supabase
      .from('assets')
      .upsert([asset], { onConflict: 'id' });

    if (error) {
      console.error(`Error inserting asset ${asset.asset_code}:`, error.message);
    } else {
      console.log(`✓ Inserted asset ${asset.asset_code}: ${asset.title}`);
    }
  }

  console.log('Seed completed successfully!');
}

seed();
