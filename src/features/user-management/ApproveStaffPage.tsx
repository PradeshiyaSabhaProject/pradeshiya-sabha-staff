import React, { useState } from 'react'


interface PendingStaff {
  id: string
  name: string
  jobTitle: string
  department: string
  submittedBy: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

const MOCK_PENDING_REQUESTS: PendingStaff[] = [
  {
    id: 'REQ-001',
    name: 'Saman Kumara',
    jobTitle: 'Development Officer',
    department: 'Administration',
    submittedBy: 'HR Admin (PS-EMP-0002)',
    submittedAt: 'Today, 09:30 AM',
    status: 'pending'
  },
  {
    id: 'REQ-002',
    name: 'Dilki Fernando',
    jobTitle: 'Data Entry Operator',
    department: 'Revenue & Finance Department',
    submittedBy: 'HR Admin (PS-EMP-0002)',
    submittedAt: 'Yesterday, 02:15 PM',
    status: 'pending'
  },
  {
    id: 'REQ-003',
    name: 'Ruwan Wijesinghe',
    jobTitle: 'Field Inspector',
    department: 'Health & Sanitation',
    submittedBy: 'System Automation',
    submittedAt: 'Yesterday, 11:45 AM',
    status: 'pending'
  }
]

export const ApproveStaffPage: React.FC = () => {
  const [requests, setRequests] = useState<PendingStaff[]>(MOCK_PENDING_REQUESTS)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<{ title: string, desc: string, type: 'success' | 'error' } | null>(null)

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    setProcessingId(id)

    // Simulate API delay
    setTimeout(() => {
      setRequests(prev => prev.filter(req => req.id !== id))
      setProcessingId(null)

      setToastMsg({
        title: action === 'approve' ? 'Request Approved' : 'Request Rejected',
        desc: action === 'approve'
          ? 'The staff member has been officially registered in the system.'
          : 'The registration request has been declined and archived.',
        type: action === 'approve' ? 'success' : 'error'
      })

      // Hide toast after 4s
      setTimeout(() => setToastMsg(null), 4000)
    }, 1500)
  }

  const pendingCount = requests.length

  return (
    <div className="space-y-6 pb-12 animate-fade-in font-sans">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Pending Staff Approvals
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Review, approve, or decline new staff member registrations.
          </p>
        </div>

        {/* Stats Badge */}
        <div>
          <div className="flex items-center gap-1.5 bg-white border border-gray-300 text-xs font-semibold px-3 py-1.5 rounded shadow-3xs">
            <span className="text-gray-600 uppercase tracking-wider text-[11px]">Approval Queue:</span>
            <span className="font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 text-[10px]">
              {pendingCount} PENDING
            </span>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right-8 fade-in duration-300">
          <div className={`rounded shadow-lg border p-3.5 flex items-start gap-3 w-80 bg-white
            ${toastMsg.type === 'success' ? 'border-green-300' : 'border-red-300'}
          `}>
            <div className={`mt-0.5 shrink-0 rounded p-1 
              ${toastMsg.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
            `}>
              {toastMsg.type === 'success' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-xs">{toastMsg.title}</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">{toastMsg.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-3.5">
        {requests.length === 0 ? (
          <div className="bg-white rounded p-10 border border-gray-300 shadow-sm text-center">
            <div className="w-16 h-16 bg-gray-50 rounded flex items-center justify-center mx-auto mb-3 border border-gray-200">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">All caught up!</h3>
            <p className="text-xs text-gray-500 mt-0.5">There are no pending staff registrations awaiting your approval.</p>
          </div>
        ) : (
          requests.map(req => (
            <div key={req.id} className="bg-white rounded border border-gray-300 shadow-sm p-4 sm:p-5 hover:border-gray-400 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                {/* Staff Info */}
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-gray-700">
                      {req.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-bold text-gray-900">{req.name}</h3>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider border border-amber-200">
                        Pending
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-gray-700">{req.jobTitle}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{req.department}</div>
                  </div>
                </div>

                {/* Submission Meta & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 lg:ml-auto">
                  <div className="bg-gray-50 rounded p-2.5 border border-gray-200 min-w-[190px]">
                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Submission Details</div>
                    <div className="text-xs font-semibold text-gray-800 flex items-center gap-1.5 mb-0.5">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      {req.submittedBy}
                    </div>
                    <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {req.submittedAt}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={processingId !== null}
                      onClick={() => handleAction(req.id, 'reject')}
                      className="flex-1 sm:flex-none px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-1.5 cursor-pointer"
                    >
                      {processingId === req.id ? 'Processing...' : 'Decline'}
                    </button>
                    <button
                      type="button"
                      disabled={processingId !== null}
                      onClick={() => handleAction(req.id, 'approve')}
                      className="flex-1 sm:flex-none px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider text-white bg-[#A31736] hover:bg-[#801028] shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-1.5 cursor-pointer"
                    >
                      {processingId === req.id ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Processing...</span>
                        </>
                      ) : (
                        'Approve Request'
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

    </div>
  )
}
