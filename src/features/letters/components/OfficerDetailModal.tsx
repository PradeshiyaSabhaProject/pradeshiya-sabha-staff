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
      <div className="bg-white rounded border border-gray-300 shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div>
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-tight">
              Officer Details - <span className="text-[#A31736]">{officer.refId}</span>
            </h2>
            <p className="text-xs text-gray-500">Pradeshiya Sabha Letter Assignment Roster</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded transition-colors cursor-pointer"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded border border-gray-200">
            <div className="w-11 h-11 rounded bg-[#A31736] text-white flex items-center justify-center text-base font-bold shadow-xs">
              {officer.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">{officer.name}</h3>
              <p className="text-xs text-gray-500">{officer.role} • {officer.phone}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white border border-gray-200 rounded">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">ASSIGNED CATEGORY</p>
              <p className="font-bold text-gray-800">{officer.assignedCategory}</p>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">TOTAL ASSIGNED</p>
              <p className="font-bold text-gray-800">{officer.assignedLetters} Letters</p>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">COMPLETED</p>
              <p className="font-bold text-green-700">{officer.completedLetters} Letters</p>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">REMAINING</p>
              <p className="font-bold text-[#A31736]">{officer.remainingLetters} Letters</p>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded">
            <p className="text-xs font-semibold text-amber-800">
              This officer has {officer.remainingLetters} pending correspondences that require timely review and response.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-200 bg-gray-50/70 flex items-center justify-end gap-2.5">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-bold uppercase tracking-wider rounded hover:bg-gray-100 transition-colors cursor-pointer shadow-2xs"
          >
            Close
          </button>
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors shadow-sm cursor-pointer"
          >
            Manage Assignments
          </button>
        </div>

      </div>
    </div>
  )
}

export default OfficerDetailModal


