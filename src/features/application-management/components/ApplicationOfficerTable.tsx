import React, { useState, useMemo } from 'react'
import type { ApplicationOfficer } from '../hooks/useApplicationOfficers'

interface ApplicationOfficerTableProps {
  officers: ApplicationOfficer[]
}

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400 shrink-0 pointer-events-none">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

function getRemainingBadgeStyle(remaining: number): string {
  if (remaining > 5) {
    return 'bg-red-50 text-red-700 border-red-200'
  }
  if (remaining > 0) {
    return 'bg-amber-50 text-amber-700 border-amber-200'
  }
  return 'bg-green-50 text-green-700 border-green-200'
}

const ApplicationOfficerTable: React.FC<ApplicationOfficerTableProps> = ({ officers }) => {
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [appliedDeptFilter, setAppliedDeptFilter] = useState('')

  const departments = useMemo(() => {
    const set = new Set(officers.map(o => o.department))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [officers])

  const filteredOfficers = useMemo(() => {
    return officers.filter(o => {
      if (appliedDeptFilter && o.department !== appliedDeptFilter) return false
      return true
    })
  }, [officers, appliedDeptFilter])

  const handleFilter = () => {
    setAppliedDeptFilter(departmentFilter)
  }

  const handleReset = () => {
    setDepartmentFilter('')
    setAppliedDeptFilter('')
  }

  return (
    <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
      
      {/* Filters Bar */}
      <div className="p-3.5 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 border-b border-gray-200 bg-gray-50/30">
        <div className="relative flex items-center border border-gray-300 rounded bg-white flex-1 min-w-[200px] max-w-full sm:max-w-sm h-9 hover:border-gray-400 focus-within:border-[#A31736]">
          <select 
            value={departmentFilter} 
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full appearance-none outline-none text-xs font-medium text-gray-700 bg-transparent py-1.5 pl-3 pr-8 cursor-pointer"
          >
            <option value="">All Municipal Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="absolute right-2.5 pointer-events-none">
            <ChevronDownIcon />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={handleFilter}
            className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold px-5 h-9 rounded uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
          >
            Filter
          </button>
          {appliedDeptFilter && (
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
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-100 border-y border-gray-300 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
              <th className="py-3 px-4">OFFICER ID &amp; NAME</th>
              <th className="py-3 px-4">DEPARTMENT</th>
              <th className="py-3 px-4">SPECIALIZED CATEGORY FOCUS</th>
              <th className="py-3 px-4 text-center">TOTAL ASSIGNED</th>
              <th className="py-3 px-4 text-center">COMPLETED</th>
              <th className="py-3 px-4 text-center">PENDING REVIEW</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-xs">
            {filteredOfficers.map((officer) => (
              <tr key={officer.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="font-bold text-gray-900">{officer.name}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{officer.role}</div>
                </td>
                <td className="py-3.5 px-4 font-semibold text-gray-700 whitespace-nowrap">
                  <span className="px-2.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[11px] font-bold text-gray-800 inline-block uppercase">
                    {officer.department}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="bg-orange-50 text-orange-800 border border-orange-200 px-2 py-0.5 rounded text-[11px] font-semibold inline-block">
                    {officer.categoryFocus}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-gray-900 whitespace-nowrap">
                  {officer.assignedApplications}
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-emerald-700 whitespace-nowrap">
                  {officer.completedApplications}
                </td>
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <span className={`px-2.5 py-0.5 rounded border text-[11px] font-bold uppercase tracking-wider ${getRemainingBadgeStyle(officer.remainingApplications)}`}>
                    {officer.remainingApplications} Pending
                  </span>
                </td>
              </tr>
            ))}
            {filteredOfficers.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 text-xs">
                  No officers match the selected departmental filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default ApplicationOfficerTable
