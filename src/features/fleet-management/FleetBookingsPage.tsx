import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useBookingData } from './hooks/useBookingData'
import { BookingStatusBadge, BookingSourceBadge } from './components/BookingStatusBadge'
import type { BookingRecord, BookingStatus, ServiceType, BookingSource } from './data/initialBookingData'
import { SERVICE_CONFIG } from './data/initialBookingData'
import {
  paymentTimeRemaining,
  formatLKR,
  formatTimestamp,
  relativeTime,
  nextActionLabel,
} from './utils/bookingUtils'

// TODO: enforce role-based access once fleet-specific roles are added to AuthContext
// (currently roles are: 'superadmin' | 'admin' | 'staff' — no fleet-specific variants)
// import { useAuth } from '../../context/AuthContext'

// ── SVG Icons ────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400 shrink-0">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

// ── Payment countdown cell ────────────────────────────────────────────────────
/** Live countdown timer for 'Awaiting Payment' rows. */
const CountdownCell: React.FC<{ paymentDueBy: string }> = ({ paymentDueBy }) => {
  const [display, setDisplay] = useState('')
  const [urgent, setUrgent] = useState(false)

  useEffect(() => {
    const update = () => {
      const r = paymentTimeRemaining(paymentDueBy)
      if (!r) { setDisplay('–'); return }
      if (r.isExpired) { setDisplay('Expired'); setUrgent(true); return }
      const h = r.hours.toString().padStart(2, '0')
      const m = r.minutes.toString().padStart(2, '0')
      const s = r.seconds.toString().padStart(2, '0')
      setDisplay(`${h}h ${m}m ${s}s`)
      setUrgent(r.isUrgent)
    }
    const timeout = setTimeout(update, 0)
    const id = setInterval(update, 1000)
    return () => {
      clearTimeout(timeout)
      clearInterval(id)
    }
  }, [paymentDueBy])

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-mono font-bold ${urgent ? 'text-[#A31736]' : 'text-blue-700'}`}>
      <ClockIcon />
      {display}
    </span>
  )
}

// ── Simple detail drawer (read-only for Phase 1) ──────────────────────────────
interface DetailDrawerProps {
  booking: BookingRecord | null
  onClose: () => void
  onAction?: (bookingId: string) => void
}

/** Read-only booking detail side drawer. Full interactive drawer comes in Phase 2. */
const BookingDetailDrawer: React.FC<DetailDrawerProps> = ({ booking, onClose }) => {
  if (!booking) return null
  const cfg = SERVICE_CONFIG[booking.serviceType]

  return (
    <div className="fixed inset-0 z-40 flex items-stretch justify-end" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      {/* Drawer */}
      <div className="relative z-50 w-full max-w-xl bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-bold text-[#1e3a8a] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                {booking.referenceNumber}
              </span>
              <BookingSourceBadge source={booking.source} />
            </div>
            <h2 className="text-base font-bold text-gray-900">{cfg.label}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Scheduled: {booking.scheduledDate} at {booking.scheduledTime}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 cursor-pointer mt-0.5 shrink-0"
            aria-label="Close drawer"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
          {/* Status */}
          <div className="px-6 py-4 flex items-center gap-3">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider w-28 shrink-0">Status</span>
            <BookingStatusBadge status={booking.status} />
          </div>

          {/* Applicant */}
          <div className="px-6 py-4 space-y-1.5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Applicant</p>
            <Row label="Name" value={booking.applicant.name} />
            <Row label="NIC" value={booking.applicant.nic} />
            <Row label="Phone" value={booking.applicant.phone} />
            <Row label="Address" value={booking.applicant.address} />
            <Row label="Ward" value={booking.applicant.ward} />
          </div>

          {/* Location */}
          <div className="px-6 py-4 space-y-1.5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Service Location</p>
            <Row label="Location" value={booking.location.label} />
            <Row label="GPS" value={`${booking.location.lat.toFixed(4)}, ${booking.location.lng.toFixed(4)}`} />
          </div>

          {/* Fee */}
          <div className="px-6 py-4 space-y-1.5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fee Breakdown</p>
            <Row label="Loads" value={String(booking.estimatedFee.loads)} />
            <Row label="Distance" value={`${booking.estimatedFee.distanceKm} km`} />
            <Row label="Fare/Load" value={formatLKR(booking.estimatedFee.farePerLoad)} />
            <Row label="Transport/km" value={formatLKR(booking.estimatedFee.transportFeePerKm)} />
            <Row label="Total Fee" value={<span className="font-bold text-gray-900">{formatLKR(booking.estimatedFee.totalLKR)}</span>} />
          </div>

          {/* Payment */}
          {booking.status === 'Awaiting Payment' && booking.paymentDueBy && (
            <div className="px-6 py-4 bg-blue-50 border-l-4 border-blue-500 space-y-1.5">
              <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Payment Due</p>
              <p className="text-sm font-semibold text-blue-900">{formatTimestamp(booking.paymentDueBy)}</p>
              <CountdownCell paymentDueBy={booking.paymentDueBy} />
            </div>
          )}

          {/* E-Receipt */}
          {booking.receipt && (
            <div className="px-6 py-4 space-y-1.5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">E-Receipt</p>
              <Row label="Receipt No." value={booking.receipt.receiptNumber} />
              <Row label="Method" value={booking.receipt.method} />
              <Row label="Paid At" value={formatTimestamp(booking.receipt.paidAt)} />
              <Row label="Amount" value={formatLKR(booking.receipt.amountLKR)} />
            </div>
          )}

          {/* Rejection reason */}
          {booking.rejectionReason && (
            <div className="px-6 py-4 bg-red-50 border-l-4 border-[#A31736]">
              <p className="text-xs font-bold text-[#A31736] uppercase tracking-wider mb-1">Rejection Reason</p>
              <p className="text-sm text-gray-800">{booking.rejectionReason}</p>
            </div>
          )}

          {/* Assignment */}
          {booking.assignedVehicleReg && (
            <div className="px-6 py-4 space-y-1.5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Vehicle Assignment</p>
              <Row label="Vehicle" value={booking.assignedVehicleReg} />
              <Row label="Driver" value={booking.assignedDriverName ?? '–'} />
              {booking.dispatchedAt && <Row label="Dispatched" value={formatTimestamp(booking.dispatchedAt)} />}
            </div>
          )}

          {/* Service Details */}
          <div className="px-6 py-4 space-y-1.5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Service Details</p>
            {booking.serviceDetails.serviceType === 'GULLY_BOWSER' ? (
              <>
                <Row label="Pit Volume" value={`${booking.serviceDetails.pitVolumeLitres.toLocaleString()} L`} />
                <Row label="Waste Type" value={booking.serviceDetails.wasteType} />
                <Row label="Dist. from Gate" value={`${booking.serviceDetails.distanceFromGateM} m`} />
                <Row label="Hose Length" value={`${booking.serviceDetails.hoseLengthRequiredM} m`} />
                <Row label="Road Width" value={`${booking.serviceDetails.roadWidthM} m`} />
              </>
            ) : (
              <>
                <Row label="Water Volume" value={`${booking.serviceDetails.waterVolumeLitres.toLocaleString()} L`} />
                <Row label="Loads Required" value={String(booking.serviceDetails.loadsRequired)} />
                <Row label="Purpose" value={booking.serviceDetails.purpose} />
                <Row label="Tank Type" value={booking.serviceDetails.storageTankType} />
              </>
            )}
          </div>

          {/* Disposal/Delivery Log */}
          {booking.disposalLog && (
            <div className="px-6 py-4 space-y-1.5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Disposal Log</p>
              <Row label="Plant" value={booking.disposalLog.plantName} />
              <Row label="Weighbridge Ticket" value={booking.disposalLog.weighbridgeTicketNo} />
              <Row label="Volume" value={`${booking.disposalLog.volumeLitres.toLocaleString()} L`} />
              <Row label="Weight" value={`${booking.disposalLog.weightKg.toLocaleString()} kg`} />
            </div>
          )}
          {booking.deliveryLog && (
            <div className="px-6 py-4 space-y-1.5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Delivery Log</p>
              <Row label="Flowmeter Start" value={String(booking.deliveryLog.flowmeterStart)} />
              <Row label="Flowmeter End" value={String(booking.deliveryLog.flowmeterEnd)} />
              <Row label="Litres Delivered" value={`${booking.deliveryLog.litresDelivered.toLocaleString()} L`} />
            </div>
          )}

          {/* Timeline */}
          <div className="px-6 py-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Workflow Timeline</p>
            <div className="space-y-3">
              {[...booking.timeline].reverse().map((entry, i) => (
                <div key={i} className="flex gap-3">
                  <div className="mt-1 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#1e3a8a]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{entry.event}</p>
                    <p className="text-[11px] text-gray-500">{entry.actor} • {relativeTime(entry.at)}</p>
                    {entry.note && <p className="text-[11px] text-gray-600 mt-0.5 italic">{entry.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          {booking.notifications.length > 0 && (
            <div className="px-6 py-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Notifications
                <span className="ml-2 font-normal text-gray-400 normal-case tracking-normal">(Simulated)</span>
              </p>
              <div className="space-y-3">
                {[...booking.notifications].reverse().map((n, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded p-3 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 uppercase">
                        {n.channel}
                      </span>
                      <span className="text-gray-500">{n.recipient}</span>
                      <span className="text-gray-400 ml-auto">{relativeTime(n.at)}</span>
                    </div>
                    <p className="text-gray-700">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 shrink-0">
          <p className="text-[11px] text-gray-400 italic">
            Workflow modals (TO Review, Payment, Assign, Progress) available in the next phase.
          </p>
        </div>
      </div>
    </div>
  )
}

/** Helper row for detail sections */
const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-start gap-2 text-sm">
    <span className="text-xs text-gray-500 w-28 shrink-0 pt-0.5">{label}</span>
    <span className="text-gray-900 font-medium">{value}</span>
  </div>
)

// ── Main Page ─────────────────────────────────────────────────────────────────

/** Fleet Booking management page — summary cards, filters, search, table, detail drawer. */
export const FleetBookingsPage: React.FC = () => {
  const { bookings, bookingStats } = useBookingData()

  // ── Filters ──────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [serviceFilter, setServiceFilter] = useState<ServiceType | 'All'>('All')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'All'>('All')
  const [sourceFilter, setSourceFilter] = useState<BookingSource | 'All'>('All')
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null)

  // ── Filter logic ─────────────────────────────────────────────────────────────
  const filtered = bookings.filter((b) => {
    const q = searchQuery.toLowerCase()
    const matchSearch =
      !q ||
      b.referenceNumber.toLowerCase().includes(q) ||
      b.applicant.name.toLowerCase().includes(q) ||
      b.applicant.phone.toLowerCase().includes(q) ||
      b.location.label.toLowerCase().includes(q)

    const matchService = serviceFilter === 'All' || b.serviceType === serviceFilter
    const matchStatus = statusFilter === 'All' || b.status === statusFilter
    const matchSource = sourceFilter === 'All' || b.source === sourceFilter

    return matchSearch && matchService && matchStatus && matchSource
  })

  const resetFilters = useCallback(() => {
    setSearchQuery('')
    setServiceFilter('All')
    setStatusFilter('All')
    setSourceFilter('All')
  }, [])

  const activeFilterCount = [
    searchQuery !== '',
    serviceFilter !== 'All',
    statusFilter !== 'All',
    sourceFilter !== 'All',
  ].filter(Boolean).length

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Fleet Booking Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 max-w-2xl">
            Manage Gutter / Gully Bowser and Water Bowser service bookings — citizen and counter-created, from
            technical review through to completed job closeout.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* TODO: wire up NewBookingModal in Phase 2 */}
          <button
            type="button"
            id="fleet-booking-new-booking-btn"
            disabled
            title="New Booking (available in Phase 2)"
            className="bg-[#A31736] text-white text-xs font-semibold px-4 py-2.5 rounded shadow-sm flex items-center gap-2 uppercase tracking-wider opacity-60 cursor-not-allowed"
          >
            <PlusIcon />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* ── Navigation tabs ── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
        <Link
          to="/fleet/overview"
          className="px-4 py-2 rounded bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold text-xs uppercase tracking-wider transition-all"
        >
          Dashboard
        </Link>
        <Link
          to="/fleet/vehicles"
          className="px-4 py-2 rounded bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold text-xs uppercase tracking-wider transition-all"
        >
          Vehicle Registry
        </Link>
        <Link
          to="/fleet/dispatch"
          className="px-4 py-2 rounded bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold text-xs uppercase tracking-wider transition-all"
        >
          Live Dispatch
        </Link>
        <Link
          to="/fleet/bookings"
          className="px-4 py-2 rounded bg-[#1e3a8a] text-white font-bold text-xs uppercase tracking-wider shadow-xs"
        >
          Fleet Bookings
        </Link>
        <Link
          to="/fleet/maintenance"
          className="px-4 py-2 rounded bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold text-xs uppercase tracking-wider transition-all"
        >
          Maintenance
        </Link>
        <Link
          to="/fleet/drivers"
          className="px-4 py-2 rounded bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold text-xs uppercase tracking-wider transition-all"
        >
          Drivers
        </Link>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <SummaryCard
          label="Pending TO Review"
          count={bookingStats.pendingToReview}
          color="amber"
          active={statusFilter === 'Pending TO Review'}
          onClick={() => setStatusFilter(statusFilter === 'Pending TO Review' ? 'All' : 'Pending TO Review')}
        />
        <SummaryCard
          label="Awaiting Payment"
          count={bookingStats.awaitingPayment}
          color="blue"
          active={statusFilter === 'Awaiting Payment'}
          onClick={() => setStatusFilter(statusFilter === 'Awaiting Payment' ? 'All' : 'Awaiting Payment')}
        />
        <SummaryCard
          label="Confirmed – Awaiting Vehicle"
          count={bookingStats.confirmed}
          color="emerald"
          active={statusFilter === 'Confirmed'}
          onClick={() => setStatusFilter(statusFilter === 'Confirmed' ? 'All' : 'Confirmed')}
        />
        <SummaryCard
          label="Active Jobs"
          count={bookingStats.activeJobs}
          color="indigo"
          active={false}
          onClick={() => {
            setStatusFilter('En Route')
          }}
        />
        <SummaryCard
          label="Completed"
          count={bookingStats.completed}
          color="green"
          active={statusFilter === 'Completed'}
          onClick={() => setStatusFilter(statusFilter === 'Completed' ? 'All' : 'Completed')}
        />
      </div>

      {/* ── Search & Filter toolbar ── */}
      <div className="bg-white p-4 border border-gray-300 rounded shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <SearchIcon />
            </div>
            <input
              id="fleet-bookings-search"
              type="text"
              placeholder="Search reference, name, phone, location…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded pl-9 pr-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#A31736]"
            />
          </div>

          {/* Service type filter */}
          <select
            id="fleet-bookings-service-filter"
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value as ServiceType | 'All')}
            className="w-full sm:w-auto px-3.5 py-2 rounded border border-gray-300 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:border-[#A31736]"
          >
            <option value="All">All Services</option>
            <option value="GULLY_BOWSER">Gutter / Gully Bowser</option>
            <option value="WATER_BOWSER">Water Bowser</option>
          </select>

          {/* Status filter */}
          <select
            id="fleet-bookings-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'All')}
            className="w-full sm:w-auto px-3.5 py-2 rounded border border-gray-300 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:border-[#A31736]"
          >
            <option value="All">All Statuses</option>
            <option value="Pending TO Review">Pending TO Review</option>
            <option value="Awaiting Payment">Awaiting Payment</option>
            <option value="Payment Expired">Payment Expired</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Vehicle Assigned">Vehicle Assigned</option>
            <option value="En Route">En Route</option>
            <option value="Service In Progress">Service In Progress</option>
            <option value="In Transit to Plant">In Transit to Plant</option>
            <option value="Pending Closeout">Pending Closeout</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Source filter */}
          <select
            id="fleet-bookings-source-filter"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as BookingSource | 'All')}
            className="w-full sm:w-auto px-3.5 py-2 rounded border border-gray-300 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:border-[#A31736]"
          >
            <option value="All">All Sources</option>
            <option value="Citizen Portal">Citizen Portal</option>
            <option value="Staff Counter">Staff Counter</option>
          </select>

          {/* Clear filters */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#A31736] font-semibold cursor-pointer transition-colors"
            >
              <CloseIcon />
              Clear ({activeFilterCount})
            </button>
          )}
        </div>

        <div className="text-xs text-gray-500 font-semibold w-full md:w-auto text-left md:text-right">
          Showing <span className="text-gray-900 font-bold">{filtered.length}</span> of {bookings.length} bookings
        </div>
      </div>

      {/* ── Bookings Table ── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded border border-gray-300 p-12 text-center space-y-3">
          <p className="text-sm font-bold text-gray-700">No Bookings Found</p>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            No bookings match your current search or filter criteria.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 rounded bg-[#1e3a8a] text-white text-xs font-semibold uppercase tracking-wider shadow-sm cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Reference</th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Service</th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Applicant</th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Source</th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Scheduled</th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Location</th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Fee</th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Payment / Action</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, idx) => {
                  const cfg = SERVICE_CONFIG[b.serviceType]
                  const actionLabel = nextActionLabel(b)

                  return (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedBooking(b)}
                      className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                    >
                      {/* Reference */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-[#1e3a8a] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          {b.referenceNumber}
                        </span>
                      </td>

                      {/* Service */}
                      <td className="py-3.5 px-4 text-xs text-gray-700 whitespace-nowrap">
                        {cfg.label}
                      </td>

                      {/* Applicant */}
                      <td className="py-3.5 px-4">
                        <p className="text-sm font-semibold text-gray-900">{b.applicant.name}</p>
                        <p className="text-xs text-gray-500">{b.applicant.phone}</p>
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4">
                        <BookingSourceBadge source={b.source} />
                      </td>

                      {/* Scheduled */}
                      <td className="py-3.5 px-4 text-xs text-gray-700 whitespace-nowrap">
                        <p>{b.scheduledDate}</p>
                        <p className="text-gray-500">{b.scheduledTime}</p>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-xs text-gray-600 max-w-[160px] truncate">
                        {b.location.label}
                      </td>

                      {/* Fee */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-gray-800 whitespace-nowrap">
                        {formatLKR(b.estimatedFee.totalLKR)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <BookingStatusBadge status={b.status} />
                      </td>

                      {/* Payment countdown / Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {b.status === 'Awaiting Payment' && b.paymentDueBy ? (
                          <CountdownCell paymentDueBy={b.paymentDueBy} />
                        ) : actionLabel ? (
                          <span className="text-xs font-semibold text-[#1e3a8a] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                            {actionLabel}
                          </span>
                        ) : null}
                      </td>

                      {/* Row arrow */}
                      <td className="py-3.5 px-4 text-gray-400">
                        <ChevronRightIcon />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Detail Drawer ── */}
      <BookingDetailDrawer
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  )
}

// ── Summary Card sub-component ────────────────────────────────────────────────
const COLOR_MAP = {
  amber: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-500', ring: 'border-amber-500 ring-amber-500' },
  blue: { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', bar: 'bg-blue-600', ring: 'border-blue-500 ring-blue-500' },
  emerald: { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-600', ring: 'border-emerald-500 ring-emerald-500' },
  indigo: { text: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', bar: 'bg-indigo-600', ring: 'border-indigo-500 ring-indigo-500' },
  green: { text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', bar: 'bg-green-600', ring: 'border-green-500 ring-green-500' },
}

interface SummaryCardProps {
  label: string
  count: number
  color: keyof typeof COLOR_MAP
  active: boolean
  onClick: () => void
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, count, color, active, onClick }) => {
  const c = COLOR_MAP[color]
  return (
    <button
      type="button"
      onClick={onClick}
      className={`bg-white border rounded p-4 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow transition-all w-full text-left font-normal ${
        active ? `${c.ring} ring-1` : 'border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 leading-tight">
          {label}
        </span>
        {count > 0 && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${c.bg} ${c.text} ${c.border}`}>
            {count}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className={`text-3xl font-extrabold tracking-tight ${c.text}`}>{count}</p>
      </div>
      <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-4 overflow-hidden">
        <div className={`${c.bar} h-1.5 rounded-sm transition-all duration-700`} style={{ width: count > 0 ? '100%' : '0%' }} />
      </div>
    </button>
  )
}
