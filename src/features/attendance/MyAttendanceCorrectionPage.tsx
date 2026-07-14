import React, { useState } from 'react'

interface TimelineStep {
  level: string
  roleName: string
  approverName: string
  status: 'Approved' | 'Pending' | 'Rejected'
  timestamp?: string
  comments?: string
}

interface AttendanceCorrectionRecord {
  id: string
  targetDate: string
  correctionType: string
  proposedIn: string
  proposedOut: string
  reason: string
  appliedOn: string
  status: 'Approved' | 'Pending Level 1' | 'Pending Level 2' | 'Rejected'
  timelineSteps: TimelineStep[]
}

const INITIAL_CORRECTIONS: AttendanceCorrectionRecord[] = [
  {
    id: 'COR-2026-081',
    targetDate: '2026-07-08',
    correctionType: 'Missed Check-Out Punch',
    proposedIn: '08:24 AM',
    proposedOut: '04:35 PM',
    reason: 'Biometric scanner screen froze during evening exit at 4:35 PM',
    appliedOn: '2026-07-09',
    status: 'Pending Level 1',
    timelineSteps: [
      {
        level: 'Submission',
        roleName: 'Applicant Officer',
        approverName: 'Kasun Perera (PS-EMP-0012)',
        status: 'Approved',
        timestamp: '2026-07-09 â€¢ 08:45 AM',
        comments: 'Correction request submitted with CCTV security desk reference.'
      },
      {
        level: 'Level 1',
        roleName: 'Line Supervisor / Engineer',
        approverName: 'Eng. S. Bandara',
        status: 'Pending',
        comments: 'Awaiting verification.'
      },
      {
        level: 'Level 2',
        roleName: 'Secretary / HR',
        approverName: 'Municipal Secretary',
        status: 'Pending'
      }
    ]
  },
  {
    id: 'COR-2026-052',
    targetDate: '2026-06-19',
    correctionType: 'Official Field Duty / Outside Duty',
    proposedIn: '08:30 AM',
    proposedOut: '04:30 PM',
    reason: 'Attending District Secretariat tax coordination meeting all day',
    appliedOn: '2026-06-20',
    status: 'Approved',
    timelineSteps: [
      {
        level: 'Submission',
        roleName: 'Applicant Officer',
        approverName: 'Kasun Perera (PS-EMP-0012)',
        status: 'Approved',
        timestamp: '2026-06-20 â€¢ 09:10 AM',
        comments: 'Submitted duty pass letter.'
      },
      {
        level: 'Level 1',
        roleName: 'Line Supervisor / Engineer',
        approverName: 'Eng. S. Bandara',
        status: 'Approved',
        timestamp: '2026-06-20 â€¢ 11:15 AM',
        comments: 'Field duty attendance verified.'
      },
      {
        level: 'Level 2',
        roleName: 'Secretary / HR',
        approverName: 'Municipal Secretary',
        status: 'Approved',
        timestamp: '2026-06-21 â€¢ 10:00 AM',
        comments: 'Timecard regularized.'
      }
    ]
  },
  {
    id: 'COR-2026-029',
    targetDate: '2026-05-04',
    correctionType: 'Missed Check-In Punch',
    proposedIn: '08:22 AM',
    proposedOut: '04:38 PM',
    reason: 'Power failure at main gate scanner during morning arrival',
    appliedOn: '2026-05-04',
    status: 'Approved',
    timelineSteps: [
      {
        level: 'Submission',
        roleName: 'Applicant Officer',
        approverName: 'Kasun Perera (PS-EMP-0012)',
        status: 'Approved',
        timestamp: '2026-05-04 â€¢ 10:00 AM'
      },
      {
        level: 'Level 1',
        roleName: 'Line Supervisor / Engineer',
        approverName: 'Eng. S. Bandara',
        status: 'Approved',
        timestamp: '2026-05-04 â€¢ 01:30 PM',
        comments: 'Security guard logbook confirmed arrival at 08:22 AM.'
      },
      {
        level: 'Level 2',
        roleName: 'Secretary / HR',
        approverName: 'Municipal Secretary',
        status: 'Approved',
        timestamp: '2026-05-05 â€¢ 09:20 AM'
      }
    ]
  }
]

