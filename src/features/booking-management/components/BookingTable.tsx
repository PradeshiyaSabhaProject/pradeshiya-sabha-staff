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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-500 group-hover:text-[#A31736] transition-colors">
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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-gray-400 shrink-0 pointer-events-none">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-gray-400 shrink-0 pointer-events-none">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-gray-400 shrink-0 pointer-events-none">
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

function matchesTab(b: FacilityBooking, activeTab: string, showTabs: boolean): boolean {
  if (!showTabs || activeTab === 'all') return true
  const tabObj = TABS.find(t => t.id === activeTab)
  if (!tabObj?.status) return true
  if (b.status === tabObj.status) return true
  if (activeTab === 'rejected' && b.status === 'CANCELLED') return true
  return false
}

function matchesSearch(b: FacilityBooking, searchQuery: string): boolean {
  if (!searchQuery) return true
  const q = searchQuery.toLowerCase()
  return (
    b.citizenName.toLowerCase().includes(q) ||
    b.citizenNic.toLowerCase().includes(q) ||
    b.refId.toLowerCase().includes(q) ||
    b.eventTitle.toLowerCase().includes(q)
  )
}

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
      if (!matchesTab(b, activeTab, showTabs)) return false
      if (selectedFacilityFilter && b.facilityName !== selectedFacilityFilter) return false
      if (appliedFilters.facility && b.facilityName !== appliedFilters.facility) return false
      if (appliedFilters.status && b.status !== appliedFilters.status) return false
      if (appliedFilters.date && b.bookingDate !== appliedFilters.date) return false
      if (!matchesSearch(b, appliedFilters.search || filters.search)) return false
      return true
    })
  }, [bookings, activeTab, appliedFilters, filters.search, showTabs, selectedFacilityFilter])

  const getStatusStyle = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return 'text-orange-700 border-orange-200 bg-orange-50'
      case 'APPROVED':
        return 'text-emerald-700 border-emerald-200 bg-emerald-50'
      case 'REJECTED':
      case 'CANCELLED':
        return 'text-red-700 border-red-200 bg-red-50'
      case 'COMPLETED':
        return 'text-indigo-700 border-indigo-200 bg-indigo-50'
      default:
        return 'text-gray-700 border-gray-200 bg-gray-50'
    }
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wider">Paid</span>
      case 'PENDING':
        return <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200 uppercase tracking-wider">Unpaid</span>
      case 'REFUNDED':
        return <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200 uppercase tracking-wider">Refunded</span>
      default:
        return <span className="bg-gray-50 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-200 uppercase tracking-wider">{status}</span>
    }
  }

  const getTabCount = (tabId: string, status: BookingStatus | null) => {
    if (tabId === 'all') return bookings.length
    if (tabId === 'rejected') return bookings.filter(b => b.status === 'REJECTED' || b.status === 'CANCELLED').length
    return bookings.filter(b => b.status === status).length
  }

  const tableColumnCount = 7

  return (
    <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
      {/* Optional Tabs */}
      {showTabs && (
        <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar bg-gray-50/50">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            const count = getTabCount(tab.id, tab.status)
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#A31736] text-[#A31736] bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
              >
                {tab.label}
                <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${isActive ? 'bg-[#A31736]/10 text-[#A31736]' : 'text-gray-400 bg-gray-100'}`}>({count})</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Filters */}
      <div className="p-3.5 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 border-b border-gray-200 bg-gray-50/30">
        {/* Search Input */}
        <div className="relative flex items-center border border-gray-300 rounded bg-white flex-1 min-w-[180px] h-9 hover:border-gray-400 focus-within:border-[#A31736]">
          <div className="absolute left-2.5">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search citizen, NIC, ref ID..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
            className="w-full text-xs font-medium text-gray-700 bg-transparent py-1.5 pl-8 pr-3 outline-none"
          />
        </div>

        {/* Facility Select */}
        <div className="relative flex items-center border border-gray-300 rounded bg-white flex-1 min-w-[150px] h-9 hover:border-gray-400 focus-within:border-[#A31736]">
          <select
            value={filters.facility}
            onChange={(e) => setFilters({ ...filters, facility: e.target.value })}
            className="w-full appearance-none outline-none text-xs font-medium text-gray-700 bg-transparent py-1.5 pl-3 pr-7 cursor-pointer"
          >
            <option value="">All Facilities</option>
            {uniqueFacilities.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <div className="absolute right-2.5 pointer-events-none">
            <ChevronDownIcon />
          </div>
        </div>

        {/* Date Select */}
        <div className="relative flex items-center border border-gray-300 rounded bg-white flex-1 min-w-[140px] h-9 hover:border-gray-400 focus-within:border-[#A31736]">
          <div className="absolute left-2.5">
            <CalendarIcon />
          </div>
          <select
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="w-full appearance-none outline-none text-xs font-medium text-gray-700 bg-transparent py-1.5 pl-8 pr-7 cursor-pointer"
          >
            <option value="">All Dates</option>
            {uniqueDates.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <div className="absolute right-2.5 pointer-events-none">
            <ChevronDownIcon />
          </div>
        </div>

        {/* Status Select */}
        <div className="relative flex items-center border border-gray-300 rounded bg-white flex-1 min-w-[140px] h-9 hover:border-gray-400 focus-within:border-[#A31736]">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full appearance-none outline-none text-xs font-medium text-gray-700 bg-transparent py-1.5 pl-3 pr-7 cursor-pointer"
          >
            <option value="">All Statuses</option>
            {uniqueStatuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="absolute right-2.5 pointer-events-none">
            <ChevronDownIcon />
          </div>
        </div>

        {/* Filter & Reset Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFilter}
            className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold px-5 h-9 rounded uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
          >
            Filter
          </button>
          {(appliedFilters.facility || appliedFilters.date || appliedFilters.status || appliedFilters.search || filters.search || activeTab !== 'all' || selectedFacilityFilter) && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-bold text-gray-500 hover:text-[#A31736] px-2 h-9 uppercase tracking-wider transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto relative [-webkit-overflow-scrolling:touch] flex-1">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-gray-100 border-y border-gray-300 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
              <th className="py-3 px-4">REF ID</th>
              <th className="py-3 px-4">FACILITY & EVENT</th>
              <th className="py-3 px-4">CITIZEN DETAILS</th>
              <th className="py-3 px-4">RESERVED TIME SLOT</th>
              <th className="py-3 px-4">RENTAL FEE</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-xs">
            {filteredBookings.map((booking) => {
              const isPending = booking.status === 'PENDING'
              return (
                <tr
                  key={booking.id}
                  className="hover:bg-gray-50/60 transition-colors group cursor-pointer"
                  onClick={() => onView(booking)}
                >
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-bold text-gray-900">{booking.refId}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{booking.submittedDate} ({booking.submittedTime})</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gray-900">{booking.eventTitle}</div>
                    <div className="text-[11px] font-semibold text-gray-600 mt-0.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#A31736]"></span>
                      {booking.facilityName}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{booking.eventType} • ~{booking.expectedAttendees} attendees</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-bold text-gray-900">{booking.citizenName}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{booking.citizenPhone || booking.citizenNic}</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">{booking.bookingDate}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{booking.timeSlot}</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-bold text-gray-900">Rs. {booking.rentalFee.toLocaleString()}</div>
                    <div className="mt-0.5">{getPaymentBadge(booking.paymentStatus)}</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${getStatusStyle(booking.status)}`}>
                      {isPending && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse block"></span>}
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      {isPending && onApprove && onReject && (
                        <>
                          <button
                            type="button"
                            onClick={() => onApprove(booking.id)}
                            title="Quick Approve Booking"
                            className="p-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded transition-colors cursor-pointer shadow-2xs"
                          >
                            <CheckIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject(booking.id)}
                            title="Quick Reject Booking"
                            className="p-1.5 bg-[#A31736] hover:bg-[#801028] text-white rounded transition-colors cursor-pointer shadow-2xs"
                          >
                            <XIcon />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => onView(booking)}
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors group cursor-pointer inline-flex items-center justify-center border border-gray-200"
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
                <td colSpan={tableColumnCount} className="py-8 text-center text-gray-500 text-xs">
                  No bookings match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dedicated Mobile Card View */}
      <div className="block md:hidden divide-y divide-gray-100 flex-1">
        {filteredBookings.length === 0 ? (
          <div className="py-8 px-4 text-center text-gray-500 text-xs">
            No bookings match the selected filters.
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const isPending = booking.status === 'PENDING'
            return (
              <div
                key={booking.id}
                className="p-3.5 space-y-2.5 hover:bg-gray-50/40 transition-colors border-b border-gray-200"
              >
                {/* Top bar: Ref + Status badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#A31736] text-xs font-mono">
                    {booking.refId}
                  </span>
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${getStatusStyle(booking.status)}`}>
                    {isPending && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse block"></span>}
                    {booking.status}
                  </span>
                </div>

                {/* Event & Facility */}
                <div>
                  <h4 className="font-bold text-gray-900 text-sm leading-snug">
                    {booking.eventTitle}
                  </h4>
                  <div className="text-xs font-semibold text-gray-600 mt-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A31736] shrink-0"></span>
                    <span className="truncate">{booking.facilityName}</span>
                  </div>
                </div>

                {/* Date/Time + Citizen summary */}
                <div className="bg-gray-50 rounded p-2.5 border border-gray-200 text-xs space-y-1">
                  <div className="flex items-center justify-between text-gray-800">
                    <span className="font-bold">📅 {booking.bookingDate}</span>
                    <span className="font-bold text-gray-900">Rs. {booking.rentalFee.toLocaleString()}</span>
                  </div>
                  <div className="text-gray-500 font-medium truncate">
                    ⏰ {booking.timeSlot}
                  </div>
                  <div className="pt-1 border-t border-gray-200 flex items-center justify-between text-gray-600">
                    <span className="truncate font-semibold">👤 {booking.citizenName} ({booking.citizenPhone})</span>
                    {getPaymentBadge(booking.paymentStatus)}
                  </div>
                </div>

                {/* Mobile Action Bar */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-gray-400">
                    Submitted: {booking.submittedDate}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isPending && onApprove && onReject && (
                      <>
                        <button
                          type="button"
                          onClick={() => onApprove(booking.id)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold flex items-center gap-1 shadow-2xs uppercase tracking-wider"
                        >
                          <CheckIcon />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(booking.id)}
                          className="px-2.5 py-1 bg-[#A31736] hover:bg-[#801028] text-white rounded text-xs font-bold flex items-center gap-1 shadow-2xs uppercase tracking-wider"
                        >
                          <XIcon />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => onView(booking)}
                      className="px-2.5 py-1 bg-white border border-gray-300 hover:border-[#A31736] text-gray-700 rounded text-xs font-bold flex items-center gap-1 shadow-2xs uppercase tracking-wider"
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
      <div className="p-3.5 bg-gray-50/60 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500">
        <div>
          Showing <span className="font-bold text-gray-800">{filteredBookings.length}</span> of <span className="font-bold text-gray-800">{bookings.length}</span> citizen bookings
        </div>
        <div className="flex items-center gap-4 font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span> Pending Review
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Approved &amp; Reserved
          </span>
        </div>
      </div>
    </div>
  )
}

export default BookingTable
