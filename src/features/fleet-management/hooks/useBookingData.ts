// ──────────────────────────────────────────────────────────────────────────────
// useBookingData — Shared fleet-booking state hook (localStorage-backed)
// Follows the same pattern as useFleetData.ts for cross-page state sharing.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from 'react'
import {
  buildInitialBookings,
  SERVICE_CONFIG,
  DEPOT_COORDS,
  type BookingRecord,
  type BookingStatus,
  type ServiceType,
  type FeeBreakdown,
  type LocationPin,
  type ApplicantDetails,
  type ServiceDetails,
  type TOChecklistResult,
  type EReceipt,
  type DisposalLog,
  type DeliveryLog,
} from '../data/initialBookingData'
import {
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  INITIAL_APPROVAL_REQUESTS,
  type VehicleRecord,
  type DriverRecord,
} from '../data/initialFleetData'
import { calculateFee, generateReferenceNumber, haversineDistanceKm } from '../utils/bookingUtils'
import {
  FLEET_WARD_NAMES,
  APPROVED_DISPOSAL_PLANTS,
  type BookingActionResult,
  validateFreeText,
  validateFlowmeterReadings,
  validateFullName,
  validateMobile,
  validateNic,
  validateNumber,
  validatePositiveNumber,
  validateReferenceText,
  validateStreetAddress,
  validateWard,
} from '../utils/validators'

// ── localStorage keys ─────────────────────────────────────────────────────────
const BOOKINGS_STORAGE_KEY = 'ps_fleet_bookings_v1'
// We also extend the vehicle/driver keys used by useFleetData so they share the
// same localStorage slots — bookings and fleet pages stay in sync.
const VEHICLES_STORAGE_KEY = 'ps_fleet_vehicles_v1'
const DRIVERS_STORAGE_KEY = 'ps_fleet_drivers_v1'
const APPROVALS_STORAGE_KEY = 'ps_fleet_approvals_v1'
const FLEET_METADATA_STORAGE_KEY = 'ps_fleet_metadata_v1'
const FLEET_SCHEMA_VERSION = 1
const FLEET_SEED_VERSION = 2

interface FleetSeedMetadata {
  schemaVersion: number
  seedVersion: number
  seededAt: string
}

interface FleetSeedSnapshot {
  bookings: BookingRecord[]
  vehicles: VehicleRecord[]
  drivers: DriverRecord[]
  approvals: unknown[]
  metadata: FleetSeedMetadata
}

/** Returns the age of a seed in whole hours, clamped to non-negative values. */
function getSeedAgeHours(seededAt: string, now: number): number {
  return Math.max(0, Math.floor((now - new Date(seededAt).getTime()) / 3600000))
}

/** Creates and persists a mutually consistent demo snapshot at the supplied time. */
function createFleetSeedSnapshot(now: number): FleetSeedSnapshot {
  const seededAt = new Date(now).toISOString()
  const bookings = buildInitialBookings(now)
  const activeBookings = bookings.filter((booking) =>
    booking.status === 'Vehicle Assigned' ||
    booking.status === 'En Route' ||
    booking.status === 'Service In Progress' ||
    booking.status === 'In Transit to Plant'
  )
  const bookingByVehicle = new Map(activeBookings.map((booking) => [booking.assignedVehicleId, booking]))
  const vehicles = INITIAL_VEHICLES.map((vehicle) => {
    const booking = bookingByVehicle.get(vehicle.id)
    if (!booking) return vehicle
    const date = new Date(now)
    return {
      ...vehicle,
      status: 'On Mission' as const,
      currentLocation: booking.location.label,
      activeMission: {
        destination: booking.location.label,
        purpose: `${SERVICE_CONFIG[booking.serviceType].label} – ${booking.referenceNumber}`,
        dispatchedAt: date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        estimatedReturn: `${booking.scheduledDate} (Service Day)`,
      },
    }
  })
  const snapshot: FleetSeedSnapshot = {
    bookings,
    vehicles,
    drivers: INITIAL_DRIVERS,
    approvals: INITIAL_APPROVAL_REQUESTS,
    metadata: {
      schemaVersion: FLEET_SCHEMA_VERSION,
      seedVersion: FLEET_SEED_VERSION,
      seededAt,
    },
  }
  return snapshot
}

/** Persists all fleet seed collections and their shared schema metadata. */
function persistFleetSeedSnapshot(snapshot: FleetSeedSnapshot): void {
  localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(snapshot.bookings))
  localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(snapshot.vehicles))
  localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(snapshot.drivers))
  localStorage.setItem(APPROVALS_STORAGE_KEY, JSON.stringify(snapshot.approvals))
  localStorage.setItem(FLEET_METADATA_STORAGE_KEY, JSON.stringify(snapshot.metadata))
}

