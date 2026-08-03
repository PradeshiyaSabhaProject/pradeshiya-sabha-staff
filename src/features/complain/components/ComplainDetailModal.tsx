import React, { useState, useEffect } from 'react'
import type { Complaint, ComplaintStatus, OfficerRemark } from '../hooks/useComplainData'
import { getDeadlineStatus, getDeadlineStatusStyleClasses } from '../utils/deadlineUtils'

interface ComplainDetailModalProps {
  complaint: Complaint | null
  onClose: () => void
  onUpdateComplaint?: (id: string, updatedData: Partial<Complaint>) => void
  mode?: 'my' | 'all'
}

const TECHNICIANS = [
  { id: 'tech-1', name: 'T. K. Samantha', role: 'Senior Electrical Technician', dept: 'Electrical & Lighting', status: 'Available' },
  { id: 'tech-2', name: 'W. A. Sunil Shantha', role: 'Road & Infrastructure Supervisor', dept: 'Public Works', status: 'Available' },
  { id: 'tech-3', name: 'D. M. Karunaratne', role: 'Water & Sanitation Field Officer', dept: 'Water Supply', status: 'On Field' },
  { id: 'tech-4', name: 'S. P. Liyanage', role: 'Waste Management Inspector', dept: 'Health & Sanitation', status: 'Available' },
  { id: 'tech-5', name: 'K. A. Nuwan Pradeep', role: 'General Maintenance Technician', dept: 'Municipal Services', status: 'Available' },
  { id: 'tech-6', name: 'R. M. Bandara', role: 'Civil Works Engineer', dept: 'Engineering Dept', status: 'In Inspection' },
]

const STATUS_OPTIONS: { value: ComplaintStatus; label: string; color: string }[] = [
  { value: 'PENDING', label: 'Pending Review', color: 'bg-orange-500' },
  { value: 'REVIEWING', label: 'Reviewing / Under Assessment', color: 'bg-amber-500' },
  { value: 'IN PROGRESS', label: 'In Progress / Action Initiated', color: 'bg-indigo-500' },
  { value: 'APPROVED', label: 'Approved for Action', color: 'bg-green-500' },
  { value: 'RESCHEDULED', label: 'Rescheduled / Postponed', color: 'bg-blue-500' },
  { value: 'COMPLETED', label: 'Completed & Resolved', color: 'bg-purple-500' },
  { value: 'REJECTED', label: 'Rejected / Invalid', color: 'bg-red-500' },
]

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

