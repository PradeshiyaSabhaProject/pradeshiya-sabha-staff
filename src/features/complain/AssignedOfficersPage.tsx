import React from 'react'
import { useOfficerData } from './hooks/useOfficerData'
import OfficerTable from './components/OfficerTable'

const AssignedOfficersPage: React.FC = () => {
  const { loading, officers } = useOfficerData()

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Assigned Investigation Officers
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Departmental technical officers, grievance inquiry assignment status, and field inspection workload.
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 bg-white border border-gray-300 text-xs font-semibold px-3 py-1.5 rounded shadow-3xs">
            <span className="text-gray-600 uppercase tracking-wider text-[11px]">Active Inquiries:</span>
            <span className="font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 text-[10px]">
              12 PENDING
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="h-96 bg-gray-100 rounded animate-pulse" />
        </div>
      ) : (
        <OfficerTable officers={officers} />
      )}

    </div>
  )
}

export default AssignedOfficersPage