export const MyAttendanceCorrectionPage: React.FC = () => {
  const [history, setHistory] = useState<AttendanceCorrectionRecord[]>(INITIAL_CORRECTIONS)
  const [isApplying, setIsApplying] = useState(false)
  const [selectedRecordForTimeline, setSelectedRecordForTimeline] = useState<AttendanceCorrectionRecord | null>(null)
  const [filterType, setFilterType] = useState('All')

  // Form state
  const [targetDate, setTargetDate] = useState('2026-07-09')
  const [correctionType, setCorrectionType] = useState('Missed Check-Out Punch')
  const [proposedIn, setProposedIn] = useState('08:30')
  const [proposedOut, setProposedOut] = useState('16:30')
  const [reason, setReason] = useState('')

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formattedIn = proposedIn ? `${proposedIn} AM` : '08:30 AM'
    const formattedOut = proposedOut ? `${proposedOut} PM` : '04:30 PM'

    const newRec: AttendanceCorrectionRecord = {
      id: `COR-2026-${Math.floor(100 + Math.random() * 900)}`,
      targetDate,
      correctionType,
      proposedIn: formattedIn,
      proposedOut: formattedOut,
      reason: reason || 'Hardware malfunction / missed punch',
      appliedOn: 'Just now',
      status: 'Pending Level 1',
      timelineSteps: [
        {
          level: 'Submission',
          roleName: 'Applicant Officer',
          approverName: 'Kasun Perera (PS-EMP-0012)',
          status: 'Approved',
          timestamp: 'Just now',
          comments: 'Attendance correction request submitted.'
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
          roleName: 'Secretary / HR',
          approverName: 'Municipal Secretary',
          status: 'Pending'
        }
      ]
    }

    setHistory([newRec, ...history])
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Attendance Corrections</h1>
          <p className="text-sm text-gray-500">
            Request regularization for missed biometric punches, machine malfunctions, or official field duties.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsApplying(true)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md transition flex items-center space-x-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Request Attendance Correction</span>
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
              ID: PS-EMP-0012 â€¢ Senior Revenue Inspector â€¢ Revenue & Finance Department
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-semibold text-gray-600 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
          <div>
            Total Correction Requests: <span className="font-extrabold text-gray-900">3</span>
          </div>
          <div>
            Pending Approval: <span className="font-extrabold text-amber-600">1 Request</span>
          </div>
        </div>
      </div>

      {/* Popup Modal Request Attendance Correction Form */}
      {isApplying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  New Regularization Submission
                </span>
                <h2 className="text-lg font-bold text-gray-900 mt-0.5">Request Attendance Correction</h2>
              </div>
              <button
                onClick={() => setIsApplying(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
              >
                âœ•
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                    Target Date of Punch
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                    Correction Type
                  </label>
                  <select
                    value={correctionType}
                    onChange={(e) => setCorrectionType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-bold text-gray-800"
                  >
                    <option value="Missed Check-Out Punch">Missed Check-Out Punch</option>
                    <option value="Missed Check-In Punch">Missed Check-In Punch</option>
                    <option value="Biometric Scanner Malfunction">Biometric Scanner Malfunction</option>
                    <option value="Official Field Duty / Outside Duty">Official Field Duty / Outside Duty</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                    Proposed Check-In Time
                  </label>
                  <input
                    type="time"
                    value={proposedIn}
                    onChange={(e) => setProposedIn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                    Proposed Check-Out Time
                  </label>
                  <input
                    type="time"
                    value={proposedOut}
                    onChange={(e) => setProposedOut(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                  Reason / Explanation
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide brief explanation or mention supervisor / field duty reference..."
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
                  Submit Correction Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Corrections Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">All Attendance Correction Requests</h3>
            <p className="text-xs text-gray-500">
              History of regularization requests submitted for missed punches and field duty
            </p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
            {['All', 'Pending', 'Approved'].map((f) => (
              <button
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                <th className="py-3.5 px-5">Request ID & Submitted</th>
                <th className="py-3.5 px-4">Target Date & Type</th>
                <th className="py-3.5 px-4">Proposed Times</th>
                <th className="py-3.5 px-4">Reason / Reference</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Timeline</th>
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
                    <div className="font-bold text-gray-900">{rec.targetDate}</div>
                    <span className="inline-block mt-1 font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 text-xs">
                      {rec.correctionType}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="text-xs font-semibold text-gray-900">In: {rec.proposedIn}</div>
                    <div className="text-xs font-semibold text-gray-600">Out: {rec.proposedOut}</div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900 text-xs max-w-xs">{rec.reason}</div>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        rec.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : rec.status.includes('Pending')
                          ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </td>

                  <td className="py-4 px-5 text-right">
                    <button
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
                    {selectedRecordForTimeline.correctionType}
                  </span>
                  <span className="text-xs font-semibold text-gray-500">
                    Date: {selectedRecordForTimeline.targetDate}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mt-1.5">
                  Approval Timeline â€¢ {selectedRecordForTimeline.id}
                </h2>
              </div>
              <button
                onClick={() => setSelectedRecordForTimeline(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition font-bold"
              >
                âœ•
              </button>
            </div>

            {/* Request summary header */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs space-y-1.5 text-gray-700">
              <div>
                <strong className="text-gray-900">Target Date:</strong> {selectedRecordForTimeline.targetDate}
              </div>
              <div>
                <strong className="text-gray-900">Proposed Times:</strong> In ({selectedRecordForTimeline.proposedIn}) â€” Out ({selectedRecordForTimeline.proposedOut})
              </div>
              <div>
                <strong className="text-gray-900">Reason:</strong> {selectedRecordForTimeline.reason}
              </div>
            </div>

            {/* Vertical Multi-Level Timeline */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {selectedRecordForTimeline.timelineSteps.map((step, idx) => (
                <div key={idx} className="relative">
                  {/* Circle Indicator */}
                  <div
                    className={`absolute -left-[23px] top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      step.status === 'Approved'
                        ? 'bg-emerald-500 border-emerald-600 text-white'
                        : step.status === 'Pending'
                        ? 'bg-amber-400 border-amber-500 text-white animate-pulse'
                        : 'bg-rose-500 border-rose-600 text-white'
                    }`}
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
                        {step.level} â€¢ {step.roleName}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          step.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : step.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
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

