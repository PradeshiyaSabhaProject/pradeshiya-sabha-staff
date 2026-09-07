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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            My Assigned Grievances & Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Review and manage citizen complaints, dispute resolutions, and field inspections assigned to your user desk.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-[#A31736]/10 text-[#A31736] border border-[#A31736]/20 px-3 py-1.5 rounded uppercase tracking-wider">
            {myComplaints.length} Assigned to You
          </span>
        </div>
      </div>

      {loading ? (
        <div className="h-96 bg-gray-100 rounded animate-pulse" />
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

