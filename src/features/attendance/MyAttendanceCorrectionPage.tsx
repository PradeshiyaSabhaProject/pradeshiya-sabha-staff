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
        timestamp: '2026-07-09 • 08:45 AM',
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
    id: 'COR-2026-085',
    targetDate: '2026-07-04',
    correctionType: 'Weekend Duty Regularization (Sat/Sun Work)',
    proposedIn: '08:30 AM',
    proposedOut: '02:30 PM',
    reason: 'Saturday Special Weekend Duty for emergency rate assessment & council budget preparation',
    appliedOn: '2026-07-05',
    status: 'Approved',
    timelineSteps: [
      {
        level: 'Submission',
        roleName: 'Applicant Officer',
        approverName: 'Kasun Perera (PS-EMP-0012)',
        status: 'Approved',
        timestamp: '2026-07-05 • 09:15 AM',
        comments: 'Submitted with Chairman approval note for Saturday duty.'
      },
      {
        level: 'Level 1',
        roleName: 'Chief Revenue Officer',
        approverName: 'Mr. H. Dissanayake',
        status: 'Approved',
        timestamp: '2026-07-05 • 11:30 AM',
        comments: 'Saturday attendance verified.'
      },
      {
        level: 'Level 2',
        roleName: 'Secretary / HR',
        approverName: 'Municipal Secretary',
        status: 'Approved',
        timestamp: '2026-07-05 • 02:00 PM',
        comments: 'Comp-off eligibility recorded.'
      }
    ]
  },
  {
    id: 'COR-2026-088',
    targetDate: '2026-07-06',
    correctionType: 'Overtime Authorization (>04:30 PM)',
    proposedIn: '08:18 AM',
    proposedOut: '06:00 PM',
    reason: 'Authorized Overtime (+1h 30m) for finalizing monthly tax revenue report before deadline',
    appliedOn: '2026-07-07',
    status: 'Approved',
    timelineSteps: [
      {
        level: 'Submission',
        roleName: 'Applicant Officer',
        approverName: 'Kasun Perera (PS-EMP-0012)',
        status: 'Approved',
        timestamp: '2026-07-07 • 08:30 AM'
      },
      {
        level: 'Level 1',
        roleName: 'Chief Revenue Officer',
        approverName: 'Mr. H. Dissanayake',
        status: 'Approved',
        timestamp: '2026-07-07 • 10:15 AM',
        comments: 'Overtime hours confirmed.'
      },
      {
        level: 'Level 2',
        roleName: 'Secretary / HR',
        approverName: 'Municipal Secretary',
        status: 'Approved',
        timestamp: '2026-07-07 • 11:00 AM',
        comments: 'Added to overtime payroll calculation.'
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
        timestamp: '2026-06-20 • 09:10 AM',
        comments: 'Submitted duty pass letter.'
      },
      {
        level: 'Level 1',
        roleName: 'Line Supervisor / Engineer',
        approverName: 'Eng. S. Bandara',
        status: 'Approved',
        timestamp: '2026-06-20 • 11:15 AM',
        comments: 'Field duty attendance verified.'
      },
      {
        level: 'Level 2',
        roleName: 'Secretary / HR',
        approverName: 'Municipal Secretary',
        status: 'Approved',
        timestamp: '2026-06-21 • 10:00 AM',
        comments: 'Timecard regularized.'
      }
    ]
  }
]

const getStatusBadgeClass = (status: string) => {
  if (status === 'Approved') {
    return 'bg-emerald-100 text-emerald-800 border-emerald-300'
  }
  if (status.includes('Pending')) {
    return 'bg-amber-100 text-amber-800 border-amber-300'
  }
  return 'bg-red-100 text-red-700 border-red-300'
}

const getTimelineCircleClass = (status: string) => {
  if (status === 'Approved') {
    return 'bg-emerald-600 border-emerald-700 text-white'
  }
  if (status === 'Pending') {
    return 'bg-amber-500 border-amber-600 text-white'
  }
  return 'bg-red-600 border-red-700 text-white'
}

