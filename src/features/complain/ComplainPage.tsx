import React, { useState } from 'react'
import { useComplainData, type Complaint } from './hooks/useComplainData'
import ComplainStats from './components/ComplainStats'
import ComplainTable from './components/ComplainTable'
import ComplainDetailModal from './components/ComplainDetailModal'

const ComplainPage: React.FC = () => {
  const { loading, complaints, stats, updateComplaint } = useComplainData()
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)

  const handleView = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
  }

  const handleCloseModal = () => {
    setSelectedComplaint(null)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Public Complaints & Grievance Ledger
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Real-time citizen grievance intake, investigation tracking, and departmental resolution monitoring.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded shadow-3xs">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse block"></span>
            <span className="text-red-800 font-bold uppercase tracking-wider text-[11px]">Deadlines Active</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-gray-300 text-xs font-semibold px-3 py-1.5 rounded shadow-3xs">
            <span className="text-gray-600 uppercase tracking-wider text-[11px]">Pending:</span>
            <span className="font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 text-[10px]">
              {stats.pending} INTAKE
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />)}
          </div>
          <div className="h-96 bg-gray-100 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <ComplainStats stats={stats} />
          <ComplainTable complaints={complaints} onView={handleView} />
        </>
      )}

      {selectedComplaint && (
        <ComplainDetailModal 
          complaint={selectedComplaint} 
          onClose={handleCloseModal}
          mode="all"
          onUpdateComplaint={(id, updatedData) => {
            const updated = updateComplaint(id, updatedData)
            if (updated) setSelectedComplaint(updated)
          }}
        />
      )}

    </div>
  )
}

export default ComplainPage

