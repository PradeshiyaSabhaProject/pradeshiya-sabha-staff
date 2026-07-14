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
          <h1 className="text-2xl font-bold text-gray-900">Assigned Officers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and review all assigned officers</p>
        </div>
        <div>
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-sm font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors cursor-pointer">
            <span className="text-gray-700">QUICK STATS</span>
            <span className="flex items-center gap-1 text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 block"></span>
              12 PENDING
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      ) : (
        <OfficerTable officers={officers} />
      )}

    </div>
  )
}

export default AssignedOfficersPage

