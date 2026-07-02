import React from 'react'
import type { Letter } from '../hooks/useLetterData'

interface LetterDetailModalProps {
  letter: Letter | null
  onClose: () => void
}

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
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

const LetterDetailModal: React.FC<LetterDetailModalProps> = ({ letter, onClose }) => {
  if (!letter) return null

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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            Letter Details – {letter.refId}
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
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">CITIZEN NAME</p>
              <p className="text-sm font-bold text-gray-900">{letter.citizenName}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">CATEGORY</p>
              <p className="text-sm font-bold text-red-700">{letter.category === 'Type 1' ? 'Waste Management' : letter.category}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">NIC NUMBER</p>
              <p className="text-sm font-semibold text-gray-800">{letter.citizenNic}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">DATE & TIME</p>
              <p className="text-sm font-semibold text-gray-800">{letter.date} | {letter.time}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">PHONE</p>
              <p className="text-sm font-semibold text-gray-800">{letter.citizenPhone}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">STATUS</p>
              <div className="mt-0.5">
                <span className={`px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider inline-block ${getStatusStyle(letter.status)}`}>
                  {letter.status}
                </span>
              </div>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">EMAIL</p>
              <p className="text-sm font-semibold text-gray-800">{letter.citizenEmail}</p>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">REMARKS</p>
            <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-4 text-sm text-gray-700">
              {letter.remarks}
            </div>
          </div>

          {/* Attachments */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">ATTACHMENTS</p>
            {letter.attachments.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No attachments provided.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {letter.attachments.map(att => (
                  <div key={att.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 transition-colors">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      {att.type === 'image' ? <ImageIcon /> : <PdfIcon />}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-900 truncate">{att.name}</p>
                      <p className="text-xs text-gray-400">{att.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            Assign Officer
          </button>
        </div>

      </div>
    </div>
  )
}

export default LetterDetailModal
