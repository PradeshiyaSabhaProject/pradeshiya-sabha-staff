// ──────────────────────────────────────────────────────────────────────────────
// useBookingData — Shared fleet-booking state hook (localStorage-backed)
// Follows the same pattern as useFleetData.ts for cross-page state sharing.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from 'react'
import {
  buildInitialBookings,
  EXTRA_VEHICLE_GULLY_ACTIVE,
  EXTRA_VEHICLE_WATER_ACTIVE,
  EXTRA_VEHICLE_GULLY_AVAIL,
  EXTRA_VEHICLE_WATER_AVAIL,
  EXTRA_VEHICLE_GULLY_CLOSEOUT,
  EXTRA_DRIVERS,
  SERVICE_CONFIG,
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
  type VehicleRecord,
  type DriverRecord,
} from '../data/initialFleetData'
import { generateReferenceNumber } from '../utils/bookingUtils'

// ── localStorage keys ─────────────────────────────────────────────────────────
const BOOKINGS_STORAGE_KEY = 'ps_fleet_bookings_v1'
// We also extend the vehicle/driver keys used by useFleetData so they share the
// same localStorage slots — bookings and fleet pages stay in sync.
const VEHICLES_STORAGE_KEY = 'ps_fleet_vehicles_v1'
const DRIVERS_STORAGE_KEY = 'ps_fleet_drivers_v1'

// ── Extra seed data appended to base lists ────────────────────────────────────
const EXTRA_VEHICLES: VehicleRecord[] = [
  EXTRA_VEHICLE_GULLY_ACTIVE,
  EXTRA_VEHICLE_WATER_ACTIVE,
  EXTRA_VEHICLE_GULLY_AVAIL,
  EXTRA_VEHICLE_WATER_AVAIL,
  EXTRA_VEHICLE_GULLY_CLOSEOUT,
]

/** Reads vehicles from localStorage (or merges seed if missing extra vehicles). */
function loadVehicles(): VehicleRecord[] {
  const saved = localStorage.getItem(VEHICLES_STORAGE_KEY)
  if (saved) {
    try {
      const parsed: VehicleRecord[] = JSON.parse(saved)
      // Ensure extra seed vehicles are present (first-run after feature deploy)
      const ids = new Set(parsed.map((v) => v.id))
      const merged = [...parsed]
      for (const ev of EXTRA_VEHICLES) {
        if (!ids.has(ev.id)) merged.push(ev)
      }
      return merged
    } catch {
      // fallback to default
    }
  }
  return [...INITIAL_VEHICLES, ...EXTRA_VEHICLES]
}

/** Reads drivers from localStorage (or merges extra drivers if missing). */
function loadDrivers(): DriverRecord[] {
  const saved = localStorage.getItem(DRIVERS_STORAGE_KEY)
  if (saved) {
    try {
      const parsed: DriverRecord[] = JSON.parse(saved)
      const ids = new Set(parsed.map((d) => d.id))
      const merged = [...parsed]
      for (const ed of EXTRA_DRIVERS) {
        if (!ids.has(ed.id)) merged.push(ed)
      }
      return merged
    } catch {
      // fallback
    }
  }
  return [...INITIAL_DRIVERS, ...EXTRA_DRIVERS]
}

/** Validation result returned by vehicle-assignment validator. */
export interface AssignmentValidationResult {
  valid: boolean
  error?: string
}

/**
 * Shared booking data hook.
 * State is persisted to localStorage under the same keys as useFleetData,
 * so vehicle/driver changes from either hook are visible on next page render.
 * TODO: replace all booking mutations with API calls before production.
 */
