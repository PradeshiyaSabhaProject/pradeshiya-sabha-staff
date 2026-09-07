import React from 'react'
import { useApplicationOfficers } from '../hooks/useApplicationOfficers'
import ApplicationOfficerTable from '../components/ApplicationOfficerTable'
import { useNavigate } from 'react-router-dom'

const ApplicationOfficersPage: React.FC = () => {
  const { loading, officers } = useApplicationOfficers()
  const navigate = useNavigate()

  const totalAssigned = officers.reduce((sum, o) => sum + o.assignedApplications, 0)
  const totalRemaining = officers.reduce((sum, o) => sum + o.remainingApplications, 0)

  return (
    <div className="space-y-6 animate-fade-in pb-8">

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">Technical Officers &amp; Inspectors</h1>

          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Workload distribution across municipal town planners, PHIs, works supervisors, and engineers</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/applications/all')}
            className="flex items-center gap-2 bg-white border border-gray-300 text-xs font-semibold px-3.5 py-1.5 rounded shadow-sm hover:bg-gray-50 transition-colors uppercase tracking-wider cursor-pointer"
          >
            <span className="text-gray-700 font-bold">All Applications</span>
          </button>
          <div className="flex items-center gap-2 bg-white border border-gray-300 text-xs font-semibold px-3.5 py-1.5 rounded shadow-sm uppercase tracking-wider cursor-default">
            <span className="text-gray-700 font-bold text-[11px]">TOTAL ASSIGNED: {totalAssigned}</span>
            <span className="flex items-center gap-1 text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded uppercase tracking-wider font-bold border border-orange-200">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 block"></span>
              {totalRemaining} PENDING REVIEW
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="h-96 bg-gray-100 rounded animate-pulse" />
        </div>
      ) : (
        <ApplicationOfficerTable officers={officers} />
      )}

    </div>
  )
}

export default ApplicationOfficersPage
