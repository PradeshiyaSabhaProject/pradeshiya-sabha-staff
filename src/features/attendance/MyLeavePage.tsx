import React, { useState } from 'react'

interface TimelineStep {
  level: string
  roleName: string
  approverName: string
  status: 'Approved' | 'Pending' | 'Rejected'
  timestamp?: string
  comments?: string
}

interface PersonalLeaveRecord {
  id: string
  leaveType: string
  startDate: string
  endDate: string
  daysCount: number
  reason: string
  handoverOfficer: string
  appliedOn: string
  status: 'Approved' | 'Pending Level 1' | 'Pending Level 2' | 'Rejected'
  approvalSummary: string
  timelineSteps: TimelineStep[]
}

const INITIAL_LEAVE_HISTORY: PersonalLeaveRecord[] = [
  {
    id: 'LV-2026-094',
    leaveType: 'Annual Leave',
    startDate: '2026-07-15',
    endDate: '2026-07-16',
    daysCount: 2,
    reason: 'Family personal commitments in outstation',
    handoverOfficer: 'Ruwan Kumara (Accountant)',
    appliedOn: '2026-07-09',
    status: 'Pending Level 1',
    approvalSummary: 'Line Supervisor review in progress',
    timelineSteps: [
      {
        level: 'Submission',
        roleName: 'Applicant Officer',
        approverName: 'Kasun Perera (PS-EMP-0012)',
        status: 'Approved',
        timestamp: '2026-07-09 • 09:15 AM',
        comments: 'Application submitted with acting officer handover details.'
      },
      {
        level: 'Level 1',
        roleName: 'Line Supervisor / Engineer',
        approverName: 'Eng. S. Bandara',
        status: 'Pending',
        comments: 'Awaiting supervisor recommendation.'
      },
      {
        level: 'Level 2',
        roleName: 'Head of Department',
        approverName: 'Chief Revenue Officer',
        status: 'Pending'
      },
      {
        level: 'Level 3',
        roleName: 'Secretary / HR',
        approverName: 'Municipal Secretary',
        status: 'Pending'
      }
    ]
  },
  {
    id: 'LV-2026-096',
    leaveType: 'Compensatory Leave (Comp-Off)',
    startDate: '2026-07-20',
    endDate: '2026-07-20',
    daysCount: 1,
    reason: 'Taking Compensatory Off in lieu of Saturday Weekend Duty worked on 2026-07-11 for Council Budget Preparation.',
    handoverOfficer: 'Ruwan Kumara (Accountant)',
    appliedOn: '2026-07-13',
    status: 'Approved',
    approvalSummary: 'Authorized by Secretary / HR (Comp-Off Ledger verified)',
    timelineSteps: [
      {
        level: 'Submission',
        roleName: 'Applicant Officer',
        approverName: 'Kasun Perera (PS-EMP-0012)',
        status: 'Approved',
        timestamp: '2026-07-13 • 11:15 AM',
        comments: 'Submitted with biometric reference for Saturday duty.'
      },
      {
        level: 'Level 1',
        roleName: 'Line Supervisor / Engineer',
        approverName: 'Eng. S. Bandara',
        status: 'Approved',
        timestamp: '2026-07-13 • 01:30 PM',
        comments: 'Saturday work confirmed.'
      },
      {
        level: 'Level 2',
        roleName: 'Head of Department',
        approverName: 'Chief Revenue Officer',
        status: 'Approved',
        timestamp: '2026-07-13 • 03:00 PM'
      },
      {
        level: 'Level 3',
        roleName: 'Secretary / HR',
        approverName: 'Municipal Secretary',
        status: 'Approved',
        timestamp: '2026-07-13 • 04:10 PM',
        comments: 'Comp-off ledger deducted.'
      }
    ]
  },
  {
    id: 'LV-2026-071',
    leaveType: 'Casual Leave',
    startDate: '2026-06-28',
    endDate: '2026-06-28',
    daysCount: 1,
    reason: 'Attending bank legal appointment',
    handoverOfficer: 'Nimali Fernando (Clerk)',
    appliedOn: '2026-06-24',
    status: 'Approved',
    approvalSummary: 'Authorized by Secretary / HR',
    timelineSteps: [
      {
        level: 'Submission',
        roleName: 'Applicant Officer',
        approverName: 'Kasun Perera (PS-EMP-0012)',
        status: 'Approved',
        timestamp: '2026-06-24 • 10:30 AM',
        comments: 'Application submitted.'
      },
      {
        level: 'Level 1',
        roleName: 'Line Supervisor / Engineer',
        approverName: 'Eng. S. Bandara',
        status: 'Approved',
        timestamp: '2026-06-24 • 02:15 PM',
        comments: 'Handover officer confirmed.'
      },
      {
        level: 'Level 2',
        roleName: 'Head of Department',
        approverName: 'Chief Revenue Officer',
        status: 'Approved',
        timestamp: '2026-06-25 • 09:00 AM',
        comments: 'Department quota verified.'
      },
      {
        level: 'Level 3',
        roleName: 'Secretary / HR',
        approverName: 'Municipal Secretary',
        status: 'Approved',
        timestamp: '2026-06-25 • 11:45 AM',
        comments: 'Final authorization locked into timecard.'
      }
    ]
  },
  {
    id: 'LV-2026-048',
    leaveType: 'Medical Leave',
    startDate: '2026-05-12',
    endDate: '2026-05-13',
    daysCount: 2,
    reason: 'Viral flu and doctor recommended bed rest',
    handoverOfficer: 'Ruwan Kumara (Accountant)',
    appliedOn: '2026-05-11',
    status: 'Approved',
    approvalSummary: 'Authorized by Secretary / HR (Medical Cert attached)',
    timelineSteps: [
      {
        level: 'Submission',
        roleName: 'Applicant Officer',
        approverName: 'Kasun Perera (PS-EMP-0012)',
        status: 'Approved',
        timestamp: '2026-05-11 • 08:30 AM',
        comments: 'Medical certificate uploaded.'
      },
      {
        level: 'Level 1',
        roleName: 'Line Supervisor / Engineer',
        approverName: 'Eng. S. Bandara',
        status: 'Approved',
        timestamp: '2026-05-11 • 10:10 AM',
        comments: 'Medical leave noted.'
      },
      {
        level: 'Level 2',
        roleName: 'Head of Department',
        approverName: 'Chief Revenue Officer',
        status: 'Approved',
        timestamp: '2026-05-11 • 11:30 AM'
      },
      {
        level: 'Level 3',
        roleName: 'Secretary / HR',
        approverName: 'Municipal Secretary',
        status: 'Approved',
        timestamp: '2026-05-11 • 02:00 PM',
        comments: 'Medical certificate verified.'
      }
    ]
  },
  {
    id: 'LV-2026-022',
    leaveType: 'Annual Leave',
    startDate: '2026-03-04',
    endDate: '2026-03-06',
    daysCount: 3,
    reason: 'Annual family pilgrimage',
    handoverOfficer: 'Nimali Fernando (Clerk)',
    appliedOn: '2026-02-25',
    status: 'Approved',
    approvalSummary: 'Authorized by Secretary / HR',
    timelineSteps: [
      {
        level: 'Submission',
        roleName: 'Applicant Officer',
        approverName: 'Kasun Perera (PS-EMP-0012)',
        status: 'Approved',
        timestamp: '2026-02-25 • 09:00 AM'
      },
      {
        level: 'Level 1',
        roleName: 'Line Supervisor / Engineer',
        approverName: 'Eng. S. Bandara',
        status: 'Approved',
        timestamp: '2026-02-25 • 01:20 PM'
      },
      {
        level: 'Level 2',
        roleName: 'Head of Department',
        approverName: 'Chief Revenue Officer',
        status: 'Approved',
        timestamp: '2026-02-26 • 10:00 AM'
      },
      {
        level: 'Level 3',
        roleName: 'Secretary / HR',
        approverName: 'Municipal Secretary',
        status: 'Approved',
        timestamp: '2026-02-26 • 03:15 PM'
      }
    ]
  }
]

