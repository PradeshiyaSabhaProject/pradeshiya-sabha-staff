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
    <div className="space-y-6 text-left pb-12 animate-fade-in font-sans">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-[#801028] inline-block" />
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pending Staff Approvals</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">Review, approve, or decline new staff member registrations.</p>
        </div>

        {/* Stats Badge */}
        <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm flex items-center gap-3 w-fit">
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
            <span className="text-orange-600 font-bold text-lg">{pendingCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Awaiting</span>
            <span className="text-sm font-bold text-gray-800">Decisions</span>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right-8 fade-in duration-300">
          <div className={`rounded-xl shadow-lg border p-4 flex items-start gap-3 w-80 bg-white
            ${toastMsg.type === 'success' ? 'border-green-200' : 'border-red-200'}
          `}>
            <div className={`mt-0.5 shrink-0 rounded-full p-1 
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
              <h4 className="font-bold text-gray-900 text-sm">{toastMsg.title}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{toastMsg.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-200 shadow-sm text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">All caught up!</h3>
            <p className="text-gray-500 mt-1">There are no pending staff registrations awaiting your approval.</p>
          </div>
        ) : (
          requests.map(req => (
            <div key={req.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                {/* Staff Info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-xl font-bold text-gray-600">
                      {req.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{req.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 uppercase tracking-wider">
                        Pending
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-gray-700">{req.jobTitle}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{req.department}</div>
                  </div>
                </div>

                {/* Submission Meta & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 lg:ml-auto">
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 min-w-[200px]">
                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Submission Details</div>
                    <div className="text-xs font-semibold text-gray-800 flex items-center gap-1.5 mb-1">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      {req.submittedBy}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {req.submittedAt}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={processingId !== null}
                      onClick={() => handleAction(req.id, 'reject')}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                      {processingId === req.id ? 'Processing...' : 'Decline'}
                    </button>
                    <button
                      type="button"
                      disabled={processingId !== null}
                      onClick={() => handleAction(req.id, 'approve')}
                      className="flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold text-white bg-[#801028] hover:bg-[#6a0d21] shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                      {processingId === req.id ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
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
