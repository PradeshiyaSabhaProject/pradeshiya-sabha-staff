import React from 'react'
import type { Zone, Ward, Road, VaripanamFilterState } from '../../types/varipanam'

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

  const statuses = ['All', 'Paid', 'Due soon', 'Overdue', 'Warrant issued'] as const

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3">
      {/* Top Row: Search input + Status Pills + Add Property Trigger */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search assessment # (78/12a), owner, NIC, mobile..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#A31736] focus:bg-white transition-colors"
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
              className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {statuses.map((st) => {
            const active = filters.status === st
            let activeClass = 'bg-gray-900 text-white shadow-xs'
            if (st === 'Paid' && active) activeClass = 'bg-emerald-600 text-white'
            if (st === 'Due soon' && active) activeClass = 'bg-amber-600 text-white'
            if (st === 'Overdue' && active) activeClass = 'bg-rose-600 text-white'
            if (st === 'Warrant issued' && active) activeClass = 'bg-purple-700 text-white'

            return (
              <button
                key={st}
                type="button"
                onClick={() => onFilterChange({ status: st })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  active ? activeClass : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {st}
              </button>
            )
          })}
        </div>

        {/* Add Property Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddPropertyClick}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isPickMode
                ? 'bg-amber-500 text-slate-900 ring-2 ring-amber-300 animate-pulse'
                : 'bg-[#A31736] text-white hover:bg-[#801028]'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{isPickMode ? 'Pin Drop Mode Active' : '+ Add Property by Location'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Cascading Row: Zone > Ward > Road > Period */}
      <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2.5 text-xs">
        {/* Zone Filter */}
        <div className="flex items-center gap-1">
          <span className="font-bold text-gray-500 text-[10px] uppercase">Zone:</span>
          <select
            value={filters.zoneId}
            onChange={(e) => {
              const newZoneId = e.target.value
              onFilterChange({
                zoneId: newZoneId,
                wardId: '', // Reset cascading ward
                roadId: '', // Reset cascading road
              })
            }}
            className="px-2.5 py-1 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A31736]"
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
        <div className="flex items-center gap-1">
          <span className="font-bold text-gray-500 text-[10px] uppercase">Ward:</span>
          <select
            value={filters.wardId}
            onChange={(e) => onFilterChange({ wardId: e.target.value })}
            className="px-2.5 py-1 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A31736]"
          >
            <option value="">All Wards</option>
            {visibleWards.map((w) => (
              <option key={w.id} value={w.id}>
                Ward {w.number}: {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Road Filter (zooms map to road properties) */}
        <div className="flex items-center gap-1">
          <span className="font-bold text-gray-500 text-[10px] uppercase">Road:</span>
          <select
            value={filters.roadId}
            onChange={(e) => onFilterChange({ roadId: e.target.value })}
            className="px-2.5 py-1 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A31736] max-w-[220px]"
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
        <div className="flex items-center gap-1">
          <span className="font-bold text-gray-500 text-[10px] uppercase">Period:</span>
          <select
            value={filters.periodQuarter}
            onChange={(e) => onFilterChange({ periodQuarter: parseInt(e.target.value) || 0 })}
            className="px-2.5 py-1 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A31736]"
          >
            <option value="0">2026 (All Quarters)</option>
            <option value="1">2026 Q1 (Jan - Mar)</option>
            <option value="2">2026 Q2 (Apr - Jun)</option>
            <option value="3">2026 Q3 (Jul - Sep)</option>
            <option value="4">2026 Q4 (Oct - Dec)</option>
          </select>
        </div>

        {/* Filter Count & Reset */}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[11px] text-gray-500">
            Showing <strong className="text-gray-900">{totalFilteredCount}</strong> assessment units
          </span>
          {(filters.zoneId || filters.wardId || filters.roadId || filters.status !== 'All' || filters.searchQuery) && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-800 transition-colors"
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