const ComplainDetailModal: React.FC<ComplainDetailModalProps> = ({ complaint, onClose, onUpdateComplaint, mode = 'my' }) => {
  const [isAssigningTech, setIsAssigningTech] = useState(false)
  const [isChangingState, setIsChangingState] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<ComplaintStatus>(complaint?.status || 'PENDING')
  const [assignedTech, setAssignedTech] = useState<string | undefined>(complaint?.assignedTechnician)
  const [notification, setNotification] = useState<string | null>(null)
  const [remarkText, setRemarkText] = useState('')
  const [remarksList, setRemarksList] = useState<OfficerRemark[]>(complaint?.officerRemarks || [])
  const [citizenNotified, setCitizenNotified] = useState(complaint?.citizenNotified || false)

  useEffect(() => {
    if (complaint) {
      setTimeout(() => {
        setCurrentStatus(complaint.status)
        setAssignedTech(complaint.assignedTechnician)
        setRemarksList(complaint.officerRemarks || [])
        setCitizenNotified(complaint.citizenNotified || false)
      }, 0)
    }
  }, [complaint])

  if (!complaint) return null

  const handleNotifyCitizen = () => {
    setCitizenNotified(true)
    if (onUpdateComplaint && complaint) {
      onUpdateComplaint(complaint.id, { citizenNotified: true })
    }
    showNotification(`Resolution notice sent to citizen (${complaint.citizenName}) via SMS & Email!`)
  }

  const showNotification = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  const handleAssignTechnician = (techName: string) => {
    setAssignedTech(techName)
    if (onUpdateComplaint && complaint) {
      onUpdateComplaint(complaint.id, { assignedTechnician: techName })
    }
    showNotification(`Assigned technician: ${techName}`)
    setIsAssigningTech(false)
  }

  const handleChangeState = (newStatus: ComplaintStatus) => {
    setCurrentStatus(newStatus)
    if (onUpdateComplaint && complaint) {
      onUpdateComplaint(complaint.id, { status: newStatus })
    }
    showNotification(`Complaint status changed to: ${newStatus}`)
    setIsChangingState(false)
  }

  const handleSendRemark = () => {
    if (!remarkText.trim() || !complaint) return
    const timestamp = new Date().getTime()
    const newRemark: OfficerRemark = {
      id: `rem-${timestamp}`,
      text: remarkText.trim(),
      date: new Date().toLocaleDateString('en-CA'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: 'Administrative Officer'
    }
    const updatedList = [newRemark, ...remarksList]
    setRemarksList(updatedList)
    setRemarkText('')
    if (onUpdateComplaint) {
      onUpdateComplaint(complaint.id, { officerRemarks: updatedList })
    }
    showNotification(`Remark sent to assigned officer (${complaint.assignedOfficer})`)
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-100 text-orange-700 border border-orange-200'
      case 'REVIEWING': return 'bg-amber-100 text-amber-800 border border-amber-200'
      case 'IN PROGRESS': return 'bg-indigo-100 text-indigo-700 border border-indigo-200'
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
            type="button"
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
                  <span className="text-sm text-gray-500">Assigned Officer</span>
                  <span className="col-span-2 text-sm font-bold text-gray-900">: {complaint.assignedOfficer}</span>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <span className="text-sm text-gray-500">Status</span>
                  <div className="col-span-2 flex items-center gap-1">
                    <span>: </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(currentStatus)}`}>
                      {currentStatus}
                    </span>
                  </div>
                </div>
                {assignedTech && (
                  <div className="grid grid-cols-3 items-center">
                    <span className="text-sm text-gray-500">Technician</span>
                    <span className="col-span-2 text-sm font-bold text-blue-700 flex items-center gap-1.5">
                      <span>: </span>
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span>{assignedTech}</span>
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-3 items-center">
                  <span className="text-sm text-gray-500">Deadline</span>
                  <span className="col-span-2 text-sm font-bold text-gray-900">: {complaint.dueDate || '—'}</span>
                </div>
                {(() => {
                  const dlStatus = getDeadlineStatus({ status: currentStatus, dueDate: complaint.dueDate || '' }, false)
                  return dlStatus ? (
                    <div className="grid grid-cols-3 items-center">
                      <span className="text-sm text-gray-500">Deadline Status</span>
                      <div className="col-span-2 flex items-center gap-1.5">
                        <span>: </span>
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${getDeadlineStatusStyleClasses(complaint.dueDate || '')}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-white block"></span>
                          {dlStatus}
                        </span>
                      </div>
                    </div>
                  ) : null
                })()}
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
                      <button type="button" className="p-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors shadow-sm cursor-pointer">
                        <DownloadIcon />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Administrative Action */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 relative overflow-hidden">
              {notification && (
                <div className="mb-3 p-2.5 bg-green-100 border border-green-300 text-green-800 rounded-lg text-xs font-bold flex items-center justify-between animate-fade-in">
                  <span>✓ {notification}</span>
                  <button type="button" onClick={() => setNotification(null)} className="text-green-800 hover:text-green-950 font-bold cursor-pointer">✕</button>
                </div>
              )}

              {currentStatus === 'COMPLETED' && (
                <div className="mb-4 p-3.5 bg-purple-50 border border-purple-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M22 2L11 13" />
                        <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-purple-950">Grievance Resolved & Completed</div>
                      <div className="text-[11px] text-purple-800">Citizen: {complaint.citizenName} ({complaint.citizenPhone})</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleNotifyCitizen}
                    disabled={citizenNotified}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-sm ${
                      citizenNotified
                        ? 'bg-purple-800 text-white opacity-90 cursor-default'
                        : 'bg-green-600 hover:bg-green-700 text-white animate-pulse hover:animate-none'
                    }`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <span>{citizenNotified ? '✓ Citizen Notified' : 'Notify Citizen'}</span>
                  </button>
                </div>
              )}

              {mode === 'all' ? (
                /* ALL COMPLAINTS MODE: Officer Instruction & Remarks */
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-[#801028]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      Officer Instructions & Remarks
                    </h3>
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200 uppercase">
                      Officer: {complaint.assignedOfficer}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 font-normal">
                    Direct state changes are disabled in All Complaints view. Send instructions to the assigned officer.
                  </p>

                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={remarkText}
                      onChange={(e) => setRemarkText(e.target.value)}
                      placeholder={`Remark for ${complaint.assignedOfficer}...`}
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#801028]/20 focus:border-[#801028]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && remarkText.trim()) handleSendRemark();
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSendRemark}
                      disabled={!remarkText.trim()}
                      className="bg-[#801028] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#600a1c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer shadow-sm"
                    >
                      Send
                    </button>
                  </div>

                  {remarksList.length > 0 ? (
                    <div className="space-y-2 mt-3 max-h-44 overflow-y-auto pr-1">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Remark History</div>
                      {remarksList.map((rem) => (
                        <div key={rem.id} className="p-2.5 bg-white border border-gray-200 rounded-lg text-xs space-y-1 shadow-sm">
                          <div className="flex items-center justify-between font-bold text-gray-700">
                            <span className="text-[#801028]">{rem.author} → {complaint.assignedOfficer}</span>
                            <span className="text-[10px] text-gray-400 font-normal">{rem.date} {rem.time}</span>
                          </div>
                          <p className="text-gray-800 font-normal">{rem.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-white/60 border border-dashed border-gray-200 rounded-lg text-center">
                      <p className="text-xs text-gray-400 italic">No instructions sent to {complaint.assignedOfficer} yet.</p>
                    </div>
                  )}
                </div>
              ) : (
                /* MY COMPLAINTS MODE: Assign Technician & Change State */
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-[#801028]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      Administrative Action
                    </h3>
                    {assignedTech && (
                      <span className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200">
                        Tech: {assignedTech}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => { setIsAssigningTech(!isAssigningTech); setIsChangingState(false); }}
                      className={`flex-1 font-semibold py-2.5 rounded-lg shadow transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm ${
                        isAssigningTech ? 'bg-[#600a1c] text-white ring-2 ring-[#801028]/30' : 'bg-[#801028] text-white hover:bg-[#600a1c]'
                      }`}
                    >
                      <span>Assign Technician</span>
                      <span className="text-xs opacity-80">{isAssigningTech ? '▲' : '▼'}</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setIsChangingState(!isChangingState); setIsAssigningTech(false); }}
                      className={`flex-1 border font-semibold py-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm ${
                        isChangingState ? 'bg-red-50 text-[#801028] border-[#801028] ring-2 ring-[#801028]/20' : 'bg-white text-[#801028] border-[#801028] hover:bg-red-50'
                      }`}
                    >
                      <span>Change State</span>
                      <span className="text-xs opacity-80">{isChangingState ? '▲' : '▼'}</span>
                    </button>
                  </div>

                  {/* Assign Technician Expandable List */}
                  {isAssigningTech && (
                    <div className="mt-4 border-t border-gray-200 pt-3 space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                        <span>Select Field Technician</span>
                        <button type="button" onClick={() => setIsAssigningTech(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
                      </div>
                      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                        {TECHNICIANS.map((tech) => {
                          const isSelected = assignedTech === tech.name
                          return (
                            <button
                              type="button"
                              key={tech.id}
                              onClick={() => handleAssignTechnician(tech.name)}
                              className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-[#801028]/10 border-[#801028] text-[#801028] font-bold shadow-sm'
                                  : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <div>
                                <div className="text-sm font-bold flex items-center gap-1.5">
                                  <span>{tech.name}</span>
                                  {isSelected && <span className="text-[10px] bg-[#801028] text-white px-1.5 py-0.2 rounded font-extrabold">ASSIGNED</span>}
                                </div>
                                <div className="text-xs text-gray-500 font-normal mt-0.5">{tech.role} • {tech.dept}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  tech.status === 'Available' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                                }`}>
                                  {tech.status}
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Change State Expandable List */}
                  {isChangingState && (
                    <div className="mt-4 border-t border-gray-200 pt-3 space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                        <span>Select New Complaint State</span>
                        <button type="button" onClick={() => setIsChangingState(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                        {STATUS_OPTIONS.map((opt) => {
                          const isSelected = currentStatus === opt.value
                          return (
                            <button
                              type="button"
                              key={opt.value}
                              onClick={() => handleChangeState(opt.value)}
                              className={`p-2.5 rounded-lg border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#801028]/10 border-[#801028] font-bold text-[#801028] shadow-sm'
                                  : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <span className={`w-2.5 h-2.5 rounded-full ${opt.color} shrink-0`}></span>
                              <span className="text-xs font-semibold">{opt.label}</span>
                              {isSelected && <span className="ml-auto text-xs text-[#801028]">✓</span>}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-b-xl">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ClockIcon />
            Last updated by Administrative Officer at 2.45 PM
          </div>
          <button 
            type="button"
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

