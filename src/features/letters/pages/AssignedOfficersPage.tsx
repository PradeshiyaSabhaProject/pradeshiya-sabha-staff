import React, { useState } from 'react'
import { useAssignedOfficersData, type AssignedOfficer } from '../hooks/useAssignedOfficersData'
import AssignedOfficersTable from '../components/AssignedOfficersTable'
import OfficerDetailModal from '../components/OfficerDetailModal'

const AssignedOfficersPage: React.FC = () => {
  const { loading, officers, stats } = useAssignedOfficersData()
  const [selectedOfficer, setSelectedOfficer] = useState<AssignedOfficer | null>(null)

  const handleView = (officer: AssignedOfficer) => {
    setSelectedOfficer(officer)
  }

  const handleCloseModal = () => {
    setSelectedOfficer(null)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assigned Officers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and review all assigned officers</p>
        </div>
        <div>
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-sm font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
            <span className="text-gray-700">QUICK STATS</span>
            <span className="flex items-center gap-1 text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 block"></span>
              {stats.pending} PENDING
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      ) : (
        <AssignedOfficersTable 
          officers={officers} 
          onView={handleView} 
        />
      )}

      <OfficerDetailModal 
        officer={selectedOfficer} 
        onClose={handleCloseModal} 
      />

    </div>
  )
}

export default AssignedOfficersPage
