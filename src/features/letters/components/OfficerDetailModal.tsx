import React from 'react'
import type { AssignedOfficer } from '../hooks/useAssignedOfficersData'

interface OfficerDetailModalProps {
  officer: AssignedOfficer | null
  onClose: () => void
}

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const OfficerDetailModal: React.FC<OfficerDetailModalProps> = ({ officer, onClose }) => {
  if (!officer) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            Officer Details - {officer.refId}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-[#801028] text-white flex items-center justify-center text-lg font-bold">
              {officer.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{officer.name}</h3>
              <p className="text-xs font-semibold text-gray-500">{officer.role} • {officer.phone}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">ASSIGNED CATEGORY</p>
              <p className="text-sm font-bold text-gray-800">{officer.assignedCategory}</p>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">TOTAL ASSIGNED</p>
              <p className="text-sm font-bold text-gray-800">{officer.assignedLetters} Letters</p>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">COMPLETED</p>
              <p className="text-sm font-bold text-green-600">{officer.completedLetters} Letters</p>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">REMAINING</p>
              <p className="text-sm font-bold text-[#801028]">{officer.remainingLetters} Letters</p>
            </div>
          </div>

          <div className="p-4 bg-orange-50/50 border border-orange-200/60 rounded-xl">
            <p className="text-xs font-semibold text-orange-800">
              This officer has {officer.remainingLetters} pending correspondences that require timely review and response.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-[#801028] text-white text-sm font-semibold rounded-lg hover:bg-[#600a1c] transition-colors shadow-sm cursor-pointer"
          >
            Manage Assignments
          </button>
        </div>

      </div>
    </div>
  )
}

export default OfficerDetailModal

