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

const ApplicationOfficerTable: React.FC<ApplicationOfficerTableProps> = ({ officers }) => {
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [appliedDeptFilter, setAppliedDeptFilter] = useState('')

  const departments = useMemo(() => {
    const set = new Set(officers.map(o => o.department))
    return Array.from(set).sort()
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
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      
      {/* Filters Bar */}
      <div className="p-4 flex flex-wrap items-center gap-4 border-b border-gray-100">
        <div className="relative flex items-center border border-gray-300 rounded-lg bg-white flex-1 min-w-[200px] max-w-sm hover:border-gray-400 focus-within:border-[#801028]">
          <select 
            value={departmentFilter} 
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full appearance-none outline-none text-sm text-gray-600 bg-transparent py-2 pl-3 pr-8 cursor-pointer"
          >
            <option value="">All Municipal Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
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
          {appliedDeptFilter && (
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
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4 px-6">OFFICER ID &amp; NAME</th>
              <th className="py-4 px-6">DEPARTMENT</th>
              <th className="py-4 px-6">SPECIALIZED CATEGORY FOCUS</th>
              <th className="py-4 px-6 text-center">TOTAL ASSIGNED</th>
              <th className="py-4 px-6 text-center">COMPLETED</th>
              <th className="py-4 px-6 text-center">PENDING REVIEW</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredOfficers.map((officer) => (
              <tr key={officer.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="py-4 px-6 whitespace-nowrap">
                  <div className="font-bold text-gray-900">{officer.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{officer.role}</div>
                </td>
                <td className="py-4 px-6 font-semibold text-gray-700 whitespace-nowrap">
                  <span className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 inline-block">
                    {officer.department}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="bg-orange-50 text-orange-800 border border-orange-200 px-2.5 py-1 rounded text-xs font-semibold inline-block">
                    {officer.categoryFocus}
                  </span>
                </td>
                <td className="py-4 px-6 text-center font-extrabold text-gray-900 whitespace-nowrap">
                  {officer.assignedApplications}
                </td>
                <td className="py-4 px-6 text-center font-bold text-green-700 whitespace-nowrap">
                  {officer.completedApplications}
                </td>
                <td className="py-4 px-6 text-center whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full border text-xs font-bold ${
                    officer.remainingApplications > 5 
                      ? 'bg-red-50 text-red-700 border-red-200' 
                      : officer.remainingApplications > 0
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-green-50 text-green-700 border-green-200'
                  }`}>
                    {officer.remainingApplications} Pending
                  </span>
                </td>
              </tr>
            ))}
            {filteredOfficers.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
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
