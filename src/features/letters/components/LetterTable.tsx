import React, { useState, useMemo } from 'react'
import type { Letter } from '../hooks/useLetterData'

interface LetterTableProps {
  letters: Letter[]
  onView: (letter: Letter) => void
  showTabs?: boolean
  showOfficer?: boolean
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
  { id: 'all', label: 'All Letters', status: null },
  { id: 'pending', label: 'Pending', status: 'PENDING' },
  { id: 'approved', label: 'Approved', status: 'APPROVED' },
  { id: 'rejected', label: 'Rejected', status: 'REJECTED' },
  { id: 'completed', label: 'Completed', status: 'COMPLETED' },
  { id: 'noshow', label: 'No-show', status: 'NO-SHOW' },
  { id: 'rescheduled', label: 'Rescheduled', status: 'RESCHEDULED' },
]

const LetterTable: React.FC<LetterTableProps> = ({ letters, onView, showTabs = false, showOfficer = false }) => {
  const [activeTab, setActiveTab] = useState('all')

  const [filters, setFilters] = useState({ date: '', category: '', status: '', officer: '' })
  const [appliedFilters, setAppliedFilters] = useState({ date: '', category: '', status: '', officer: '' })

  const uniqueDates = useMemo(() => Array.from(new Set(letters.map(l => l.date))).sort((a, b) => a.localeCompare(b)), [letters])
  const uniqueCategories = useMemo(() => Array.from(new Set(letters.map(l => l.category))).sort((a, b) => a.localeCompare(b)), [letters])
  const uniqueStatuses = useMemo(() => Array.from(new Set(letters.map(l => l.status))).sort((a, b) => a.localeCompare(b)), [letters])
  const uniqueOfficers = useMemo(() => Array.from(new Set(letters.map(l => l.assignedOfficer))).sort((a, b) => a.localeCompare(b)), [letters])

  const handleFilter = () => {
    setAppliedFilters(filters)
  }

  const handleReset = () => {
    setFilters({ date: '', category: '', status: '', officer: '' })
    setAppliedFilters({ date: '', category: '', status: '', officer: '' })
    setActiveTab('all')
  }

  const filteredLetters = useMemo(() => {
    return letters.filter(l => {
      if (showTabs) {
        const tabObj = TABS.find(t => t.id === activeTab)
        if (tabObj?.status && l.status !== tabObj.status) return false
      }
      
      if (appliedFilters.date && l.date !== appliedFilters.date) return false
      if (appliedFilters.category && l.category !== appliedFilters.category) return false
      if (appliedFilters.status && l.status !== appliedFilters.status) return false
      if (showOfficer && appliedFilters.officer && l.assignedOfficer !== appliedFilters.officer) return false
      
      return true
    })
  }, [letters, activeTab, appliedFilters, showTabs, showOfficer])

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-50 text-amber-800 border-amber-200'
      case 'APPROVED': return 'bg-blue-50 text-blue-800 border-blue-200'
      case 'REJECTED': return 'bg-red-50 text-red-800 border-red-200'
      case 'COMPLETED': return 'bg-green-50 text-green-800 border-green-200'
      case 'RESCHEDULED': return 'bg-indigo-50 text-indigo-800 border-indigo-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getTabCount = (tabId: string, status: string | null) => {
    if (tabId === 'all') return letters.length
    return letters.filter(l => l.status === status).length
  }

  return (
    <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
      
      {/* Optional Tabs */}
      {showTabs && (
        <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar bg-gray-50/30">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            const count = getTabCount(tab.id, tab.status)
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-5 py-3.5 text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'border-[#A31736] text-[#A31736] bg-white' 
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${isActive ? 'bg-red-50 text-[#A31736]' : 'text-gray-400'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Filters */}
      <div className="p-3 sm:p-4 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 border-b border-gray-200 bg-gray-50/40">
        <div className="relative flex items-center border border-gray-300 rounded bg-white w-full sm:w-auto sm:flex-1 min-w-[140px] focus-within:border-[#A31736] h-9">
          <div className="absolute left-3">
            <CalendarIcon />
          </div>
          <select 
            value={filters.date} 
            onChange={(e) => setFilters({...filters, date: e.target.value})}
            className="w-full appearance-none outline-none text-xs font-medium text-gray-700 bg-transparent py-2 pl-9 pr-8 cursor-pointer"
          >
            <option value="">All Dates</option>
            {uniqueDates.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="absolute right-3 pointer-events-none">
            <ChevronDownIcon />
          </div>
        </div>

        <div className="relative flex items-center border border-gray-300 rounded bg-white w-full sm:w-auto sm:flex-1 min-w-[140px] focus-within:border-[#A31736] h-9">
          <select 
            value={filters.category} 
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="w-full appearance-none outline-none text-xs font-medium text-gray-700 bg-transparent py-2 pl-3 pr-8 cursor-pointer"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="absolute right-3 pointer-events-none">
            <ChevronDownIcon />
          </div>
        </div>

        <div className="relative flex items-center border border-gray-300 rounded bg-white w-full sm:w-auto sm:flex-1 min-w-[140px] focus-within:border-[#A31736] h-9">
          <select 
            value={filters.status} 
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="w-full appearance-none outline-none text-xs font-medium text-gray-700 bg-transparent py-2 pl-3 pr-8 cursor-pointer"
          >
            <option value="">All Statuses</option>
            {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="absolute right-3 pointer-events-none">
            <ChevronDownIcon />
          </div>
        </div>

        {showOfficer && (
          <div className="relative flex items-center border border-gray-300 rounded bg-white w-full sm:w-auto sm:flex-1 min-w-[140px] focus-within:border-[#A31736] h-9">
            <select 
              value={filters.officer} 
              onChange={(e) => setFilters({...filters, officer: e.target.value})}
              className="w-full appearance-none outline-none text-xs font-medium text-gray-700 bg-transparent py-2 pl-3 pr-8 cursor-pointer"
            >
              <option value="">All Officers</option>
              {uniqueOfficers.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <div className="absolute right-3 pointer-events-none">
              <ChevronDownIcon />
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button 
            type="button"
            onClick={handleFilter}
            className="bg-[#A31736] text-white text-xs font-bold uppercase tracking-wider px-5 h-9 rounded hover:bg-[#801028] transition-colors cursor-pointer shadow-sm flex items-center justify-center"
          >
            Filter
          </button>
          {(appliedFilters.date || appliedFilters.category || appliedFilters.status || appliedFilters.officer || activeTab !== 'all') && (
            <button 
              type="button"
              onClick={handleReset}
              className="text-xs font-bold text-gray-600 hover:text-[#A31736] px-3 h-9 rounded hover:bg-gray-100 transition-colors cursor-pointer uppercase tracking-wider"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch] flex-1">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="bg-gray-100 border-y border-gray-300 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
              <th className="py-3 px-6">LETTER ID</th>
              <th className="py-3 px-6">CITIZEN NAME</th>
              <th className="py-3 px-6">CATEGORY</th>
              <th className="py-3 px-6">DATE & TIME</th>
              {showOfficer && <th className="py-3 px-6">ASSIGNED OFFICER</th>}
              <th className="py-3 px-6">STATUS</th>
              <th className="py-3 px-6 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {filteredLetters.map((letter) => (
              <tr key={letter.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="py-3.5 px-6 font-bold text-gray-800 whitespace-nowrap font-mono">{letter.refId}</td>
                <td className="py-3.5 px-6 whitespace-nowrap">
                  <div className="font-bold text-gray-900">{letter.citizenName}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{letter.citizenPhone}</div>
                </td>
                <td className="py-3.5 px-6 font-semibold text-gray-700 whitespace-nowrap">{letter.category}</td>
                <td className="py-3.5 px-6 whitespace-nowrap">
                  <div className="font-semibold text-gray-800 text-xs">{letter.date}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{letter.time}</div>
                </td>
                {showOfficer && <td className="py-3.5 px-6 font-semibold text-gray-700 whitespace-nowrap">{letter.assignedOfficer}</td>}
                <td className="py-3.5 px-6 whitespace-nowrap">
                  <span className={`px-2.5 py-0.5 rounded border text-[11px] font-bold uppercase tracking-wide inline-block ${getStatusStyle(letter.status)}`}>
                    {letter.status}
                  </span>
                </td>
                <td className="py-3.5 px-6 text-center whitespace-nowrap">
                  <button 
                    type="button"
                    onClick={() => onView(letter)}
                    className="p-1.5 rounded hover:bg-gray-200 text-gray-600 hover:text-[#A31736] transition-colors group cursor-pointer inline-flex items-center justify-center"
                    title="View Letter Details"
                  >
                    <EyeIcon />
                  </button>
                </td>
              </tr>
            ))}
            {filteredLetters.length === 0 && (
              <tr>
                <td colSpan={showOfficer ? 7 : 6} className="py-12 text-center text-gray-500 font-medium">
                  No letters match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3.5 border-t border-gray-200 bg-gray-50/50">
        <span className="text-xs text-gray-500 font-medium">
          Showing {filteredLetters.length > 0 ? 1 : 0}-{Math.min(filteredLetters.length, 8)} of {filteredLetters.length} results
        </span>
        <div className="flex items-center gap-1 text-xs font-semibold text-gray-600">
          <button type="button" className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40" disabled>&lt;</button>
          <button type="button" className="px-3 py-1 rounded bg-[#A31736] text-white font-bold">1</button>
          <button type="button" className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40" disabled>&gt;</button>
        </div>
      </div>

    </div>
  )
}

export default LetterTable


