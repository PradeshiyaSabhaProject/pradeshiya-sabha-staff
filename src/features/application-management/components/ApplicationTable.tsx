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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-500 group-hover:text-[#801028]">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
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
      case 'PENDING': return 'text-orange-600 border-orange-300'
      case 'REVIEWING': return 'text-amber-600 border-amber-300'
      case 'INSPECTION': return 'text-indigo-600 border-indigo-300'
      case 'APPROVED': return 'text-green-600 border-green-300'
      case 'REJECTED': return 'text-red-600 border-red-300'
      case 'RETURNED': return 'text-purple-600 border-purple-300'
      default: return 'text-gray-600 border-gray-300'
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
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      
      {/* Optional Tabs */}
      {showTabs && (
        <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            const count = getTabCount(tab.id, tab.status)
            return (
              <button
                key={tab.id}
                type="button"
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
            {uniqueDates.map(d => <option key={d} value={d}>{d}</option>)}
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
              <th className="py-4 px-6">REF ID</th>
              <th className="py-4 px-6">APPLICANT NAME</th>
              <th className="py-4 px-6">CATEGORY</th>
              <th className="py-4 px-6">SUBMISSION DATE</th>
              {showDeadline && (
                <>
                  <th className="py-4 px-6">DUE DATE</th>
                  <th className="py-4 px-6">DEADLINE STATUS</th>
                </>
              )}
              {showOfficer && <th className="py-4 px-6">ASSIGNED OFFICER</th>}
              <th className="py-4 px-6">STATUS</th>
              <th className="py-4 px-6 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredApplications.map((application) => {
              const isAssignedToCurrentTO = isApplicationAssignedToCurrentOfficer(application, currentOfficerName)
              const computedDueDate = application.dueDate || computeDeadlineFromSubmissionDate(application.date)
              const deadlineStatus = getDeadlineStatus({ status: application.status, dueDate: computedDueDate }, isAssignedToCurrentTO)

              return (
                <tr key={application.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-4 px-6 font-bold text-gray-700 whitespace-nowrap">{application.refId}</td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="font-bold text-gray-900">{application.applicantName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{application.applicantPhone || application.applicantNic}</div>
                  </td>
                  <td className="py-4 px-6 font-semibold text-gray-700 whitespace-nowrap">{application.category}</td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="font-bold text-gray-900">{application.date}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{application.time}</div>
                  </td>
                  {showDeadline && (
                    <>
                      <td className="py-4 px-6 whitespace-nowrap font-bold text-gray-700">{computedDueDate || '—'}</td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {deadlineStatus ? (
                          <span className={`px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider inline-block ${getDeadlineStatusStyleClasses(computedDueDate)}`}>
                            {deadlineStatus}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">—</span>
                        )}
                      </td>
                    </>
                  )}
                  {showOfficer && <td className="py-4 px-6 font-semibold text-gray-700 whitespace-nowrap">{application.assignedOfficer}</td>}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`px-4 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-wider inline-block ${getStatusStyle(application.status)}`}>
                      {application.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    <button 
                      type="button"
                      onClick={() => onView(application)}
                      className="p-2 rounded-lg hover:bg-gray-200 transition-colors group cursor-pointer inline-flex items-center justify-center"
                    >
                      <EyeIcon />
                    </button>
                  </td>
                </tr>
              )
            })}
            {filteredApplications.length === 0 && (
              <tr>
                <td colSpan={tableColumnCount} className="py-8 text-center text-gray-500">
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
