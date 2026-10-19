import React from 'react'
import type { BookingStatus, BookingSource } from '../data/initialBookingData'

// ── Status badge style map ────────────────────────────────────────────────────
const STATUS_STYLES: Record<BookingStatus, string> = {
  'Pending TO Review':
    'bg-amber-50 text-amber-800 border-amber-200',
  Rejected:
    'bg-red-50 text-[#A31736] border-red-200 font-bold',
  'Awaiting Payment':
    'bg-blue-50 text-blue-800 border-blue-200',
  'Payment Expired':
    'bg-gray-100 text-gray-600 border-gray-300 line-through',
  Confirmed:
    'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold',
  'Vehicle Assigned':
    'bg-cyan-50 text-cyan-800 border-cyan-200 font-semibold',
  'En Route':
    'bg-indigo-50 text-indigo-800 border-indigo-200 font-semibold',
  'Service In Progress':
    'bg-violet-50 text-violet-800 border-violet-200 font-semibold',
  'In Transit to Plant':
    'bg-orange-50 text-orange-800 border-orange-200 font-semibold',
  'Pending Closeout':
    'bg-teal-50 text-teal-800 border-teal-200 font-semibold',
  Completed:
    'bg-green-50 text-green-800 border-green-200 font-semibold',
}

interface BookingStatusBadgeProps {
  /** The booking workflow status to display. */
  status: BookingStatus
  /** Optional extra CSS classes. */
  className?: string
}

/**
 * Pill badge for booking workflow statuses.
 * Matches the pill style used by other fleet badge components.
 */
export const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const style = STATUS_STYLES[status] ?? 'bg-gray-50 text-gray-700 border-gray-200'
  return (
    <span
      className={`inline-flex items-center text-[11px] px-2.5 py-0.5 rounded border uppercase tracking-wider whitespace-nowrap font-semibold ${style} ${className}`}
    >
      {status}
    </span>
  )
}

// ── Source badge ──────────────────────────────────────────────────────────────
interface BookingSourceBadgeProps {
  /** The booking creation source. */
  source: BookingSource
  className?: string
}

/**
 * Small pill badge distinguishing citizen-portal vs staff-counter bookings.
 */
export const BookingSourceBadge: React.FC<BookingSourceBadgeProps> = ({
  source,
  className = '',
}) => {
  const style =
    source === 'Citizen Portal'
      ? 'bg-purple-50 text-purple-800 border-purple-200'
      : 'bg-sky-50 text-sky-800 border-sky-200'

  return (
    <span
      className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded border font-semibold whitespace-nowrap ${style} ${className}`}
    >
      {source}
    </span>
  )
}