const getStatusBadgeClass = (status: string) => {
  if (status === 'Approved') {
    return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
  }
  if (status.includes('Pending')) {
    return 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
  }
  return 'bg-rose-100 text-rose-800 border border-rose-200'
}

const getTimelineCircleClass = (status: string) => {
  if (status === 'Approved') {
    return 'bg-emerald-500 border-emerald-600 text-white'
  }
  if (status === 'Pending') {
    return 'bg-amber-400 border-amber-500 text-white animate-pulse'
  }
  return 'bg-rose-500 border-rose-600 text-white'
}

const getTimelineStatusBadgeClass = (status: string) => {
  if (status === 'Approved') {
    return 'bg-emerald-100 text-emerald-800'
  }
  if (status === 'Pending') {
    return 'bg-amber-100 text-amber-800'
  }
  return 'bg-rose-100 text-rose-800'
}

export const MyLeavePage: React.FC = () => {
  const [history, setHistory] = useState<PersonalLeaveRecord[]>(INITIAL_LEAVE_HISTORY)
  const [isApplying, setIsApplying] = useState(false)
  const [selectedRecordForTimeline, setSelectedRecordForTimeline] = useState<PersonalLeaveRecord | null>(null)
  const [filterType, setFilterType] = useState('All')

  // Form states for Apply Leave inline
  const [leaveType, setLeaveType] = useState('Annual Leave')
  const [startDate, setStartDate] = useState('2026-07-20')
  const [endDate, setEndDate] = useState('2026-07-21')
  const [daysCount, setDaysCount] = useState(2)
  const [reason, setReason] = useState('')
  const [handoverOfficer, setHandoverOfficer] = useState('Ruwan Kumara (Accountant)')

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const array = new Uint32Array(1)
    window.crypto.getRandomValues(array)
    const randomSuffix = 100 + (array[0] % 900)

    const newRecord: PersonalLeaveRecord = {
      id: `LV-2026-${randomSuffix}`,
      leaveType,
      startDate,
      endDate,
      daysCount,
      reason: reason || 'Personal reasons',
      handoverOfficer,
      appliedOn: 'Just now',
      status: 'Pending Level 1',
      approvalSummary: 'Line Supervisor review in progress',
      timelineSteps: [
        {
          level: 'Submission',
          roleName: 'Applicant Officer',
          approverName: 'Kasun Perera (PS-EMP-0012)',
          status: 'Approved',
          timestamp: 'Just now',
          comments: 'Application submitted.'
        },
        {
          level: 'Level 1',
          roleName: 'Line Supervisor / Engineer',
          approverName: 'Eng. S. Bandara',
          status: 'Pending',
          comments: 'Awaiting line manager recommendation.'
        },
        {
          level: 'Level 2',
          roleName: 'Head of Department',
          approverName: 'Chief Revenue Officer',
          status: 'Pending'
        },
        {
          level: 'Level 3',
          roleName: 'Secretary / HR',
          approverName: 'Municipal Secretary',
          status: 'Pending'
        }
      ]
    }
    setHistory([newRecord, ...history])
    setIsApplying(false)
    setReason('')
  }

  const filteredHistory = history.filter((item) => {
    if (filterType === 'All') return true
    if (filterType === 'Pending') return item.status.includes('Pending')
    if (filterType === 'Approved') return item.status === 'Approved'
    return true
  })

  return (
    <div className="space-y-6 text-left pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">My Leave & Applications</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            View your personal leave entitlement balances, submit new leave applications, and track approval status.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsApplying(!isApplying)}
            className={`w-full sm:w-auto justify-center px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-md transition flex items-center space-x-2 cursor-pointer ${
              isApplying
                ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 shrink-0">
              {isApplying ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </>
              )}
            </svg>
            <span>{isApplying ? 'Close Application Form' : 'Apply for Leave'}</span>
          </button>
        </div>
      </div>

      {/* Logged-In Officer Summary Card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-base border border-blue-100">
            KP
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-gray-900">Kasun Perera</h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Permanent Staff
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              ID: PS-EMP-0012 • Senior Revenue Inspector • Revenue & Finance Department
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-semibold text-gray-600 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
          <div>
            Total Leaves Taken: <span className="font-extrabold text-gray-900">6 Days</span>
          </div>
          <div>
            Pending Applications: <span className="font-extrabold text-amber-600">1 Request</span>
          </div>
        </div>
      </div>

      {/* Quota Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-5 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Casual Leave</span>
            <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">Annual</span>
          </div>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-3xl font-extrabold text-gray-900">10</span>
            <span className="text-sm font-medium text-gray-500">/ 14 days left</span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: '71%' }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Annual Leave</span>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">Annual</span>
          </div>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-3xl font-extrabold text-gray-900">9</span>
            <span className="text-sm font-medium text-gray-500">/ 14 days left</span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: '64%' }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Medical Leave</span>
            <span className="text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">Medical</span>
          </div>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-3xl font-extrabold text-gray-900">19</span>
            <span className="text-sm font-medium text-gray-500">/ 21 days left</span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full" style={{ width: '90%' }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Duty Leave</span>
            <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">Official</span>
          </div>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-3xl font-extrabold text-gray-900">8</span>
            <span className="text-sm font-medium text-gray-500">/ 10 days left</span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-600 h-full rounded-full" style={{ width: '80%' }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-indigo-200 bg-indigo-50/20 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Comp-Off</span>
            <span className="text-xs font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md">Earned</span>
          </div>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-3xl font-extrabold text-gray-900">5</span>
            <span className="text-sm font-medium text-gray-500">/ 6 earned left</span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: '83%' }} />
          </div>
        </div>
      </div>

      {/* Popup Modal Apply for Leave Overlay */}
      {isApplying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  New Leave Submission
                </span>
                <h2 className="text-lg font-bold text-gray-900 mt-0.5">Submit Application for Approval</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsApplying(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="leave-category" className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                    Leave Category
                  </label>
                  <select
                    id="leave-category"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-bold text-gray-800"
                  >
                    <option value="Annual Leave">Annual Leave (9 available)</option>
                    <option value="Casual Leave">Casual Leave (10 available)</option>
                    <option value="Medical Leave">Medical Leave (19 available)</option>
                    <option value="Duty Leave">Duty Leave</option>
                    <option value="Compensatory Leave (Comp-Off)">Compensatory Leave (Comp-Off - Earned from Weekend/OT)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="start-date" className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="start-date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-800"
                  />
                </div>
                <div>
                  <label htmlFor="end-date" className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="end-date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="days-count" className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                    Number of Days
                  </label>
                  <input
                    type="number"
                    id="days-count"
                    min={0.5}
                    step={0.5}
                    value={daysCount}
                    onChange={(e) => setDaysCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-extrabold text-blue-700"
                  />
                </div>
                <div>
                  <label htmlFor="handover-officer" className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                    Acting Officer / Handover Duty
                  </label>
                  <input
                    type="text"
                    id="handover-officer"
                    value={handoverOfficer}
                    onChange={(e) => setHandoverOfficer(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="leave-reason" className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                  Reason for Leave
                </label>
                <textarea
                  id="leave-reason"
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Briefly describe reason for leave..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-800"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsApplying(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md transition"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leaves Taken / Requested Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">All Leaves Taken & Applications</h3>
            <p className="text-xs text-gray-500">
              Complete history of approved leave days taken and applications currently under review
            </p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
            {['All', 'Pending', 'Approved'].map((f) => (
              <button
                type="button"
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterType === f
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch]">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                <th className="py-3.5 px-5">Leave ID & Applied Date</th>
                <th className="py-3.5 px-4">Leave Category</th>
                <th className="py-3.5 px-4">Duration & Dates</th>
                <th className="py-3.5 px-4">Reason & Handover Officer</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Approval Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredHistory.map((rec) => (
                <tr key={rec.id} className="hover:bg-gray-50/60 transition">
                  <td className="py-4 px-5">
                    <div className="font-bold text-gray-900">{rec.id}</div>
                    <div className="text-xs text-gray-500">Applied: {rec.appliedOn}</div>
                  </td>

                  <td className="py-4 px-4">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 text-xs">
                      {rec.leaveType}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-bold text-gray-900">
                      {rec.daysCount} {rec.daysCount === 1 ? 'Day' : 'Days'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {rec.startDate} to {rec.endDate}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900 text-xs">{rec.reason}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">Handover: {rec.handoverOfficer}</div>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(rec.status)}`}
                    >
                      {rec.status}
                    </span>
                  </td>

                  <td className="py-4 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedRecordForTimeline(rec)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition shadow-2xs"
                      title="View Multi-Level Approval Timeline"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <span>Timeline</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Timeline Popup Modal */}
      {selectedRecordForTimeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                    {selectedRecordForTimeline.leaveType}
                  </span>
                  <span className="text-xs font-semibold text-gray-500">
                    {selectedRecordForTimeline.daysCount} {selectedRecordForTimeline.daysCount === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mt-1.5">
                  Approval Timeline • {selectedRecordForTimeline.id}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecordForTimeline(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition font-bold"
              >
                ✕
              </button>
            </div>

            {/* Leave summary header */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs space-y-1.5 text-gray-700">
              <div>
                <strong className="text-gray-900">Dates Requested:</strong> {selectedRecordForTimeline.startDate} to {selectedRecordForTimeline.endDate}
              </div>
              <div>
                <strong className="text-gray-900">Reason:</strong> {selectedRecordForTimeline.reason}
              </div>
              <div>
                <strong className="text-gray-900">Handover Officer:</strong> {selectedRecordForTimeline.handoverOfficer}
              </div>
            </div>

            {/* Vertical Multi-Level Timeline */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {selectedRecordForTimeline.timelineSteps.map((step, idx) => (
                <div key={idx} className="relative">
                  {/* Circle Indicator */}
                  <div
                    className={`absolute -left-[23px] top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${getTimelineCircleClass(step.status)}`}
                  >
                    {step.status === 'Approved' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-3 h-3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>

                  {/* Content Box */}
                  <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">
                        {step.level} • {step.roleName}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${getTimelineStatusBadgeClass(step.status)}`}
                      >
                        {step.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 font-medium">{step.approverName}</div>
                    {step.timestamp && (
                      <div className="text-[11px] text-gray-400">{step.timestamp}</div>
                    )}
                    {step.comments && (
                      <div className="text-xs italic text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-200/80 mt-1.5">
                        "{step.comments}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setSelectedRecordForTimeline(null)}
                className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition shadow-sm"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

