import React, { useState, useEffect, useCallback } from 'react'
import { useBookingData } from './hooks/useBookingData'
import { BookingStatusBadge, BookingSourceBadge } from './components/BookingStatusBadge'
import type { BookingRecord, BookingStatus, ServiceType, BookingSource } from './data/initialBookingData'
import { SERVICE_CONFIG } from './data/initialBookingData'
import {
  paymentTimeRemaining,
  formatLKR,
  nextActionLabel,
} from './utils/bookingUtils'
import { formatMobileNumber } from './utils/validators'

// Workflow Modals & Full Drawer
import { NewBookingModal } from './components/NewBookingModal'
import { TechnicalReviewModal } from './components/TechnicalReviewModal'
import { RecordPaymentModal } from './components/RecordPaymentModal'
import { AssignBookingVehicleModal } from './components/AssignBookingVehicleModal'
import { JobProgressModal } from './components/JobProgressModal'
import { CloseoutBookingModal } from './components/CloseoutBookingModal'
import { BookingDetailDrawer } from './components/BookingDetailDrawer'

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

// ── Main Page ─────────────────────────────────────────────────────────────────

/** Fleet Booking management page — summary cards, filters, search, table, workflow modals, and detail drawer. */
export const FleetBookingsPage: React.FC = () => {
  const {
    bookings,
    vehicles,
    drivers,
    bookingStats,
    seedAgeHours,
    createBooking,
    approveBooking,
    rejectBooking,
    recordPayment,
    assignVehicle,
    advanceJobStep,
    closeoutBooking,
  } = useBookingData()

  // ── Filters ──────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [serviceFilter, setServiceFilter] = useState<ServiceType | 'All'>('All')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'All'>('All')
  const [sourceFilter, setSourceFilter] = useState<BookingSource | 'All'>('All')

  // ── Modal & Drawer States ────────────────────────────────────────────────────
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null)
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false)
  const [reviewBooking, setReviewBooking] = useState<BookingRecord | null>(null)
  const [paymentBooking, setPaymentBooking] = useState<BookingRecord | null>(null)
  const [assignBooking, setAssignBooking] = useState<BookingRecord | null>(null)
  const [progressBooking, setProgressBooking] = useState<BookingRecord | null>(null)
  const [closeoutBookingRecord, setCloseoutBookingRecord] = useState<BookingRecord | null>(null)
  const [isSeedNoticeDismissed, setIsSeedNoticeDismissed] = useState(false)

  // ── Filter logic ─────────────────────────────────────────────────────────────
  const filtered = [...bookings]
    .sort((first, second) => {
      const createdDifference =
        Date.parse(second.timeline[0]?.at ?? '') - Date.parse(first.timeline[0]?.at ?? '')
      return createdDifference || second.referenceNumber.localeCompare(first.referenceNumber)
    })
    .filter((b) => {
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

  /** Dispatches action button click to the appropriate workflow modal. */
  const handleOpenAction = (booking: BookingRecord) => {
    switch (booking.status) {
      case 'Pending TO Review':
        setReviewBooking(booking)
        break
      case 'Awaiting Payment':
        setPaymentBooking(booking)
        break
      case 'Confirmed':
        setAssignBooking(booking)
        break
      case 'Vehicle Assigned':
      case 'En Route':
      case 'Service In Progress':
      case 'In Transit to Plant':
        setProgressBooking(booking)
        break
      case 'Pending Closeout':
        setCloseoutBookingRecord(booking)
        break
      default:
        // terminal statuses open detail drawer
        setSelectedBooking(booking)
        break
    }
  }

  // Keep selected drawer booking updated if mutated
  const currentDrawerBooking = selectedBooking
    ? bookings.find((b) => b.id === selectedBooking.id) || selectedBooking
    : null

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
          <button
            type="button"
            onClick={() => setIsNewBookingOpen(true)}
            className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-4 py-2.5 rounded shadow-sm transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <PlusIcon />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {seedAgeHours >= 12 && !isSeedNoticeDismissed && (
        <div className="flex items-center justify-between gap-3 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900" role="status">
          <p>Demo data was created {seedAgeHours} hours ago, so payment countdowns may have expired.</p>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => setIsSeedNoticeDismissed(true)} aria-label="Dismiss demo data notice" className="font-bold">
              ×
            </button>
          </div>
        </div>
      )}

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <SummaryCard
          label="Pending TO Review"
          count={bookingStats.pendingToReview}
          color="amber"
          active={statusFilter === 'Pending TO Review'}
          onClick={() => setStatusFilter((prev) => (prev === 'Pending TO Review' ? 'All' : 'Pending TO Review'))}
        />
        <SummaryCard
          label="Awaiting Payment"
          count={bookingStats.awaitingPayment}
          color="blue"
          active={statusFilter === 'Awaiting Payment'}
          onClick={() => setStatusFilter((prev) => (prev === 'Awaiting Payment' ? 'All' : 'Awaiting Payment'))}
        />
        <SummaryCard
          label="Confirmed (Awaiting Vehicle)"
          count={bookingStats.confirmed}
          color="indigo"
          active={statusFilter === 'Confirmed'}
          onClick={() => setStatusFilter((prev) => (prev === 'Confirmed' ? 'All' : 'Confirmed'))}
        />
        <SummaryCard
          label="Active Jobs"
          count={bookingStats.activeJobs}
          color="emerald"
          active={
            statusFilter === 'Vehicle Assigned' ||
            statusFilter === 'En Route' ||
            statusFilter === 'Service In Progress' ||
            statusFilter === 'In Transit to Plant'
          }
          onClick={() => setStatusFilter((prev) => (prev === 'En Route' ? 'All' : 'En Route'))}
        />
        <SummaryCard
          label="Completed"
          count={bookingStats.completed}
          secondaryLabel={`Pending Closeout: ${bookingStats.pendingCloseout}`}
          color="green"
          active={statusFilter === 'Completed'}
          onClick={() => setStatusFilter((prev) => (prev === 'Completed' ? 'All' : 'Completed'))}
        />
      </div>

      {/* ── Filter & Search Toolbar ── */}
      <div className="bg-white border border-gray-300 rounded p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-lg">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search by ref no, applicant name, phone, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border border-gray-300 rounded text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#A31736] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                aria-label="Clear search"
              >
                <CloseIcon />
              </button>
            )}
          </div>

          {/* Dropdown filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Service Type */}
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value as ServiceType | 'All')}
              className="bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-700 font-medium focus:outline-none focus:border-[#A31736]"
            >
              <option value="All">All Services</option>
              <option value="GULLY_BOWSER">{SERVICE_CONFIG.GULLY_BOWSER.label}</option>
              <option value="WATER_BOWSER">{SERVICE_CONFIG.WATER_BOWSER.label}</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'All')}
              className="bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-700 font-medium focus:outline-none focus:border-[#A31736]"
            >
              <option value="All">All Statuses</option>
              <option value="Pending TO Review">Pending TO Review</option>
              <option value="Awaiting Payment">Awaiting Payment</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Vehicle Assigned">Vehicle Assigned</option>
              <option value="En Route">En Route</option>
              <option value="Service In Progress">Service In Progress</option>
              <option value="In Transit to Plant">In Transit to Plant</option>
              <option value="Pending Closeout">Pending Closeout</option>
              <option value="Completed">Completed</option>
              <option value="Payment Expired">Payment Expired</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Source */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as BookingSource | 'All')}
              className="bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-700 font-medium focus:outline-none focus:border-[#A31736]"
            >
              <option value="All">All Sources</option>
              <option value="Citizen Portal">Citizen Portal</option>
              <option value="Staff Counter">Staff Counter</option>
            </select>

            {/* Reset */}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-[#A31736] hover:text-[#85122b] font-semibold px-2 py-1.5 cursor-pointer"
              >
                <CloseIcon />
                <span>Reset ({activeFilterCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
          <span>
            Showing <strong className="text-gray-800">{filtered.length}</strong> of{' '}
            <strong className="text-gray-800">{bookings.length}</strong> bookings
          </span>
          <span className="text-[11px] text-gray-400">
            Use the reference number or chevron to open a dossier • Action buttons open step workflows
          </span>
        </div>
      </div>

      {/* ── Bookings Table ── */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-300 rounded p-12 text-center shadow-sm">
          <p className="text-gray-400 text-sm">No bookings match the current search and filter criteria.</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-3 text-xs text-[#A31736] hover:underline font-semibold cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Ref No.</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Scheduled</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Fee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action / Timer</th>
                  <th className="py-3 px-4 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filtered.map((b) => {
                  const cfg = SERVICE_CONFIG[b.serviceType]
                  const actionLabel = nextActionLabel(b)
                  const isAwaiting = b.status === 'Awaiting Payment'

                  return (
                    <tr key={b.id} className="hover:bg-rose-50/30 transition-colors group">
                      {/* Ref */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#A31736] whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedBooking(b)}
                          aria-label={`Open dossier for ${b.referenceNumber}`}
                          className="font-mono font-bold text-[#A31736] hover:underline cursor-pointer"
                        >
                          {b.referenceNumber}
                        </button>
                      </td>

                      {/* Service */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900">{cfg.label}</span>
                      </td>

                      {/* Applicant */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-900">{b.applicant.name}</p>
                        <p className="text-[11px] text-gray-500 font-mono">{formatMobileNumber(b.applicant.phone)}</p>
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <BookingSourceBadge source={b.source} />
                      </td>

                      {/* Scheduled */}
                      <td className="py-3.5 px-4 text-xs text-gray-700 whitespace-nowrap">
                        <p className="font-medium">{b.scheduledDate}</p>
                        <p className="text-gray-500 text-[11px]">{b.scheduledTime}</p>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-xs text-gray-600 max-w-[160px] truncate" title={b.location.label}>
                        {b.location.label}
                      </td>

                      {/* Fee */}
                      <td className="py-3.5 px-4 text-xs font-bold text-gray-800 whitespace-nowrap">
                        {formatLKR(b.estimatedFee.totalLKR)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <BookingStatusBadge status={b.status} />
                      </td>

                      {/* Payment countdown / Action Button */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isAwaiting && b.paymentDueBy ? (
                          <div className="flex items-center gap-2">
                            <CountdownCell paymentDueBy={b.paymentDueBy} />
                            <button
                              type="button"
                              onClick={() => setPaymentBooking(b)}
                              className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-all cursor-pointer shadow-xs"
                            >
                              Record Payment
                            </button>
                          </div>
                        ) : actionLabel ? (
                          <button
                            type="button"
                            onClick={() => handleOpenAction(b)}
                            className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-[#A31736] border border-rose-200 font-bold text-xs transition-all cursor-pointer shadow-xs flex items-center gap-1"
                          >
                            <span>{actionLabel}</span>
                            <span>→</span>
                          </button>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">–</span>
                        )}
                      </td>

                      {/* Row arrow */}
                      <td className="py-3.5 px-4 text-gray-400 group-hover:text-gray-600 transition-colors">
                        <button
                          type="button"
                          onClick={() => setSelectedBooking(b)}
                          aria-label={`Open dossier for ${b.referenceNumber}`}
                          className="cursor-pointer"
                        >
                          <ChevronRightIcon />
                        </button>
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
        booking={currentDrawerBooking}
        onClose={() => setSelectedBooking(null)}
        onOpenAction={(b) => {
          setSelectedBooking(null)
          handleOpenAction(b)
        }}
      />

      {/* ── 1. New Booking Modal ── */}
      <NewBookingModal
        isOpen={isNewBookingOpen}
        onClose={() => setIsNewBookingOpen(false)}
        onCreateBooking={createBooking}
      />

      {/* ── 2. Technical Review Modal ── */}
      <TechnicalReviewModal
        isOpen={Boolean(reviewBooking)}
        onClose={() => setReviewBooking(null)}
        booking={reviewBooking}
        onApprove={approveBooking}
        onReject={rejectBooking}
      />

      {/* ── 3. Record Payment Modal ── */}
      <RecordPaymentModal
        isOpen={Boolean(paymentBooking)}
        onClose={() => setPaymentBooking(null)}
        booking={paymentBooking}
        onRecordPayment={recordPayment}
      />

      {/* ── 4. Assign Vehicle & Driver Modal ── */}
      <AssignBookingVehicleModal
        isOpen={Boolean(assignBooking)}
        onClose={() => setAssignBooking(null)}
        booking={assignBooking}
        vehicles={vehicles}
        drivers={drivers}
        onAssign={assignVehicle}
      />

      {/* ── 5. Job Progress Modal ── */}
      <JobProgressModal
        isOpen={Boolean(progressBooking)}
        onClose={() => setProgressBooking(null)}
        booking={progressBooking}
        onAdvanceJobStep={advanceJobStep}
      />

      {/* ── 6. Closeout Booking Modal ── */}
      <CloseoutBookingModal
        isOpen={Boolean(closeoutBookingRecord)}
        onClose={() => setCloseoutBookingRecord(null)}
        booking={closeoutBookingRecord}
        onCloseout={closeoutBooking}
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
  secondaryLabel?: string
  color: keyof typeof COLOR_MAP
  active: boolean
  onClick: () => void
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, count, secondaryLabel, color, active, onClick }) => {
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
      {secondaryLabel && (
        <span className="mt-1 text-[10px] font-semibold text-amber-700">{secondaryLabel}</span>
      )}
      <div className="mt-3">
        <p className={`text-3xl font-extrabold tracking-tight ${c.text}`}>{count}</p>
      </div>
      <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-4 overflow-hidden">
        <div className={`${c.bar} h-1.5 rounded-sm transition-all duration-700`} style={{ width: count > 0 ? '100%' : '0%' }} />
      </div>
    </button>
  )
}