export function useBookingData() {
  // ── Bookings state ──────────────────────────────────────────────────────────
  const [bookings, setBookings] = useState<BookingRecord[]>(() => {
    const saved = localStorage.getItem(BOOKINGS_STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved) as BookingRecord[]
      } catch {
        // fallback
      }
    }
    return buildInitialBookings(Date.now())
  })

  // ── Shared vehicle & driver state (same localStorage slots as useFleetData) ─
  const [vehicles, setVehicles] = useState<VehicleRecord[]>(loadVehicles)
  const [drivers, setDrivers] = useState<DriverRecord[]>(loadDrivers)

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
        try { setBookings(JSON.parse(b)) } catch { /* ignore */ }
      }
      const v = localStorage.getItem(VEHICLES_STORAGE_KEY)
      if (v) {
        try { setVehicles(JSON.parse(v)) } catch { /* ignore */ }
      }
      const d = localStorage.getItem(DRIVERS_STORAGE_KEY)
      if (d) {
        try { setDrivers(JSON.parse(d)) } catch { /* ignore */ }
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
    completed: bookings.filter((b) => b.status === 'Completed').length,
  }), [bookings])

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
  }): BookingRecord => {
    const now = new Date().toISOString()
    const refNum = generateReferenceNumber(data.serviceType, bookings)
    const newBooking: BookingRecord = {
      id: `BK-${Date.now()}`,
      referenceNumber: refNum,
      serviceType: data.serviceType,
      source: data.source,
      status: 'Pending TO Review',
      applicant: data.applicant,
      location: data.location,
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      serviceDetails: data.serviceDetails,
      estimatedFee: data.estimatedFee,
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
          recipient: data.applicant.phone,
          message: `Your ${SERVICE_CONFIG[data.serviceType].label} booking (${refNum}) has been registered at the Pradeshiya Sabha counter.`,
          label: 'Simulated',
        },
      ],
    }
    setBookings((prev) => [newBooking, ...prev])
    return newBooking
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
  ) => {
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
          estimatedFee: params.finalFee,
          approvedAt: now,
          paymentDueBy,
          timeline: [
            ...b.timeline,
            {
              at: now,
              actor: params.approverName || 'Technical Officer',
              event: 'Booking Approved',
              note: `Final fee: LKR ${params.finalFee.totalLKR.toLocaleString()}. Payment due within 24 hours.`,
            },
          ],
          notifications: [
            ...b.notifications,
            {
              at: now,
              channel: 'SMS' as const,
              recipient: b.applicant.phone,
              message: `${b.referenceNumber} APPROVED. Fee: LKR ${params.finalFee.totalLKR.toLocaleString()}. Please complete payment within 24 hours to confirm your booking.`,
              label: 'Simulated' as const,
            },
          ],
        }
      })
    )
  }

  /**
   * Technical Officer rejects a booking.
   * TODO: replace with API call.
   */
  const rejectBooking = (
    bookingId: string,
    reason: string,
    approverName?: string
  ) => {
    const now = new Date().toISOString()
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId || b.status !== 'Pending TO Review') return b
        return {
          ...b,
          status: 'Rejected' as BookingStatus,
          rejectionReason: reason,
          timeline: [
            ...b.timeline,
            {
              at: now,
              actor: approverName || 'Technical Officer',
              event: 'Booking Rejected',
              note: reason,
            },
          ],
          notifications: [
            ...b.notifications,
            {
              at: now,
              channel: 'SMS' as const,
              recipient: b.applicant.phone,
              message: `${b.referenceNumber} REJECTED. Reason: ${reason} Please contact the Pradeshiya Sabha for alternatives.`,
              label: 'Simulated' as const,
            },
          ],
        }
      })
    )
  }

  /**
   * Records a payment (counter or simulated online) for an 'Awaiting Payment' booking.
   * TODO: replace with API call.
   */
  const recordPayment = (
    bookingId: string,
    receipt: EReceipt,
    recordedBy?: string
  ) => {
    const now = new Date().toISOString()
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId || b.status !== 'Awaiting Payment') return b
        return {
          ...b,
          status: 'Confirmed' as BookingStatus,
          receipt,
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
  }

  /**
   * Validates whether a vehicle can be assigned to a booking.
   * Checks: category match, Available status, permit/licence/insurance validity.
   * Returns { valid: true } or { valid: false, error: '...' }.
   */
  const validateVehicleAssignment = (
    booking: BookingRecord,
    vehicleId: string
  ): AssignmentValidationResult => {
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    if (!vehicle) return { valid: false, error: 'Vehicle not found.' }

    const requiredCategory = SERVICE_CONFIG[booking.serviceType].vehicleCategory
    if (vehicle.category !== requiredCategory) {
      return {
        valid: false,
        error: `Vehicle category mismatch. This booking requires a "${requiredCategory}" but "${vehicle.name}" is a "${vehicle.category}".`,
      }
    }

    if (vehicle.status !== 'Available') {
      return {
        valid: false,
        error: `Vehicle ${vehicle.registrationNumber} is not available (current status: ${vehicle.status}).`,
      }
    }

    // Permit / licence / insurance checks — use today's date string
    const today = new Date().toISOString().split('T')[0]
    if (vehicle.permitExpiryDate < today) {
      return {
        valid: false,
        error: `Vehicle ${vehicle.registrationNumber} has an expired Route Permit (expired ${vehicle.permitExpiryDate}). Renew before assigning.`,
      }
    }
    if (vehicle.revenueLicenseExpiryDate < today) {
      return {
        valid: false,
        error: `Vehicle ${vehicle.registrationNumber} has an expired Revenue License (expired ${vehicle.revenueLicenseExpiryDate}).`,
      }
    }
    if (vehicle.insuranceExpiryDate < today) {
      return {
        valid: false,
        error: `Vehicle ${vehicle.registrationNumber} has expired Insurance (expired ${vehicle.insuranceExpiryDate}).`,
      }
    }

    return { valid: true }
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
    if (!booking) return { valid: false, error: 'Booking not found.' }

    const validation = validateVehicleAssignment(booking, vehicleId)
    if (!validation.valid) return validation

    const vehicle = vehicles.find((v) => v.id === vehicleId)
    const driver = drivers.find((d) => d.id === driverId)
    if (!driver) return { valid: false, error: 'Driver not found.' }

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
        valid: false,
        error: `Driver ${driver.name} is already on an active job (${driverActiveBooking.referenceNumber}).`,
      }
    }

    const now = new Date().toISOString()
    const nowDisplay = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

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
              actor: assignedBy || 'Fleet Supervisor (Current User)',
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
        if (v.id !== vehicleId) return v
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
      })
    )

    // Update driver record
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id !== driverId) return d
        return {
          ...d,
          assignedVehicleId: vehicleId,
          assignedVehicleReg: vehicle?.registrationNumber ?? null,
        }
      })
    )

    return { valid: true }
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
    }
  ) => {
    const now = new Date().toISOString()
    let vehicleToRelease: string | undefined

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b

        // Capture vehicle ID for release when entering Pending Closeout
        if (newStatus === 'Pending Closeout') {
          vehicleToRelease = b.assignedVehicleId
        }

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
          timeline: [
            ...b.timeline,
            {
              at: now,
              actor: actor || 'Driver / Supervisor (Current User)',
              event: statusEventMap[newStatus] || newStatus,
              note,
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
      const booking = bookings.find((b) => b.id === bookingId)
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
            odometerKm: v.odometerKm + Math.round(tripKm),
          }
        })
      )
      if (booking?.assignedDriverId) {
        setDrivers((prev) =>
          prev.map((d) => {
            if (d.id !== booking.assignedDriverId) return d
            return d // Driver keeps vehicle assignment; only booking link is severed
          })
        )
      }
    }
  }

  /**
   * Records a citizen sign-off and closes out a booking (Pending Closeout → Completed).
   * TODO: replace with API call.
   */
  const closeoutBooking = (
    bookingId: string,
    citizenSignOff: string,
    supervisorNote?: string,
    supervisorName?: string
  ) => {
    advanceJobStep(
      bookingId,
      'Completed',
      supervisorNote
        ? `${supervisorNote} Citizen sign-off: ${citizenSignOff}.`
        : `Citizen sign-off: ${citizenSignOff}.`,
      supervisorName || 'Supervisor (Current User)'
    )
    // Update booking with sign-off
    const now = new Date().toISOString()
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, citizenSignOff, completedAt: now } : b
      )
    )
  }

  return {
    bookings,
    vehicles,
    drivers,
    bookingStats,
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
