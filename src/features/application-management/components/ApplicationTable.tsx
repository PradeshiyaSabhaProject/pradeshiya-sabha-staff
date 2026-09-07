import React, { useState, useMemo } from 'react'
import type { ApplicationForm } from '../types'
import { getDeadlineStatus, getDeadlineStatusStyleClasses, isApplicationAssignedToCurrentOfficer } from '../utils/applicationUtils'
import { useAuth } from '../../../context/AuthContext'

interface ApplicationTableProps {
  applications: ApplicationForm[]
  onView: (application: ApplicationForm) => void
  showTabs?: boolean
  showOfficer?: boolean
}

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-500 group-hover:text-[#A31736] transition-colors">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
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

const TABS = [
  { id: 'all', label: 'All Applications', status: null },
  { id: 'pending', label: 'Pending Intake', status: 'PENDING' },
  { id: 'reviewing', label: 'Under Review', status: 'REVIEWING' },
  { id: 'inspection', label: 'Field Inspection', status: 'INSPECTION' },
  { id: 'approved', label: 'Approved & Issued', status: 'APPROVED' },
  { id: 'rejected', label: 'Rejected', status: 'REJECTED' },
  { id: 'returned', label: 'Returned for Info', status: 'RETURNED' },
]

const ApplicationTable: React.FC<ApplicationTableProps> = ({ applications, onView, showTabs = true, showOfficer = true }) => {
  const [activeTab, setActiveTab] = useState('all')
  const [filters, setFilters] = useState({ date: '', category: '', status: '', officer: '' })
  const [appliedFilters, setAppliedFilters] = useState({ date: '', category: '', status: '', officer: '' })

  const uniqueDates = useMemo(() => Array.from(new Set(applications.map(a => a.date))).sort((a, b) => a.localeCompare(b)), [applications])
  const uniqueCategories = useMemo(() => Array.from(new Set(applications.map(a => a.category))).sort((a, b) => a.localeCompare(b)), [applications])
  const uniqueStatuses = useMemo(() => Array.from(new Set(applications.map(a => a.status))).sort((a, b) => a.localeCompare(b)), [applications])
  const uniqueOfficers = useMemo(() => Array.from(new Set(applications.map(a => a.assignedOfficer))).sort((a, b) => a.localeCompare(b)), [applications])

  const handleFilter = () => {
    setAppliedFilters(filters)
  }

  const handleReset = () => {
    setFilters({ date: '', category: '', status: '', officer: '' })
    setAppliedFilters({ date: '', category: '', status: '', officer: '' })
    setActiveTab('all')
  }

  const filteredApplications = useMemo(() => {
    return applications.filter(a => {
      if (showTabs) {
        const tabObj = TABS.find(t => t.id === activeTab)
        if (tabObj?.status && a.status !== tabObj.status) return false
      }
      
      if (appliedFilters.date && a.date !== appliedFilters.date) return false
      if (appliedFilters.category && a.category !== appliedFilters.category) return false
      if (appliedFilters.status && a.status !== appliedFilters.status) return false
      if (showOfficer && appliedFilters.officer && a.assignedOfficer !== appliedFilters.officer) return false
      
      return true
    })
  }, [applications, activeTab, appliedFilters, showTabs, showOfficer])

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'REVIEWING': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'INSPECTION': return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'APPROVED': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200'
      case 'RETURNED': return 'bg-purple-50 text-purple-700 border-purple-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getTabCount = (tabId: string, status: string | null) => {
    if (tabId === 'all') return applications.length
    return applications.filter(a => a.status === status).length
  }

  const { user } = useAuth()
  const currentOfficerName = user?.name ?? ''
  const showDeadline = true
  const tableColumnCount = 6 + (showOfficer ? 1 : 0) + (showDeadline ? 2 : 0)

  const computeDeadlineFromSubmissionDate = (receivedDate: string) => {
    const parsed = new Date(receivedDate)
    if (Number.isNaN(parsed.getTime())) return ''
    parsed.setDate(parsed.getDate() + 7)
    return parsed.toISOString().slice(0, 10)
  }

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
                key={tab.id}
                type="button"
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
        <div className="relative flex items-center border border-gray-300 rounded bg-white flex-1 min-w-[150px] h-9 hover:border-gray-400 focus-within:border-[#A31736]">
          <div className="absolute left-2.5">
            <CalendarIcon />
          </div>
          <select 
            value={filters.date} 
            onChange={(e) => setFilters({...filters, date: e.target.value})}
            className="w-full appearance-none outline-none text-xs font-medium text-gray-700 bg-transparent py-1.5 pl-8 pr-7 cursor-pointer"
          >
            <option value="">All Dates</option>
            {uniqueDates.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="absolute right-2.5 pointer-events-none">
            <ChevronDownIcon />
          </div>
        </div>

        <div className="relative flex items-center border border-gray-300 rounded bg-white flex-1 min-w-[150px] h-9 hover:border-gray-400 focus-within:border-[#A31736]">
          <select 
            value={filters.category} 
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="w-full appearance-none outline-none text-xs font-medium text-gray-700 bg-transparent py-1.5 pl-3 pr-7 cursor-pointer"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="absolute right-2.5 pointer-events-none">
            <ChevronDownIcon />
          </div>
        </div>

        <div className="relative flex items-center border border-gray-300 rounded bg-white flex-1 min-w-[150px] h-9 hover:border-gray-400 focus-within:border-[#A31736]">
          <select 
            value={filters.status} 
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="w-full appearance-none outline-none text-xs font-medium text-gray-700 bg-transparent py-1.5 pl-3 pr-7 cursor-pointer"
          >
            <option value="">All Statuses</option>
            {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="absolute right-2.5 pointer-events-none">
            <ChevronDownIcon />
          </div>
        </div>

        {showOfficer && (
          <div className="relative flex items-center border border-gray-300 rounded bg-white flex-1 min-w-[150px] h-9 hover:border-gray-400 focus-within:border-[#A31736]">
            <select 
              value={filters.officer} 
              onChange={(e) => setFilters({...filters, officer: e.target.value})}
              className="w-full appearance-none outline-none text-xs font-medium text-gray-700 bg-transparent py-1.5 pl-3 pr-7 cursor-pointer"
            >
              <option value="">All Officers</option>
              {uniqueOfficers.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <div className="absolute right-2.5 pointer-events-none">
              <ChevronDownIcon />
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={handleFilter}
            className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold px-5 h-9 rounded uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
          >
            Filter
          </button>
          {(appliedFilters.date || appliedFilters.category || appliedFilters.status || appliedFilters.officer || activeTab !== 'all') && (
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

      {/* Table */}
      <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch] flex-1">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-gray-100 border-y border-gray-300 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
              <th className="py-3 px-4">REF ID</th>
              <th className="py-3 px-4">APPLICANT NAME</th>
              <th className="py-3 px-4">CATEGORY</th>
              <th className="py-3 px-4">SUBMISSION DATE</th>
              {showDeadline && (
                <>
                  <th className="py-3 px-4">DUE DATE</th>
                  <th className="py-3 px-4">DEADLINE STATUS</th>
                </>
              )}
              {showOfficer && <th className="py-3 px-4">ASSIGNED OFFICER</th>}
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-xs">
            {filteredApplications.map((application) => {
              const isAssignedToCurrentTO = isApplicationAssignedToCurrentOfficer(application, currentOfficerName)
              const computedDueDate = application.dueDate || computeDeadlineFromSubmissionDate(application.date)
              const deadlineStatus = getDeadlineStatus({ status: application.status, dueDate: computedDueDate }, isAssignedToCurrentTO)

              return (
                <tr key={application.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">{application.refId}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-bold text-gray-900">{application.applicantName}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{application.applicantPhone || application.applicantNic}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-gray-800 whitespace-nowrap">{application.category}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">{application.date}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{application.time}</div>
                  </td>
                  {showDeadline && (
                    <>
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-gray-700">{computedDueDate || '—'}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {deadlineStatus ? (
                          <span className={`px-2.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider inline-block ${getDeadlineStatusStyleClasses(computedDueDate)}`}>
                            {deadlineStatus}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">—</span>
                        )}
                      </td>
                    </>
                  )}
                  {showOfficer && <td className="py-3.5 px-4 font-medium text-gray-700 whitespace-nowrap">{application.assignedOfficer}</td>}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider inline-block ${getStatusStyle(application.status)}`}>
                      {application.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <button 
                      type="button"
                      onClick={() => onView(application)}
                      className="p-1.5 rounded hover:bg-gray-100 transition-colors group cursor-pointer inline-flex items-center justify-center border border-gray-200"
                    >
                      <EyeIcon />
                    </button>
                  </td>
                </tr>
              )
            })}
            {filteredApplications.length === 0 && (
              <tr>
                <td colSpan={tableColumnCount} className="py-8 text-center text-gray-500 text-xs">
                  No applications match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default ApplicationTable
