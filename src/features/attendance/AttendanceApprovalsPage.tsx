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
  if (status === 'Approved') return 'bg-emerald-500 border-emerald-600 text-white'
  if (status === 'Pending') return 'bg-amber-400 border-amber-500 text-white animate-pulse'
  if (status === 'Rejected') return 'bg-rose-500 border-rose-600 text-white'
  return 'bg-gray-400 border-gray-500 text-white'
}

const getTimelineStatusBadgeClass = (status: string) => {
  if (status === 'Approved') return 'bg-emerald-100 text-emerald-800'
  if (status === 'Pending') return 'bg-amber-100 text-amber-800'
  if (status === 'Rejected') return 'bg-rose-100 text-rose-800'
  return 'bg-gray-100 text-gray-700'
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
    // Find current active level or default to level 1
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
    <div className="space-y-6 text-left pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manager & Superior Approvals Queue</h1>
          <p className="text-sm text-gray-500">
            Review, authorize, or reject staff leave requests and biometric attendance corrections. (Rejections convert leaves to Unauthorized No-Pay Leave).
          </p>
        </div>
      </div>

      {/* Search & Filtering Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee name, ID, or request type..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-semibold text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 outline-none transition"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto">
            {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((st) => (
              <button
                type="button"
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  statusFilter === st ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {st === 'Rejected' ? 'Rejected / No-Pay' : st}
              </button>
            ))}
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 outline-none"
          >
            <option value="All">All Departments</option>
            <option value="Revenue & Finance Department">Revenue & Finance Dept</option>
            <option value="Administration & Council Registry">Administration Dept</option>
            <option value="Works & Civil Engineering Department">Works & Engineering Dept</option>
            <option value="Public Health & Sanitation Department">Public Health Dept</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 space-x-6 sm:space-x-8 overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <button
          type="button"
          onClick={() => setActiveTab('leaves')}
          className={`pb-3.5 text-sm font-bold flex items-center space-x-2 transition border-b-2 ${
            activeTab === 'leaves' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Leave Applications Queue</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
              activeTab === 'leaves' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {pendingLeavesCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('corrections')}
          className={`pb-3.5 text-sm font-bold flex items-center space-x-2 transition border-b-2 ${
            activeTab === 'corrections' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Attendance Corrections</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
              activeTab === 'corrections' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {pendingCorrectionsCount}
          </span>
        </button>
      </div>

      {/* Leave Applications Tab Content */}
      {activeTab === 'leaves' && (
        <div className="space-y-4">
          {filteredLeaveQueue.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 text-sm font-semibold">
              No leave applications match your current search or filter criteria.
            </div>
          ) : (
            filteredLeaveQueue.map((item) => {
              const isPending = item.overallStatus.includes('Pending')
              const isApproved = item.overallStatus === 'Approved'
              const isRejected = item.overallStatus.includes('Rejected') || item.overallStatus.includes('Unauthorized')
              const isCancelled = item.overallStatus.includes('Cancelled')

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border p-6 transition shadow-xs ${
                    isApproved
                      ? 'border-emerald-200 bg-emerald-50/10'
                      : isRejected
                      ? 'border-rose-200 bg-rose-50/10'
                      : isCancelled
                      ? 'border-gray-200 bg-gray-50/50'
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 font-extrabold flex items-center justify-center text-base border border-blue-100 shrink-0">
                        {item.avatarInitials || item.employeeName.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-gray-900">{item.employeeName}</h3>
                          <span className="text-xs font-semibold text-gray-500">({item.employeeId})</span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                            {item.department}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="text-xs font-extrabold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg border border-blue-200">
                            {item.leaveType}
                          </span>
                          <span className="text-xs font-bold text-gray-800">
                            {item.daysCount} {item.daysCount === 1 ? 'Day' : 'Days'} ({item.startDate} to {item.endDate})
                          </span>
                          <span className="text-xs text-gray-400">• Applied: {item.appliedOn}</span>
                        </div>

                        <p className="text-xs text-gray-600 font-medium pt-1">
                          <strong className="text-gray-900">Reason:</strong> "{item.reason}"
                        </p>
                        {item.handoverOfficer && (
                          <p className="text-[11px] text-gray-500">
                            <strong className="text-gray-700">Acting Officer / Handover:</strong> {item.handoverOfficer}
                          </p>
                        )}
                        {item.rejectionReason && (
                          <p className="text-[11px] text-rose-700 font-bold bg-rose-50 p-1.5 rounded-md border border-rose-200">
                            Superior Rejection Remarks: {item.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 lg:justify-end shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100 w-full lg:w-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedLeaveForTimeline(item)}
                        className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span>Timeline</span>
                      </button>

                      {isPending ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setRejectingLeaveItem(item)}
                            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition text-center cursor-pointer"
                          >
                            ✕ Reject (No-Pay)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApproveLeave(item)}
                            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition text-center cursor-pointer"
                          >
                            ✓ Approve Leave
                          </button>
                        </>
                      ) : (
                        <span
                          className={`w-full sm:w-auto text-center px-4 py-2 rounded-xl text-xs font-extrabold ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : isRejected
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-gray-100 text-gray-700 border border-gray-300'
                          }`}
                        >
                          {isApproved ? '✓ Authorized Leave' : isRejected ? '⛔ Unauthorized No-Pay' : 'ℹ️ Cancelled'}
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

      {/* Attendance Corrections Tab Content */}
      {activeTab === 'corrections' && (
        <div className="space-y-4">
          {filteredCorrectionQueue.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-6 transition shadow-xs ${
                item.status === 'Approved'
                  ? 'border-emerald-200 bg-emerald-50/10'
                  : item.status === 'Rejected'
                  ? 'border-rose-200 bg-rose-50/10'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center text-base border border-amber-100 shrink-0">
                    {item.avatarInitials}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-gray-900">{item.employeeName}</h3>
                      <span className="text-xs font-semibold text-gray-500">({item.employeeId})</span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                        {item.department}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-xs font-extrabold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-200">
                        {item.correctionType}
                      </span>
                      <span className="text-xs font-bold text-gray-800">Date: {item.targetDate}</span>
                      <span className="text-xs text-gray-400">• Applied: {item.appliedOn}</span>
                    </div>

                    <div className="text-xs font-semibold text-gray-800 pt-1">
                      Proposed Punches: <span className="text-emerald-700">In ({item.proposedIn})</span> —{' '}
                      <span className="text-blue-700">Out ({item.proposedOut})</span>
                    </div>

                    <p className="text-xs text-gray-600 font-medium">
                      <strong className="text-gray-900">Reason:</strong> "{item.reason}"
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 lg:justify-end shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100 w-full lg:w-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedCorrectionTimeline(item)}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>Timeline</span>
                  </button>

                  {item.status === 'Pending' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleRejectCorrection(item.id)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition text-center cursor-pointer"
                      >
                        ✕ Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveCorrection(item.id)}
                        className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition text-center cursor-pointer"
                      >
                        ✓ Authorize Correction
                      </button>
                    </>
                  ) : (
                    <span
                      className={`w-full sm:w-auto text-center px-4 py-2 rounded-xl text-xs font-extrabold ${
                        item.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {item.status === 'Approved' ? '✓ Regularized' : '✕ Rejected'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Superior Rejection Modal (Converts to Unauthorized No-Pay Leave) */}
      {rejectingLeaveItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xl max-w-md w-full text-left space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center font-bold text-lg">
                ⛔
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Reject Leave Application</h3>
                <p className="text-xs text-gray-500">
                  {rejectingLeaveItem.employeeName} ({rejectingLeaveItem.employeeId}) • {rejectingLeaveItem.id}
                </p>
              </div>
            </div>

            <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1">
              <div className="font-bold">Notice on Superior Rejection:</div>
              <p>
                Rejecting this request will automatically convert the absence period ({rejectingLeaveItem.startDate} to{' '}
                {rejectingLeaveItem.endDate}, {rejectingLeaveItem.daysCount} days) into an{' '}
                <strong>Unauthorized No-Pay Leave</strong> subject to monthly salary deduction.
              </p>
            </div>

            <form onSubmit={handleConfirmRejectLeave} className="space-y-4">
              <div>
                <label htmlFor="rejection-reason" className="block text-xs font-semibold text-gray-700 mb-1">
                  Rejection Reason / Superior Remarks
                </label>
                <textarea
                  id="rejection-reason"
                  rows={3}
                  required
                  placeholder="Explain why leave was rejected (e.g., Unexcused absence during critical project deadline)..."
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingLeaveItem(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition"
                >
                  Confirm Rejection (Set No-Pay)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Approval Timeline Modal */}
      {selectedLeaveForTimeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                  Leave Approval Workflow
                </span>
                <h2 className="text-lg font-bold text-gray-900 mt-1.5">
                  {selectedLeaveForTimeline.employeeName} • {selectedLeaveForTimeline.leaveType} ({selectedLeaveForTimeline.id})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLeaveForTimeline(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition font-bold"
              >
                ✕
              </button>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {selectedLeaveForTimeline.approvalLevels.map((step) => (
                <div key={`${step.levelNumber}-${step.roleName}`} className="relative">
                  <div
                    className={`absolute -left-[23px] top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${getTimelineCircleClass(
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

                  <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">
                        Level {step.levelNumber} • {step.roleName}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${getTimelineStatusBadgeClass(
                          step.status
                        )}`}
                      >
                        {step.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 font-medium">{step.approverName}</div>
                    {step.timestamp && <div className="text-[11px] text-gray-400">{step.timestamp}</div>}
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
                onClick={() => setSelectedLeaveForTimeline(null)}
                className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition shadow-sm"
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
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                  Correction Workflow
                </span>
                <h2 className="text-lg font-bold text-gray-900 mt-1.5">
                  {selectedCorrectionTimeline.employeeName} • {selectedCorrectionTimeline.correctionType} ({selectedCorrectionTimeline.id})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCorrectionTimeline(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition font-bold"
              >
                ✕
              </button>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {selectedCorrectionTimeline.timelineSteps.map((step) => (
                <div key={`${step.level}-${step.roleName}`} className="relative">
                  <div
                    className={`absolute -left-[23px] top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${getTimelineCircleClass(
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

                  <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">
                        {step.level} • {step.roleName}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${getTimelineStatusBadgeClass(
                          step.status
                        )}`}
                      >
                        {step.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 font-medium">{step.approverName}</div>
                    {step.timestamp && <div className="text-[11px] text-gray-400">{step.timestamp}</div>}
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
                onClick={() => setSelectedCorrectionTimeline(null)}
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
