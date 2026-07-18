import React, { useState } from 'react'
import type { ApplicationForm, ApplicationRemark } from '../types'

interface ApplicationDetailModalProps {
  application: ApplicationForm | null
  onClose: () => void
  onUpdateApplication?: (id: string, updatedData: Partial<ApplicationForm>) => void
  mode?: 'my' | 'all'
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

const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({ application, onClose, onUpdateApplication, mode = 'my' }) => {
  const [newRemarkText, setNewRemarkText] = useState('')
  const [showRejectionForm, setShowRejectionForm] = useState(false)
  const [rejectionRemarkText, setRejectionRemarkText] = useState('')
  const [isManagerDecided, setIsManagerDecided] = useState<string | null>(null)
  const [prevAppId, setPrevAppId] = useState(application?.id)

  if (application?.id !== prevAppId) {
    setPrevAppId(application?.id)
    setShowRejectionForm(false)
    setRejectionRemarkText('')
    setIsManagerDecided(null)
  }

  if (!application) return null

  const handleAddRemark = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRemarkText.trim() || !onUpdateApplication) return
    const now = new Date()
    const newRemark: ApplicationRemark = {
      id: Date.now().toString(),
      author: 'Current Staff Officer',
      text: newRemarkText.trim(),
      date: now.toISOString().slice(0, 10),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    const updatedRemarks = [...(application.officerRemarks || []), newRemark]
    onUpdateApplication(application.id, { officerRemarks: updatedRemarks })
    setNewRemarkText('')
  }

  const handleManagerApprove = () => {
    if (!onUpdateApplication || !application) return
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10)
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const needsEscalation =
      application.category.includes('Building') ||
      application.category.includes('Tree Cutting') ||
      application.category.includes('Water') ||
      application.status === 'PENDING'

