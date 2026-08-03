import React, { useState, useMemo } from 'react'
import type { Officer } from '../hooks/useOfficerData'

interface OfficerTableProps {
  officers: Officer[]
}

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-500 group-hover:text-[#801028]">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-500 shrink-0 pointer-events-none">
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

// The screenshot shows these exact tabs on the Assigned Officers page
const TABS = [
  { id: 'all', label: 'All Assigned Officers', count: 63 },
  { id: 'pending', label: 'Pending', count: 12 },
  { id: 'approved', label: 'Approved', count: 28 },
  { id: 'rejected', label: 'Rejected', count: 3 },
  { id: 'completed', label: 'Completed', count: 18 },
  { id: 'noshow', label: 'No-show', count: 2 },
  { id: 'rescheduled', label: 'Rescheduled', count: 2 },
]

const OfficerTable: React.FC<OfficerTableProps> = ({ officers }) => {
  const [activeTab, setActiveTab] = useState('all')

  const [filters, setFilters] = useState({ date: '', category: '', status: '', officer: '' })
  const [appliedFilters, setAppliedFilters] = useState({ date: '', category: '', status: '', officer: '' })

  const uniqueCategories = useMemo(() => Array.from(new Set(officers.map(o => o.category))).sort((a, b) => a.localeCompare(b)), [officers])
  const uniqueNames = useMemo(() => Array.from(new Set(officers.map(o => o.name))).sort((a, b) => a.localeCompare(b)), [officers])

  const handleFilter = () => {
    setAppliedFilters(filters)
  }

  const handleReset = () => {
    setFilters({ date: '', category: '', status: '', officer: '' })
    setAppliedFilters({ date: '', category: '', status: '', officer: '' })
    setActiveTab('all')
  }

  const filteredOfficers = useMemo(() => {
    return officers.filter(o => {
      // Basic dropdown filtering simulation
      if (appliedFilters.category && o.category !== appliedFilters.category) return false
      if (appliedFilters.officer && o.name !== appliedFilters.officer) return false
      return true
    })
  }, [officers, appliedFilters])

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-6 py-4 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'border-[#801028] text-[#801028]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span className="text-xs font-bold text-gray-400">({tab.count})</span>
            </button>
          )
        })}
      </div>

      {/* Filters (same layout as complains page) */}
      <div className="p-4 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 border-b border-gray-100">
        <div className="flex items-center border border-gray-300 rounded-lg bg-white flex-1 min-w-[160px] hover:border-gray-400 focus-within:border-[#801028] px-3">
          <CalendarIcon />
          <input 
            type="date"
            value={filters.date} 
            onChange={(e) => setFilters({...filters, date: e.target.value})}
            className="w-full outline-none text-sm text-gray-600 bg-transparent py-2 pl-2 cursor-pointer"
            title="Filter by Date"
          />
        </div>

        <div className="relative flex items-center border border-gray-300 rounded-lg bg-white flex-1 min-w-[160px] hover:border-gray-400 focus-within:border-[#801028]">
          <select 
            value={filters.category} 
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="w-full appearance-none outline-none text-sm text-gray-600 bg-transparent py-2 pl-3 pr-8 cursor-pointer"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="absolute right-3 pointer-events-none">
            <ChevronDownIcon />
          </div>
        </div>

        <div className="relative flex items-center border border-gray-300 rounded-lg bg-white flex-1 min-w-[160px] hover:border-gray-400 focus-within:border-[#801028]">
          <select 
            value={filters.status} 
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="w-full appearance-none outline-none text-sm text-gray-600 bg-transparent py-2 pl-3 pr-8 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <div className="absolute right-3 pointer-events-none">
            <ChevronDownIcon />
          </div>
        </div>

        <div className="relative flex items-center border border-gray-300 rounded-lg bg-white flex-1 min-w-[160px] hover:border-gray-400 focus-within:border-[#801028]">
          <select 
            value={filters.officer} 
            onChange={(e) => setFilters({...filters, officer: e.target.value})}
            className="w-full appearance-none outline-none text-sm text-gray-600 bg-transparent py-2 pl-3 pr-8 cursor-pointer"
          >
            <option value="">All Officers</option>
            {uniqueNames.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <div className="absolute right-3 pointer-events-none">
            <ChevronDownIcon />
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            type="button"
            onClick={handleFilter}
            className="bg-white border border-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Filter
          </button>
          {(appliedFilters.date || appliedFilters.category || appliedFilters.status || appliedFilters.officer || activeTab !== 'all') && (
            <button 
              type="button"
              onClick={handleReset}
              className="text-gray-500 hover:text-[#801028] font-medium px-2 py-2 text-sm transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch] flex-1">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4 px-6">ID</th>
              <th className="py-4 px-6">NAME</th>
              <th className="py-4 px-6 text-center">ROLE</th>
              <th className="py-4 px-6 text-center">ASSIGNED<br/>CATEGORY</th>
              <th className="py-4 px-6 text-center">ASSIGNED<br/>COMPLAINTS</th>
              <th className="py-4 px-6 text-center">COMPLETED<br/>COMPLAINTS</th>
              <th className="py-4 px-6 text-center">REMAINING<br/>COMPLAINTS</th>
              <th className="py-4 px-6 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredOfficers.map((officer) => (
              <tr key={officer.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="py-4 px-6 font-bold text-gray-700 whitespace-nowrap">{officer.officerId}</td>
                <td className="py-4 px-6 whitespace-nowrap">
                  <div className="font-bold text-gray-900">{officer.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{officer.phone}</div>
                </td>
                <td className="py-4 px-6 font-semibold text-gray-900 text-center whitespace-nowrap">{officer.role}</td>
                <td className="py-4 px-6 font-bold text-gray-700 text-center whitespace-nowrap">{officer.category}</td>
                <td className="py-4 px-6 font-medium text-gray-600 text-center whitespace-nowrap">{officer.assignedComplaints}</td>
                <td className="py-4 px-6 font-medium text-gray-600 text-center whitespace-nowrap">{officer.completedComplaints}</td>
                <td className="py-4 px-6 font-bold text-[#801028] text-center whitespace-nowrap">{officer.remainingComplaints}</td>
                <td className="py-4 px-6 text-center whitespace-nowrap">
                  <button 
                    type="button"
                    className="p-2 rounded-lg hover:bg-gray-200 transition-colors group cursor-pointer inline-flex items-center justify-center"
                  >
                    <EyeIcon />
                  </button>
                </td>
              </tr>
            ))}
            {filteredOfficers.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">
                  No officers match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-white">
        <span className="text-sm text-gray-500">
          Showing {filteredOfficers.length > 0 ? 1 : 0}-{Math.min(filteredOfficers.length, 8)} of {filteredOfficers.length} results
        </span>
        <div className="flex items-center gap-1 text-sm font-semibold text-gray-600">
          <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50" disabled>&lt;</button>
          <button type="button" className="px-3 py-1 rounded bg-[#801028] text-white">1</button>
          <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50" disabled>&gt;</button>
        </div>
      </div>

    </div>
  )
}

export default OfficerTable

