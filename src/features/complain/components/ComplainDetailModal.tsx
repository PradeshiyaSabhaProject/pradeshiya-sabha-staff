import React from 'react'
import type { Complaint } from '../hooks/useComplainData'

interface ComplainDetailModalProps {
  complaint: Complaint | null
  onClose: () => void
}

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[#801028]">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const FileTextIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[#801028]">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

const ImageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-blue-500">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

const PdfIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-red-500">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
)

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-blue-600">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const ComplainDetailModal: React.FC<ComplainDetailModalProps> = ({ complaint, onClose }) => {
  if (!complaint) return null

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-100 text-orange-700 border border-orange-200'
      case 'APPROVED': return 'bg-green-100 text-green-700 border border-green-200'
      case 'REJECTED': return 'bg-red-100 text-red-700 border border-red-200'
      case 'COMPLETED': return 'bg-purple-100 text-purple-700 border border-purple-200'
      case 'RESCHEDULED': return 'bg-blue-100 text-blue-700 border border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border border-gray-200'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <FileTextIcon />
            </div>
            <h2 className="text-xl font-bold text-[#801028]">
              Complaint Details - {complaint.refId}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="space-y-8">
            
            {/* Requester Information */}
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-[#801028] mb-4">
                <UserIcon />
                Requester Information
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-3">
                  <span className="text-sm text-gray-500">Citizen Name</span>
                  <span className="col-span-2 text-sm font-semibold text-gray-900">: {complaint.citizenName}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-sm text-gray-500">NIC Number</span>
                  <span className="col-span-2 text-sm font-semibold text-gray-900">: {complaint.citizenNic}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-sm text-gray-500">Phone</span>
                  <span className="col-span-2 text-sm font-semibold text-gray-900">: {complaint.citizenPhone}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="col-span-2 text-sm font-semibold text-gray-900">: {complaint.citizenEmail}</span>
                </div>
              </div>
            </div>
            
            <hr className="border-gray-100" />

            {/* Submission Particulars */}
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-[#801028] mb-4">
                <FileTextIcon />
                Submission Particulars
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-3 items-center">
                  <span className="text-sm text-gray-500">Category</span>
                  <span className="col-span-2 text-sm font-semibold text-gray-900">: {complaint.category}</span>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <span className="text-sm text-gray-500">Date & Time</span>
                  <span className="col-span-2 text-sm font-semibold text-gray-900">: {complaint.date} | {complaint.time}</span>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <span className="text-sm text-gray-500">Status</span>
                  <div className="col-span-2 flex items-center gap-1">
                    <span>: </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Remark / Description */}
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <FileTextIcon />
                Remark / Description
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 italic">
                "{complaint.description}"
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* Attached Documentation */}
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-[#801028] mb-4">
                <FileTextIcon />
                Attached Documentation
              </h3>
              <div className="space-y-3">
                {complaint.attachments.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No attachments provided.</p>
                ) : (
                  complaint.attachments.map(att => (
                    <div key={att.id} className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          {att.type === 'image' ? <ImageIcon /> : <PdfIcon />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{att.name}</p>
                          <p className="text-xs text-gray-500">{att.size}</p>
                        </div>
                      </div>
                      <button className="p-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors shadow-sm cursor-pointer">
                        <DownloadIcon />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Administrative Action */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#801028] mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Administrative Action
              </h3>
              <div className="flex gap-3">
                <button className="flex-1 bg-[#801028] text-white font-semibold py-2.5 rounded-lg shadow hover:bg-[#600a1c] transition-colors cursor-pointer">
                  Assign Technician
                </button>
                <button className="flex-1 bg-white text-[#801028] border border-[#801028] font-semibold py-2.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">
                  Mark Reviewing
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between rounded-b-xl">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ClockIcon />
            Last updated by Administrative Officer at 2.45 PM
          </div>
          <button 
            onClick={onClose}
            className="bg-gray-900 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Close Detail View
          </button>
        </div>

      </div>
    </div>
  )
}

// Just for the footer icon
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

export default ComplainDetailModal
