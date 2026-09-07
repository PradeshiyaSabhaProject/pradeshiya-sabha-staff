import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApplicationData } from './hooks/useApplicationData'
import type { ApplicationForm } from './types'
import ApplicationStats from './components/ApplicationStats'
import ApplicationTable from './components/ApplicationTable'
import ApplicationDetailModal from './components/ApplicationDetailModal'

const AllApplicationsPage: React.FC = () => {
  const { loading, applications, stats, updateApplication } = useApplicationData()
  const [selectedApplication, setSelectedApplication] = useState<ApplicationForm | null>(null)
  const navigate = useNavigate()

  const handleView = (application: ApplicationForm) => {
    setSelectedApplication(application)
  }

  const handleCloseModal = () => {
    setSelectedApplication(null)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">Public Application &amp; Permit Dossier</h1>

          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Review all citizen statutory applications, building permits, trade licenses, and municipal counter submissions.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse block"></span>
            <span className="text-red-800 font-bold uppercase tracking-wider text-[11px]">Pipeline Active</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/applications/officers')}
            className="flex items-center gap-2 bg-white border border-gray-300 text-xs font-semibold px-3.5 py-1.5 rounded shadow-xs hover:bg-gray-50 transition-colors uppercase tracking-wider cursor-pointer"
          >
            <span className="text-gray-700 font-bold">Assigned Officers</span>
            <span className="flex items-center gap-1 text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded uppercase tracking-wider font-bold border border-orange-200">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 block"></span>
              {stats.pending} INTAKE
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-28 bg-gray-100 rounded animate-pulse border border-gray-200" />)}
          </div>
          <div className="h-96 bg-gray-100 rounded animate-pulse border border-gray-200" />
        </div>
      ) : (
        <>
          <ApplicationStats stats={stats} />
          <ApplicationTable applications={applications} onView={handleView} showOfficer={true} />
        </>
      )}

      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={handleCloseModal}
          mode="all"
          onUpdateApplication={(id, updatedData) => {
            const updated = updateApplication(id, updatedData)
            if (updated) setSelectedApplication(updated)
          }}
        />
      )}

    </div>
  )
}

export default AllApplicationsPage
