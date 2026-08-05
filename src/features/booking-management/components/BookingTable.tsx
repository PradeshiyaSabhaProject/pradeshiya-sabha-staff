import React, { useState, useMemo } from 'react'
import type { FacilityBooking, BookingStatus } from '../types'

interface BookingTableProps {
  bookings: FacilityBooking[]
  onView: (booking: FacilityBooking) => void
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  showTabs?: boolean
  selectedFacilityFilter?: string
}

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-500 group-hover:text-[#801028]">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400 shrink-0 pointer-events-none">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400 shrink-0 pointer-events-none">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400 shrink-0 pointer-events-none">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const TABS: { id: string; label: string; status: BookingStatus | null }[] = [
  { id: 'all', label: 'All Bookings', status: null },
  { id: 'pending', label: 'Pending Approval', status: 'PENDING' },
  { id: 'approved', label: 'Approved & Reserved', status: 'APPROVED' },
  { id: 'rejected', label: 'Rejected / Cancelled', status: 'REJECTED' },
  { id: 'completed', label: 'Completed Events', status: 'COMPLETED' }
]

const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  onView,
  onApprove,
  onReject,
  showTabs = true,
  selectedFacilityFilter = ''
}) => {
  const [activeTab, setActiveTab] = useState('all')
  const [filters, setFilters] = useState({ facility: '', date: '', status: '', search: '' })
  const [appliedFilters, setAppliedFilters] = useState({ facility: '', date: '', status: '', search: '' })

  const uniqueFacilities = useMemo(
    () => Array.from(new Set(bookings.map(b => b.facilityName))).sort((a, b) => a.localeCompare(b)),
    [bookings]
  )
  const uniqueDates = useMemo(
    () => Array.from(new Set(bookings.map(b => b.bookingDate))).sort((a, b) => a.localeCompare(b)),
    [bookings]
  )
  const uniqueStatuses = useMemo(
    () => Array.from(new Set(bookings.map(b => b.status))).sort((a, b) => a.localeCompare(b)),
    [bookings]
  )

  const handleFilter = () => {
    setAppliedFilters(filters)
  }

  const handleReset = () => {
    setFilters({ facility: '', date: '', status: '', search: '' })
    setAppliedFilters({ facility: '', date: '', status: '', search: '' })
    setActiveTab('all')
  }

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      // Tab filter
      if (showTabs && activeTab !== 'all') {
        const tabObj = TABS.find(t => t.id === activeTab)
        if (tabObj?.status && b.status !== tabObj.status) {
          if (activeTab === 'rejected' && b.status === 'CANCELLED') {
            // allow cancelled in rejected tab
          } else {
            return false
          }
        }
      }

      // External facility filter
      if (selectedFacilityFilter && b.facilityName !== selectedFacilityFilter) {
        return false
      }

      // Applied facility filter
      if (appliedFilters.facility && b.facilityName !== appliedFilters.facility) {
        return false
      }

      // Applied status filter
      if (appliedFilters.status && b.status !== appliedFilters.status) {
        return false
      }

      // Applied date filter
      if (appliedFilters.date && b.bookingDate !== appliedFilters.date) {
        return false
      }

      // Applied search filter
      if (appliedFilters.search || filters.search) {
        const q = (appliedFilters.search || filters.search).toLowerCase()
        const matchesName = b.citizenName.toLowerCase().includes(q)
        const matchesNic = b.citizenNic.toLowerCase().includes(q)
        const matchesRef = b.refId.toLowerCase().includes(q)
        const matchesTitle = b.eventTitle.toLowerCase().includes(q)
        if (!matchesName && !matchesNic && !matchesRef && !matchesTitle) {
          return false
        }
      }

      return true
    })
  }, [bookings, activeTab, appliedFilters, filters.search, showTabs, selectedFacilityFilter])

  const getStatusStyle = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return 'text-orange-600 border-orange-300 bg-orange-50/50'
      case 'APPROVED':
        return 'text-green-600 border-green-300 bg-green-50/50'
      case 'REJECTED':
      case 'CANCELLED':
        return 'text-red-600 border-red-300 bg-red-50/50'
      case 'COMPLETED':
        return 'text-indigo-600 border-indigo-300 bg-indigo-50/50'
      default:
        return 'text-gray-600 border-gray-300 bg-gray-50/50'
    }
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wider">Paid</span>
      case 'PENDING':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200 uppercase tracking-wider">Unpaid</span>
      case 'REFUNDED':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200 uppercase tracking-wider">Refunded</span>
      default:
        return <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{status}</span>
    }
  }

  const getTabCount = (tabId: string, status: BookingStatus | null) => {
    if (tabId === 'all') return bookings.length
    if (tabId === 'rejected') return bookings.filter(b => b.status === 'REJECTED' || b.status === 'CANCELLED').length
    return bookings.filter(b => b.status === status).length
  }

  const tableColumnCount = 7

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Optional Tabs */}
      {showTabs && (
        <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            const count = getTabCount(tab.id, tab.status)
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-5 sm:px-6 py-4 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#801028] text-[#801028]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                <span className="text-xs font-bold text-gray-400">({count})</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Filters (exact ApplicationTable style) */}
      <div className="p-4 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 border-b border-gray-100">
        {/* Search Input */}
        <div className="relative flex items-center border border-gray-300 rounded-lg bg-white flex-1 min-w-[200px] hover:border-gray-400 focus-within:border-[#801028]">
          <div className="absolute left-3">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search citizen, NIC, ref ID, event..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
            className="w-full text-sm text-gray-700 bg-transparent py-2 pl-9 pr-3 outline-none"
          />
        </div>

        {/* Facility Select */}
        <div className="relative flex items-center border border-gray-300 rounded-lg bg-white flex-1 min-w-[160px] hover:border-gray-400 focus-within:border-[#801028]">
          <select
            value={filters.facility}
            onChange={(e) => setFilters({ ...filters, facility: e.target.value })}
            className="w-full appearance-none outline-none text-sm text-gray-600 bg-transparent py-2 pl-3 pr-8 cursor-pointer"
          >
            <option value="">All Facilities</option>
            {uniqueFacilities.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <div className="absolute right-3 pointer-events-none">
            <ChevronDownIcon />
          </div>
        </div>

        {/* Date Select */}
        <div className="relative flex items-center border border-gray-300 rounded-lg bg-white flex-1 min-w-[150px] hover:border-gray-400 focus-within:border-[#801028]">
          <div className="absolute left-3">
            <CalendarIcon />
          </div>
          <select
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="w-full appearance-none outline-none text-sm text-gray-600 bg-transparent py-2 pl-9 pr-8 cursor-pointer"
          >
            <option value="">All Dates</option>
            {uniqueDates.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <div className="absolute right-3 pointer-events-none">
            <ChevronDownIcon />
          </div>
        </div>

        {/* Status Select */}
        <div className="relative flex items-center border border-gray-300 rounded-lg bg-white flex-1 min-w-[150px] hover:border-gray-400 focus-within:border-[#801028]">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full appearance-none outline-none text-sm text-gray-600 bg-transparent py-2 pl-3 pr-8 cursor-pointer"
          >
            <option value="">All Statuses</option>
            {uniqueStatuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="absolute right-3 pointer-events-none">
            <ChevronDownIcon />
          </div>
        </div>

        {/* Filter & Reset Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleFilter}
            className="bg-white border border-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex-1 sm:flex-initial text-center"
          >
            Filter
          </button>
          {(appliedFilters.facility || appliedFilters.date || appliedFilters.status || appliedFilters.search || filters.search || activeTab !== 'all' || selectedFacilityFilter) && (
            <button
              type="button"
              onClick={handleReset}
              className="text-gray-500 hover:text-[#801028] font-medium px-3 py-2 text-sm transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Desktop Table View (hidden on small screens, shown on md and up) */}
      <div className="hidden md:block overflow-x-auto relative [-webkit-overflow-scrolling:touch] flex-1">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4 px-6">REF ID</th>
              <th className="py-4 px-6">FACILITY & EVENT</th>
              <th className="py-4 px-6">CITIZEN DETAILS</th>
              <th className="py-4 px-6">RESERVED TIME SLOT</th>
              <th className="py-4 px-6">RENTAL FEE</th>
              <th className="py-4 px-6">STATUS</th>
              <th className="py-4 px-6 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredBookings.map((booking) => {
              const isPending = booking.status === 'PENDING'
              return (
                <tr
                  key={booking.id}
                  className="hover:bg-gray-50/60 transition-colors group cursor-pointer"
                  onClick={() => onView(booking)}
                >
                  <td className="py-4 px-6 font-bold text-gray-700 whitespace-nowrap">
                    <div className="font-extrabold text-[#801028]">{booking.refId}</div>
                    <div className="text-xs text-gray-400 font-normal mt-0.5">{booking.submittedDate} ({booking.submittedTime})</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900">{booking.eventTitle}</div>
                    <div className="text-xs font-semibold text-gray-600 mt-0.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#801028]"></span>
                      {booking.facilityName}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{booking.eventType} • ~{booking.expectedAttendees} attendees</div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="font-bold text-gray-900">{booking.citizenName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{booking.citizenPhone || booking.citizenNic}</div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="font-bold text-gray-900">{booking.bookingDate}</div>
                    <div className="text-xs text-gray-500 mt-0.5 font-medium">{booking.timeSlot}</div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="font-bold text-gray-900">Rs. {booking.rentalFee.toLocaleString()}</div>
                    <div className="mt-1">{getPaymentBadge(booking.paymentStatus)}</div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`px-3.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${getStatusStyle(booking.status)}`}>
                      {isPending && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse block"></span>}
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      {isPending && onApprove && onReject && (
                        <>
                          <button
                            type="button"
                            onClick={() => onApprove(booking.id)}
                            title="Quick Approve Booking"
                            className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer shadow-2xs"
                          >
                            <CheckIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject(booking.id)}
                            title="Quick Reject Booking"
                            className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer shadow-2xs"
                          >
                            <XIcon />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => onView(booking)}
                        className="p-2 rounded-lg hover:bg-gray-200 transition-colors group cursor-pointer inline-flex items-center justify-center"
                      >
                        <EyeIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filteredBookings.length === 0 && (
              <tr>
                <td colSpan={tableColumnCount} className="py-8 text-center text-gray-500">
                  No bookings match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dedicated Mobile Card View (shown only on small/medium screens below md) */}
      <div className="block md:hidden divide-y divide-gray-100 flex-1">
        {filteredBookings.length === 0 ? (
          <div className="py-10 px-4 text-center text-gray-500 text-sm">
            No bookings match the selected filters.
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const isPending = booking.status === 'PENDING'
            return (
              <div
                key={booking.id}
                className="p-4 space-y-3 hover:bg-gray-50/40 transition-colors border border-gray-100 rounded-xl my-2"
              >
                {/* Top bar: Ref + Status badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-[#801028] text-xs font-mono">
                    {booking.refId}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${getStatusStyle(booking.status)}`}>
                    {isPending && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse block"></span>}
                    {booking.status}
                  </span>
                </div>

                {/* Event & Facility */}
                <div>
                  <h4 className="font-bold text-gray-900 text-sm leading-snug">
                    {booking.eventTitle}
                  </h4>
                  <div className="text-xs font-semibold text-gray-600 mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#801028] shrink-0"></span>
                    <span className="truncate">{booking.facilityName}</span>
                  </div>
                </div>

                {/* Date/Time + Citizen summary */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200/70 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-gray-800">
                    <span className="font-bold">📅 {booking.bookingDate}</span>
                    <span className="font-extrabold text-gray-900">Rs. {booking.rentalFee.toLocaleString()}</span>
                  </div>
                  <div className="text-gray-500 font-medium truncate">
                    ⏰ {booking.timeSlot}
                  </div>
                  <div className="pt-1.5 border-t border-gray-200 flex items-center justify-between text-gray-600">
                    <span className="truncate font-semibold">👤 {booking.citizenName} ({booking.citizenPhone})</span>
                    {getPaymentBadge(booking.paymentStatus)}
                  </div>
                </div>

                {/* Mobile Action Bar */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-gray-400">
                    Submitted: {booking.submittedDate}
                  </span>
                  <div className="flex items-center gap-2">
                    {isPending && onApprove && onReject && (
                      <>
                        <button
                          type="button"
                          onClick={() => onApprove(booking.id)}
                          className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-bold flex items-center gap-1 shadow-2xs"
                        >
                          <CheckIcon />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(booking.id)}
                          className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-bold flex items-center gap-1 shadow-2xs"
                        >
                          <XIcon />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => onView(booking)}
                      className="px-3 py-1.5 bg-white border border-gray-300 hover:border-[#801028] text-gray-700 rounded-md text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                    >
                      <EyeIcon />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Table Footer */}
      <div className="p-4 bg-gray-50/60 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500">
        <div>
          Showing <span className="font-bold text-gray-800">{filteredBookings.length}</span> of <span className="font-bold text-gray-800">{bookings.length}</span> citizen bookings
        </div>
        <div className="flex items-center gap-4 font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span> Pending Review
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Approved & Reserved
          </span>
        </div>
      </div>
    </div>
  )
}

export default BookingTable
