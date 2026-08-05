import React, { useState } from 'react'
import { useApplicationData } from '../hooks/useApplicationData'
import type { ApplicationForm } from '../types'
import ApplicationStats from '../components/ApplicationStats'
import ApplicationTable from '../components/ApplicationTable'
import ApplicationDetailModal from '../components/ApplicationDetailModal'

const AllApplicationsPage: React.FC = () => {
  const { loading, applications, stats, updateApplication } = useApplicationData()
  const [selectedApp, setSelectedApp] = useState<ApplicationForm | null>(null)

  const handleView = (app: ApplicationForm) => {
    setSelectedApp(app)
  }

  const handleCloseModal = () => {
    setSelectedApp(null)
  }

  const handleUpdate = (id: string, updatedData: Partial<ApplicationForm>) => {
    updateApplication(id, updatedData)
    if (selectedApp && selectedApp.id === id) {
      setSelectedApp({ ...selectedApp, ...updatedData })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Applications</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and review all citizen-submitted permits &amp; statutory applications</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="flex items-center gap-2 bg-white border border-gray-300 text-xs font-semibold px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition-colors uppercase tracking-wider cursor-default">
            <span className="text-gray-700">Quick Stats</span>
            <span className="flex items-center gap-1 text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded uppercase tracking-wider font-bold border border-orange-200">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 block"></span>
              {stats.pending} PENDING INTAKE
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-28 bg-gray-100 rounded animate-pulse" />)}
          </div>
          <div className="h-96 bg-gray-100 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <ApplicationStats stats={stats} />
          <ApplicationTable 
            applications={applications} 
            onView={handleView} 
            showTabs={true} 
            showOfficer={true} 
          />
        </>
      )}

      <ApplicationDetailModal 
        application={selectedApp} 
        onClose={handleCloseModal} 
        onUpdateApplication={handleUpdate}
        mode="all"
      />

    </div>
  )
}

export default AllApplicationsPage
