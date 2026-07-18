import React, { useState, useMemo } from 'react'
import type { Complaint } from '../hooks/useComplainData'
import { getDeadlineStatus, getDeadlineStatusStyleClasses, isComplaintAssignedToCurrentTO } from '../utils/deadlineUtils'
import { useAuth } from '../../../context/AuthContext'

interface ComplainTableProps {
  complaints: Complaint[]
  onView: (complaint: Complaint) => void
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
  { id: 'all', label: 'All Complaints', status: null },
  { id: 'pending', label: 'Pending', status: 'PENDING' },
  { id: 'reviewing', label: 'Reviewing', status: 'REVIEWING' },
  { id: 'inprogress', label: 'In Progress', status: 'IN PROGRESS' },
  { id: 'approved', label: 'Approved', status: 'APPROVED' },
  { id: 'rejected', label: 'Rejected', status: 'REJECTED' },
  { id: 'completed', label: 'Completed', status: 'COMPLETED' },
  { id: 'noshow', label: 'No-show', status: 'NO-SHOW' },
  { id: 'rescheduled', label: 'Rescheduled', status: 'RESCHEDULED' },
]

const ComplainTable: React.FC<ComplainTableProps> = ({ complaints, onView, showTabs = true, showOfficer = true }) => {
  const [activeTab, setActiveTab] = useState('all')

  const [filters, setFilters] = useState({ date: '', category: '', status: '', officer: '' })
  const [appliedFilters, setAppliedFilters] = useState({ date: '', category: '', status: '', officer: '' })

  const uniqueCategories = useMemo(() => Array.from(new Set(complaints.map(c => c.category))).sort(), [complaints])
  const uniqueStatuses = useMemo(() => Array.from(new Set(complaints.map(c => c.status))).sort(), [complaints])
  const uniqueOfficers = useMemo(() => Array.from(new Set(complaints.map(c => c.assignedOfficer))).sort(), [complaints])

  const handleFilter = () => {
    setAppliedFilters(filters)
  }

  const handleReset = () => {
    setFilters({ date: '', category: '', status: '', officer: '' })
    setAppliedFilters({ date: '', category: '', status: '', officer: '' })
    setActiveTab('all')
  }

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      // Tab filter
      const tabObj = TABS.find(t => t.id === activeTab)
      if (tabObj && tabObj.status && c.status !== tabObj.status) return false
      
      // Dropdown filters
      if (appliedFilters.date && c.date !== appliedFilters.date) return false
      if (appliedFilters.category && c.category !== appliedFilters.category) return false
      if (appliedFilters.status && c.status !== appliedFilters.status) return false
      if (appliedFilters.officer && c.assignedOfficer !== appliedFilters.officer) return false
      
      return true
    })
  }, [complaints, activeTab, appliedFilters])

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-orange-600 border-orange-300'
      case 'REVIEWING': return 'text-amber-600 border-amber-300'
      case 'IN PROGRESS': return 'text-indigo-600 border-indigo-300'
      case 'APPROVED': return 'text-green-600 border-green-300'
      case 'REJECTED': return 'text-red-600 border-red-300'
      case 'COMPLETED': return 'text-purple-600 border-purple-300'
      case 'RESCHEDULED': return 'text-blue-600 border-blue-300'
      default: return 'text-gray-600 border-gray-300'
    }
  }

  // Count complaints per tab ignoring dropdown filters (or including them if you prefer)
  const getTabCount = (tabId: string, status: string | null) => {
    if (tabId === 'all') return complaints.length
    return complaints.filter(c => c.status === status).length
  }

  const { user } = useAuth()
  const currentTOName = user?.name ?? ''
  // Always show deadline columns across all tabs
  const showDeadline = true

  const tableColumnCount = 6 + (showOfficer ? 1 : 0) + (showDeadline ? 2 : 0)

  const computeDeadlineFromReceivedDate = (receivedDate: string) => {
    const parsed = new Date(receivedDate)
    if (Number.isNaN(parsed.getTime())) return ''
    parsed.setDate(parsed.getDate() + 7)
    return parsed.toISOString().slice(0, 10)
  }

  const formatDeadline = (dueDate?: string) => {
    if (!dueDate) return '—'
    return dueDate
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      
      {/* Tabs */}
      {showTabs && (
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
      )}

      {/* Filters */}
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
            {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="absolute right-3 pointer-events-none">
            <ChevronDownIcon />
          </div>
        </div>

        {showOfficer && (
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
        )}
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
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
      <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch] flex-1">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4 px-6">ID</th>
              <th className="py-4 px-6">CITIZEN NAME</th>
              <th className="py-4 px-6">CATEGORY</th>
              <th className="py-4 px-6">RECEIVED DATE</th>
              {showDeadline && (
                <>
                  <th className="py-4 px-6">DEADLINE</th>
                  <th className="py-4 px-6">DEADLINE STATUS</th>
                </>
              )}
              {showOfficer && <th className="py-4 px-6">ASSIGNED OFFICER</th>}
              <th className="py-4 px-6">STATUS</th>
              <th className="py-4 px-6 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredComplaints.map((complaint) => {
              const isAssignedToCurrentTO = isComplaintAssignedToCurrentTO(complaint, currentTOName)
              const computedDueDate = complaint.dueDate || computeDeadlineFromReceivedDate(complaint.date)
              const deadlineStatus = getDeadlineStatus({ status: complaint.status, dueDate: computedDueDate }, isAssignedToCurrentTO)

              return (
                <tr key={complaint.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-4 px-6 font-bold text-gray-700 whitespace-nowrap">{complaint.refId}</td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="font-bold text-gray-900">{complaint.citizenName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{complaint.citizenPhone}</div>
                  </td>
                  <td className="py-4 px-6 font-semibold text-gray-700 whitespace-nowrap">{complaint.category}</td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="font-bold text-gray-900">{complaint.date}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{complaint.time}</div>
                  </td>
                  {showDeadline && (
                    <>
                      <td className="py-4 px-6 whitespace-nowrap font-semibold text-gray-700">{formatDeadline(computedDueDate)}</td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {deadlineStatus ? (
                          <span className={`px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs ${getDeadlineStatusStyleClasses(computedDueDate)}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white block"></span>
                            {deadlineStatus}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">—</span>
                        )}
                      </td>
                    </>
                  )}
                  {showOfficer && <td className="py-4 px-6 font-semibold text-gray-700 whitespace-nowrap">{complaint.assignedOfficer}</td>}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`px-4 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-wider inline-block ${getStatusStyle(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    <button 
                      onClick={() => onView(complaint)}
                      className="p-2 rounded-lg hover:bg-gray-200 transition-colors group cursor-pointer inline-flex items-center justify-center"
                    >
                      <EyeIcon />
                    </button>
                  </td>
                </tr>
              )
            })}
            {filteredComplaints.length === 0 && (
              <tr>
                <td colSpan={tableColumnCount} className="py-8 text-center text-gray-500">
                  No complaints match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-white">
        <span className="text-sm text-gray-500">
          Showing {filteredComplaints.length > 0 ? 1 : 0}-{Math.min(filteredComplaints.length, 8)} of {filteredComplaints.length} results
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

export default ComplainTable


