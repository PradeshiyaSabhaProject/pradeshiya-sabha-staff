import React, { useState, useMemo } from 'react'
import { useApplicationData } from '../hooks/useApplicationData'
import type { ApplicationForm } from '../types'
import ApplicationStats from '../components/ApplicationStats'
import ApplicationTable from '../components/ApplicationTable'
import ApplicationDetailModal from '../components/ApplicationDetailModal'
import { useAuth } from '../../../context/AuthContext'
import { isApplicationAssignedToCurrentOfficer } from '../utils/applicationUtils'

const MyApplicationsPage: React.FC = () => {
  const { loading, applications, updateApplication } = useApplicationData()
  const [selectedApp, setSelectedApp] = useState<ApplicationForm | null>(null)
  const { user } = useAuth()
  const currentOfficerName = user?.name ?? ''

  const myApplications = useMemo(() => {
    return applications.filter(a => isApplicationAssignedToCurrentOfficer(a, currentOfficerName, user?.role))
  }, [applications, currentOfficerName, user?.role])

  const myStats = useMemo(() => {
    return {
      pending: myApplications.filter(a => a.status === 'PENDING').length,
      reviewing: myApplications.filter(a => a.status === 'REVIEWING').length,
      inspection: myApplications.filter(a => a.status === 'INSPECTION').length,
      approved: myApplications.filter(a => a.status === 'APPROVED').length,
      rejected: myApplications.filter(a => a.status === 'REJECTED').length,
      returned: myApplications.filter(a => a.status === 'RETURNED').length,
      total: myApplications.length
    }
  }, [myApplications])

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
          <h1 className="text-2xl font-bold text-gray-900">My Applications (Manager Approval Desk)</h1>
          <p className="text-sm text-gray-500 mt-1">Review citizen statutory forms sent directly to you. Approve for automatic technical escalation or reject with remarks.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="flex items-center gap-2 bg-white border border-gray-300 text-xs font-semibold px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition-colors uppercase tracking-wider cursor-default">
            <span className="text-gray-700">My Workload</span>
            <span className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase tracking-wider font-bold border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 block"></span>
              {myStats.pending + myStats.reviewing + myStats.inspection} ACTIVE
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
          <ApplicationStats stats={myStats} />
          <ApplicationTable 
            applications={myApplications} 
            onView={handleView} 
            showTabs={true} 
            showOfficer={false} 
          />
        </>
      )}

      <ApplicationDetailModal 
        application={selectedApp} 
        onClose={handleCloseModal} 
        onUpdateApplication={handleUpdate}
        mode="my"
      />

    </div>
  )
}

export default MyApplicationsPage
