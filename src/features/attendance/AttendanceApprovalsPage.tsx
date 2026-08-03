import React, { useState } from 'react'

interface ApprovalTimelineStep {
  level: string
  roleName: string
  approverName: string
  status: 'Approved' | 'Pending' | 'Rejected'
  timestamp?: string
  comments?: string
}

interface LeaveApprovalItem {
  id: string
  employeeName: string
  employeeId: string
  department: string
  avatarInitials: string
  leaveType: string
  startDate: string
  endDate: string
  daysCount: number
  reason: string
  handoverOfficer: string
  appliedOn: string
  currentLevel: 1 | 2 | 3
  status: 'Pending' | 'Approved' | 'Rejected'
  timelineSteps: ApprovalTimelineStep[]
}

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
  status: 'Pending' | 'Approved' | 'Rejected'
  timelineSteps: ApprovalTimelineStep[]
}

const INITIAL_LEAVE_QUEUE: LeaveApprovalItem[] = [
  {
    id: 'LV-2026-094',
    employeeName: 'Kasun Perera',
    employeeId: 'PS-EMP-0012',
    department: 'Revenue & Finance Department',
    avatarInitials: 'KP',
    leaveType: 'Annual Leave',
    startDate: '2026-07-15',
    endDate: '2026-07-16',
    daysCount: 2,
    reason: 'Family personal commitments in outstation',
    handoverOfficer: 'Ruwan Kumara (Accountant)',
    appliedOn: '2026-07-09 • 09:15 AM',
    currentLevel: 1,
    status: 'Pending',
    timelineSteps: [
      {
        level: 'Submission',
        roleName: 'Applicant Officer',
        approverName: 'Kasun Perera (PS-EMP-0012)',
        status: 'Approved',
        timestamp: '2026-07-09 • 09:15 AM'
      },
      {
        level: 'Level 1',
        roleName: 'Line Supervisor / Engineer',
        approverName: 'Eng. S. Bandara',
        status: 'Pending',
        comments: 'Awaiting line supervisor review.'
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
    id: 'LV-2026-091',
    employeeName: 'Nimali Fernando',
    employeeId: 'PS-EMP-0019',
    department: 'Administration & Council Registry',
    avatarInitials: 'NF',
    leaveType: 'Casual Leave',
    startDate: '2026-07-14',
    endDate: '2026-07-14',
    daysCount: 1,
    reason: 'Personal banking and legal work',
    handoverOfficer: 'Chaminda Rathnayake (Clerk)',
    appliedOn: '2026-07-08 • 02:40 PM',
    currentLevel: 2,
    status: 'Pending',
    timelineSteps: [
      {
        level: 'Submission',
        roleName: 'Applicant Officer',
        approverName: 'Nimali Fernando (PS-EMP-0019)',
        status: 'Approved',
        timestamp: '2026-07-08 • 02:40 PM'
      },
      {
        level: 'Level 1',
        roleName: 'Line Supervisor / Engineer',
        approverName: 'Admin Officer',
        status: 'Approved',
        timestamp: '2026-07-08 • 04:10 PM',
        comments: 'Handover clerk verified. Recommended.'
      },
      {
        level: 'Level 2',
        roleName: 'Head of Department',
        approverName: 'Chief Admin Officer',
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
    id: 'LV-2026-088',
    employeeName: 'Eng. Samantha Bandara',
    employeeId: 'PS-EMP-0034',
    department: 'Works & Civil Engineering Department',
    avatarInitials: 'SB',
    leaveType: 'Duty Leave',
    startDate: '2026-07-16',
    endDate: '2026-07-17',
    daysCount: 2,
    reason: 'Attending Provincial Road Development workshop at Uva Province HQ',
    handoverOfficer: 'Tech Officer Silva',
    appliedOn: '2026-07-07 • 10:15 AM',
    currentLevel: 3,
    status: 'Pending',
    timelineSteps: [
      {
        level: 'Submission',
        roleName: 'Applicant Officer',
        approverName: 'Eng. Samantha Bandara',
        status: 'Approved',
        timestamp: '2026-07-07 • 10:15 AM'
      },
      {
        level: 'Level 1',
        roleName: 'Line Supervisor / Engineer',
        approverName: 'Works Superintendent',
        status: 'Approved',
        timestamp: '2026-07-07 • 11:30 AM'
      },
      {
        level: 'Level 2',
        roleName: 'Head of Department',
        approverName: 'Chief Engineer',
        status: 'Approved',
        timestamp: '2026-07-08 • 09:00 AM',
        comments: 'Official workshop invitation attached.'
      },
      {
        level: 'Level 3',
        roleName: 'Secretary / HR',
        approverName: 'Municipal Secretary',
        status: 'Pending'
      }
    ]
  }
]

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

export const AttendanceApprovalsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leaves' | 'corrections'>('leaves')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All')
  const [departmentFilter, setDepartmentFilter] = useState('All')

  const [leaveQueue, setLeaveQueue] = useState<LeaveApprovalItem[]>(INITIAL_LEAVE_QUEUE)
  const [correctionQueue, setCorrectionQueue] = useState<CorrectionApprovalItem[]>(INITIAL_CORRECTION_QUEUE)

  const filteredLeaveQueue = leaveQueue.filter((item) => {
    const matchesSearch =
      item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.leaveType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter
    const matchesDept = departmentFilter === 'All' || item.department === departmentFilter
    return matchesSearch && matchesStatus && matchesDept
  })

  const filteredCorrectionQueue = correctionQueue.filter((item) => {
    const matchesSearch =
      item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.correctionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter
    const matchesDept = departmentFilter === 'All' || item.department === departmentFilter
    return matchesSearch && matchesStatus && matchesDept
  })

  const [selectedTimelineItem, setSelectedTimelineItem] = useState<{
    id: string
    title: string
    steps: ApprovalTimelineStep[]
  } | null>(null)

  const handleApproveLeave = (id: string) => {
    setLeaveQueue(
      leaveQueue.map((item) => {
        if (item.id !== id) return item
        return {
          ...item,
          status: 'Approved'
        }
      })
    )
  }

  const handleRejectLeave = (id: string) => {
    setLeaveQueue(
      leaveQueue.map((item) => {
        if (item.id !== id) return item
        return {
          ...item,
          status: 'Rejected'
        }
      })
    )
  }

  const handleApproveCorrection = (id: string) => {
    setCorrectionQueue(
      correctionQueue.map((item) => {
        if (item.id !== id) return item
        return {
          ...item,
          status: 'Approved'
        }
      })
    )
  }

  const handleRejectCorrection = (id: string) => {
    setCorrectionQueue(
      correctionQueue.map((item) => {
        if (item.id !== id) return item
        return {
          ...item,
          status: 'Rejected'
        }
      })
    )
  }

  const pendingLeavesCount = leaveQueue.filter((i) => i.status === 'Pending').length
  const pendingCorrectionsCount = correctionQueue.filter((i) => i.status === 'Pending').length

  return (
    <div className="space-y-6 text-left pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Manager Approvals Queue
          </h1>
          <p className="text-sm text-gray-500">
            Review, authorize, or reject staff leave requests and biometric attendance corrections.
          </p>
        </div>


      </div>

      {/* Search & Filtering Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:max-w-md">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2">
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Status Pills */}
          <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto">
            {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((st) => (
              <button
                type="button"
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-white text-gray-900 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Department Select */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 outline-none"
          >
            <option value="All">All Departments</option>
            <option value="Revenue & Finance Department">Revenue & Finance Dept</option>
            <option value="Administration & Council Registry">Administration Dept</option>
            <option value="Works & Civil Engineering Department">Works & Civil Eng Dept</option>
            <option value="Public Health & Sanitation Department">Public Health Dept</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 space-x-6 sm:space-x-8 overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <button
          type="button"
          onClick={() => setActiveTab('leaves')}
          className={`pb-3.5 text-sm font-bold flex items-center space-x-2 transition border-b-2 ${activeTab === 'leaves'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
        >
          <span>Leave Applications</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${activeTab === 'leaves' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
              }`}
          >
            {pendingLeavesCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('corrections')}
          className={`pb-3.5 text-sm font-bold flex items-center space-x-2 transition border-b-2 ${activeTab === 'corrections'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
        >
          <span>Attendance Corrections</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${activeTab === 'corrections' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
              }`}
          >
            {pendingCorrectionsCount}
          </span>
        </button>
      </div>

      {/* Tab Content: Leave Applications */}
      {activeTab === 'leaves' && (
        <div className="space-y-4">
          {filteredLeaveQueue.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 text-sm font-semibold">
              No leave applications match your search or filters.
            </div>
          ) : (
            filteredLeaveQueue.map((item) => (
              <div
              key={item.id}
              className={`bg-white rounded-2xl border p-6 transition shadow-xs ${item.status === 'Approved'
                  ? 'border-emerald-200 bg-emerald-50/10'
                  : item.status === 'Rejected'
                    ? 'border-rose-200 bg-rose-50/10 opacity-70'
                    : 'border-gray-200 hover:border-blue-200'
                }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                {/* Employee info & Leave details */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-base border border-blue-100 shrink-0">
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
                    <p className="text-[11px] text-gray-500">
                      <strong className="text-gray-700">Acting Officer / Handover:</strong> {item.handoverOfficer}
                    </p>
                  </div>
                </div>

                {/* Manager actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 lg:justify-end shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100 w-full lg:w-auto">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedTimelineItem({
                        id: item.id,
                        title: `${item.employeeName} • ${item.leaveType}`,
                        steps: item.timelineSteps
                      })
                    }
                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition flex items-center justify-center space-x-1.5"
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
                        onClick={() => handleRejectLeave(item.id)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition text-center"
                      >
                        ✕ Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveLeave(item.id)}
                        className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition text-center"
                      >
                        ✓ Approve Request
                      </button>
                    </>
                  ) : (
                    <span
                      className={`w-full sm:w-auto text-center px-4 py-2 rounded-xl text-xs font-extrabold ${item.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                    >
                      {item.status === 'Approved' ? '✓ Authorized' : '✕ Rejected'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )))}
        </div>
      )}

      {/* Tab Content: Attendance Corrections */}
      {activeTab === 'corrections' && (
        <div className="space-y-4">
          {filteredCorrectionQueue.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 text-sm font-semibold">
              No attendance corrections match your search or filters.
            </div>
          ) : (
            filteredCorrectionQueue.map((item) => (
              <div
              key={item.id}
              className={`bg-white rounded-2xl border p-6 transition shadow-xs ${item.status === 'Approved'
                  ? 'border-emerald-200 bg-emerald-50/10'
                  : item.status === 'Rejected'
                    ? 'border-rose-200 bg-rose-50/10 opacity-70'
                    : 'border-gray-200 hover:border-blue-200'
                }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                {/* Employee info & Correction details */}
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

                {/* Manager actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 lg:justify-end shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100 w-full lg:w-auto">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedTimelineItem({
                        id: item.id,
                        title: `${item.employeeName} • ${item.correctionType}`,
                        steps: item.timelineSteps
                      })
                    }
                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition flex items-center justify-center space-x-1.5"
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
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition text-center"
                      >
                        ✕ Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveCorrection(item.id)}
                        className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition text-center"
                      >
                        ✓ Authorize Correction
                      </button>
                    </>
                  ) : (
                    <span
                      className={`w-full sm:w-auto text-center px-4 py-2 rounded-xl text-xs font-extrabold ${item.status === 'Approved'
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
          )))}
        </div>
      )}

      {/* Approval Timeline Popup Modal */}
      {selectedTimelineItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                  Workflow Audit Trail
                </span>
                <h2 className="text-lg font-bold text-gray-900 mt-1.5">
                  {selectedTimelineItem.title} ({selectedTimelineItem.id})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTimelineItem(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition font-bold"
              >
                ✕
              </button>
            </div>

            {/* Vertical Timeline */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {selectedTimelineItem.steps.map((step) => (
                <div key={`${step.level}-${step.roleName}`} className="relative">
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
                onClick={() => setSelectedTimelineItem(null)}
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

