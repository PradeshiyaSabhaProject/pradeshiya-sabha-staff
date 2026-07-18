import React, { useState } from 'react'
import { type Letter, type LetterStatus, updateLetterInStore } from '../hooks/useLetterData'

interface LetterDetailModalProps {
  letter: Letter | null
  onClose: () => void
  allowForwardToSuperior?: boolean
  allowStatusChange?: boolean
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

const LetterDetailModal: React.FC<LetterDetailModalProps> = ({ 
  letter, 
  onClose, 
  allowForwardToSuperior = false,
  allowStatusChange = false
}) => {
  const [superiorOfficer, setSuperiorOfficer] = useState('Hon. Chairman (Chief Executive)')
  const [isForwarded, setIsForwarded] = useState(false)
  const [status, setStatus] = useState<LetterStatus>(letter?.status || 'PENDING')
  const [isStatusUpdated, setIsStatusUpdated] = useState(false)
  const [prevLetterId, setPrevLetterId] = useState(letter?.id)

  if (letter?.id !== prevLetterId) {
    setPrevLetterId(letter?.id)
    setSuperiorOfficer('Hon. Chairman (Chief Executive)')
    setIsForwarded(false)
    if (letter) setStatus(letter.status)
    setIsStatusUpdated(false)
  }

  if (!letter) return null

  const handleForwardToSuperior = () => {
    const updated = { ...letter, assignedOfficer: superiorOfficer }
    updateLetterInStore(updated)
    setIsForwarded(true)
    setTimeout(() => {
      onClose()
    }, 1200)
  }

  const handleUpdateStatus = () => {
    const updated = { ...letter, status: status }
    updateLetterInStore(updated)
    setIsStatusUpdated(true)
    setTimeout(() => {
      onClose()
    }, 1200)
  }

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
            Letter Details - {letter.refId}
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
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">CURRENT STATUS</p>
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

          {/* Update Correspondence Status (Only in My Letters) */}
          {allowStatusChange && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 space-y-3 animate-fade-in shadow-xs">
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>ðŸ”„ Update Correspondence Status</span>
              </h3>
              <p className="text-xs text-amber-800">
                Modify the processing status of this citizen letter to reflect current administrative progress.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center pt-1">
                <div className="flex-1">
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value as LetterStatus)}
                    disabled={isStatusUpdated}
                    className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm font-semibold bg-white text-gray-800 focus:outline-none focus:border-amber-600 cursor-pointer disabled:opacity-60"
                  >
                    <option value="PENDING">PENDING (In Review)</option>
                    <option value="APPROVED">APPROVED (Action Authorized)</option>
                    <option value="REJECTED">REJECTED (Request Denied)</option>
                    <option value="COMPLETED">COMPLETED (Action Finished)</option>
                    <option value="RESCHEDULED">RESCHEDULED (Postponed)</option>
                    <option value="NO-SHOW">NO-SHOW (Citizen Absent)</option>
                  </select>
                </div>
                <button 
                  onClick={handleUpdateStatus}
                  disabled={isStatusUpdated}
                  className={`px-5 py-2 text-white text-sm font-bold rounded-lg transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                    isStatusUpdated ? 'bg-green-600' : 'bg-amber-700 hover:bg-amber-800'
                  }`}
                >
                  <span>{isStatusUpdated ? '✓ Status Updated!' : 'Update Status'}</span>
                </button>
              </div>
              {isStatusUpdated && (
                <div className="text-xs font-semibold text-green-800 bg-green-100 border border-green-300 px-3 py-2 rounded-lg flex items-center justify-between animate-fade-in mt-2">
                  <span>✓ Letter status changed to {status}!</span>
                  <span className="text-[10px] uppercase bg-green-200 text-green-900 px-2 py-0.5 rounded font-extrabold">Saved</span>
                </div>
              )}
            </div>
          )}

          {/* Escalate / Forward to Superior Official (Only in My Letters) */}
          {allowForwardToSuperior && (
            <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-4 space-y-3 animate-fade-in shadow-xs">
              <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>⬆️¸ Escalate: Forward to Official Above Designation</span>
              </h3>
              <p className="text-xs text-purple-700">
                Forward this correspondence to a superior municipal authority or executive officer for higher-level review and action.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center pt-1">
                <div className="flex-1">
                  <select 
                    value={superiorOfficer} 
                    onChange={(e) => setSuperiorOfficer(e.target.value)}
                    disabled={isForwarded}
                    className="w-full border border-purple-300 rounded-lg px-3 py-2 text-sm font-semibold bg-white text-gray-800 focus:outline-none focus:border-purple-600 cursor-pointer disabled:opacity-60"
                  >
                    <option value="Hon. Chairman (Chief Executive)">Hon. Chairman (Chief Executive of Sabha)</option>
                    <option value="Secretary of Pradeshiya Sabha">Secretary of Pradeshiya Sabha (Chief Admin Officer)</option>
                    <option value="Chief Engineer (Works Dept)">Chief Engineer (Head of Works & Technical Dept)</option>
                    <option value="Revenue Superintendent">Revenue Superintendent (Head of Finance)</option>
                    <option value="Senior Staff Officer / Deputy Secretary">Senior Staff Officer / Deputy Secretary</option>
                  </select>
                </div>
                <button 
                  onClick={handleForwardToSuperior}
                  disabled={isForwarded}
                  className={`px-5 py-2 text-white text-sm font-bold rounded-lg transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                    isForwarded ? 'bg-green-600' : 'bg-[#801028] hover:bg-[#600a1c]'
                  }`}
                >
                  <span>{isForwarded ? '✓ Escalated!' : 'Forward to Superior'}</span>
                </button>
              </div>
              {isForwarded && (
                <div className="text-xs font-semibold text-green-800 bg-green-100 border border-green-300 px-3 py-2 rounded-lg flex items-center justify-between animate-fade-in mt-2">
                  <span>✓ Correspondence forwarded to {superiorOfficer}!</span>
                  <span className="text-[10px] uppercase bg-green-200 text-green-900 px-2 py-0.5 rounded font-extrabold">Transferred</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            Currently assigned to: <span className="font-bold text-gray-800">{letter.assignedOfficer}</span>
          </div>
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  )
}

export default LetterDetailModal