const getTimelineStatusBadgeClass = (status: string) => {
  if (status === 'Approved') return 'bg-emerald-100 text-emerald-800 border-emerald-300'
  if (status === 'Pending') return 'bg-amber-100 text-amber-800 border-amber-300'
  return 'bg-red-100 text-red-700 border-red-300'
}

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

    const array = new Uint32Array(1)
    window.crypto.getRandomValues(array)
    const randomSuffix = 100 + (array[0] % 900)

    const newRec: AttendanceCorrectionRecord = {
      id: `COR-2026-${randomSuffix}`,
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
    <div className="space-y-6 text-left pb-8 animate-fade-in">
      {/* ── 1. Top Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            My Attendance Corrections
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Request regularization for missed biometric punches, machine malfunctions, or official field duties.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsApplying(true)}
          className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Request Correction</span>
        </button>
      </div>

      {/* ── 2. Officer Details Card (Overview Style) ──────────────────── */}
      <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded bg-blue-50 text-[#1e3a8a] font-bold flex items-center justify-center text-sm border border-blue-200 shrink-0 font-mono uppercase">
            KP
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-gray-900 uppercase">Kasun Perera</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border bg-emerald-100 text-emerald-800 border-emerald-300">
                Permanent Staff
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              <span className="font-mono font-bold text-gray-700">PS-EMP-0012</span> • Senior Revenue Inspector • Revenue &amp; Finance Department
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-semibold text-gray-600 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-200">
          <div>
            Total Requests: <span className="font-extrabold text-gray-900">{history.length}</span>
          </div>
          <div>
            Pending Approval: <span className="font-extrabold text-amber-700">{history.filter((r) => r.status.includes('Pending')).length}</span>
          </div>
          <div>
            Approved: <span className="font-extrabold text-emerald-700">{history.filter((r) => r.status === 'Approved').length}</span>
          </div>
        </div>
      </div>

      {/* ── 3. Corrections Table Card (Overview Table Style) ──────────── */}
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide">
              Attendance Regularization Ledger
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              History of regularization requests submitted for missed punches and field duty
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {['All', 'Pending', 'Approved'].map((f) => (
              <button
                type="button"
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
                  filterType === f
                    ? 'bg-[#A31736] text-white border-[#A31736] shadow-xs'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto flex-1 relative [-webkit-overflow-scrolling:touch]">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-gray-100 border-y border-gray-300 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6">REQUEST ID &amp; SUBMITTED</th>
                <th className="py-3 px-4 sm:px-6">TARGET DATE &amp; TYPE</th>
                <th className="py-3 px-4 sm:px-6">PROPOSED TIMES</th>
                <th className="py-3 px-4 sm:px-6">REASON / REFERENCE</th>
                <th className="py-3 px-4 sm:px-6 text-center">STATUS</th>
                <th className="py-3 px-4 sm:px-6 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredHistory.map((rec) => (
                <tr key={rec.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="py-3 px-4 sm:px-6 font-mono text-xs whitespace-nowrap">
                    <div className="font-bold text-gray-900">{rec.id}</div>
                    <div className="text-[11px] text-gray-500">Applied: {rec.appliedOn}</div>
                  </td>

                  <td className="py-3 px-4 sm:px-6 whitespace-nowrap">
                    <div className="font-bold text-gray-900 text-xs">{rec.targetDate}</div>
                    <span className="inline-block mt-0.5 text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border bg-blue-50 text-[#1e3a8a] border-blue-200">
                      {rec.correctionType}
                    </span>
                  </td>

                  <td className="py-3 px-4 sm:px-6 text-xs whitespace-nowrap">
                    <div className="font-semibold text-gray-900">In: {rec.proposedIn}</div>
                    <div className="font-semibold text-gray-600">Out: {rec.proposedOut}</div>
                  </td>

                  <td className="py-3 px-4 sm:px-6 max-w-xs text-xs text-gray-800">
                    <div className="truncate">{rec.reason}</div>
                  </td>

                  <td className="py-3 px-4 sm:px-6 text-center whitespace-nowrap">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide inline-block border ${getStatusBadgeClass(
                        rec.status
                      )}`}
                    >
                      {rec.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSelectedRecordForTimeline(rec)}
                      className="border border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white transition-all text-xs font-semibold px-3 py-1 rounded bg-white shadow-xs cursor-pointer uppercase tracking-wider"
                    >
                      Timeline
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Attendance Correction Modal */}
      {isApplying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white border border-gray-300 rounded shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden text-left">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide">
                  Request Attendance Correction
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Submit manual punch regularization for supervisor approval</p>
              </div>
              <button
                type="button"
                onClick={() => setIsApplying(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="target-date" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Target Date of Punch
                  </label>
                  <input
                    type="date"
                    id="target-date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#1e3a8a]"
                  />
                </div>

                <div>
                  <label htmlFor="corr-type" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Correction Type
                  </label>
                  <select
                    id="corr-type"
                    value={correctionType}
                    onChange={(e) => setCorrectionType(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-gray-300 bg-white text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#1e3a8a]"
                  >
                    <option value="Missed Check-Out Punch">Missed Check-Out Punch</option>
                    <option value="Missed Check-In Punch">Missed Check-In Punch</option>
                    <option value="Biometric Scanner Malfunction">Biometric Scanner Malfunction</option>
                    <option value="Official Field Duty / Outside Duty">Official Field Duty / Outside Duty</option>
                    <option value="Weekend Duty Regularization (Sat/Sun Work)">Weekend Duty Regularization (Sat/Sun Work)</option>
                    <option value="Overtime Authorization (>04:30 PM)">Overtime Authorization (&gt;04:30 PM)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="proposed-in" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Proposed Check-In Time
                  </label>
                  <input
                    type="time"
                    id="proposed-in"
                    value={proposedIn}
                    onChange={(e) => setProposedIn(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#1e3a8a]"
                  />
                </div>
                <div>
                  <label htmlFor="proposed-out" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Proposed Check-Out Time
                  </label>
                  <input
                    type="time"
                    id="proposed-out"
                    value={proposedOut}
                    onChange={(e) => setProposedOut(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#1e3a8a]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reason-explain" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Reason / Explanation
                </label>
                <textarea
                  id="reason-explain"
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide brief explanation or mention supervisor / field duty reference..."
                  className="w-full px-3 py-2 rounded border border-gray-300 text-xs text-gray-800 focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsApplying(false)}
                  className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold px-3.5 py-1.5 rounded border border-gray-300 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer"
                >
                  Submit Correction Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approval Timeline Modal */}
      {selectedRecordForTimeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white border border-gray-300 rounded shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide">
                  Approval Timeline • {selectedRecordForTimeline.id}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">{selectedRecordForTimeline.correctionType} — {selectedRecordForTimeline.targetDate}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecordForTimeline(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-gray-50 p-4 rounded border border-gray-200 text-xs space-y-1.5 text-gray-700">
                <div>
                  <strong className="text-gray-900 uppercase text-[11px] tracking-wider">Target Date:</strong> {selectedRecordForTimeline.targetDate}
                </div>
                <div>
                  <strong className="text-gray-900 uppercase text-[11px] tracking-wider">Proposed Times:</strong> In ({selectedRecordForTimeline.proposedIn}) — Out ({selectedRecordForTimeline.proposedOut})
                </div>
                <div>
                  <strong className="text-gray-900 uppercase text-[11px] tracking-wider">Reason:</strong> {selectedRecordForTimeline.reason}
                </div>
              </div>

              {/* Vertical Timeline Steps */}
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {selectedRecordForTimeline.timelineSteps.map((step) => (
                  <div key={`${step.level}-${step.roleName}`} className="relative">
                    <div
                      className={`absolute -left-[23px] top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${getTimelineCircleClass(step.status)}`}
                    >
                      {step.status === 'Approved' ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-3 h-3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>

                    <div className="bg-white rounded border border-gray-300 p-3.5 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 uppercase">
                          {step.level} • {step.roleName}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${getTimelineStatusBadgeClass(step.status)}`}>
                          {step.status}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600 font-medium">{step.approverName}</div>
                      {step.timestamp && <div className="text-[11px] text-gray-400">{step.timestamp}</div>}
                      {step.comments && (
                        <div className="text-xs italic text-gray-700 bg-gray-50 p-2 rounded border border-gray-200 mt-1">
                          "{step.comments}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRecordForTimeline(null)}
                className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold px-4 py-1.5 rounded border border-gray-300 transition-colors uppercase tracking-wider cursor-pointer"
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

export default MyAttendanceCorrectionPage
