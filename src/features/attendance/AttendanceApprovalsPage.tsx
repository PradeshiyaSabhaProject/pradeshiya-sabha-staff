import React, { useState } from 'react'
import { useLeave } from '../../context/LeaveContext'
import type { LeaveRequest } from './data/mockAttendanceData'

type ApprovalStatus = 'Approved' | 'Pending' | 'Rejected'

interface CorrectionApprovalItem {
  id: string
  employeeName: string
  employeeId: string
  department: string
  avatarInitials: string
  targetDate: string
  correctionType: string
  proposedIn: string
  proposedOut: string
  reason: string
  appliedOn: string
  currentLevel: 1 | 2
  status: ApprovalStatus
  timelineSteps: {
    level: string
    roleName: string
    approverName: string
    status: ApprovalStatus
    timestamp?: string
    comments?: string
  }[]
}

const INITIAL_CORRECTION_QUEUE: CorrectionApprovalItem[] = [
  {
    id: 'COR-2026-081',
    employeeName: 'Kasun Perera',
    employeeId: 'PS-EMP-0012',
    department: 'Revenue & Finance Department',
    avatarInitials: 'KP',
    targetDate: '2026-07-08',
    correctionType: 'Missed Check-Out Punch',
    proposedIn: '08:24 AM',
    proposedOut: '04:35 PM',
    reason: 'Biometric scanner screen froze during evening exit at 4:35 PM',
    appliedOn: '2026-07-09 • 08:45 AM',
    currentLevel: 1,
    status: 'Pending',
    timelineSteps: [
      {
        level: 'Submission',
        roleName: 'Applicant Officer',
        approverName: 'Kasun Perera (PS-EMP-0012)',
        status: 'Approved',
        timestamp: '2026-07-09 • 08:45 AM'
      },
      {
        level: 'Level 1',
        roleName: 'Line Supervisor / Engineer',
        approverName: 'Eng. S. Bandara',
        status: 'Pending',
        comments: 'Pending supervisor review.'
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
    id: 'COR-2026-079',
    employeeName: 'Chaminda Rathnayake',
    employeeId: 'PS-EMP-0041',
    department: 'Public Health & Sanitation Department',
    avatarInitials: 'CR',
    targetDate: '2026-07-07',
    correctionType: 'Official Field Duty / Outside Duty',
    proposedIn: '08:30 AM',
    proposedOut: '04:30 PM',
    reason: 'Emergency dengue outbreak inspection team visit in South Ward 4',
    appliedOn: '2026-07-08 • 09:00 AM',
    currentLevel: 2,
    status: 'Pending',
    timelineSteps: [
      {
        level: 'Submission',
        roleName: 'Applicant Officer',
        approverName: 'Chaminda Rathnayake',
        status: 'Approved',
        timestamp: '2026-07-08 • 09:00 AM'
      },
      {
        level: 'Level 1',
        roleName: 'Line Supervisor / MOH',
        approverName: 'Medical Officer of Health',
        status: 'Approved',
        timestamp: '2026-07-08 • 11:15 AM',
        comments: 'Field duty verified via inspection logbook.'
      },
      {
        level: 'Level 2',
        roleName: 'Secretary / HR',
        approverName: 'Municipal Secretary',
        status: 'Pending'
      }
    ]
  }
]

const getTimelineCircleClass = (status: string) => {
  if (status === 'Approved') return 'bg-emerald-600 border-emerald-700 text-white'
  if (status === 'Pending') return 'bg-amber-500 border-amber-600 text-white'
  if (status === 'Rejected') return 'bg-red-600 border-red-700 text-white'
  return 'bg-gray-400 border-gray-500 text-white'
}

const getTimelineStatusBadgeClass = (status: string) => {
  if (status === 'Approved') return 'bg-emerald-100 text-emerald-800 border-emerald-300'
  if (status === 'Pending') return 'bg-amber-100 text-amber-800 border-amber-300'
  if (status === 'Rejected') return 'bg-red-100 text-red-700 border-red-300'
  return 'bg-gray-100 text-gray-700 border-gray-300'
}

export const AttendanceApprovalsPage: React.FC = () => {
  const { leaveRequests, approveLevel, rejectLevel } = useLeave()

  const [activeTab, setActiveTab] = useState<'leaves' | 'corrections'>('leaves')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All')
  const [departmentFilter, setDepartmentFilter] = useState('All')

  const [correctionQueue, setCorrectionQueue] = useState<CorrectionApprovalItem[]>(INITIAL_CORRECTION_QUEUE)

  // Rejection modal state
  const [rejectingLeaveItem, setRejectingLeaveItem] = useState<LeaveRequest | null>(null)
  const [rejectionReasonInput, setRejectionReasonInput] = useState('')

  // Timeline view item
  const [selectedLeaveForTimeline, setSelectedLeaveForTimeline] = useState<LeaveRequest | null>(null)
  const [selectedCorrectionTimeline, setSelectedCorrectionTimeline] = useState<CorrectionApprovalItem | null>(null)

  const filteredLeaveQueue = leaveRequests.filter((item) => {
    const matchesSearch =
      item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.leaveType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase())

    let matchesStatus = true
    if (statusFilter === 'Pending') matchesStatus = item.overallStatus.includes('Pending')
    else if (statusFilter === 'Approved') matchesStatus = item.overallStatus === 'Approved'
    else if (statusFilter === 'Rejected') matchesStatus = item.overallStatus.includes('Rejected') || item.overallStatus.includes('Unauthorized')

    const matchesDept = departmentFilter === 'All' || item.department.includes(departmentFilter.split(' ')[0])
    return matchesSearch && matchesStatus && matchesDept
  })

  const filteredCorrectionQueue = correctionQueue.filter((item) => {
    const matchesSearch =
      item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.correctionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter
    const matchesDept = departmentFilter === 'All' || item.department.includes(departmentFilter.split(' ')[0])
    return matchesSearch && matchesStatus && matchesDept
  })

  const handleApproveLeave = (item: LeaveRequest) => {
    const currentStep = item.approvalLevels.find((l) => l.status === 'Pending')
    const levelNum = currentStep ? currentStep.levelNumber : 1
    approveLevel(item.id, levelNum, 'Eng. S. Bandara (Line Manager)', 'Verified acting officer and department workload.')
  }

  const handleConfirmRejectLeave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectingLeaveItem) return

    const currentStep = rejectingLeaveItem.approvalLevels.find((l) => l.status === 'Pending')
    const levelNum = currentStep ? currentStep.levelNumber : 1

    rejectLevel(
      rejectingLeaveItem.id,
      levelNum,
      'Eng. S. Bandara (Line Manager)',
      rejectionReasonInput || 'Operational constraints during peak council audit.'
    )

    setRejectingLeaveItem(null)
    setRejectionReasonInput('')
  }

  const handleApproveCorrection = (id: string) => {
    setCorrectionQueue(
      correctionQueue.map((item) => {
        if (item.id !== id) return item
        return { ...item, status: 'Approved' }
      })
    )
  }

  const handleRejectCorrection = (id: string) => {
    setCorrectionQueue(
      correctionQueue.map((item) => {
        if (item.id !== id) return item
        return { ...item, status: 'Rejected' }
      })
    )
  }

  const pendingLeavesCount = leaveRequests.filter((i) => i.overallStatus.includes('Pending')).length
  const pendingCorrectionsCount = correctionQueue.filter((i) => i.status === 'Pending').length

  return (
    <div className="space-y-6 text-left pb-8 animate-fade-in">
      {/* ── 1. Top Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Manager &amp; Superior Approvals Queue
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Review, authorize, or reject staff leave requests and biometric attendance corrections.
          </p>
        </div>
      </div>

      {/* ── 2. Search & Filtering Toolbar (Overview Style) ────────────── */}
      <div className="bg-white border border-gray-300 rounded p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee name, ID, or request..."
            className="w-full pl-8 pr-3 py-1.5 rounded border border-gray-300 bg-white text-xs font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
          />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded border border-gray-300">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Dept:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-gray-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value="All">All Departments</option>
              <option value="Revenue & Finance Department">Revenue &amp; Finance</option>
              <option value="Administration & Council Registry">Administration</option>
              <option value="Works & Civil Engineering Department">Works &amp; Engineering</option>
              <option value="Public Health & Sanitation Department">Public Health</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((st) => (
              <button
                type="button"
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
                  statusFilter === st
                    ? 'bg-[#A31736] text-white border-[#A31736] shadow-xs'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {st === 'Rejected' ? 'Rejected / No-Pay' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. Queue Tabs Switcher ────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-gray-300 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('leaves')}
          className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border flex items-center gap-2 ${
            activeTab === 'leaves'
              ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          <span>Leave Applications</span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
            activeTab === 'leaves' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-800'
          }`}>
            {pendingLeavesCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('corrections')}
          className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border flex items-center gap-2 ${
            activeTab === 'corrections'
              ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          <span>Attendance Corrections</span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
            activeTab === 'corrections' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-800'
          }`}>
            {pendingCorrectionsCount}
          </span>
        </button>
      </div>

      {/* ── 4. Leave Applications Tab Content ─────────────────────────── */}
      {activeTab === 'leaves' && (
        <div className="space-y-3">
          {filteredLeaveQueue.length === 0 ? (
            <div className="bg-white border border-gray-300 rounded p-8 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              No leave applications match your search or filter criteria.
            </div>
          ) : (
            filteredLeaveQueue.map((item) => {
              const isPending = item.overallStatus.includes('Pending')
              const isApproved = item.overallStatus === 'Approved'
              const isRejected = item.overallStatus.includes('Rejected') || item.overallStatus.includes('Unauthorized')

              return (
                <div
                  key={item.id}
                  className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded bg-blue-50 text-[#1e3a8a] font-bold flex items-center justify-center text-xs border border-blue-200 shrink-0 uppercase font-mono">
                        {item.avatarInitials || item.employeeName.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-900 uppercase">{item.employeeName}</h3>
                          <span className="text-xs text-gray-500 font-mono">({item.employeeId})</span>
                          <span className="text-[11px] text-gray-700 font-medium bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                            {item.department}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border bg-blue-50 text-[#1e3a8a] border-blue-200">
                            {item.leaveType}
                          </span>
                          <span className="text-xs font-bold text-gray-800">
                            {item.daysCount} {item.daysCount === 1 ? 'Day' : 'Days'} ({item.startDate} to {item.endDate})
                          </span>
                          <span className="text-xs text-gray-500">• Applied: {item.appliedOn}</span>
                        </div>

                        <p className="text-xs text-gray-700 pt-0.5">
                          <strong className="text-gray-900">Reason:</strong> "{item.reason}"
                        </p>
                        {item.handoverOfficer && (
                          <p className="text-[11px] text-gray-500">
                            <strong className="text-gray-700">Acting Officer:</strong> {item.handoverOfficer}
                          </p>
                        )}
                        {item.rejectionReason && (
                          <p className="text-[11px] text-red-700 font-bold bg-red-50 p-1.5 rounded border border-red-200">
                            Rejection Remarks: {item.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-200">
                      <button
                        type="button"
                        onClick={() => setSelectedLeaveForTimeline(item)}
                        className="border border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white transition-all text-xs font-semibold px-3 py-1 rounded bg-white shadow-xs cursor-pointer uppercase tracking-wider"
                      >
                        Timeline
                      </button>

                      {isPending ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setRejectingLeaveItem(item)}
                            className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all text-xs font-semibold px-3 py-1 rounded bg-white shadow-xs cursor-pointer uppercase tracking-wider"
                          >
                            Reject (No-Pay)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApproveLeave(item)}
                            className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer"
                          >
                            Approve Leave
                          </button>
                        </>
                      ) : (
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded uppercase tracking-wide border ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : isRejected
                              ? 'bg-red-100 text-red-700 border-red-300'
                              : 'bg-gray-200 text-gray-700 border-gray-300'
                          }`}
                        >
                          {isApproved ? 'Authorized' : isRejected ? 'Unauthorized No-Pay' : 'Cancelled'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ── 5. Attendance Corrections Tab Content ─────────────────────── */}
      {activeTab === 'corrections' && (
        <div className="space-y-3">
          {filteredCorrectionQueue.length === 0 ? (
            <div className="bg-white border border-gray-300 rounded p-8 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              No correction requests match your search or filter criteria.
            </div>
          ) : (
            filteredCorrectionQueue.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded bg-amber-50 text-amber-800 font-bold flex items-center justify-center text-xs border border-amber-200 shrink-0 uppercase font-mono">
                      {item.avatarInitials}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900 uppercase">{item.employeeName}</h3>
                        <span className="text-xs text-gray-500 font-mono">({item.employeeId})</span>
                        <span className="text-[11px] text-gray-700 font-medium bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          {item.department}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border bg-amber-100 text-amber-800 border-amber-300">
                          {item.correctionType}
                        </span>
                        <span className="text-xs font-bold text-gray-800">Date: {item.targetDate}</span>
                        <span className="text-xs text-gray-500">• Applied: {item.appliedOn}</span>
                      </div>

                      <div className="text-xs font-semibold text-gray-800 pt-0.5">
                        Proposed Punches: <span className="text-emerald-700">In ({item.proposedIn})</span> —{' '}
                        <span className="text-[#1e3a8a]">Out ({item.proposedOut})</span>
                      </div>

                      <p className="text-xs text-gray-700">
                        <strong className="text-gray-900">Reason:</strong> "{item.reason}"
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-200">
                    <button
                      type="button"
                      onClick={() => setSelectedCorrectionTimeline(item)}
                      className="border border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white transition-all text-xs font-semibold px-3 py-1 rounded bg-white shadow-xs cursor-pointer uppercase tracking-wider"
                    >
                      Timeline
                    </button>

                    {item.status === 'Pending' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRejectCorrection(item.id)}
                          className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all text-xs font-semibold px-3 py-1 rounded bg-white shadow-xs cursor-pointer uppercase tracking-wider"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApproveCorrection(item.id)}
                          className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer"
                        >
                          Authorize
                        </button>
                      </>
                    ) : (
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded uppercase tracking-wide border ${
                          item.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-red-100 text-red-700 border-red-300'
                        }`}
                      >
                        {item.status === 'Approved' ? 'Regularized' : 'Rejected'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingLeaveItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white border border-gray-300 rounded shadow-xl max-w-md w-full overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">Reject Leave Application</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {rejectingLeaveItem.employeeName} ({rejectingLeaveItem.employeeId}) • {rejectingLeaveItem.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRejectingLeaveItem(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 p-3 rounded border border-red-200 text-xs text-red-800 space-y-1">
                <div className="font-bold uppercase tracking-wider">Notice on Superior Rejection:</div>
                <p>
                  Rejecting this request will automatically convert the absence period ({rejectingLeaveItem.startDate} to{' '}
                  {rejectingLeaveItem.endDate}, {rejectingLeaveItem.daysCount} days) into an{' '}
                  <strong>Unauthorized No-Pay Leave</strong>.
                </p>
              </div>

              <form onSubmit={handleConfirmRejectLeave} className="space-y-4">
                <div>
                  <label htmlFor="rejection-reason" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Rejection Reason / Superior Remarks
                  </label>
                  <textarea
                    id="rejection-reason"
                    rows={3}
                    required
                    placeholder="Explain why leave was rejected..."
                    value={rejectionReasonInput}
                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-gray-300 text-xs text-gray-800 focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setRejectingLeaveItem(null)}
                    className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold px-3.5 py-1.5 rounded border border-gray-300 transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-red-700 hover:bg-red-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Leave Approval Timeline Modal */}
      {selectedLeaveForTimeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white border border-gray-300 rounded shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide">
                  Approval Timeline • {selectedLeaveForTimeline.id}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedLeaveForTimeline.employeeName} • {selectedLeaveForTimeline.leaveType}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLeaveForTimeline(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {selectedLeaveForTimeline.approvalLevels.map((step) => (
                  <div key={`${step.levelNumber}-${step.roleName}`} className="relative">
                    <div
                      className={`absolute -left-[23px] top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${getTimelineCircleClass(
                        step.status
                      )}`}
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
                          Level {step.levelNumber} • {step.roleName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${getTimelineStatusBadgeClass(
                            step.status
                          )}`}
                        >
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
                onClick={() => setSelectedLeaveForTimeline(null)}
                className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold px-4 py-1.5 rounded border border-gray-300 transition-colors uppercase tracking-wider cursor-pointer"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Correction Timeline Modal */}
      {selectedCorrectionTimeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white border border-gray-300 rounded shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide">
                  Correction Timeline • {selectedCorrectionTimeline.id}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedCorrectionTimeline.employeeName} • {selectedCorrectionTimeline.correctionType}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCorrectionTimeline(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {selectedCorrectionTimeline.timelineSteps.map((step) => (
                  <div key={`${step.level}-${step.roleName}`} className="relative">
                    <div
                      className={`absolute -left-[23px] top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${getTimelineCircleClass(
                        step.status
                      )}`}
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
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${getTimelineStatusBadgeClass(
                            step.status
                          )}`}
                        >
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
                onClick={() => setSelectedCorrectionTimeline(null)}
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

export default AttendanceApprovalsPage
