import React, { useState, useMemo } from 'react'
import type { AssignedOfficer } from '../hooks/useAssignedOfficersData'

interface AssignedOfficersTableProps {
  officers: AssignedOfficer[]
  onView: (officer: AssignedOfficer) => void
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

const TABS = [
  { id: 'all', label: 'All Assigned Officers', status: null },
  { id: 'pending', label: 'Pending', status: 'PENDING' },
  { id: 'approved', label: 'Approved', status: 'APPROVED' },
  { id: 'rejected', label: 'Rejected', status: 'REJECTED' },
  { id: 'completed', label: 'Completed', status: 'COMPLETED' },
  { id: 'noshow', label: 'No-show', status: 'NO-SHOW' },
  { id: 'rescheduled', label: 'Rescheduled', status: 'RESCHEDULED' },
]

const AssignedOfficersTable: React.FC<AssignedOfficersTableProps> = ({ officers, onView }) => {
  const [activeTab, setActiveTab] = useState('all')

  const [filters, setFilters] = useState({ date: '', category: '', status: '', officer: '' })
  const [appliedFilters, setAppliedFilters] = useState({ date: '', category: '', status: '', officer: '' })

  const uniqueCategories = useMemo(() => Array.from(new Set(officers.map(o => o.assignedCategory))).sort(), [officers])
  const uniqueStatuses = useMemo(() => Array.from(new Set(officers.map(o => o.status))).sort(), [officers])
  const uniqueOfficers = useMemo(() => Array.from(new Set(officers.map(o => o.name))).sort(), [officers])

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
      const tabObj = TABS.find(t => t.id === activeTab)
      if (tabObj && tabObj.status && o.status !== tabObj.status) return false
      
      if (appliedFilters.category && o.assignedCategory !== appliedFilters.category) return false
      if (appliedFilters.status && o.status !== appliedFilters.status) return false
      if (appliedFilters.officer && o.name !== appliedFilters.officer) return false
      
      return true
    })
  }, [officers, activeTab, appliedFilters])

  const getTabCount = (tabId: string, status: string | null) => {
    if (tabId === 'all') return 63
    switch (status) {
      case 'PENDING': return 12
      case 'APPROVED': return 28
      case 'REJECTED': return 3
      case 'COMPLETED': return 18
      case 'NO-SHOW': return 2
      case 'RESCHEDULED': return 2
      default: return officers.length
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          const count = getTabCount(tab.id, tab.status)
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-6 py-4 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
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

      {/* Filters */}
      <div className="p-4 flex flex-wrap items-center gap-4 border-b border-gray-100">
        <div className="relative flex items-center border border-gray-300 rounded-lg bg-white flex-1 min-w-[160px] hover:border-gray-400 focus-within:border-[#801028]">
          <div className="absolute left-3">
            <CalendarIcon />
          </div>
          <select 
            value={filters.date} 
            onChange={(e) => setFilters({...filters, date: e.target.value})}
            className="w-full appearance-none outline-none text-sm text-gray-600 bg-transparent py-2 pl-9 pr-8 cursor-pointer"
          >
            <option value="">All Dates</option>
            <option value="2023-06-05">2023-06-05</option>
            <option value="2023-07-02">2023-07-02</option>
            <option value="2023-07-16">2023-07-16</option>
          </select>
          <div className="absolute right-3 pointer-events-none">
            <ChevronDownIcon />
          </div>
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
            {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
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
            {uniqueOfficers.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <div className="absolute right-3 pointer-events-none">
            <ChevronDownIcon />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleFilter}
            className="bg-white border border-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Filter
          </button>
          {(appliedFilters.date || appliedFilters.category || appliedFilters.status || appliedFilters.officer || activeTab !== 'all') && (
            <button 
              onClick={handleReset}
              className="text-gray-500 hover:text-[#801028] font-medium px-2 py-2 text-sm transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4 px-6">ID</th>
              <th className="py-4 px-6">NAME</th>
              <th className="py-4 px-6">ROLE</th>
              <th className="py-4 px-6">ASSIGNED CATEGORY</th>
              <th className="py-4 px-6 text-center">ASSIGNED LETTERS</th>
              <th className="py-4 px-6 text-center">COMPLETED LETTERS</th>
              <th className="py-4 px-6 text-center">REMAINING LETTERS</th>
              <th className="py-4 px-6 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredOfficers.map((officer) => (
              <tr key={officer.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="py-4 px-6 font-bold text-gray-700 whitespace-nowrap">{officer.refId}</td>
                <td className="py-4 px-6 whitespace-nowrap">
                  <div className="font-bold text-gray-900">{officer.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{officer.phone}</div>
                </td>
                <td className="py-4 px-6 font-semibold text-gray-700 whitespace-nowrap">{officer.role}</td>
                <td className="py-4 px-6 font-semibold text-gray-700 whitespace-nowrap">{officer.assignedCategory}</td>
                <td className="py-4 px-6 text-center font-semibold text-gray-700 whitespace-nowrap">{officer.assignedLetters}</td>
                <td className="py-4 px-6 text-center font-semibold text-gray-700 whitespace-nowrap">{officer.completedLetters}</td>
                <td className="py-4 px-6 text-center font-bold text-[#801028] whitespace-nowrap">{officer.remainingLetters}</td>
                <td className="py-4 px-6 text-center whitespace-nowrap">
                  <button 
                    onClick={() => onView(officer)}
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
                  No assigned officers match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
        <span className="text-sm text-gray-500">
          Showing {filteredOfficers.length > 0 ? 1 : 0}-{Math.min(filteredOfficers.length, 8)} of 63 results
        </span>
        <div className="flex items-center gap-1 text-sm font-semibold text-gray-600">
          <button className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50" disabled>&lt;</button>
          <button className="px-3 py-1 rounded bg-[#801028] text-white">1</button>
          <button className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50" disabled>&gt;</button>
        </div>
      </div>

    </div>
  )
}

export default AssignedOfficersTable
