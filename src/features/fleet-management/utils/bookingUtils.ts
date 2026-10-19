// ──────────────────────────────────────────────────────────────────────────────
// Fleet Booking Utilities
// ──────────────────────────────────────────────────────────────────────────────

import {
  DEPOT_COORDS,
  SERVICE_CONFIG,
  type BookingStatus,
  type BookingRecord,
  type ServiceType,
  type FeeBreakdown,
  type LocationPin,
} from '../data/initialBookingData'

// ── Haversine Distance ────────────────────────────────────────────────────────

/**
 * Calculates the straight-line (haversine) distance in kilometres between
 * two GPS coordinates, rounded to one decimal place.
 */
export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Earth radius km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distKm = R * c
  return Math.round(distKm * 10) / 10
}

/**
 * Estimates the straight-line distance from the municipal depot to a given
 * location pin, rounded to 0.1 km.
 */
export function depotDistanceKm(pin: LocationPin): number {
  return haversineDistanceKm(DEPOT_COORDS.lat, DEPOT_COORDS.lng, pin.lat, pin.lng)
}

// ── Fee Calculation ───────────────────────────────────────────────────────────

/**
 * Calculates the booking fee breakdown.
 * Total = (loads × farePerLoad) + (distanceKm × transportFeePerKm)
 * TODO: confirm official tariff rates with Pradeshiya Sabha.
 */
export function calculateFee(
  serviceType: ServiceType,
  loads: number,
  distanceKm: number
): FeeBreakdown {
  const cfg = SERVICE_CONFIG[serviceType]
  return {
    loads,
    distanceKm,
    farePerLoad: cfg.farePerLoad,
    transportFeePerKm: cfg.transportFeePerKm,
    totalLKR: loads * cfg.farePerLoad + distanceKm * cfg.transportFeePerKm,
  }
}

// ── Reference Number Generator ───────────────────────────────────────────────

/**
 * Generates the next sequential reference number for a service type,
 * based on the highest existing reference number in the bookings list.
 * Format: GB-2026-0001 | WB-2026-0001
 */
export function generateReferenceNumber(
  serviceType: ServiceType,
  existingBookings: BookingRecord[]
): string {
  const cfg = SERVICE_CONFIG[serviceType]
  const year = new Date().getFullYear()
  const prefix = `${cfg.referencePrefix}-${year}-`

  let maxSeq = 0
  for (const b of existingBookings) {
    if (b.referenceNumber.startsWith(prefix)) {
      const seq = parseInt(b.referenceNumber.slice(prefix.length), 10)
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq
    }
  }

  const next = (maxSeq + 1).toString().padStart(4, '0')
  return `${prefix}${next}`
}

// ── Payment Time Remaining ────────────────────────────────────────────────────

/**
 * Computes the time remaining until the payment deadline.
 * Returns null if no paymentDueBy is set or the deadline has passed.
 * Used in table countdown cells — call this from a timer callback, not render.
 */
export function paymentTimeRemaining(paymentDueBy: string): {
  totalMs: number
  hours: number
  minutes: number
  seconds: number
  isUrgent: boolean   // < 3 hours remaining
  isExpired: boolean
} | null {
  const now = Date.now()
  const due = new Date(paymentDueBy).getTime()
  const totalMs = due - now

  if (totalMs <= 0) {
    return { totalMs: 0, hours: 0, minutes: 0, seconds: 0, isUrgent: true, isExpired: true }
  }

  const hours = Math.floor(totalMs / (1000 * 3600))
  const minutes = Math.floor((totalMs % (1000 * 3600)) / (1000 * 60))
  const seconds = Math.floor((totalMs % (1000 * 60)) / 1000)
  const isUrgent = totalMs < 3 * 3600 * 1000

  return { totalMs, hours, minutes, seconds, isUrgent, isExpired: false }
}

/**
 * Formats a payment countdown as a human-readable string.
 * e.g. "21h 04m 32s"
 */
export function formatCountdown(paymentDueBy: string): string {
  const r = paymentTimeRemaining(paymentDueBy)
  if (!r) return '–'
  if (r.isExpired) return 'Expired'
  const h = r.hours.toString().padStart(2, '0')
  const m = r.minutes.toString().padStart(2, '0')
  const s = r.seconds.toString().padStart(2, '0')
  return `${h}h ${m}m ${s}s`
}

// ── Status Helpers ────────────────────────────────────────────────────────────

/** Returns true if the given status is terminal (no further transitions). */
export function isTerminalStatus(status: BookingStatus): boolean {
  return status === 'Rejected' || status === 'Payment Expired' || status === 'Completed'
}

/** Returns true if the booking is currently in an active field job. */
export function isActiveJob(status: BookingStatus): boolean {
  return (
    status === 'Vehicle Assigned' ||
    status === 'En Route' ||
    status === 'Service In Progress' ||
    status === 'In Transit to Plant'
  )
}

/** Returns the next workflow step label for a booking, used on action buttons. */
export function nextActionLabel(booking: BookingRecord): string | null {
  switch (booking.status) {
    case 'Pending TO Review':
      return 'Technical Review'
    case 'Awaiting Payment':
      return 'Record Payment'
    case 'Confirmed':
      return 'Assign Vehicle'
    case 'Vehicle Assigned':
      return 'Start Trip (En Route)'
    case 'En Route':
      return 'Mark Arrived'
    case 'Service In Progress':
      return booking.serviceType === 'GULLY_BOWSER' ? 'Pit Emptied → Transit' : 'Log Delivery'
    case 'In Transit to Plant':
      return 'Log Disposal'
    case 'Pending Closeout':
      return 'Verify & Close'
    default:
      return null
  }
}

// ── Date/Time Formatters ─────────────────────────────────────────────────────

/**
 * Formats an ISO timestamp string to a compact human-readable form.
 * e.g. "Oct 19, 10:30 AM"
 */
export function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Returns a relative time string like "3 hours ago", "2 days ago".
 * Safe to call during render because it is pure (no side effects).
 */
export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const absMs = Math.abs(diffMs)
  const isFuture = diffMs < 0

  const mins = Math.floor(absMs / 60000)
  const hours = Math.floor(absMs / 3600000)
  const days = Math.floor(absMs / 86400000)

  let label: string
  if (mins < 1) label = 'just now'
  else if (mins < 60) label = `${mins} min${mins > 1 ? 's' : ''}`
  else if (hours < 24) label = `${hours} hr${hours > 1 ? 's' : ''}`
  else label = `${days} day${days > 1 ? 's' : ''}`

  if (label === 'just now') return label
  return isFuture ? `in ${label}` : `${label} ago`
}

/**
 * Formats a currency amount as LKR with comma separators.
 * e.g. formatLKR(9585) → "LKR 9,585"
 */
export function formatLKR(amount: number): string {
  return `LKR ${amount.toLocaleString('en-US')}`
}
