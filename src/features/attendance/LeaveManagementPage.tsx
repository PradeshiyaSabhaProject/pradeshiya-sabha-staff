import React, { useState } from 'react'
import { useLeave } from '../../context/LeaveContext'
import { ApplyLeaveModal } from './components/ApplyLeaveModal'
import type { LeaveRequest } from './data/mockAttendanceData'

const getLevelContainerClass = (status: string) => {
  if (status === 'Approved') return 'bg-emerald-50 border-emerald-300'
  if (status === 'Pending') return 'bg-amber-50 border-amber-300'
  if (status === 'Rejected') return 'bg-red-50 border-red-300'
  return 'bg-gray-50 border-gray-200'
}

const getLevelStatusBadgeClass = (status: string) => {
  if (status === 'Approved') return 'bg-emerald-100 text-emerald-800 border-emerald-300'
  if (status === 'Pending') return 'bg-amber-100 text-amber-800 border-amber-300'
  if (status === 'Rejected') return 'bg-red-100 text-red-700 border-red-300'
  return 'bg-gray-200 text-gray-700 border-gray-300'
}

export const LeaveManagementPage: React.FC = () => {
  const { leaveRequests, leaveBalances, approveLevel, rejectLevel, recordUnauthorizedAbsence } = useLeave()

  const [activeTab, setActiveTab] = useState<'requests' | 'unauthorized' | 'ledger'>('requests')
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)

  // Direct unauthorized absence modal
  const [isLogUnauthorizedModalOpen, setIsLogUnauthorizedModalOpen] = useState(false)
  const [unauthEmpId, setUnauthEmpId] = useState('PS-EMP-0062')
  const [unauthStartDate, setUnauthStartDate] = useState('2026-07-25')
  const [unauthEndDate, setUnauthEndDate] = useState('2026-07-25')
  const [unauthDaysCount, setUnauthDaysCount] = useState(1)
  const [unauthReason, setUnauthReason] = useState('Unexcused absence during road paving inspection')

  // Rejection modal
  const [rejectingItem, setRejectingItem] = useState<{ req: LeaveRequest; levelNum: 1 | 2 | 3 } | null>(null)
  const [rejectionReasonInput, setRejectionReasonInput] = useState('')

  const employeesList = [
    { id: 'PS-EMP-0062', name: 'Upul Dissanayake', dept: 'Roads & Infrastructure', title: 'Works Overseer' },
    { id: 'PS-EMP-0012', name: 'Kasun Perera', dept: 'Revenue & Finance', title: 'Senior Revenue Inspector' },
    { id: 'PS-EMP-0019', name: 'Nimali Fernando', dept: 'Works & Engineering', title: 'Subject Clerk' },
    { id: 'PS-EMP-0041', name: 'Chaminda Rathnayake', dept: 'Public Health & Environment', title: 'Public Health Inspector' }
  ]

  const handleLevelApproveClick = (reqId: string, levelNum: number) => {
    approveLevel(reqId, levelNum as 1 | 2 | 3, 'HR Secretary / Dept Head', 'Recommendation approved and signed.')
  }

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectingItem) return
    rejectLevel(
      rejectingItem.req.id,
      rejectingItem.levelNum,
      'Department Head / HR Secretary',
      rejectionReasonInput || 'Unexcused leave request. Converted to Unauthorized No-Pay Leave.'
    )
    setRejectingItem(null)
    setRejectionReasonInput('')
  }

  const handleLogUnauthorizedSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const targetEmp = employeesList.find((e) => e.id === unauthEmpId) || employeesList[0]
    recordUnauthorizedAbsence({
      employeeId: targetEmp.id,
      employeeName: targetEmp.name,
      department: targetEmp.dept,
      designation: targetEmp.title,
      startDate: unauthStartDate,
      endDate: unauthEndDate,
      daysCount: unauthDaysCount,
      reason: unauthReason
    })
    setIsLogUnauthorizedModalOpen(false)
  }

  const unauthorizedList = leaveRequests.filter(
    (r) => r.isUnauthorizedNoPay || r.overallStatus.includes('Unauthorized') || r.overallStatus.includes('Rejected')
  )

  return (
    <div className="space-y-6 text-left pb-8 animate-fade-in">
      {/* ── 1. Top Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Council Leave Portal &amp; Entitlement Ledger
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Multi-level leave approval pipeline, authorized vs unauthorized no-pay leave monitoring, and quota management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLogUnauthorizedModalOpen(true)}
            className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all text-xs font-semibold px-3.5 py-1.5 rounded bg-white shadow-xs cursor-pointer uppercase tracking-wider"
          >
            Log Unauthorized Absence
          </button>
          <button
            type="button"
            onClick={() => setIsApplyModalOpen(true)}
            className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* ── 2. Tabs Switcher (Overview Style) ─────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-gray-300 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
            activeTab === 'requests'
              ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          Leave Pipeline ({leaveRequests.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('unauthorized')}
          className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border flex items-center gap-2 ${
            activeTab === 'unauthorized'
              ? 'bg-[#A31736] text-white border-[#A31736]'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          <span>Unauthorized No-Pay Absences</span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
            activeTab === 'unauthorized' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-800'
          }`}>
            {unauthorizedList.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
            activeTab === 'ledger'
              ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          Entitlement Quota Ledger
        </button>
      </div>

      {/* ── 3. Tab 1: Requests Pipeline ───────────────────────────────── */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {leaveRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-gray-200 pb-3">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded bg-blue-50 text-[#1e3a8a] font-bold flex items-center justify-center text-xs border border-blue-200 shrink-0 font-mono uppercase">
                    {req.avatarInitials || req.employeeName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-gray-900 uppercase">{req.employeeName}</h3>
                      <span className="text-xs text-gray-500 font-mono">({req.employeeId})</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {req.designation} • {req.department} • Applied on {req.appliedOn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wide border bg-blue-50 text-[#1e3a8a] border-blue-200">
                    {req.leaveType}
                  </span>
                  <div className="text-xs font-bold text-gray-900">
                    {req.startDate} to {req.endDate} ({req.daysCount} {req.daysCount === 1 ? 'Day' : 'Days'})
                  </div>
                </div>
              </div>

              {/* Reason & Status */}
              <div className="space-y-2">
                <div className="bg-gray-50 p-3 rounded border border-gray-200 text-xs text-gray-700">
                  <span className="font-bold text-gray-900">Reason / Handover Notes: </span>
                  {req.reason}
                </div>

                {req.isUnauthorizedNoPay && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-800 font-medium">
                    ⛔ Unauthorized No-Pay Leave: {req.rejectionReason} (Flagged for payroll deduction).
                  </div>
                )}

                {req.overallStatus.includes('Cancelled') && (
                  <div className="p-2.5 bg-gray-100 border border-gray-200 rounded text-xs text-gray-700 italic">
                    ℹ️ Cancelled by Employee ({req.cancelledAt}): {req.cancellationReason || 'Leave quota restored.'}
                  </div>
                )}
              </div>

              {/* Multi-Level Workflow Steps */}
              <div>
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2.5">
                  Multi-Level Approval Pipeline
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {req.approvalLevels.map((lvl) => (
                    <div
                      key={lvl.levelNumber}
                      className={`p-3.5 rounded border flex flex-col justify-between ${getLevelContainerClass(lvl.status)}`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
                            Level {lvl.levelNumber}: {lvl.roleName}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${getLevelStatusBadgeClass(
                              lvl.status
                            )}`}
                          >
                            {lvl.status}
                          </span>
                        </div>
                        <div className="font-bold text-xs text-gray-900">{lvl.approverName}</div>
                        {lvl.timestamp && <div className="text-[10px] text-gray-500 mt-0.5">{lvl.timestamp}</div>}
                        {lvl.comments && (
                          <div className="text-xs italic text-gray-700 mt-2 bg-white p-2 rounded border border-gray-200">
                            "{lvl.comments}"
                          </div>
                        )}
                      </div>

                      {lvl.status === 'Pending' && (
                        <div className="mt-3 pt-2.5 border-t border-amber-200 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setRejectingItem({ req, levelNum: lvl.levelNumber })}
                            className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all text-xs font-semibold px-2.5 py-1 rounded bg-white shadow-xs cursor-pointer uppercase tracking-wider"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLevelApproveClick(req.id, lvl.levelNumber)}
                            className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-3 py-1 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer"
                          >
                            Approve Level {lvl.levelNumber}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 4. Tab 2: Unauthorized No-Pay Absences Log ─────────────────── */}
      {activeTab === 'unauthorized' && (
        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide">
              Unauthorized No-Pay Absences Log
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Absences rejected by superiors or unexcused by HR carrying salary deduction penalty
            </p>
          </div>

          <div className="overflow-x-auto flex-1 relative [-webkit-overflow-scrolling:touch]">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-gray-100 border-y border-gray-300 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">LEAVE ID</th>
                  <th className="py-3 px-4 sm:px-6">EMPLOYEE</th>
                  <th className="py-3 px-4 sm:px-6">ABSENCE DATES</th>
                  <th className="py-3 px-4 sm:px-6">UNPAID DAYS</th>
                  <th className="py-3 px-4 sm:px-6">REJECTION / AUDIT REMARKS</th>
                  <th className="py-3 px-4 sm:px-6 text-center">PENALTY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {unauthorizedList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No unauthorized no-pay absences recorded.
                    </td>
                  </tr>
                ) : (
                  unauthorizedList.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 sm:px-6 font-mono text-xs font-bold text-gray-900">{item.id}</td>
                      <td className="py-3 px-4 sm:px-6">
                        <div className="font-bold text-gray-900 text-xs">{item.employeeName}</div>
                        <div className="text-[11px] text-gray-500 font-mono">
                          {item.employeeId} • {item.department}
                        </div>
                      </td>
                      <td className="py-3 px-4 sm:px-6 font-semibold text-gray-800 text-xs whitespace-nowrap">
                        {item.startDate} to {item.endDate}
                      </td>
                      <td className="py-3 px-4 sm:px-6 font-bold text-red-700 text-xs">{item.daysCount} Days</td>
                      <td className="py-3 px-4 sm:px-6 max-w-xs text-xs text-gray-700">
                        {item.rejectionReason || item.reason}
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-center whitespace-nowrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded uppercase tracking-wide border border-red-300">
                          Pay-Cut Enforced
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 5. Tab 3: Entitlement Ledger ──────────────────────────────── */}
      {activeTab === 'ledger' && (
        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide">
              2026 Annual Staff Leave Quotas &amp; Balances Ledger
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Live balances for Casual (14), Annual (14), Medical (21), Duty (10), and Comp-Off
            </p>
          </div>

          <div className="overflow-x-auto flex-1 relative [-webkit-overflow-scrolling:touch]">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-100 border-y border-gray-300 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">EMPLOYEE</th>
                  <th className="py-3 px-4 sm:px-6">DEPARTMENT</th>
                  <th className="py-3 px-4 sm:px-6 text-center">CASUAL LEAVE (14)</th>
                  <th className="py-3 px-4 sm:px-6 text-center">ANNUAL LEAVE (14)</th>
                  <th className="py-3 px-4 sm:px-6 text-center">MEDICAL LEAVE (21)</th>
                  <th className="py-3 px-4 sm:px-6 text-center">DUTY LEAVE (10)</th>
                  <th className="py-3 px-4 sm:px-6 text-center">COMP-OFF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {leaveBalances.map((bal) => (
                  <tr key={bal.employeeId} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 sm:px-6">
                      <div className="font-bold text-gray-900 text-xs">{bal.employeeName}</div>
                      <div className="text-[11px] text-gray-500 font-mono">
                        {bal.employeeId} • {bal.designation}
                      </div>
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-xs text-gray-700 font-medium whitespace-nowrap">{bal.department}</td>

                    <td className="py-3 px-4 sm:px-6 text-center whitespace-nowrap">
                      <span className="text-xs font-bold text-[#1e3a8a]">
                        {bal.casual.remaining} <span className="text-gray-500 font-normal">/ {bal.casual.total}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 sm:px-6 text-center whitespace-nowrap">
                      <span className="text-xs font-bold text-emerald-700">
                        {bal.annual.remaining} <span className="text-gray-500 font-normal">/ {bal.annual.total}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 sm:px-6 text-center whitespace-nowrap">
                      <span className="text-xs font-bold text-purple-700">
                        {bal.medical.remaining} <span className="text-gray-500 font-normal">/ {bal.medical.total}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 sm:px-6 text-center whitespace-nowrap">
                      <span className="text-xs font-bold text-amber-700">
                        {bal.duty.remaining} <span className="text-gray-500 font-normal">/ {bal.duty.total}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 sm:px-6 text-center whitespace-nowrap">
                      {bal.compOff ? (
                        <span className="text-xs font-bold text-indigo-700">
                          {bal.compOff.remaining} <span className="text-gray-500 font-normal">/ {bal.compOff.total}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Unauthorized Absence Modal */}
      {isLogUnauthorizedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white border border-gray-300 rounded shadow-xl max-w-lg w-full overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                Log Unauthorized No-Pay Absence
              </h3>
              <button
                type="button"
                onClick={() => setIsLogUnauthorizedModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogUnauthorizedSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="unauth-employee-select" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Select Employee
                </label>
                <select
                  id="unauth-employee-select"
                  value={unauthEmpId}
                  onChange={(e) => setUnauthEmpId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-gray-300 bg-white text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#1e3a8a]"
                >
                  {employeesList.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.id}) — {emp.dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="unauth-start-date" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="unauth-start-date"
                    value={unauthStartDate}
                    onChange={(e) => setUnauthStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs text-gray-800 focus:outline-none focus:border-[#1e3a8a]"
                  />
                </div>
                <div>
                  <label htmlFor="unauth-end-date" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="unauth-end-date"
                    value={unauthEndDate}
                    onChange={(e) => setUnauthEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs text-gray-800 focus:outline-none focus:border-[#1e3a8a]"
                  />
                </div>
                <div>
                  <label htmlFor="unauth-working-days" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Days Count
                  </label>
                  <input
                    type="number"
                    id="unauth-working-days"
                    min={0.5}
                    step={0.5}
                    value={unauthDaysCount}
                    onChange={(e) => setUnauthDaysCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs font-bold text-red-700 focus:outline-none focus:border-[#1e3a8a]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="unauth-reason-input" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Reason / HR Audit Notes
                </label>
                <textarea
                  id="unauth-reason-input"
                  rows={3}
                  required
                  placeholder="State reason for marking unexcused absence as Unauthorized No-Pay Leave..."
                  value={unauthReason}
                  onChange={(e) => setUnauthReason(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-gray-300 text-xs text-gray-800 focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                />
              </div>

              <div className="p-3 bg-red-50 rounded border border-red-200 text-xs text-red-800">
                This action creates an <strong>Unauthorized No-Pay Leave</strong> record and flags the employee's payroll for a 100% daily pay deduction.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsLogUnauthorizedModalOpen(false)}
                  className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold px-3.5 py-1.5 rounded border border-gray-300 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-700 hover:bg-red-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer"
                >
                  Record Unauthorized No-Pay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Leave Level Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white border border-gray-300 rounded shadow-xl max-w-md w-full overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                  Reject Level {rejectingItem.levelNum}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">ID: {rejectingItem.req.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 p-3 rounded border border-red-200 text-xs text-red-800">
                Rejecting this leave converts it to <strong>Unauthorized No-Pay Leave</strong>. Paid leave quotas will be restored and payroll deduction will apply.
              </div>

              <form onSubmit={handleConfirmReject} className="space-y-4">
                <div>
                  <label htmlFor="rejection-reason-pipeline-input" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Rejection Remarks
                  </label>
                  <textarea
                    id="rejection-reason-pipeline-input"
                    rows={3}
                    required
                    placeholder="State rejection reason..."
                    value={rejectionReasonInput}
                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-gray-300 text-xs text-gray-800 focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setRejectingItem(null)}
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

      {/* Apply Leave Modal */}
      <ApplyLeaveModal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} />
    </div>
  )
}

export default LeaveManagementPage
