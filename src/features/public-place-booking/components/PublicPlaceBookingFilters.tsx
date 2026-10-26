import React from 'react'
import { Search } from 'lucide-react'

export type PublicPlaceBookingStatusFilter = 'All' | 'PENDING' | 'APPROVED' | 'COMPLETED'
export type PublicPlacePaymentFilter = 'All' | 'pending' | 'balance-due' | 'complete'

export interface PublicPlaceBookingFilterState {
  search: string
  status: PublicPlaceBookingStatusFilter
  facility: string
  date: string
  payment: PublicPlacePaymentFilter
}

interface PublicPlaceBookingFiltersProps {
  facilities: string[]
  dates: string[]
  filters: PublicPlaceBookingFilterState
  onFilterChange: (filters: Partial<PublicPlaceBookingFilterState>) => void
  onResetFilters: () => void
  totalFilteredCount: number
}

const statuses: { value: PublicPlaceBookingStatusFilter; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'COMPLETED', label: 'Completed' },
]

const PublicPlaceBookingFilters: React.FC<PublicPlaceBookingFiltersProps> = ({
  facilities,
  dates,
  filters,
  onFilterChange,
  onResetFilters,
  totalFilteredCount,
}) => {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== 'All' ||
    filters.facility !== '' ||
    filters.date !== '' ||
    filters.payment !== 'All'

  return (
    <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
      <div className="flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center">
        <label className="relative flex-1 lg:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onFilterChange({ search: event.target.value })}
            placeholder="Search reference, citizen, NIC, facility, event..."
            aria-label="Search public place bookings"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 py-2 pl-9 pr-3 text-xs transition-colors focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#A31736]"
          />
        </label>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
          {statuses.map((status) => {
            const active = filters.status === status.value
            return (
              <button
                key={status.value}
                type="button"
                aria-pressed={active}
                onClick={() => onFilterChange({ status: status.value })}
                className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  active ? 'bg-gray-900 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 border-t border-gray-100 pt-3 text-xs">
        <label className="flex items-center gap-1">
          <span className="text-[10px] font-bold uppercase text-gray-500">Facility:</span>
          <select
            value={filters.facility}
            onChange={(event) => onFilterChange({ facility: event.target.value })}
            className="max-w-[220px] rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#A31736]"
          >
            <option value="">All Facilities</option>
            {facilities.map((facility) => <option key={facility} value={facility}>{facility}</option>)}
          </select>
        </label>

        <label className="flex items-center gap-1">
          <span className="text-[10px] font-bold uppercase text-gray-500">Event date:</span>
          <select
            value={filters.date}
            onChange={(event) => onFilterChange({ date: event.target.value })}
            className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#A31736]"
          >
            <option value="">All Dates</option>
            {dates.map((date) => <option key={date} value={date}>{date}</option>)}
          </select>
        </label>

        <label className="flex items-center gap-1">
          <span className="text-[10px] font-bold uppercase text-gray-500">Payment:</span>
          <select
            value={filters.payment}
            onChange={(event) => onFilterChange({ payment: event.target.value as PublicPlacePaymentFilter })}
            className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#A31736]"
          >
            <option value="All">All Payments</option>
            <option value="pending">Payment pending</option>
            <option value="balance-due">Balance due</option>
            <option value="complete">Payment complete</option>
          </select>
        </label>

        <div className="ml-auto flex items-center gap-3">
          <span className="whitespace-nowrap text-[11px] text-gray-500">
            Showing <strong className="text-gray-900">{totalFilteredCount}</strong> bookings
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="whitespace-nowrap text-[11px] font-bold text-rose-600 transition-colors hover:text-rose-800"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PublicPlaceBookingFilters