/** Loads a compatible persisted fleet snapshot or creates a fresh seed. */
function loadOrCreateFleetSeed(): FleetSeedSnapshot {
  try {
    const metadata = JSON.parse(localStorage.getItem(FLEET_METADATA_STORAGE_KEY) ?? 'null') as FleetSeedMetadata | null
    const bookings = JSON.parse(localStorage.getItem(BOOKINGS_STORAGE_KEY) ?? 'null') as BookingRecord[] | null
    const vehicles = JSON.parse(localStorage.getItem(VEHICLES_STORAGE_KEY) ?? 'null') as VehicleRecord[] | null
    const drivers = JSON.parse(localStorage.getItem(DRIVERS_STORAGE_KEY) ?? 'null') as DriverRecord[] | null
    const approvals = JSON.parse(localStorage.getItem(APPROVALS_STORAGE_KEY) ?? 'null') as unknown[] | null
    if (
      metadata?.schemaVersion === FLEET_SCHEMA_VERSION &&
      metadata.seedVersion === FLEET_SEED_VERSION &&
      Number.isFinite(new Date(metadata.seededAt).getTime()) &&
      Array.isArray(bookings) &&
      Array.isArray(vehicles) &&
      Array.isArray(drivers) &&
      Array.isArray(approvals)
    ) {
      return { metadata, bookings, vehicles, drivers, approvals }
    }
  } catch {
    // Invalid or incomplete persisted demo data is replaced as one snapshot.
  }
  return createFleetSeedSnapshot(Date.now())
}

/** Validation result returned by vehicle-assignment validator. */
export type AssignmentValidationResult = BookingActionResult<void>

/**
 * Shared booking data hook.
 * State is persisted to localStorage under the same keys as useFleetData,
 * so vehicle/driver changes from either hook are visible on next page render.
 * TODO: replace all booking mutations with API calls before production.
 */
