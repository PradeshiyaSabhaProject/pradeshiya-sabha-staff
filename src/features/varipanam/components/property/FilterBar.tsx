import React from 'react'
import type { Zone, Ward, Road, VaripanamFilterState } from '../../types/varipanam'
import { Plus } from 'lucide-react'

interface FilterBarProps {
  zones: Zone[]
  wards: Ward[]
  roads: Road[]
  filters: VaripanamFilterState
  onFilterChange: (newFilters: Partial<VaripanamFilterState>) => void
  onResetFilters: () => void
  onAddPropertyClick: () => void
  isPickMode: boolean
  totalFilteredCount: number
}

export const FilterBar: React.FC<FilterBarProps> = ({
  zones,
  wards,
  roads,
  filters,
  onFilterChange,
  onResetFilters,
  onAddPropertyClick,
  isPickMode,
  totalFilteredCount,
}) => {
  // Cascading lists based on selected zone
  const visibleWards = filters.zoneId ? wards.filter((w) => w.zoneId === filters.zoneId) : wards
  const visibleRoads = filters.zoneId ? roads.filter((r) => r.zoneId === filters.zoneId) : roads

  const statuses = [
    { key: 'All', label: 'ALL' },
    { key: 'Paid', label: 'PAID' },
    { key: 'Due soon', label: 'DUE SOON' },
    { key: 'Overdue', label: 'OVERDUE' },
    { key: 'Warrant issued', label: 'WARRANT ISSUED' },
  ] as const

  return (
    <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-xs space-y-3">
      {/* Top Row: Search input + Add Property Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search by assessment # (78/12a), owner, NIC, mobile..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736] text-gray-800 placeholder-gray-400 font-medium transition-colors"
          />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-4 h-4 text-gray-400 absolute left-3 top-2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Add Property Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onAddPropertyClick}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer ${
              isPickMode
                ? 'bg-amber-500 text-slate-900 ring-2 ring-amber-300 animate-pulse'
                : 'bg-[#A31736] hover:bg-[#801028] text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{isPickMode ? 'Pin Drop Mode Active' : 'Add Property by Location'}</span>
          </button>
        </div>
      </div>

      {/* Cascading Filter Row: Zone > Ward > Road > Period + Status Button Tabs + Showing Count */}
      <div className="pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left / Middle Group: Cascading Selects + Status Button Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Zone Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-600 text-[10px] uppercase tracking-wider">Zone:</span>
            <select
              value={filters.zoneId}
              onChange={(e) => {
                const newZoneId = e.target.value
                onFilterChange({
                  zoneId: newZoneId,
                  wardId: '',
                  roadId: '',
                })
              }}
              className="px-2.5 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#A31736]"
            >
              <option value="">All Zones</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.code})
                </option>
              ))}
            </select>
          </div>

          {/* Ward Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-600 text-[10px] uppercase tracking-wider">Ward:</span>
            <select
              value={filters.wardId}
              onChange={(e) => onFilterChange({ wardId: e.target.value })}
              className="px-2.5 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#A31736]"
            >
              <option value="">All Wards</option>
              {visibleWards.map((w) => (
                <option key={w.id} value={w.id}>
                  Ward {w.number}: {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Road Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-600 text-[10px] uppercase tracking-wider">Road:</span>
            <select
              value={filters.roadId}
              onChange={(e) => onFilterChange({ roadId: e.target.value })}
              className="px-2.5 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#A31736] max-w-[200px]"
            >
              <option value="">All Roads</option>
              {visibleRoads.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Period Quarter Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-600 text-[10px] uppercase tracking-wider">Period:</span>
            <select
              value={filters.periodQuarter}
              onChange={(e) => onFilterChange({ periodQuarter: parseInt(e.target.value) || 0 })}
              className="px-2.5 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#A31736]"
            >
              <option value="0">2026 (All Quarters)</option>
              <option value="1">2026 Q1 (Jan - Mar)</option>
              <option value="2">2026 Q2 (Apr - Jun)</option>
              <option value="3">2026 Q3 (Jul - Sep)</option>
              <option value="4">2026 Q4 (Oct - Dec)</option>
            </select>
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-gray-300 hidden sm:block" />

          {/* Status Button Tabs (Municipal Style) */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {statuses.map((st) => {
              const active = filters.status === st.key

              return (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => onFilterChange({ status: st.key as VaripanamFilterState['status'] })}
                  className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#A31736] text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {st.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Side: Count & Reset */}
        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
            Showing <strong className="text-gray-900 font-bold">{totalFilteredCount}</strong> assessment units
          </span>
          {(filters.zoneId || filters.wardId || filters.roadId || filters.status !== 'All' || filters.searchQuery || filters.periodQuarter !== 0) && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-bold uppercase tracking-wider text-[#A31736] hover:underline transition-colors cursor-pointer whitespace-nowrap"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default FilterBar
