// ──────────────────────────────────────────────────────────────────────────────
// Fleet Booking — Initial Data, Types & Service Configuration
// ──────────────────────────────────────────────────────────────────────────────

// TODO: confirm official service name for Gully Bowser (currently "Gutter / Gully Bowser")
// TODO: confirm official tariff rates with Pradeshiya Sabha before go-live

import type { VehicleRecord, DriverRecord } from './initialFleetData'

// ── Depot ──────────────────────────────────────────────────────────────────────
/** Municipal depot GPS coordinates used as the haversine distance origin. */
export const DEPOT_COORDS = { lat: 6.8433, lng: 80.0014 } // Homagama Municipal Depot

// ── Service Types ─────────────────────────────────────────────────────────────
export type ServiceType = 'GULLY_BOWSER' | 'WATER_BOWSER'

/** Gully-Bowser specific service form fields */
export interface GullyServiceDetails {
  serviceType: 'GULLY_BOWSER'
  pitVolumeLitres: number
  wasteType: 'Domestic Septage' | 'Commercial Septage' | 'Drain & Gully Silt'
  distanceFromGateM: number
  hoseLengthRequiredM: number
  roadWidthM: number
}

/** Water-Bowser specific service form fields */
export interface WaterServiceDetails {
  serviceType: 'WATER_BOWSER'
  waterVolumeLitres: number
  loadsRequired: number
  purpose: 'Drinking' | 'Domestic' | 'Festival' | 'Construction'
  storageTankType: 'Overhead Tank' | 'Ground Sump' | 'Barrel or Small Tank' | 'Reservoir'
}

export type ServiceDetails = GullyServiceDetails | WaterServiceDetails

// ── Booking Statuses ──────────────────────────────────────────────────────────
export type BookingStatus =
  | 'Pending TO Review'
  | 'Rejected'
  | 'Awaiting Payment'
  | 'Payment Expired'
  | 'Confirmed'
  | 'Vehicle Assigned'
  | 'En Route'
  | 'Service In Progress'
  | 'In Transit to Plant'
  | 'Pending Closeout'
  | 'Completed'

// ── Booking Source ────────────────────────────────────────────────────────────
export type BookingSource = 'Citizen Portal' | 'Staff Counter'

// ── Applicant Details ─────────────────────────────────────────────────────────
export interface ApplicantDetails {
  name: string
  nic: string
  phone: string
  address: string
  ward: string
}

// ── Location Pin ──────────────────────────────────────────────────────────────
export interface LocationPin {
  lat: number
  lng: number
  label: string // human-readable location name
}

// ── Fee Breakdown ─────────────────────────────────────────────────────────────
export interface FeeBreakdown {
  loads: number
  distanceKm: number
  farePerLoad: number
  transportFeePerKm: number
  totalLKR: number
}

// ── TO Checklist ─────────────────────────────────────────────────────────────
export interface TOChecklistResult {
  roadAccess: boolean
  vehicleTurningRadius?: boolean   // Gully only
  suctionDistance?: boolean        // Gully only
  bowserCapacity?: boolean         // Gully only
  deliveryRoadBridgeLimits?: boolean // Water only
  slope?: boolean                  // Water only
  pumpingHoseReach?: boolean       // Water only
  waterReservoirStock?: boolean    // Water only
}

// ── E-Receipt ────────────────────────────────────────────────────────────────
export interface EReceipt {
  receiptNumber: string
  method: 'Counter Cash' | 'Counter Card' | 'Online Payment'
  paidAt: string // ISO timestamp string
  amountLKR: number
}

// ── Disposal / Delivery Log ──────────────────────────────────────────────────
export interface DisposalLog {
  plantName: string
  weighbridgeTicketNo: string
  volumeLitres: number
  weightKg: number
}

export interface DeliveryLog {
  flowmeterStart: number
  flowmeterEnd: number
  litresDelivered: number
}

// ── Timeline Entry ───────────────────────────────────────────────────────────
export interface TimelineEntry {
  at: string        // ISO timestamp string
  actor: string
  event: string
  note?: string
}

// ── Notification Entry ───────────────────────────────────────────────────────
export interface NotificationEntry {
  at: string        // ISO timestamp string
  channel: 'SMS' | 'Notice'
  recipient: string
  message: string
  label: 'Simulated'
}

// ── Main Booking Record ──────────────────────────────────────────────────────
export interface BookingRecord {
  id: string
  referenceNumber: string           // GB-2026-0001 | WB-2026-0001
  serviceType: ServiceType
  source: BookingSource
  status: BookingStatus

  applicant: ApplicantDetails
  location: LocationPin
  scheduledDate: string             // YYYY-MM-DD
  scheduledTime: string             // HH:MM

  serviceDetails: ServiceDetails
  estimatedFee: FeeBreakdown

  // TO Review
  toChecklistResult?: TOChecklistResult
  toAdjustedLoads?: number
  toAdjustedDistanceKm?: number
  rejectionReason?: string
  approvedAt?: string               // ISO timestamp

  // Payment
  paymentDueBy?: string             // ISO timestamp — approvedAt + 24h
  receipt?: EReceipt

  // Assignment
  assignedVehicleId?: string
  assignedVehicleReg?: string
  assignedDriverId?: string
  assignedDriverName?: string
  dispatchedAt?: string             // ISO timestamp

  // Job Progress
  enRouteAt?: string                // ISO timestamp
  serviceStartedAt?: string         // ISO timestamp
  inTransitToPlantAt?: string       // ISO timestamp (Gully only)
  pendingCloseoutAt?: string        // ISO timestamp
  completedAt?: string              // ISO timestamp

  // Closeout logs
  disposalLog?: DisposalLog         // Gully only
  deliveryLog?: DeliveryLog         // Water only
  citizenSignOff?: string           // Name/initials

  // Audit trail
  timeline: TimelineEntry[]
  notifications: NotificationEntry[]
}

// ── Service Configuration ─────────────────────────────────────────────────────
export interface ServiceConfig {
  label: string
  referencePrefix: string
  vehicleCategory: string     // must match VehicleRecord.category
  farePerLoad: number
  transportFeePerKm: number
  supervisorTitle: string
  bookingRanges: {
    pitVolumeLitres: { min: number; max: number }
    distanceFromGateM: { min: number; max: number }
    hoseLengthRequiredM: { min: number; max: number }
    roadWidthM: { min: number; max: number }
    waterVolumeLitres: { min: number; max: number }
    loadsRequired: { min: number; max: number }
    technicalLoads: { min: number; max: number }
    technicalDistanceKm: { min: number; max: number }
  }
  closeoutStepNames: { field: string; plant?: string; closeout: string }
}

/**
 * Config-driven service type registry.
 * To add a new service vehicle, add an entry here — no page rewrites needed.
 * TODO: confirm official tariff rates with Pradeshiya Sabha.
 */