export function useBookingData() {
  const [initialSeed] = useState<FleetSeedSnapshot>(loadOrCreateFleetSeed)

  // ── Bookings state ──────────────────────────────────────────────────────────
  const [bookings, setBookings] = useState<BookingRecord[]>(initialSeed.bookings)

  // ── Shared vehicle & driver state (same localStorage slots as useFleetData) ─
  const [vehicles, setVehicles] = useState<VehicleRecord[]>(initialSeed.vehicles)
  const [drivers, setDrivers] = useState<DriverRecord[]>(initialSeed.drivers)
  const [seededAt, setSeededAt] = useState(initialSeed.metadata.seededAt)
  const [seedAgeHours, setSeedAgeHours] = useState(() =>
    getSeedAgeHours(initialSeed.metadata.seededAt, Date.now())
  )

  useEffect(() => {
    persistFleetSeedSnapshot(initialSeed)
  }, [initialSeed])

  useEffect(() => {
    const interval = setInterval(() => {
      setSeedAgeHours(getSeedAgeHours(seededAt, Date.now()))
    }, 60000)
    return () => clearInterval(interval)
  }, [seededAt])

  // ── Persist to localStorage & dispatch cross-page sync ─────────────────────
  useEffect(() => {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings))
    window.dispatchEvent(new Event('fleet_storage_update'))
  }, [bookings])

  useEffect(() => {
    localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles))
    window.dispatchEvent(new Event('fleet_storage_update'))
  }, [vehicles])

  useEffect(() => {
    localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(drivers))
    window.dispatchEvent(new Event('fleet_storage_update'))
  }, [drivers])

  // Cross-page / cross-component sync listener
  useEffect(() => {
    const handleSync = () => {
      const b = localStorage.getItem(BOOKINGS_STORAGE_KEY)
      if (b) {
        try {
          const next = JSON.parse(b) as BookingRecord[]
          setBookings((current) =>
            JSON.stringify(current) === JSON.stringify(next) ? current : next
          )
        } catch { /* ignore */ }
      }
      const v = localStorage.getItem(VEHICLES_STORAGE_KEY)
      if (v) {
        try {
          const next = JSON.parse(v) as VehicleRecord[]
          setVehicles((current) =>
            JSON.stringify(current) === JSON.stringify(next) ? current : next
          )
        } catch { /* ignore */ }
      }
      const d = localStorage.getItem(DRIVERS_STORAGE_KEY)
      if (d) {
        try {
          const next = JSON.parse(d) as DriverRecord[]
          setDrivers((current) =>
            JSON.stringify(current) === JSON.stringify(next) ? current : next
          )
        } catch { /* ignore */ }
      }
    }
    window.addEventListener('storage', handleSync)
    window.addEventListener('fleet_storage_update', handleSync)
    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('fleet_storage_update', handleSync)
    }
  }, [])

  // ── Payment-expiry auto-check ────────────────────────────────────────────────
  // Runs every 30 s and transitions 'Awaiting Payment' bookings whose
  // paymentDueBy has passed to 'Payment Expired'.
  useEffect(() => {
    const checkExpiry = () => {
      setBookings((prev) => {
        const now = Date.now()
        let changed = false
        const next = prev.map((b) => {
          if (b.status !== 'Awaiting Payment' || !b.paymentDueBy) return b
          if (new Date(b.paymentDueBy).getTime() > now) return b
          changed = true
          return {
            ...b,
            status: 'Payment Expired' as BookingStatus,
            timeline: [
              ...b.timeline,
              {
                at: new Date(now).toISOString(),
                actor: 'System (Auto)',
                event: 'Payment Window Expired',
                note: 'No payment received within 24 hours. Booking auto-cancelled.',
              },
            ],
            notifications: [
              ...b.notifications,
              {
                at: new Date(now).toISOString(),
                channel: 'SMS' as const,
                recipient: b.applicant.phone,
                message: `${b.referenceNumber} CANCELLED. Payment was not received within 24 hours. Please re-apply.`,
                label: 'Simulated' as const,
              },
            ],
          }
        })
        return changed ? next : prev
      })
    }

    const timeout = setTimeout(checkExpiry, 0)
    const interval = setInterval(checkExpiry, 30000)
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [])

  // ── Computed stats ───────────────────────────────────────────────────────────
  const bookingStats = useMemo(() => ({
    pendingToReview: bookings.filter((b) => b.status === 'Pending TO Review').length,
    awaitingPayment: bookings.filter((b) => b.status === 'Awaiting Payment').length,
    confirmed: bookings.filter((b) => b.status === 'Confirmed').length,
    activeJobs: bookings.filter(
      (b) =>
        b.status === 'Vehicle Assigned' ||
        b.status === 'En Route' ||
        b.status === 'Service In Progress' ||
        b.status === 'In Transit to Plant'
    ).length,
    pendingCloseout: bookings.filter((b) => b.status === 'Pending Closeout').length,
    completed: bookings.filter((b) => b.status === 'Completed').length,
  }), [bookings])

  /** Clears every persisted fleet collection and replaces it with a fresh seed. */
  const resetDemoData = () => {
    localStorage.removeItem(BOOKINGS_STORAGE_KEY)
    localStorage.removeItem(VEHICLES_STORAGE_KEY)
    localStorage.removeItem(DRIVERS_STORAGE_KEY)
    localStorage.removeItem(APPROVALS_STORAGE_KEY)
    localStorage.removeItem(FLEET_METADATA_STORAGE_KEY)
    const snapshot = createFleetSeedSnapshot(Date.now())
    persistFleetSeedSnapshot(snapshot)
    setBookings(snapshot.bookings)
    setVehicles(snapshot.vehicles)
    setDrivers(snapshot.drivers)
    setSeededAt(snapshot.metadata.seededAt)
    setSeedAgeHours(0)
    window.dispatchEvent(new Event('fleet_storage_update'))
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  /**
   * Creates a new booking (counter / phone / walk-in).
   * TODO: replace with API call.
   */
  const createBooking = (data: {
    serviceType: ServiceType
    applicant: ApplicantDetails
    location: LocationPin
    scheduledDate: string
    scheduledTime: string
    serviceDetails: ServiceDetails
    estimatedFee: FeeBreakdown
    source: 'Staff Counter'
  }): BookingActionResult<BookingRecord> => {
    const errors: Record<string, string> = {}
    const applicantChecks = {
      name: validateFullName(data.applicant.name),
      nic: validateNic(data.applicant.nic),
      phone: validateMobile(data.applicant.phone),
      address: validateStreetAddress(data.applicant.address),
      ward: validateWard(data.applicant.ward, FLEET_WARD_NAMES),
    }
    for (const [field, check] of Object.entries(applicantChecks)) {
      if (!check.valid) errors[field] = check.error
    }
    const ranges = SERVICE_CONFIG[data.serviceType].bookingRanges
    if (data.serviceDetails.serviceType === 'GULLY_BOWSER') {
      const checks = {
        pitVolumeLitres: validateNumber(data.serviceDetails.pitVolumeLitres, ranges.pitVolumeLitres.min, ranges.pitVolumeLitres.max, true),
        distanceFromGateM: validateNumber(data.serviceDetails.distanceFromGateM, ranges.distanceFromGateM.min, ranges.distanceFromGateM.max, true),
        hoseLengthRequiredM: validateNumber(data.serviceDetails.hoseLengthRequiredM, ranges.hoseLengthRequiredM.min, ranges.hoseLengthRequiredM.max, true),
        roadWidthM: validateNumber(data.serviceDetails.roadWidthM, ranges.roadWidthM.min, ranges.roadWidthM.max),
      }
      for (const [field, check] of Object.entries(checks)) {
        if (!check.valid) errors[field] = check.error
      }
      if (Math.round(data.serviceDetails.roadWidthM * 10) !== data.serviceDetails.roadWidthM * 10) {
        errors.roadWidthM = 'Road width must use no more than one decimal place.'
      }
    } else {
      const volume = validateNumber(data.serviceDetails.waterVolumeLitres, ranges.waterVolumeLitres.min, ranges.waterVolumeLitres.max, true)
      const loads = validateNumber(data.serviceDetails.loadsRequired, ranges.loadsRequired.min, ranges.loadsRequired.max, true)
      if (!volume.valid) errors.waterVolumeLitres = volume.error
      if (!loads.valid) errors.loadsRequired = loads.error
    }
    if (data.serviceType !== data.serviceDetails.serviceType) {
      errors.serviceType = 'The selected service does not match its service details.'
    }
    const distanceKm = haversineDistanceKm(DEPOT_COORDS.lat, DEPOT_COORDS.lng, data.location.lat, data.location.lng)
    if (!Number.isFinite(data.location.lat) || data.location.lat < -90 || data.location.lat > 90 ||
      !Number.isFinite(data.location.lng) || data.location.lng < -180 || data.location.lng > 180 || distanceKm.toFixed(1) === '0.0') {
      errors.location = 'A valid site pin away from the depot is required.'
    }
    const locationLabel = validateFreeText(data.location.label, { required: true, min: 3, max: 300 })
    if (!locationLabel.valid) errors.location = locationLabel.error
    const scheduledAt = new Date(`${data.scheduledDate}T${data.scheduledTime}`)
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) {
      errors.schedule = 'Choose a future date and time.'
    }
    if (Object.keys(errors).length) return { ok: false, errors }

    const applicant: ApplicantDetails = {
      ...data.applicant,
      name: applicantChecks.name.value,
      nic: applicantChecks.nic.value,
      phone: applicantChecks.phone.value,
      address: applicantChecks.address.value,
      ward: applicantChecks.ward.value,
    }
    const loads = data.serviceDetails.serviceType === 'GULLY_BOWSER'
      ? Math.max(1, Math.ceil(data.serviceDetails.pitVolumeLitres / 6000))
      : data.serviceDetails.loadsRequired
    const estimatedFee = calculateFee(data.serviceType, loads, distanceKm)
    const now = new Date().toISOString()
    const refNum = generateReferenceNumber(data.serviceType, bookings)
    const newBooking: BookingRecord = {
      id: `BK-${Date.now()}`,
      referenceNumber: refNum,
      serviceType: data.serviceType,
      source: data.source,
      status: 'Pending TO Review',
      applicant,
      location: { ...data.location, label: locationLabel.value },
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      serviceDetails: data.serviceDetails,
      estimatedFee,
      timeline: [
        {
          at: now,
          actor: 'Staff Counter (Current User)',
          event: 'Booking Created at Counter',
          note: `Reference: ${refNum}`,
        },
      ],
      notifications: [
        {
          at: now,
          channel: 'SMS',
          recipient: applicant.phone,
          message: `Your ${SERVICE_CONFIG[data.serviceType].label} booking (${refNum}) has been registered at the Pradeshiya Sabha counter.`,
          label: 'Simulated',
        },
      ],
    }
    setBookings((prev) => [newBooking, ...prev])
    return { ok: true, value: newBooking }
  }

  /**
   * Technical Officer approves a booking.
   * Sets status to 'Awaiting Payment' and starts 24h payment countdown.
   * TODO: replace with API call.
   */
  const approveBooking = (
    bookingId: string,
    params: {
      checklist: TOChecklistResult
      adjustedLoads?: number
      adjustedDistanceKm?: number
      finalFee: FeeBreakdown
      approverName?: string
    }
  ): BookingActionResult<void> => {
    const booking = bookings.find((item) => item.id === bookingId)
    if (!booking) return { ok: false, errors: { booking: 'Booking not found.' } }
    if (booking.status !== 'Pending TO Review') return { ok: false, errors: { booking: 'Only bookings awaiting technical review can be approved.' } }
    const ranges = SERVICE_CONFIG[booking.serviceType].bookingRanges
    const loads = validateNumber(params.finalFee.loads, ranges.technicalLoads.min, ranges.technicalLoads.max, true)
    const distance = validateNumber(params.finalFee.distanceKm, ranges.technicalDistanceKm.min, ranges.technicalDistanceKm.max)
    const requiredChecks = booking.serviceType === 'GULLY_BOWSER'
      ? [params.checklist.roadAccess, params.checklist.vehicleTurningRadius, params.checklist.suctionDistance, params.checklist.bowserCapacity]
      : [params.checklist.roadAccess, params.checklist.deliveryRoadBridgeLimits, params.checklist.slope, params.checklist.pumpingHoseReach, params.checklist.waterReservoirStock]
    if (!loads.valid || !distance.valid || requiredChecks.some((value) => value !== true)) {
      return { ok: false, errors: { review: !loads.valid ? loads.error : !distance.valid ? distance.error : 'Every technical checklist item must be confirmed.' } }
    }
    if (Math.round(params.finalFee.distanceKm * 10) !== params.finalFee.distanceKm * 10) {
      return { ok: false, errors: { distance: 'Route distance must use no more than one decimal place.' } }
    }
    const verifiedFee = calculateFee(booking.serviceType, loads.value, distance.value)
    if (
      (params.adjustedLoads !== undefined && params.adjustedLoads !== verifiedFee.loads) ||
      (params.adjustedDistanceKm !== undefined && params.adjustedDistanceKm !== verifiedFee.distanceKm)
    ) {
      return { ok: false, errors: { finalFee: 'Adjustment values must match the validated fee calculation.' } }
    }
    if (
      params.finalFee.totalLKR !== verifiedFee.totalLKR ||
      params.finalFee.farePerLoad !== verifiedFee.farePerLoad ||
      params.finalFee.transportFeePerKm !== verifiedFee.transportFeePerKm
    ) {
      return { ok: false, errors: { finalFee: 'The final fee must match the validated loads and route distance.' } }
    }
    const now = new Date().toISOString()
    const paymentDueBy = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId || b.status !== 'Pending TO Review') return b
        return {
          ...b,
          status: 'Awaiting Payment' as BookingStatus,
          toChecklistResult: params.checklist,
          toAdjustedLoads: params.adjustedLoads,
          toAdjustedDistanceKm: params.adjustedDistanceKm,
          estimatedFee: verifiedFee,
          approvedAt: now,
          paymentDueBy,
          timeline: [
            ...b.timeline,
            {
              at: now,
              actor: params.approverName || 'Technical Officer',
              event: 'Booking Approved',
              note: `Final fee: LKR ${verifiedFee.totalLKR.toLocaleString()}. Payment due within 24 hours.`,
            },
          ],
          notifications: [
            ...b.notifications,
            {
              at: now,
              channel: 'SMS' as const,
              recipient: b.applicant.phone,
              message: `${b.referenceNumber} APPROVED. Fee: LKR ${verifiedFee.totalLKR.toLocaleString()}. Please complete payment within 24 hours to confirm your booking.`,
              label: 'Simulated' as const,
            },
          ],
        }
      })
    )
    return { ok: true, value: undefined }
  }

  /**
   * Technical Officer rejects a booking.
   * TODO: replace with API call.
   */
  const rejectBooking = (
    bookingId: string,
    reason: string,
    approverName?: string
  ): BookingActionResult<void> => {
    const booking = bookings.find((item) => item.id === bookingId)
    if (!booking) return { ok: false, errors: { booking: 'Booking not found.' } }
    if (booking.status !== 'Pending TO Review') return { ok: false, errors: { booking: 'Only bookings awaiting technical review can be rejected.' } }
    const validatedReason = validateFreeText(reason, { required: true, min: 10, max: 300 })
    if (!validatedReason.valid) return { ok: false, errors: { reason: validatedReason.error } }
    const now = new Date().toISOString()
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId || b.status !== 'Pending TO Review') return b
        return {
          ...b,
          status: 'Rejected' as BookingStatus,
          rejectionReason: validatedReason.value,
          timeline: [
            ...b.timeline,
            {
              at: now,
              actor: approverName || 'Technical Officer',
              event: 'Booking Rejected',
              note: validatedReason.value,
            },
          ],
          notifications: [
            ...b.notifications,
            {
              at: now,
              channel: 'SMS' as const,
              recipient: b.applicant.phone,
              message: `${b.referenceNumber} REJECTED. Reason: ${validatedReason.value} Please contact the Pradeshiya Sabha for alternatives.`,
              label: 'Simulated' as const,
            },
          ],
        }
      })
    )
    return { ok: true, value: undefined }
  }

  /**
   * Records a payment (counter or simulated online) for an 'Awaiting Payment' booking.
   * TODO: replace with API call.
   */
  const recordPayment = (
    bookingId: string,
    receipt: EReceipt,
    recordedBy?: string
  ): BookingActionResult<void> => {
    const booking = bookings.find((item) => item.id === bookingId)
    if (!booking) return { ok: false, errors: { booking: 'Booking not found.' } }
    if (booking.status !== 'Awaiting Payment') return { ok: false, errors: { booking: 'Only bookings awaiting payment can be paid.' } }
    const reference = validateReferenceText(receipt.receiptNumber)
    if (!reference.valid) return { ok: false, errors: { receiptNumber: reference.error } }
    if (!['Counter Cash', 'Counter Card', 'Online Payment'].includes(receipt.method)) {
      return { ok: false, errors: { method: 'Choose a payment method.' } }
    }
    if (receipt.amountLKR !== booking.estimatedFee.totalLKR) {
      return { ok: false, errors: { amountLKR: 'Payment amount must equal the approved booking fee.' } }
    }
    const now = new Date().toISOString()
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId || b.status !== 'Awaiting Payment') return b
        return {
          ...b,
          status: 'Confirmed' as BookingStatus,
          receipt: { ...receipt, receiptNumber: reference.value },
          timeline: [
            ...b.timeline,
            {
              at: now,
              actor: recordedBy || 'Staff Counter (Current User)',
              event: 'Payment Received',
              note: `Receipt: ${receipt.receiptNumber}. Method: ${receipt.method}. Amount: LKR ${receipt.amountLKR.toLocaleString()}.`,
            },
          ],
          notifications: [
            ...b.notifications,
            {
              at: now,
              channel: 'SMS' as const,
              recipient: b.applicant.phone,
              message: `Payment received for ${b.referenceNumber}. Your booking is confirmed — a vehicle will be assigned shortly.`,
              label: 'Simulated' as const,
            },
          ],
        }
      })
    )
    return { ok: true, value: undefined }
  }

  /**
   * Validates whether a vehicle can be assigned to a booking.
   * Checks: category match, Available status, permit/licence/insurance validity.
   * Returns a structured success or field validation errors.
   */
  const validateVehicleAssignment = (
    booking: BookingRecord,
    vehicleId: string
  ): AssignmentValidationResult => {
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    if (!vehicle) return { ok: false, errors: { vehicleId: 'Vehicle not found.' } }

    const requiredCategory = SERVICE_CONFIG[booking.serviceType].vehicleCategory
    if (vehicle.category !== requiredCategory) {
      return {
        ok: false,
        errors: { vehicleId: `Vehicle category mismatch. This booking requires a "${requiredCategory}" but "${vehicle.name}" is a "${vehicle.category}".` },
      }
    }

    if (vehicle.status !== 'Available') {
      return {
        ok: false,
        errors: { vehicleId: `Vehicle ${vehicle.registrationNumber} is not available (current status: ${vehicle.status}).` },
      }
    }

    // Permit / licence / insurance checks — use today's date string
    const today = new Date().toISOString().split('T')[0]
    if (vehicle.permitExpiryDate < today) {
      return {
        ok: false,
        errors: { vehicleId: `Vehicle ${vehicle.registrationNumber} has an expired Route Permit (expired ${vehicle.permitExpiryDate}). Renew before assigning.` },
      }
    }
    if (vehicle.revenueLicenseExpiryDate < today) {
      return {
        ok: false,
        errors: { vehicleId: `Vehicle ${vehicle.registrationNumber} has an expired Revenue License (expired ${vehicle.revenueLicenseExpiryDate}).` },
      }
    }
    if (vehicle.insuranceExpiryDate < today) {
      return {
        ok: false,
        errors: { vehicleId: `Vehicle ${vehicle.registrationNumber} has expired Insurance (expired ${vehicle.insuranceExpiryDate}).` },
      }
    }

    return { ok: true, value: undefined }
  }

  /**
   * Assigns a vehicle and driver to a confirmed booking.
   * Validates the vehicle, then sets vehicle to On Mission and updates fleet state.
   * TODO: replace with API call.
   */
  const assignVehicle = (
    bookingId: string,
    vehicleId: string,
    driverId: string,
    assignedBy?: string
  ): AssignmentValidationResult => {
    const booking = bookings.find((b) => b.id === bookingId)
    if (!booking) return { ok: false, errors: { booking: 'Booking not found.' } }
    if (booking.status !== 'Confirmed') return { ok: false, errors: { booking: 'Only confirmed bookings can be assigned.' } }

    const validation = validateVehicleAssignment(booking, vehicleId)
    if (!validation.ok) return validation

    const validatedAssignee = validateFreeText(assignedBy ?? '', { max: 300 })
    if (!validatedAssignee.valid) return { ok: false, errors: { assignedBy: validatedAssignee.error } }

    const vehicle = vehicles.find((v) => v.id === vehicleId)
    const driver = drivers.find((d) => d.id === driverId)
    if (!driver) return { ok: false, errors: { driverId: 'Driver not found.' } }
    if (driver.status !== 'On Duty') {
      return { ok: false, errors: { driverId: `Driver ${driver.name} is not currently on duty.` } }
    }

    // Check driver not already on an active booking job
    const driverActiveBooking = bookings.find(
      (b) =>
        b.assignedDriverId === driverId &&
        (b.status === 'Vehicle Assigned' ||
          b.status === 'En Route' ||
          b.status === 'Service In Progress' ||
          b.status === 'In Transit to Plant')
    )
    if (driverActiveBooking) {
      return {
        ok: false,
        errors: { driverId: `Driver ${driver.name} is already on an active job (${driverActiveBooking.referenceNumber}).` },
      }
    }

    const now = new Date().toISOString()
    const nowDisplay = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    const previousVehicleIdForDriver = driver.assignedVehicleId
    const previousDriverIdForVehicle = vehicle?.assignedDriverId

    // Update booking
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b
        return {
          ...b,
          status: 'Vehicle Assigned' as BookingStatus,
          assignedVehicleId: vehicleId,
          assignedVehicleReg: vehicle?.registrationNumber ?? '',
          assignedDriverId: driverId,
          assignedDriverName: driver.name,
          dispatchedAt: now,
          timeline: [
            ...b.timeline,
            {
              at: now,
              actor: validatedAssignee.value || 'Fleet Supervisor (Current User)',
              event: 'Vehicle Assigned',
              note: `${vehicle?.registrationNumber} assigned with driver ${driver.name}.`,
            },
          ],
          notifications: [
            ...b.notifications,
            {
              at: now,
              channel: 'SMS' as const,
              recipient: b.applicant.phone,
              message: `${b.referenceNumber}: Vehicle ${vehicle?.registrationNumber} assigned. Driver: ${driver.name}. Your bowser will be on the way soon.`,
              label: 'Simulated' as const,
            },
          ],
        }
      })
    )

    // Set vehicle to On Mission
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          return {
            ...v,
            status: 'On Mission',
            assignedDriverId: driverId,
            assignedDriverName: driver.name,
            currentLocation: booking.location.label,
            activeMission: {
              destination: booking.location.label,
              purpose: `${SERVICE_CONFIG[booking.serviceType].label} – ${booking.referenceNumber}`,
              dispatchedAt: nowDisplay,
              estimatedReturn: booking.scheduledDate + ' (Service Day)',
            },
          }
        }
        if (v.id === previousVehicleIdForDriver && v.assignedDriverId === driverId) {
          return { ...v, assignedDriverId: null, assignedDriverName: null }
        }
        return v
      })
    )

    // Update driver record
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === driverId) {
          return {
            ...d,
            assignedVehicleId: vehicleId,
            assignedVehicleReg: vehicle?.registrationNumber ?? null,
          }
        }
        if (d.id === previousDriverIdForVehicle && d.assignedVehicleId === vehicleId) {
          return { ...d, assignedVehicleId: null, assignedVehicleReg: null }
        }
        return d
      })
    )

    return { ok: true, value: undefined }
  }

  /**
   * Advances a booking through a job-progress step.
   * Also handles the "release rule": vehicle + driver freed at Pending Closeout.
   * TODO: replace with API call.
   */
  const advanceJobStep = (
    bookingId: string,
    newStatus: BookingStatus,
    note?: string,
    actor?: string,
    extraData?: {
      disposalLog?: DisposalLog
      deliveryLog?: DeliveryLog
      citizenSignOff?: string
      signOffConfirmed?: boolean
    }
  ): BookingActionResult<void> => {
    const booking = bookings.find((item) => item.id === bookingId)
    if (!booking) return { ok: false, errors: { booking: 'Booking not found.' } }
    const transitions: Partial<Record<BookingStatus, BookingStatus[]>> = {
      'Vehicle Assigned': ['En Route'],
      'En Route': ['Service In Progress'],
      'Service In Progress': booking.serviceType === 'GULLY_BOWSER' ? ['In Transit to Plant'] : ['Pending Closeout'],
      'In Transit to Plant': ['Pending Closeout'],
      'Pending Closeout': ['Completed'],
    }
    if (!transitions[booking.status]?.includes(newStatus)) {
      return { ok: false, errors: { status: 'This booking cannot advance to the requested status.' } }
    }
    if (newStatus === 'Completed') {
      const signOff = validateFreeText(extraData?.citizenSignOff ?? '', { required: true, min: 3, max: 120 })
      if (extraData?.signOffConfirmed !== true || !signOff.valid) {
        return { ok: false, errors: { signOff: 'A confirmed citizen sign-off is required before completion.' } }
      }
    }
    const validatedNote = validateFreeText(note ?? '', { max: 300 })
    if (!validatedNote.valid) return { ok: false, errors: { note: validatedNote.error } }
    if (newStatus === 'Pending Closeout' && booking.serviceType === 'GULLY_BOWSER') {
      const log = extraData?.disposalLog
      const ticket = validateReferenceText(log?.weighbridgeTicketNo ?? '')
      const volume = validatePositiveNumber(log?.volumeLitres ?? '')
      const knownPlant = log && APPROVED_DISPOSAL_PLANTS.some((plant) => plant === log.plantName)
      if (!log || !knownPlant || !ticket.valid || !volume.valid) {
        return { ok: false, errors: { disposalLog: !log ? 'Disposal details are required.' : !knownPlant ? 'Choose a listed treatment plant.' : !ticket.valid ? ticket.error : volume.error } }
      }
    }
    if (newStatus === 'Pending Closeout' && booking.serviceType === 'WATER_BOWSER') {
      const log = extraData?.deliveryLog
      const readings = log && validateFlowmeterReadings(log.flowmeterStart, log.flowmeterEnd)
      if (!log || !readings?.valid || log.litresDelivered !== readings.value.litresDelivered) {
        return { ok: false, errors: { deliveryLog: readings?.error || 'Flowmeter readings are required and delivered volume must be calculated.' } }
      }
    }
    const now = new Date().toISOString()
    const vehicleToRelease = newStatus === 'Pending Closeout' ? booking.assignedVehicleId : undefined

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b

        const statusEventMap: Record<BookingStatus, string> = {
          'Pending TO Review': 'Pending TO Review',
          Rejected: 'Rejected',
          'Awaiting Payment': 'Awaiting Payment',
          'Payment Expired': 'Payment Expired',
          Confirmed: 'Confirmed',
          'Vehicle Assigned': 'Vehicle Assigned',
          'En Route': 'En Route',
          'Service In Progress': 'Service In Progress',
          'In Transit to Plant': 'In Transit to Plant',
          'Pending Closeout': 'Pending Closeout',
          Completed: 'Completed',
        }

        return {
          ...b,
          status: newStatus,
          enRouteAt: newStatus === 'En Route' ? now : b.enRouteAt,
          serviceStartedAt:
            newStatus === 'Service In Progress' ? now : b.serviceStartedAt,
          inTransitToPlantAt:
            newStatus === 'In Transit to Plant' ? now : b.inTransitToPlantAt,
          pendingCloseoutAt:
            newStatus === 'Pending Closeout' ? now : b.pendingCloseoutAt,
          completedAt: newStatus === 'Completed' ? now : b.completedAt,
          disposalLog: extraData?.disposalLog ?? b.disposalLog,
          deliveryLog: extraData?.deliveryLog ?? b.deliveryLog,
          citizenSignOff: extraData?.citizenSignOff ?? b.citizenSignOff,
          timeline: [
            ...b.timeline,
            {
              at: now,
              actor: actor || 'Driver / Supervisor (Current User)',
              event: statusEventMap[newStatus] || newStatus,
              note: validatedNote.value || undefined,
            },
          ],
          notifications:
            newStatus === 'Completed'
              ? [
                  ...b.notifications,
                  {
                    at: now,
                    channel: 'SMS' as const,
                    recipient: b.applicant.phone,
                    message: `${b.referenceNumber} COMPLETED. Thank you for using Homagama Pradeshiya Sabha services.`,
                    label: 'Simulated' as const,
                  },
                ]
              : b.notifications,
        }
      })
    )

    // Release rule: vehicle + driver freed at Pending Closeout
    if (newStatus === 'Pending Closeout' && vehicleToRelease) {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id !== vehicleToRelease) return v
          // Increase odometer by estimated round-trip distance
          const tripKm = (booking?.estimatedFee.distanceKm ?? 0) * 2
          return {
            ...v,
            status: 'Available',
            currentLocation: 'Sanitation Unit Depot – Returned from Service',
            activeMission: undefined,
            assignedDriverId: null,
            assignedDriverName: null,
            odometerKm: v.odometerKm + Math.round(tripKm),
          }
        })
      )
      if (booking.assignedDriverId) {
        setDrivers((prev) =>
          prev.map((driver) => driver.id === booking.assignedDriverId
            ? { ...driver, assignedVehicleId: null, assignedVehicleReg: null }
            : driver)
        )
      }
    }
    return { ok: true, value: undefined }
  }

  /**
   * Records a citizen sign-off and closes out a booking (Pending Closeout → Completed).
   * TODO: replace with API call.
   */
  const closeoutBooking = (
    bookingId: string,
    citizenSignOff: string,
    signOffConfirmed: boolean,
    supervisorNote?: string,
    supervisorName?: string
  ): BookingActionResult<void> => {
    const booking = bookings.find((item) => item.id === bookingId)
    if (!booking || booking.status !== 'Pending Closeout') {
      return { ok: false, errors: { booking: 'Only pending-closeout bookings can be completed.' } }
    }
    const signOff = validateFreeText(citizenSignOff, { required: true, min: 3, max: 120 })
    const note = validateFreeText(supervisorNote ?? '', { max: 300 })
    if (!signOffConfirmed) return { ok: false, errors: { signOff: 'Confirm that the citizen sign-off was received.' } }
    if (!signOff.valid) return { ok: false, errors: { signOff: 'Record the citizen sign-off confirmation.' } }
    if (!note.valid) return { ok: false, errors: { remarks: note.error } }
    const result = advanceJobStep(
      bookingId,
      'Completed',
      note.value || undefined,
      supervisorName || 'Supervisor (Current User)',
      { citizenSignOff: signOff.value, signOffConfirmed }
    )
    if (!result.ok) return result
    return { ok: true, value: undefined }
  }

  return {
    bookings,
    vehicles,
    drivers,
    bookingStats,
    seededAt,
    seedAgeHours,
    resetDemoData,
    createBooking,
    approveBooking,
    rejectBooking,
    recordPayment,
    validateVehicleAssignment,
    assignVehicle,
    advanceJobStep,
    closeoutBooking,
  }
}
