import React, { useState } from 'react'
import { useComplainData, type Complaint } from '../hooks/useComplainData'
import ComplainTable from '../components/ComplainTable'
import ComplainDetailModal from '../components/ComplainDetailModal'

const MyComplaintsPage: React.FC = () => {
  const { loading, complaints, updateComplaint } = useComplainData()
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)

  const handleView = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
  }

  const handleCloseModal = () => {
    setSelectedComplaint(null)
  }

  // Filter complaints handled by or relevant to the current user
  const myComplaints = complaints.filter(c => c.assignedOfficer.includes('Perera') || c.assignedOfficer.includes('Silva') || c.status === 'PENDING' || c.status === 'REVIEWING' || c.status === 'IN PROGRESS')

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#801028] inline-block"></span>
            <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">Review and manage public grievances assigned to your user account</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold bg-red-100 text-[#801028] px-3 py-1.5 rounded-full uppercase tracking-wider">
            {myComplaints.length} Assigned to You
          </span>
        </div>
      </div>

      {loading ? (
        <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
      ) : (
        <ComplainTable 
          complaints={myComplaints} 
          onView={handleView} 
          showOfficer={false}
        />
      )}

      {selectedComplaint && (
        <ComplainDetailModal 
          complaint={selectedComplaint} 
          onClose={handleCloseModal}
          mode="my"
          onUpdateComplaint={(id, updatedData) => {
            const updated = updateComplaint(id, updatedData)
            if (updated) setSelectedComplaint(updated)
          }}
        />
      )}

    </div>
  )
}

export default MyComplaintsPage