    if (needsEscalation && application.status !== 'INSPECTION') {
      let targetInspector = 'Chief Technical Officer (S. Kumara)'
      if (application.category.includes('Building')) targetInspector = 'Senior Town Planning Engineer (K. Perera)'
      else if (application.category.includes('Trade') || application.category.includes('Business')) targetInspector = 'Public Health Inspector - PHI (D. Silva)'
      else if (application.category.includes('Water')) targetInspector = 'Water Utility Inspector (M. Fernando)'

      const auditRemark: ApplicationRemark = {
        id: `rem-mgr-${Date.now()}`,
        author: 'Assigned Manager',
        text: `Approved by Manager — Automatically escalated to ${targetInspector} for technical field verification.`,
        date: dateStr,
        time: timeStr
      }
      const updatedRemarks = [...(application.officerRemarks || []), auditRemark]
      onUpdateApplication(application.id, {
        status: 'INSPECTION',
        assignedInspector: targetInspector,
        officerRemarks: updatedRemarks
      })
      setIsManagerDecided('ESCALATED')
    } else {
      const auditRemark: ApplicationRemark = {
        id: `rem-mgr-${Date.now()}`,
        author: 'Assigned Manager',
        text: 'Final verification approved by Manager — Permit Authorized & Issued.',
        date: dateStr,
        time: timeStr
      }
      const updatedRemarks = [...(application.officerRemarks || []), auditRemark]
      onUpdateApplication(application.id, {
        status: 'APPROVED',
        feeStatus: 'PAID',
        officerRemarks: updatedRemarks
      })
      setIsManagerDecided('APPROVED')
    }
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  const handleManagerReject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!onUpdateApplication || !application || !rejectionRemarkText.trim()) return
    const now = new Date()
    const auditRemark: ApplicationRemark = {
      id: `rem-mgr-${Date.now()}`,
      author: 'Manager Decision',
      text: `REJECTED: ${rejectionRemarkText.trim()}`,
      date: now.toISOString().slice(0, 10),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    const updatedRemarks = [...(application.officerRemarks || []), auditRemark]
    onUpdateApplication(application.id, {
      status: 'REJECTED',
      officerRemarks: updatedRemarks
    })
    setIsManagerDecided('REJECTED')
    setShowRejectionForm(false)
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-100 text-orange-700 border border-orange-200'
      case 'REVIEWING': return 'bg-amber-100 text-amber-700 border border-amber-200'
      case 'INSPECTION': return 'bg-indigo-100 text-indigo-700 border border-indigo-200'
      case 'APPROVED': return 'bg-green-100 text-green-700 border border-green-200'
      case 'REJECTED': return 'bg-red-100 text-red-700 border border-red-200'
      case 'RETURNED': return 'bg-purple-100 text-purple-700 border border-purple-200'
      default: return 'bg-gray-100 text-gray-700 border border-gray-200'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            Application Details - {application.refId}
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
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">APPLICANT NAME</p>
              <p className="text-sm font-bold text-gray-900">{application.applicantName}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">FORM CATEGORY</p>
              <p className="text-sm font-bold text-[#801028]">{application.category}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">NIC NUMBER</p>
              <p className="text-sm font-semibold text-gray-800">{application.applicantNic || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">DATE &amp; TIME</p>
              <p className="text-sm font-semibold text-gray-800">{application.date} | {application.time}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">PHONE</p>
              <p className="text-sm font-semibold text-gray-800">{application.applicantPhone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">CURRENT STATUS</p>
              <div className="mt-0.5">
                <span className={`px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider inline-block ${getStatusStyle(application.status)}`}>
                  {application.status}
                </span>
              </div>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">APPLICANT EMAIL &amp; ADDRESS</p>
              <p className="text-sm font-semibold text-gray-800">
                {application.applicantEmail || 'No email'} — {application.applicantAddress || 'No address provided'}
              </p>
            </div>
          </div>

          {/* Custom Category Details */}
          {application.customData && (
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">CATEGORY SPECIFIC PARTICULARS</p>
              <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-4 text-sm text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {application.customData.proposedLandArea && (
                  <div>
                    <span className="text-xs text-gray-500 font-bold uppercase block">Land Extent / Area:</span>
                    <span className="font-semibold text-gray-900">{application.customData.proposedLandArea}</span>
                  </div>
                )}
                {application.customData.buildingStoreys && (
                  <div>
                    <span className="text-xs text-gray-500 font-bold uppercase block">Building Storeys:</span>
                    <span className="font-semibold text-gray-900">{application.customData.buildingStoreys}</span>
                  </div>
                )}
                {application.customData.businessName && (
                  <div>
                    <span className="text-xs text-gray-500 font-bold uppercase block">Business Name:</span>
                    <span className="font-semibold text-gray-900">{application.customData.businessName}</span>
                  </div>
                )}
                {application.customData.businessRegistrationNo && (
                  <div>
                    <span className="text-xs text-gray-500 font-bold uppercase block">Registration No:</span>
                    <span className="font-semibold text-gray-900">{application.customData.businessRegistrationNo}</span>
                  </div>
                )}
                {application.customData.connectionPipeSize && (
                  <div>
                    <span className="text-xs text-gray-500 font-bold uppercase block">Connection Pipe Size:</span>
                    <span className="font-semibold text-gray-900">{application.customData.connectionPipeSize}</span>
                  </div>
                )}
                {application.customData.bookingDate && (
                  <div>
                    <span className="text-xs text-gray-500 font-bold uppercase block">Proposed Date:</span>
                    <span className="font-semibold text-gray-900">{application.customData.bookingDate}</span>
                  </div>
                )}
                {application.customData.expectedAttendees && (
                  <div>
                    <span className="text-xs text-gray-500 font-bold uppercase block">Expected Crowd:</span>
                    <span className="font-semibold text-gray-900">{application.customData.expectedAttendees}</span>
                  </div>
                )}
                {application.customData.signboardDimensions && (
                  <div>
                    <span className="text-xs text-gray-500 font-bold uppercase block">Signboard Dimensions:</span>
                    <span className="font-semibold text-gray-900">{application.customData.signboardDimensions}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">DESCRIPTION / STATEMENT</p>
            <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-4 text-sm text-gray-700">
              {application.description || 'No additional statement provided.'}
            </div>
          </div>

          {/* Attachments */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">ATTACHED DOCUMENTS</p>
            {!application.attachments || application.attachments.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No attachments provided.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {application.attachments.map(att => (
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

          {/* Remarks & Audit Trail */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">INTERNAL REMARKS &amp; AUDIT TRAIL</p>
            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
              {!application.officerRemarks || application.officerRemarks.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No remarks logged yet.</p>
              ) : (
                application.officerRemarks.map((r: ApplicationRemark) => (
                  <div key={r.id} className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between text-gray-500 font-semibold">
                      <span>{r.author}</span>
                      <span>{r.date} {r.time}</span>
                    </div>
                    <p className="text-gray-800">{r.text}</p>
                  </div>
                ))
              )}
            </div>
            {onUpdateApplication && (
              <form onSubmit={handleAddRemark} className="flex gap-2">
                <input
                  type="text"
                  value={newRemarkText}
                  onChange={(e) => setNewRemarkText(e.target.value)}
                  placeholder="Add an internal observation or instruction note..."
                  className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#801028]"
                />
                <button
                  type="submit"
                  className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Add Note
                </button>
              </form>
            )}
          </div>

          {/* Manager Approval & Rejection Desk (Only in My Applications) */}
          {onUpdateApplication && mode === 'my' && (
            <div className="bg-gradient-to-br from-amber-50/90 to-orange-50/80 border border-amber-200 rounded-xl p-5 space-y-4 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600 block animate-pulse"></span>
                  <span>📋 Manager Approval &amp; Decision Desk</span>
                </h3>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-amber-300">
                  Manager Review
                </span>
              </div>
              <p className="text-xs text-amber-900 font-medium leading-relaxed">
                As the assigned manager, review the application particulars above. Upon clicking <strong>Approve</strong>, if the category requires technical field verification, it will be automatically escalated to the appropriate Technical Inspector. If rejecting, mandatory rejection remarks must be provided.
              </p>

              {isManagerDecided ? (
                <div className="p-4 bg-green-100 border border-green-300 rounded-xl text-xs font-bold text-green-900 flex items-center justify-between animate-fade-in">
                  <span>
                    {isManagerDecided === 'ESCALATED' && '✓ Approved & automatically escalated to Technical Inspector!'}
                    {isManagerDecided === 'APPROVED' && '✓ Approved & Digital Permit Certificate Authorized!'}
                    {isManagerDecided === 'REJECTED' && '✓ Application Rejected & remarks logged!'}
                  </span>
                  <span className="text-[10px] uppercase bg-green-200 text-green-950 px-2 py-0.5 rounded font-extrabold">Saved</span>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {application.status === 'APPROVED' || application.status === 'REJECTED' ? (
                    <div className="p-3.5 bg-white border border-amber-200 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-between">
                      <span>This application has already been finalized as <span className="uppercase text-[#801028]">{application.status}</span>.</span>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded uppercase">Completed</span>
                    </div>
                  ) : !showRejectionForm ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleManagerApprove}
                        className="flex-1 min-w-[180px] bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Approve Application </span>
                      </button>
                      <button
                        onClick={() => setShowRejectionForm(true)}
                        className="flex-1 min-w-[180px] bg-[#801028] hover:bg-[#600a1c] text-white text-xs font-bold py-3 px-5 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        <span>Reject Application</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleManagerReject} className="bg-white border-2 border-red-200 rounded-xl p-4 space-y-3 animate-fade-in shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#801028] uppercase tracking-wider">Specify Rejection Remarks (Mandatory)</span>
                        <button
                          type="button"
                          onClick={() => setShowRejectionForm(false)}
                          className="text-xs font-bold text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          ✕ Cancel Rejection
                        </button>
                      </div>
                      <textarea
                        value={rejectionRemarkText}
                        onChange={(e) => setRejectionRemarkText(e.target.value)}
                        placeholder="State clearly the reason for rejection or missing statutory criteria to be sent to the applicant..."
                        rows={3}
                        required
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-xs text-gray-800 focus:outline-none focus:border-[#801028] focus:bg-white transition-all"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowRejectionForm(false)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!rejectionRemarkText.trim()}
                          className="px-5 py-2 bg-[#801028] hover:bg-[#600a1c] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <span>Confirm Rejection</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            Currently assigned officer: <span className="font-bold text-gray-800">{application.assignedOfficer}</span>
            {application.assignedInspector && (
              <span> | Technical Inspector: <span className="font-bold text-purple-800">{application.assignedInspector}</span></span>
            )}
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

export default ApplicationDetailModal