export const SERVICE_CONFIG: Record<ServiceType, ServiceConfig> = {
  GULLY_BOWSER: {
    label: 'Gutter / Gully Bowser', // TODO: confirm official service name
    referencePrefix: 'GB',
    vehicleCategory: 'Gully Bowser',
    farePerLoad: 4500,           // LKR per load — placeholder
    transportFeePerKm: 150,      // LKR per km — placeholder
    supervisorTitle: 'Fleet Supervisor',
    bookingRanges: {
      pitVolumeLitres: { min: 500, max: 30000 },
      distanceFromGateM: { min: 0, max: 500 },
      hoseLengthRequiredM: { min: 0, max: 200 },
      roadWidthM: { min: 1, max: 15 },
      waterVolumeLitres: { min: 1000, max: 100000 },
      loadsRequired: { min: 1, max: 20 },
      technicalLoads: { min: 1, max: 20 },
      technicalDistanceKm: { min: 0.1, max: 100 },
    },
    closeoutStepNames: {
      field: 'Pit Emptied',
      plant: 'Disposed at Treatment Plant',
      closeout: 'Job Verified & Closed',
    },
  },
  WATER_BOWSER: {
    label: 'Water Bowser',
    referencePrefix: 'WB',
    vehicleCategory: 'Water Bowser',
    farePerLoad: 3000,           // LKR per load — placeholder
    transportFeePerKm: 100,      // LKR per km — placeholder
    supervisorTitle: 'Water Supply Supervisor',
    bookingRanges: {
      pitVolumeLitres: { min: 500, max: 30000 },
      distanceFromGateM: { min: 0, max: 500 },
      hoseLengthRequiredM: { min: 0, max: 200 },
      roadWidthM: { min: 1, max: 15 },
      waterVolumeLitres: { min: 1000, max: 100000 },
      loadsRequired: { min: 1, max: 20 },
      technicalLoads: { min: 1, max: 20 },
      technicalDistanceKm: { min: 0.1, max: 100 },
    },
    closeoutStepNames: {
      field: 'Water Delivered',
      closeout: 'Delivery Verified & Closed',
    },
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// EXTRA SEED VEHICLES & DRIVERS (added to support active-booking consistency)
// These are appended to INITIAL_VEHICLES / INITIAL_DRIVERS in the hook.
// ─────────────────────────────────────────────────────────────────────────────

/** Extra Gully Bowser for active En Route booking (BK-007) */
export const EXTRA_VEHICLE_GULLY_ACTIVE: VehicleRecord = {
  id: 'VEH-007',
  registrationNumber: 'WP GB-5544',
  name: 'Ashok Leyland 6000L Gully Vacuum Bowser',
  category: 'Gully Bowser',
  department: 'Public Health & Sanitation',
  fuelType: 'Diesel',
  odometerKm: 55200,
  yearOfManufacture: 2021,
  status: 'On Mission',
  currentLocation: 'Godagama – En Route to Service Site (Booking GB-2026-0004)',
  activeMission: {
    destination: '24/A, Godagama Road, Godagama, Homagama',
    purpose: 'Gutter / Gully Bowser – GB-2026-0004',
    dispatchedAt: '2026-10-21 08:00 AM',
    estimatedReturn: '2026-10-21 12:30 PM',
  },
  assignedDriverId: 'DRV-09',
  assignedDriverName: 'Chaminda Perera',
  permitExpiryDate: '2027-06-30',
  revenueLicenseExpiryDate: '2027-06-30',
  insuranceExpiryDate: '2027-07-31',
  maintenanceHistory: [],
}

/** Extra Water Bowser for active Service-In-Progress booking (BK-008) */
export const EXTRA_VEHICLE_WATER_ACTIVE: VehicleRecord = {
  id: 'VEH-008',
  registrationNumber: 'WP LG-7730',
  name: 'Tata LPK 1618 Water Bowser 12,000L',
  category: 'Water Bowser',
  department: 'Works & Engineering',
  fuelType: 'Diesel',
  odometerKm: 43100,
  yearOfManufacture: 2023,
  status: 'On Mission',
  currentLocation: 'Mattegoda Estate – Service In Progress (Booking WB-2026-0004)',
  activeMission: {
    destination: 'Mattegoda Estate, Mattegoda',
    purpose: 'Water Bowser – WB-2026-0004',
    dispatchedAt: '2026-10-21 07:30 AM',
    estimatedReturn: '2026-10-21 11:00 AM',
  },
  assignedDriverId: 'DRV-10',
  assignedDriverName: 'Ruwan Sanjeewa',
  permitExpiryDate: '2027-09-15',
  revenueLicenseExpiryDate: '2027-09-15',
  insuranceExpiryDate: '2027-10-01',
  maintenanceHistory: [],
}

/** Extra available Gully Bowser for assignment demos */
export const EXTRA_VEHICLE_GULLY_AVAIL: VehicleRecord = {
  id: 'VEH-009',
  registrationNumber: 'WP GB-8831',
  name: 'Tata LPK 813 Gully Bowser 5000L',
  category: 'Gully Bowser',
  department: 'Public Health & Sanitation',
  fuelType: 'Diesel',
  odometerKm: 29400,
  yearOfManufacture: 2022,
  status: 'Available',
  currentLocation: 'Sanitation Unit Depot – Yard B',
  assignedDriverId: 'DRV-11',
  assignedDriverName: 'Nalin Kumara',
  permitExpiryDate: '2027-08-20',
  revenueLicenseExpiryDate: '2027-08-20',
  insuranceExpiryDate: '2027-09-30',
  maintenanceHistory: [],
}

/** Extra available Water Bowser for assignment demos */
export const EXTRA_VEHICLE_WATER_AVAIL: VehicleRecord = {
  id: 'VEH-010',
  registrationNumber: 'WP LG-4418',
  name: 'Isuzu FTR Water Bowser 8000L',
  category: 'Water Bowser',
  department: 'Works & Engineering',
  fuelType: 'Diesel',
  odometerKm: 18700,
  yearOfManufacture: 2024,
  status: 'Available',
  currentLocation: 'Municipal Depot – Heavy Vehicle Bay 04',
  assignedDriverId: 'DRV-12',
  assignedDriverName: 'Asanka Jayawardena',
  permitExpiryDate: '2028-01-10',
  revenueLicenseExpiryDate: '2028-01-10',
  insuranceExpiryDate: '2028-02-28',
  maintenanceHistory: [],
}

/** Extra Gully Bowser released at Pending Closeout per spec rule */
export const EXTRA_VEHICLE_GULLY_CLOSEOUT: VehicleRecord = {
  id: 'VEH-011',
  registrationNumber: 'WP GB-3302',
  name: 'Ashok Leyland 9000L Gully Bowser (Super)',
  category: 'Gully Bowser',
  department: 'Public Health & Sanitation',
  fuelType: 'Diesel',
  odometerKm: 71200,
  yearOfManufacture: 2020,
  status: 'Available', // Released at Pending Closeout per spec release rule
  currentLocation: 'Sanitation Unit Depot – Yard A',
  assignedDriverId: 'DRV-13',
  assignedDriverName: 'Pradeep Seneviratne',
  permitExpiryDate: '2027-03-31',
  revenueLicenseExpiryDate: '2027-03-31',
  insuranceExpiryDate: '2027-04-30',
  maintenanceHistory: [],
}

/** Extra Gully Bowser for the seeded In-Transit-to-Plant booking (BK-014). */
export const EXTRA_VEHICLE_GULLY_TRANSIT: VehicleRecord = {
  id: 'VEH-012',
  registrationNumber: 'WP GB-7712',
  name: 'Isuzu Forward Gully Bowser 8000L',
  category: 'Gully Bowser',
  department: 'Public Health & Sanitation',
  fuelType: 'Diesel',
  odometerKm: 51800,
  yearOfManufacture: 2021,
  status: 'On Mission',
  currentLocation: 'Homagama Septage Treatment Plant – In Transit',
  activeMission: {
    destination: 'Homagama Septage Treatment Plant',
    purpose: 'Gully Bowser – GB-2026-0009',
    dispatchedAt: '2026-10-21 09:00 AM',
    estimatedReturn: '2026-10-21 12:00 PM',
  },
  assignedDriverId: 'DRV-14',
  assignedDriverName: 'Saman Wijesinghe',
  permitExpiryDate: '2027-11-30',
  revenueLicenseExpiryDate: '2027-11-30',
  insuranceExpiryDate: '2027-12-31',
  maintenanceHistory: [],
}

/** Array of all extra seed vehicles for bowser service bookings */
export const EXTRA_VEHICLES: VehicleRecord[] = [
  EXTRA_VEHICLE_GULLY_ACTIVE,
  EXTRA_VEHICLE_WATER_ACTIVE,
  EXTRA_VEHICLE_GULLY_AVAIL,
  EXTRA_VEHICLE_WATER_AVAIL,
  EXTRA_VEHICLE_GULLY_CLOSEOUT,
  EXTRA_VEHICLE_GULLY_TRANSIT,
]

export const EXTRA_DRIVERS: DriverRecord[] = [
  {
    id: 'DRV-09',
    name: 'Chaminda Perera',
    employeeId: 'PS-DRV-009',
    phone: '071-9923401',
    licenseNumber: 'DL-7712390',
    licenseGrade: 'Heavy Vehicle (Class E)',
    assignedVehicleId: 'VEH-007',
    assignedVehicleReg: 'WP GB-5544',
    status: 'On Duty',
  },
  {
    id: 'DRV-10',
    name: 'Ruwan Sanjeewa',
    employeeId: 'PS-DRV-010',
    phone: '077-3312845',
    licenseNumber: 'DL-8892014',
    licenseGrade: 'Heavy Vehicle (Class E)',
    assignedVehicleId: 'VEH-008',
    assignedVehicleReg: 'WP LG-7730',
    status: 'On Duty',
  },
  {
    id: 'DRV-11',
    name: 'Nalin Kumara',
    employeeId: 'PS-DRV-011',
    phone: '076-5521093',
    licenseNumber: 'DL-4490128',
    licenseGrade: 'Heavy Vehicle (Class E)',
    assignedVehicleId: 'VEH-009',
    assignedVehicleReg: 'WP GB-8831',
    status: 'On Duty',
  },
  {
    id: 'DRV-12',
    name: 'Asanka Jayawardena',
    employeeId: 'PS-DRV-012',
    phone: '078-6643201',
    licenseNumber: 'DL-3381726',
    licenseGrade: 'Heavy Vehicle (Class E)',
    assignedVehicleId: 'VEH-010',
    assignedVehicleReg: 'WP LG-4418',
    status: 'On Duty',
  },
  {
    id: 'DRV-13',
    name: 'Pradeep Seneviratne',
    employeeId: 'PS-DRV-013',
    phone: '070-9920384',
    licenseNumber: 'DL-6612047',
    licenseGrade: 'Heavy Vehicle (Class E)',
    assignedVehicleId: 'VEH-011',
    assignedVehicleReg: 'WP GB-3302',
    status: 'On Duty',
  },
  {
    id: 'DRV-14',
    name: 'Saman Wijesinghe',
    employeeId: 'PS-DRV-014',
    phone: '071-8802345',
    licenseNumber: 'DL-7743102',
    licenseGrade: 'Heavy Vehicle (Class E)',
    assignedVehicleId: 'VEH-012',
    assignedVehicleReg: 'WP GB-7712',
    status: 'On Duty',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL BOOKINGS — 15 seed records covering every status, both services,
// both sources. Timestamps are relative to "now" and computed by the hook
// lazy-initializer (never during render).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds 15 seed bookings relative to the provided wall-clock timestamp.
 * Call this inside a useState lazy initializer, never during render.
 */
export function buildInitialBookings(now: number): BookingRecord[] {
  const ts = (offsetMs: number): string => new Date(now + offsetMs).toISOString()
  const h = (hours: number) => hours * 3600 * 1000
  const dms = (days: number) => days * 24 * 3600 * 1000
  /** Formats a timestamp offset as a local calendar date. */
  const day = (offsetMs = 0): string => {
    const date = new Date(now + offsetMs)
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
  }

  const bookings: BookingRecord[] = [
    // ── BK-001: Pending TO Review — Gully, Citizen Portal ─────────────────
    {
      id: 'BK-001',
      referenceNumber: 'GB-2026-0001',
      serviceType: 'GULLY_BOWSER',
      source: 'Citizen Portal',
      status: 'Pending TO Review',
      applicant: {
        name: 'Sujeewa Dissanayake',
        nic: '892341567V',
        phone: '071-4412098',
        address: '14/B, Pitipana North Road, Pitipana, Homagama',
        ward: 'Ward 03 – Pitipana North',
      },
      location: { lat: 6.8552, lng: 80.0121, label: 'Pitipana North Road, Pitipana' },
      scheduledDate: day(dms(3)),
      scheduledTime: '09:00',
      serviceDetails: {
        serviceType: 'GULLY_BOWSER',
        pitVolumeLitres: 3000,
        wasteType: 'Domestic Septage',
        distanceFromGateM: 15,
        hoseLengthRequiredM: 30,
        roadWidthM: 4.5,
      },
      estimatedFee: { loads: 1, distanceKm: 2.1, farePerLoad: 4500, transportFeePerKm: 150, totalLKR: 4815 },
      timeline: [{ at: ts(-h(6)), actor: 'Citizen Portal (System)', event: 'Booking Submitted', note: 'Ref: GB-2026-0001' }],
      notifications: [{ at: ts(-h(6)), channel: 'SMS', recipient: '071-4412098', message: 'Your Gutter / Gully Bowser booking (GB-2026-0001) has been received. A Technical Officer will review shortly.', label: 'Simulated' }],
    },

    // ── BK-002: Pending TO Review — Water, Staff Counter ─────────────────
    {
      id: 'BK-002',
      referenceNumber: 'WB-2026-0002',
      serviceType: 'WATER_BOWSER',
      source: 'Staff Counter',
      status: 'Pending TO Review',
      applicant: {
        name: 'Kamala Wijesinghe',
        nic: '756789012V',
        phone: '077-8812034',
        address: '38, Kiriwattuduwa Junction, Kiriwattuduwa',
        ward: 'Ward 07 – Kiriwattuduwa',
      },
      location: { lat: 6.8284, lng: 80.0245, label: 'Kiriwattuduwa Junction, Kiriwattuduwa' },
      scheduledDate: day(dms(5)),
      scheduledTime: '10:30',
      serviceDetails: { serviceType: 'WATER_BOWSER', waterVolumeLitres: 8000, loadsRequired: 1, purpose: 'Domestic', storageTankType: 'Ground Sump' },
      estimatedFee: { loads: 1, distanceKm: 3.5, farePerLoad: 3000, transportFeePerKm: 100, totalLKR: 3350 },
      timeline: [{ at: ts(-h(2)), actor: 'Staff Counter (Dev Admin)', event: 'Booking Created at Counter', note: 'Walk-in customer.' }],
      notifications: [{ at: ts(-h(2)), channel: 'SMS', recipient: '077-8812034', message: 'Your Water Bowser booking (WB-2026-0002) has been registered at the Pradeshiya Sabha counter.', label: 'Simulated' }],
    },

    // ── BK-003: Awaiting Payment — ~21h left ─────────────────────────────
    {
      id: 'BK-003',
      referenceNumber: 'GB-2026-0003',
      serviceType: 'GULLY_BOWSER',
      source: 'Citizen Portal',
      status: 'Awaiting Payment',
      applicant: {
        name: 'Roshan Madhushanka',
        nic: '901234567V',
        phone: '076-3319024',
        address: '7/A, Meegoda Town, Meegoda',
        ward: 'Ward 05 – Meegoda',
      },
      location: { lat: 6.8148, lng: 80.0062, label: 'Meegoda Town, Meegoda' },
      scheduledDate: day(dms(4)),
      scheduledTime: '08:00',
      serviceDetails: { serviceType: 'GULLY_BOWSER', pitVolumeLitres: 5000, wasteType: 'Commercial Septage', distanceFromGateM: 20, hoseLengthRequiredM: 40, roadWidthM: 5.0 },
      estimatedFee: { loads: 1, distanceKm: 4.2, farePerLoad: 4500, transportFeePerKm: 150, totalLKR: 5130 },
      toChecklistResult: { roadAccess: true, vehicleTurningRadius: true, suctionDistance: true, bowserCapacity: true },
      approvedAt: ts(-h(3)),
      paymentDueBy: ts(h(21)),
      timeline: [
        { at: ts(-dms(1)), actor: 'Citizen Portal (System)', event: 'Booking Submitted' },
        { at: ts(-h(3)), actor: 'Technical Officer – P.K. Samarasinghe', event: 'Booking Approved', note: 'Final fee: LKR 5,130. Payment due within 24 hours.' },
      ],
      notifications: [
        { at: ts(-dms(1)), channel: 'SMS', recipient: '076-3319024', message: 'Booking GB-2026-0003 received. Pending technical review.', label: 'Simulated' },
        { at: ts(-h(3)), channel: 'SMS', recipient: '076-3319024', message: 'GB-2026-0003 APPROVED. Fee: LKR 5,130. Please complete payment within 24 hours to confirm your booking.', label: 'Simulated' },
      ],
    },

    // ── BK-004: Awaiting Payment — ~2h left (RED countdown) ──────────────
    {
      id: 'BK-004',
      referenceNumber: 'WB-2026-0004',
      serviceType: 'WATER_BOWSER',
      source: 'Citizen Portal',
      status: 'Awaiting Payment',
      applicant: {
        name: 'Nimal Perera',
        nic: '831100345V',
        phone: '070-5541023',
        address: '52, Diyagama Road, Diyagama',
        ward: 'Ward 09 – Diyagama',
      },
      location: { lat: 6.8621, lng: 79.9812, label: 'Diyagama Road, Diyagama' },
      scheduledDate: day(dms(2)),
      scheduledTime: '13:00',
      serviceDetails: { serviceType: 'WATER_BOWSER', waterVolumeLitres: 12000, loadsRequired: 2, purpose: 'Construction', storageTankType: 'Ground Sump' },
      estimatedFee: { loads: 2, distanceKm: 5.6, farePerLoad: 3000, transportFeePerKm: 100, totalLKR: 6560 },
      toChecklistResult: { roadAccess: true, deliveryRoadBridgeLimits: true, slope: true, pumpingHoseReach: true, waterReservoirStock: true },
      approvedAt: ts(-h(22)),
      paymentDueBy: ts(h(2)),
      timeline: [
        { at: ts(-dms(2)), actor: 'Citizen Portal (System)', event: 'Booking Submitted' },
        { at: ts(-h(22)), actor: 'Technical Officer – P.K. Samarasinghe', event: 'Booking Approved', note: 'Loads adjusted to 2. Fee: LKR 6,560. Payment due within 24h.' },
      ],
      notifications: [
        { at: ts(-dms(2)), channel: 'SMS', recipient: '070-5541023', message: 'Booking WB-2026-0004 received. Pending technical review.', label: 'Simulated' },
        { at: ts(-h(22)), channel: 'SMS', recipient: '070-5541023', message: 'WB-2026-0004 APPROVED. Fee: LKR 6,560. URGENT: Payment required within ~2 hours or booking will be cancelled.', label: 'Simulated' },
      ],
    },

    // ── BK-005: Payment Expired ───────────────────────────────────────────
    {
      id: 'BK-005',
      referenceNumber: 'GB-2026-0005',
      serviceType: 'GULLY_BOWSER',
      source: 'Citizen Portal',
      status: 'Payment Expired',
      applicant: {
        name: 'Anura Rajapaksha',
        nic: '775678901V',
        phone: '071-7791023',
        address: '11, Kahathuduwa New Road, Kahathuduwa',
        ward: 'Ward 11 – Kahathuduwa',
      },
      location: { lat: 6.7942, lng: 80.0188, label: 'Kahathuduwa New Road, Kahathuduwa' },
      scheduledDate: day(-dms(1)),
      scheduledTime: '09:00',
      serviceDetails: { serviceType: 'GULLY_BOWSER', pitVolumeLitres: 4000, wasteType: 'Domestic Septage', distanceFromGateM: 10, hoseLengthRequiredM: 25, roadWidthM: 4.0 },
      estimatedFee: { loads: 1, distanceKm: 6.1, farePerLoad: 4500, transportFeePerKm: 150, totalLKR: 5415 },
      toChecklistResult: { roadAccess: true, vehicleTurningRadius: true, suctionDistance: true, bowserCapacity: true },
      approvedAt: ts(-h(48)),
      paymentDueBy: ts(-h(24)),
      timeline: [
        { at: ts(-dms(3)), actor: 'Citizen Portal (System)', event: 'Booking Submitted' },
        { at: ts(-h(48)), actor: 'Technical Officer – P.K. Samarasinghe', event: 'Booking Approved', note: 'Fee: LKR 5,415. Payment window: 24 hours.' },
        { at: ts(-h(24)), actor: 'System (Auto)', event: 'Payment Window Expired', note: 'No payment received within 24 hours. Booking auto-cancelled.' },
      ],
      notifications: [
        { at: ts(-dms(3)), channel: 'SMS', recipient: '071-7791023', message: 'Booking GB-2026-0005 received.', label: 'Simulated' },
        { at: ts(-h(48)), channel: 'SMS', recipient: '071-7791023', message: 'GB-2026-0005 APPROVED. Fee: LKR 5,415. Please pay within 24 hours.', label: 'Simulated' },
        { at: ts(-h(24)), channel: 'SMS', recipient: '071-7791023', message: 'GB-2026-0005 CANCELLED. Payment was not received within 24 hours. Please re-apply.', label: 'Simulated' },
      ],
    },

    // ── BK-006: Rejected ──────────────────────────────────────────────────
    {
      id: 'BK-006',
      referenceNumber: 'WB-2026-0006',
      serviceType: 'WATER_BOWSER',
      source: 'Staff Counter',
      status: 'Rejected',
      applicant: {
        name: 'Chamari Wijeratne',
        nic: '945612387V',
        phone: '077-2234501',
        address: '3/B, Godagama Estate, Godagama',
        ward: 'Ward 14 – Godagama',
      },
      location: { lat: 6.8712, lng: 79.9914, label: 'Godagama Estate, Godagama' },
      scheduledDate: day(dms(3)),
      scheduledTime: '07:30',
      serviceDetails: { serviceType: 'WATER_BOWSER', waterVolumeLitres: 20000, loadsRequired: 3, purpose: 'Festival', storageTankType: 'Reservoir' },
      estimatedFee: { loads: 3, distanceKm: 2.8, farePerLoad: 3000, transportFeePerKm: 100, totalLKR: 9280 },
      toChecklistResult: { roadAccess: false, deliveryRoadBridgeLimits: false, slope: true, pumpingHoseReach: true, waterReservoirStock: true },
      rejectionReason: 'The access road bridge to Godagama Estate has a 5-tonne weight limit. The fully loaded Water Bowser (~12 tonnes) cannot safely cross. Applicant must arrange alternative access or a smaller tanker lorry.',
      timeline: [
        { at: ts(-dms(2)), actor: 'Staff Counter (Dev Admin)', event: 'Booking Created at Counter' },
        { at: ts(-h(26)), actor: 'Technical Officer – P.K. Samarasinghe', event: 'Booking Rejected', note: 'Bridge weight limit (5 t) cannot support the loaded Water Bowser (≈12 t).' },
      ],
      notifications: [
        { at: ts(-dms(2)), channel: 'SMS', recipient: '077-2234501', message: 'Booking WB-2026-0006 received. Pending technical review.', label: 'Simulated' },
        { at: ts(-h(26)), channel: 'SMS', recipient: '077-2234501', message: 'WB-2026-0006 REJECTED. Reason: Bridge weight limit. Please contact the Pradeshiya Sabha for alternatives.', label: 'Simulated' },
      ],
    },

    // ── BK-007: En Route — Gully, VEH-007 / DRV-09 ──────────────────────
    {
      id: 'BK-007',
      referenceNumber: 'GB-2026-0007',
      serviceType: 'GULLY_BOWSER',
      source: 'Citizen Portal',
      status: 'En Route',
      applicant: {
        name: 'Lasith Gunasekara',
        nic: '862012934V',
        phone: '078-4491023',
        address: '24/A, Godagama Road, Godagama',
        ward: 'Ward 14 – Godagama',
      },
      location: { lat: 6.8688, lng: 79.9944, label: 'Godagama Road, Godagama' },
      scheduledDate: day(),
      scheduledTime: '09:00',
      serviceDetails: { serviceType: 'GULLY_BOWSER', pitVolumeLitres: 6000, wasteType: 'Drain & Gully Silt', distanceFromGateM: 25, hoseLengthRequiredM: 50, roadWidthM: 6.0 },
      estimatedFee: { loads: 2, distanceKm: 3.9, farePerLoad: 4500, transportFeePerKm: 150, totalLKR: 9585 },
      toChecklistResult: { roadAccess: true, vehicleTurningRadius: true, suctionDistance: true, bowserCapacity: true },
      approvedAt: ts(-dms(2)),
      paymentDueBy: ts(-dms(2) + h(24)),
      receipt: { receiptNumber: 'RCP-2026-0007', method: 'Online Payment', paidAt: ts(-dms(2) + h(20)), amountLKR: 9585 },
      assignedVehicleId: 'VEH-007',
      assignedVehicleReg: 'WP GB-5544',
      assignedDriverId: 'DRV-09',
      assignedDriverName: 'Chaminda Perera',
      dispatchedAt: ts(-h(2)),
      enRouteAt: ts(-h(2)),
      timeline: [
        { at: ts(-dms(3)), actor: 'Citizen Portal (System)', event: 'Booking Submitted' },
        { at: ts(-dms(2)), actor: 'Technical Officer – P.K. Samarasinghe', event: 'Booking Approved', note: 'Fee: LKR 9,585.' },
        { at: ts(-dms(2) + h(20)), actor: 'System (Online Payment)', event: 'Payment Received', note: 'Receipt: RCP-2026-0007.' },
        { at: ts(-h(3)), actor: 'Fleet Supervisor – S. Mendis', event: 'Vehicle Assigned', note: 'WP GB-5544 assigned with driver Chaminda Perera.' },
        { at: ts(-h(2)), actor: 'Driver – Chaminda Perera', event: 'En Route', note: 'Departed Sanitation Unit Depot.' },
      ],
      notifications: [
        { at: ts(-dms(3)), channel: 'SMS', recipient: '078-4491023', message: 'Booking GB-2026-0007 received.', label: 'Simulated' },
        { at: ts(-dms(2)), channel: 'SMS', recipient: '078-4491023', message: 'GB-2026-0007 APPROVED. Fee: LKR 9,585. Please pay within 24h.', label: 'Simulated' },
        { at: ts(-dms(2) + h(20)), channel: 'SMS', recipient: '078-4491023', message: 'Payment received for GB-2026-0007. Booking confirmed.', label: 'Simulated' },
        { at: ts(-h(3)), channel: 'SMS', recipient: '078-4491023', message: 'GB-2026-0007: Vehicle WP GB-5544 assigned. Driver: Chaminda Perera.', label: 'Simulated' },
      ],
    },

    // ── BK-008: Service In Progress — Water, VEH-008 / DRV-10 ────────────
    {
      id: 'BK-008',
      referenceNumber: 'WB-2026-0008',
      serviceType: 'WATER_BOWSER',
      source: 'Staff Counter',
      status: 'Service In Progress',
      applicant: {
        name: 'Priyantha Fernando',
        nic: '791231056V',
        phone: '076-9921045',
        address: 'Mattegoda Estate, Block C, Mattegoda',
        ward: 'Ward 06 – Mattegoda',
      },
      location: { lat: 6.8341, lng: 80.0301, label: 'Mattegoda Estate, Mattegoda' },
      scheduledDate: day(),
      scheduledTime: '08:00',
      serviceDetails: { serviceType: 'WATER_BOWSER', waterVolumeLitres: 10000, loadsRequired: 1, purpose: 'Drinking', storageTankType: 'Overhead Tank' },
      estimatedFee: { loads: 1, distanceKm: 4.5, farePerLoad: 3000, transportFeePerKm: 100, totalLKR: 3450 },
      toChecklistResult: { roadAccess: true, deliveryRoadBridgeLimits: true, slope: true, pumpingHoseReach: true, waterReservoirStock: true },
      approvedAt: ts(-dms(3)),
      paymentDueBy: ts(-dms(3) + h(24)),
      receipt: { receiptNumber: 'RCP-2026-0008', method: 'Counter Cash', paidAt: ts(-dms(3) + h(5)), amountLKR: 3450 },
      assignedVehicleId: 'VEH-008',
      assignedVehicleReg: 'WP LG-7730',
      assignedDriverId: 'DRV-10',
      assignedDriverName: 'Ruwan Sanjeewa',
      dispatchedAt: ts(-h(4)),
      enRouteAt: ts(-h(4)),
      serviceStartedAt: ts(-h(1)),
      timeline: [
        { at: ts(-dms(4)), actor: 'Staff Counter (Dev Admin)', event: 'Booking Created at Counter' },
        { at: ts(-dms(3)), actor: 'Technical Officer – P.K. Samarasinghe', event: 'Booking Approved', note: 'Fee: LKR 3,450.' },
        { at: ts(-dms(3) + h(5)), actor: 'Staff Counter (Dev Admin)', event: 'Payment Received', note: 'Receipt: RCP-2026-0008.' },
        { at: ts(-h(5)), actor: 'Water Supply Supervisor – R. Karunaratne', event: 'Vehicle Assigned', note: 'WP LG-7730 assigned with driver Ruwan Sanjeewa.' },
        { at: ts(-h(4)), actor: 'Driver – Ruwan Sanjeewa', event: 'En Route', note: 'Departed Municipal Depot.' },
        { at: ts(-h(1)), actor: 'Driver – Ruwan Sanjeewa', event: 'Service In Progress', note: 'Arrived on site. Pumping water to overhead tank.' },
      ],
      notifications: [
        { at: ts(-dms(4)), channel: 'SMS', recipient: '076-9921045', message: 'Booking WB-2026-0008 registered at counter.', label: 'Simulated' },
        { at: ts(-dms(3)), channel: 'SMS', recipient: '076-9921045', message: 'WB-2026-0008 APPROVED. Fee: LKR 3,450.', label: 'Simulated' },
        { at: ts(-dms(3) + h(5)), channel: 'SMS', recipient: '076-9921045', message: 'Payment confirmed for WB-2026-0008.', label: 'Simulated' },
        { at: ts(-h(5)), channel: 'SMS', recipient: '076-9921045', message: 'WB-2026-0008: Vehicle WP LG-7730 assigned. Driver: Ruwan Sanjeewa.', label: 'Simulated' },
      ],
    },

    // ── BK-009: Pending Closeout — Gully ─────────────────────────────────
    {
      id: 'BK-009',
      referenceNumber: 'GB-2026-0009',
      serviceType: 'GULLY_BOWSER',
      source: 'Citizen Portal',
      status: 'Pending Closeout',
      applicant: {
        name: 'Indika Weerasinghe',
        nic: '831023456V',
        phone: '071-3341022',
        address: '17, Panagoda Housing Scheme, Panagoda',
        ward: 'Ward 12 – Panagoda',
      },
      location: { lat: 6.8789, lng: 80.0081, label: 'Panagoda Housing Scheme, Panagoda' },
      scheduledDate: day(),
      scheduledTime: '07:00',
      serviceDetails: { serviceType: 'GULLY_BOWSER', pitVolumeLitres: 8000, wasteType: 'Commercial Septage', distanceFromGateM: 30, hoseLengthRequiredM: 60, roadWidthM: 5.5 },
      estimatedFee: { loads: 2, distanceKm: 5.2, farePerLoad: 4500, transportFeePerKm: 150, totalLKR: 9780 },
      toChecklistResult: { roadAccess: true, vehicleTurningRadius: true, suctionDistance: true, bowserCapacity: true },
      approvedAt: ts(-dms(5)),
      paymentDueBy: ts(-dms(5) + h(24)),
      receipt: { receiptNumber: 'RCP-2026-0009', method: 'Online Payment', paidAt: ts(-dms(5) + h(10)), amountLKR: 9780 },
      assignedVehicleId: 'VEH-011',
      assignedVehicleReg: 'WP GB-3302',
      assignedDriverId: 'DRV-13',
      assignedDriverName: 'Pradeep Seneviratne',
      dispatchedAt: ts(-dms(1) - h(1)),
      enRouteAt: ts(-dms(1) - h(1)),
      serviceStartedAt: ts(-dms(1) + h(1)),
      inTransitToPlantAt: ts(-dms(1) + h(3)),
      pendingCloseoutAt: ts(-dms(1) + h(5)),
      disposalLog: { plantName: 'Homagama Septage Treatment Plant', weighbridgeTicketNo: 'WB-TKT-0441', volumeLitres: 7800, weightKg: 8100 },
      timeline: [
        { at: ts(-dms(6)), actor: 'Citizen Portal (System)', event: 'Booking Submitted' },
        { at: ts(-dms(5)), actor: 'Technical Officer – P.K. Samarasinghe', event: 'Booking Approved', note: 'Fee: LKR 9,780.' },
        { at: ts(-dms(5) + h(10)), actor: 'System (Online Payment)', event: 'Payment Received', note: 'Receipt: RCP-2026-0009.' },
        { at: ts(-dms(1) - h(2)), actor: 'Fleet Supervisor – S. Mendis', event: 'Vehicle Assigned', note: 'WP GB-3302 assigned with driver Pradeep Seneviratne.' },
        { at: ts(-dms(1) - h(1)), actor: 'Driver – Pradeep Seneviratne', event: 'En Route' },
        { at: ts(-dms(1) + h(1)), actor: 'Driver – Pradeep Seneviratne', event: 'Service In Progress', note: 'Pit emptying commenced.' },
        { at: ts(-dms(1) + h(3)), actor: 'Driver – Pradeep Seneviratne', event: 'In Transit to Plant', note: 'Transporting to Homagama Septage Treatment Plant.' },
        { at: ts(-dms(1) + h(5)), actor: 'Driver – Pradeep Seneviratne', event: 'Pending Closeout', note: 'Disposed at plant. Weighbridge ticket: WB-TKT-0441. Vehicle & driver released.' },
      ],
      notifications: [
        { at: ts(-dms(6)), channel: 'SMS', recipient: '071-3341022', message: 'Booking GB-2026-0009 received.', label: 'Simulated' },
        { at: ts(-dms(5)), channel: 'SMS', recipient: '071-3341022', message: 'GB-2026-0009 APPROVED. Fee: LKR 9,780.', label: 'Simulated' },
        { at: ts(-dms(5) + h(10)), channel: 'SMS', recipient: '071-3341022', message: 'Payment confirmed for GB-2026-0009.', label: 'Simulated' },
        { at: ts(-dms(1) - h(2)), channel: 'SMS', recipient: '071-3341022', message: 'GB-2026-0009: Vehicle WP GB-3302 assigned. Driver: Pradeep Seneviratne.', label: 'Simulated' },
      ],
    },

    // ── BK-010: Completed — Water ─────────────────────────────────────────
    {
      id: 'BK-010',
      referenceNumber: 'WB-2026-0010',
      serviceType: 'WATER_BOWSER',
      source: 'Citizen Portal',
      status: 'Completed',
      applicant: {
        name: 'Rukmani Jayawardena',
        nic: '735123890V',
        phone: '078-9912345',
        address: '5, Homagama Town, Main Street',
        ward: 'Ward 01 – Homagama Town',
      },
      location: { lat: 6.8433, lng: 80.0014, label: 'Homagama Town, Main Street' },
      scheduledDate: day(-dms(3)),
      scheduledTime: '10:00',
      serviceDetails: { serviceType: 'WATER_BOWSER', waterVolumeLitres: 8000, loadsRequired: 1, purpose: 'Domestic', storageTankType: 'Overhead Tank' },
      estimatedFee: { loads: 1, distanceKm: 0.8, farePerLoad: 3000, transportFeePerKm: 100, totalLKR: 3080 },
      toChecklistResult: { roadAccess: true, deliveryRoadBridgeLimits: true, slope: true, pumpingHoseReach: true, waterReservoirStock: true },
      approvedAt: ts(-dms(7)),
      paymentDueBy: ts(-dms(7) + h(24)),
      receipt: { receiptNumber: 'RCP-2026-0010', method: 'Counter Card', paidAt: ts(-dms(7) + h(3)), amountLKR: 3080 },
      assignedVehicleId: 'VEH-002',
      assignedVehicleReg: 'WP LG-1102',
      assignedDriverId: 'DRV-02',
      assignedDriverName: 'Chamal Priyantha',
      dispatchedAt: ts(-dms(3) - h(1)),
      enRouteAt: ts(-dms(3) - h(1)),
      serviceStartedAt: ts(-dms(3) + h(1)),
      pendingCloseoutAt: ts(-dms(3) + h(3)),
      completedAt: ts(-dms(3) + h(5)),
      deliveryLog: { flowmeterStart: 10200, flowmeterEnd: 18200, litresDelivered: 8000 },
      citizenSignOff: 'R. Jayawardena',
      timeline: [
        { at: ts(-dms(10)), actor: 'Citizen Portal (System)', event: 'Booking Submitted' },
        { at: ts(-dms(7)), actor: 'Technical Officer – P.K. Samarasinghe', event: 'Booking Approved', note: 'Fee: LKR 3,080.' },
        { at: ts(-dms(7) + h(3)), actor: 'Staff Counter (Dev Admin)', event: 'Payment Received', note: 'Receipt: RCP-2026-0010.' },
        { at: ts(-dms(4)), actor: 'Water Supply Supervisor – R. Karunaratne', event: 'Vehicle Assigned', note: 'WP LG-1102 assigned.' },
        { at: ts(-dms(3) - h(1)), actor: 'Driver – Chamal Priyantha', event: 'En Route' },
        { at: ts(-dms(3) + h(1)), actor: 'Driver – Chamal Priyantha', event: 'Service In Progress' },
        { at: ts(-dms(3) + h(3)), actor: 'Driver – Chamal Priyantha', event: 'Pending Closeout', note: '8,000 L delivered (flowmeter 10200→18200).' },
        { at: ts(-dms(3) + h(5)), actor: 'Water Supply Supervisor – R. Karunaratne', event: 'Completed', note: 'Citizen sign-off: R. Jayawardena.' },
      ],
      notifications: [
        { at: ts(-dms(10)), channel: 'SMS', recipient: '078-9912345', message: 'Booking WB-2026-0010 received.', label: 'Simulated' },
        { at: ts(-dms(7)), channel: 'SMS', recipient: '078-9912345', message: 'WB-2026-0010 APPROVED. Fee: LKR 3,080.', label: 'Simulated' },
        { at: ts(-dms(7) + h(3)), channel: 'SMS', recipient: '078-9912345', message: 'Payment confirmed for WB-2026-0010.', label: 'Simulated' },
        { at: ts(-dms(3) + h(5)), channel: 'SMS', recipient: '078-9912345', message: 'WB-2026-0010 COMPLETED. Thank you for using Homagama Pradeshiya Sabha services.', label: 'Simulated' },
      ],
    },

    // ── BK-011: Confirmed — awaiting vehicle assignment (Gully) ──────────
    {
      id: 'BK-011',
      referenceNumber: 'GB-2026-0011',
      serviceType: 'GULLY_BOWSER',
      source: 'Staff Counter',
      status: 'Confirmed',
      applicant: {
        name: 'Wasantha Silva',
        nic: '912345678V',
        phone: '070-1123456',
        address: '78, Diyagama Housing Scheme, Diyagama',
        ward: 'Ward 09 – Diyagama',
      },
      location: { lat: 6.8654, lng: 79.9843, label: 'Diyagama Housing Scheme, Diyagama' },
      scheduledDate: day(dms(2)),
      scheduledTime: '08:00',
      serviceDetails: { serviceType: 'GULLY_BOWSER', pitVolumeLitres: 3500, wasteType: 'Domestic Septage', distanceFromGateM: 12, hoseLengthRequiredM: 25, roadWidthM: 4.0 },
      estimatedFee: { loads: 1, distanceKm: 4.0, farePerLoad: 4500, transportFeePerKm: 150, totalLKR: 5100 },
      toChecklistResult: { roadAccess: true, vehicleTurningRadius: true, suctionDistance: true, bowserCapacity: true },
      approvedAt: ts(-h(30)),
      paymentDueBy: ts(-h(30) + h(24)),
      receipt: { receiptNumber: 'RCP-2026-0011', method: 'Counter Cash', paidAt: ts(-h(30) + h(2)), amountLKR: 5100 },
      timeline: [
        { at: ts(-dms(2)), actor: 'Staff Counter (Dev Admin)', event: 'Booking Created at Counter' },
        { at: ts(-h(30)), actor: 'Technical Officer – P.K. Samarasinghe', event: 'Booking Approved', note: 'Fee: LKR 5,100.' },
        { at: ts(-h(30) + h(2)), actor: 'Staff Counter (Dev Admin)', event: 'Payment Received', note: 'Receipt: RCP-2026-0011. Counter Cash.' },
      ],
      notifications: [
        { at: ts(-dms(2)), channel: 'SMS', recipient: '070-1123456', message: 'Booking GB-2026-0011 registered.', label: 'Simulated' },
        { at: ts(-h(30)), channel: 'SMS', recipient: '070-1123456', message: 'GB-2026-0011 APPROVED. Fee: LKR 5,100.', label: 'Simulated' },
        { at: ts(-h(30) + h(2)), channel: 'SMS', recipient: '070-1123456', message: 'Payment confirmed for GB-2026-0011. Vehicle will be assigned shortly.', label: 'Simulated' },
      ],
    },

    // ── BK-012: Completed — Gully ─────────────────────────────────────────
    {
      id: 'BK-012',
      referenceNumber: 'GB-2026-0012',
      serviceType: 'GULLY_BOWSER',
      source: 'Citizen Portal',
      status: 'Completed',
      applicant: {
        name: 'Chathura Bandara',
        nic: '885601234V',
        phone: '077-4421012',
        address: '22, Homagama Town, Station Road',
        ward: 'Ward 02 – Homagama Town South',
      },
      location: { lat: 6.8412, lng: 80.0028, label: 'Homagama Town, Station Road' },
      scheduledDate: day(-dms(5)),
      scheduledTime: '07:30',
      serviceDetails: { serviceType: 'GULLY_BOWSER', pitVolumeLitres: 5000, wasteType: 'Domestic Septage', distanceFromGateM: 18, hoseLengthRequiredM: 35, roadWidthM: 5.0 },
      estimatedFee: { loads: 1, distanceKm: 0.3, farePerLoad: 4500, transportFeePerKm: 150, totalLKR: 4545 },
      toChecklistResult: { roadAccess: true, vehicleTurningRadius: true, suctionDistance: true, bowserCapacity: true },
      approvedAt: ts(-dms(9)),
      paymentDueBy: ts(-dms(9) + h(24)),
      receipt: { receiptNumber: 'RCP-2026-0012', method: 'Online Payment', paidAt: ts(-dms(9) + h(6)), amountLKR: 4545 },
      assignedVehicleId: 'VEH-006',
      assignedVehicleReg: 'WP GB-2291',
      assignedDriverId: 'DRV-06',
      assignedDriverName: 'Nuwan Pradeep',
      dispatchedAt: ts(-dms(5) - h(1)),
      enRouteAt: ts(-dms(5) - h(1)),
      serviceStartedAt: ts(-dms(5) + h(1)),
      inTransitToPlantAt: ts(-dms(5) + h(3)),
      pendingCloseoutAt: ts(-dms(5) + h(5)),
      completedAt: ts(-dms(5) + h(6)),
      disposalLog: { plantName: 'Homagama Septage Treatment Plant', weighbridgeTicketNo: 'WB-TKT-0398', volumeLitres: 4900, weightKg: 5200 },
      citizenSignOff: 'C. Bandara',
      timeline: [
        { at: ts(-dms(12)), actor: 'Citizen Portal (System)', event: 'Booking Submitted' },
        { at: ts(-dms(9)), actor: 'Technical Officer – P.K. Samarasinghe', event: 'Booking Approved', note: 'Fee: LKR 4,545.' },
        { at: ts(-dms(9) + h(6)), actor: 'System (Online Payment)', event: 'Payment Received', note: 'Receipt: RCP-2026-0012.' },
        { at: ts(-dms(6)), actor: 'Fleet Supervisor – S. Mendis', event: 'Vehicle Assigned', note: 'WP GB-2291 assigned with driver Nuwan Pradeep.' },
        { at: ts(-dms(5) - h(1)), actor: 'Driver – Nuwan Pradeep', event: 'En Route' },
        { at: ts(-dms(5) + h(1)), actor: 'Driver – Nuwan Pradeep', event: 'Service In Progress' },
        { at: ts(-dms(5) + h(3)), actor: 'Driver – Nuwan Pradeep', event: 'In Transit to Plant' },
        { at: ts(-dms(5) + h(5)), actor: 'Driver – Nuwan Pradeep', event: 'Pending Closeout', note: 'Disposed at plant. Weighbridge: WB-TKT-0398.' },
        { at: ts(-dms(5) + h(6)), actor: 'Fleet Supervisor – S. Mendis', event: 'Completed', note: 'Report verified. Citizen sign-off: C. Bandara.' },
      ],
      notifications: [
        { at: ts(-dms(12)), channel: 'SMS', recipient: '077-4421012', message: 'Booking GB-2026-0012 received.', label: 'Simulated' },
        { at: ts(-dms(9)), channel: 'SMS', recipient: '077-4421012', message: 'GB-2026-0012 APPROVED. Fee: LKR 4,545.', label: 'Simulated' },
        { at: ts(-dms(9) + h(6)), channel: 'SMS', recipient: '077-4421012', message: 'Payment confirmed for GB-2026-0012.', label: 'Simulated' },
        { at: ts(-dms(6)), channel: 'SMS', recipient: '077-4421012', message: 'GB-2026-0012: Vehicle WP GB-2291 assigned. Driver: Nuwan Pradeep.', label: 'Simulated' },
        { at: ts(-dms(5) + h(6)), channel: 'SMS', recipient: '077-4421012', message: 'GB-2026-0012 COMPLETED. Thank you for using Homagama Pradeshiya Sabha services.', label: 'Simulated' },
      ],
    },

    {
      id: 'BK-013',
      referenceNumber: 'GB-2026-9991',
      serviceType: 'GULLY_BOWSER',
      source: 'Citizen Portal',
      status: 'Vehicle Assigned',
      applicant: { name: 'Madhavi Ekanayake', nic: '916781234V', phone: '075-4402198', address: '19, Mattegoda Road, Homagama', ward: 'Ward 06 – Mattegoda' },
      location: { lat: 6.8317, lng: 80.0119, label: 'Mattegoda Road, Homagama' },
      scheduledDate: day(),
      scheduledTime: '14:00',
      serviceDetails: { serviceType: 'GULLY_BOWSER', pitVolumeLitres: 4200, wasteType: 'Domestic Septage', distanceFromGateM: 18, hoseLengthRequiredM: 30, roadWidthM: 4.5 },
      estimatedFee: { loads: 1, distanceKm: 3.2, farePerLoad: 4500, transportFeePerKm: 150, totalLKR: 4980 },
      toChecklistResult: { roadAccess: true, vehicleTurningRadius: true, suctionDistance: true, bowserCapacity: true },
      approvedAt: ts(-dms(2)),
      paymentDueBy: ts(-dms(2) + h(24)),
      receipt: { receiptNumber: 'RCP-2026-0013', method: 'Online Payment', paidAt: ts(-dms(2) + h(4)), amountLKR: 4980 },
      assignedVehicleId: 'VEH-009',
      assignedVehicleReg: 'WP GB-8831',
      assignedDriverId: 'DRV-11',
      assignedDriverName: 'Nalin Kumara',
      dispatchedAt: ts(-h(1)),
      timeline: [
        { at: ts(-dms(3)), actor: 'Citizen Portal (System)', event: 'Booking Submitted' },
        { at: ts(-dms(2)), actor: 'Technical Officer – P.K. Samarasinghe', event: 'Booking Approved', note: 'Fee: LKR 4,980.' },
        { at: ts(-dms(2) + h(4)), actor: 'System (Online Payment)', event: 'Payment Received', note: 'Receipt: RCP-2026-0013.' },
        { at: ts(-h(1)), actor: 'Fleet Supervisor – S. Mendis', event: 'Vehicle Assigned', note: 'WP GB-8831 assigned with driver Nalin Kumara.' },
      ],
      notifications: [
        { at: ts(-dms(3)), channel: 'SMS', recipient: '075-4402198', message: 'Booking GB-2026-9991 received.', label: 'Simulated' },
        { at: ts(-dms(2) + h(4)), channel: 'SMS', recipient: '075-4402198', message: 'Payment confirmed for GB-2026-9991.', label: 'Simulated' },
        { at: ts(-h(1)), channel: 'SMS', recipient: '075-4402198', message: 'GB-2026-9991: Vehicle WP GB-8831 assigned. Driver: Nalin Kumara.', label: 'Simulated' },
      ],
    },
    {
      id: 'BK-014',
      referenceNumber: 'GB-2026-9992',
      serviceType: 'GULLY_BOWSER',
      source: 'Staff Counter',
      status: 'In Transit to Plant',
      applicant: { name: 'Samanthi Perera', nic: '856712340V', phone: '072-7712088', address: '42, Godagama North, Godagama', ward: 'Ward 03 – Godagama' },
      location: { lat: 6.8528, lng: 80.0173, label: 'Godagama North, Godagama' },
      scheduledDate: day(),
      scheduledTime: '09:00',
      serviceDetails: { serviceType: 'GULLY_BOWSER', pitVolumeLitres: 6000, wasteType: 'Commercial Septage', distanceFromGateM: 20, hoseLengthRequiredM: 40, roadWidthM: 5 },
      estimatedFee: { loads: 1, distanceKm: 4.7, farePerLoad: 4500, transportFeePerKm: 150, totalLKR: 5205 },
      toChecklistResult: { roadAccess: true, vehicleTurningRadius: true, suctionDistance: true, bowserCapacity: true },
      approvedAt: ts(-dms(3)),
      paymentDueBy: ts(-dms(3) + h(24)),
      receipt: { receiptNumber: 'RCP-2026-0014', method: 'Counter Card', paidAt: ts(-dms(3) + h(5)), amountLKR: 5205 },
      assignedVehicleId: 'VEH-012',
      assignedVehicleReg: 'WP GB-7712',
      assignedDriverId: 'DRV-14',
      assignedDriverName: 'Saman Wijesinghe',
      dispatchedAt: ts(-h(3)),
      enRouteAt: ts(-h(3)),
      serviceStartedAt: ts(-h(2)),
      inTransitToPlantAt: ts(-h(1)),
      timeline: [
        { at: ts(-dms(4)), actor: 'Staff Counter (Current User)', event: 'Booking Created at Counter' },
        { at: ts(-dms(3)), actor: 'Technical Officer – P.K. Samarasinghe', event: 'Booking Approved', note: 'Fee: LKR 5,205.' },
        { at: ts(-dms(3) + h(5)), actor: 'Staff Counter (Current User)', event: 'Payment Received', note: 'Receipt: RCP-2026-0014.' },
        { at: ts(-h(4)), actor: 'Fleet Supervisor – S. Mendis', event: 'Vehicle Assigned', note: 'WP GB-7712 assigned with driver Saman Wijesinghe.' },
        { at: ts(-h(3)), actor: 'Driver – Saman Wijesinghe', event: 'En Route' },
        { at: ts(-h(2)), actor: 'Driver – Saman Wijesinghe', event: 'Service In Progress', note: 'Pit emptied; sealed load is travelling to the treatment plant.' },
        { at: ts(-h(1)), actor: 'Driver – Saman Wijesinghe', event: 'In Transit to Plant' },
      ],
      notifications: [
        { at: ts(-dms(4)), channel: 'SMS', recipient: '072-7712088', message: 'Booking GB-2026-9992 registered at the counter.', label: 'Simulated' },
        { at: ts(-dms(3) + h(5)), channel: 'SMS', recipient: '072-7712088', message: 'Payment confirmed for GB-2026-9992.', label: 'Simulated' },
        { at: ts(-h(4)), channel: 'SMS', recipient: '072-7712088', message: 'GB-2026-9992: Vehicle WP GB-7712 assigned. Driver: Saman Wijesinghe.', label: 'Simulated' },
      ],
    },
    {
      id: 'BK-015',
      referenceNumber: 'WB-2026-9993',
      serviceType: 'WATER_BOWSER',
      source: 'Citizen Portal',
      status: 'Confirmed',
      applicant: { name: 'Nadeesha Fernando', nic: '927650123V', phone: '077-3012456', address: '6, Kiriwattuduwa Lane, Kiriwattuduwa', ward: 'Ward 07 – Kiriwattuduwa' },
      location: { lat: 6.8261, lng: 80.0263, label: 'Kiriwattuduwa Lane, Kiriwattuduwa' },
      scheduledDate: day(dms(4)),
      scheduledTime: '11:00',
      serviceDetails: { serviceType: 'WATER_BOWSER', waterVolumeLitres: 8000, loadsRequired: 1, purpose: 'Domestic', storageTankType: 'Ground Sump' },
      estimatedFee: { loads: 1, distanceKm: 3.8, farePerLoad: 3000, transportFeePerKm: 100, totalLKR: 3380 },
      toChecklistResult: { roadAccess: true, deliveryRoadBridgeLimits: true, slope: true, pumpingHoseReach: true, waterReservoirStock: true },
      approvedAt: ts(-h(20)),
      paymentDueBy: ts(h(4)),
      receipt: { receiptNumber: 'RCP-2026-0015', method: 'Online Payment', paidAt: ts(-h(17)), amountLKR: 3380 },
      timeline: [
        { at: ts(-dms(2)), actor: 'Citizen Portal (System)', event: 'Booking Submitted' },
        { at: ts(-h(20)), actor: 'Technical Officer – P.K. Samarasinghe', event: 'Booking Approved', note: 'Fee: LKR 3,380.' },
        { at: ts(-h(17)), actor: 'System (Online Payment)', event: 'Payment Received', note: 'Receipt: RCP-2026-0015.' },
      ],
      notifications: [
        { at: ts(-dms(2)), channel: 'SMS', recipient: '077-3012456', message: 'Water Bowser booking WB-2026-9993 received.', label: 'Simulated' },
        { at: ts(-h(17)), channel: 'SMS', recipient: '077-3012456', message: 'Payment confirmed for WB-2026-9993. Your booking is confirmed.', label: 'Simulated' },
      ],
    },
  ]

  const year = new Date(now).getFullYear()
  const nextSequences: Record<ServiceType, number> = { GULLY_BOWSER: 0, WATER_BOWSER: 0 }
  const referenceMap = new Map<string, string>()
  for (const booking of bookings) {
    const prefix = SERVICE_CONFIG[booking.serviceType].referencePrefix
    const nextSequence = ++nextSequences[booking.serviceType]
    const reference = `${prefix}-${year}-${nextSequence.toString().padStart(4, '0')}`
    referenceMap.set(booking.referenceNumber, reference)
    booking.referenceNumber = reference
  }

  /** Replaces seed references in audit text with their generated sequences. */
  const replaceReferences = (text: string): string =>
    text.replace(/(?:GB|WB)-\d{4}-\d{4}/g, (reference) => referenceMap.get(reference) ?? reference)

  for (const booking of bookings) {
    booking.timeline = booking.timeline.map((entry) => ({
      ...entry,
      note: entry.note ? replaceReferences(entry.note) : undefined,
    }))
    booking.notifications = booking.notifications.map((notification) => ({
      ...notification,
      message: replaceReferences(notification.message),
    }))
  }

  return bookings
}
