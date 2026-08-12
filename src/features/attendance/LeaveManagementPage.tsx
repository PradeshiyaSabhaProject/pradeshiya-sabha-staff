import React, { useState } from 'react'
import { useLeave } from '../../context/LeaveContext'
import { ApplyLeaveModal } from './components/ApplyLeaveModal'
import type { LeaveRequest } from './data/mockAttendanceData'

const getLevelContainerClass = (status: string) => {
  if (status === 'Approved') return 'bg-emerald-50/70 border-emerald-300'
  if (status === 'Pending') return 'bg-amber-50/70 border-amber-300 shadow-xs'
  if (status === 'Rejected') return 'bg-rose-50/70 border-rose-300'
  return 'bg-gray-50 border-gray-200 opacity-70'
}

const getLevelStatusBadgeClass = (status: string) => {
  if (status === 'Approved') return 'bg-emerald-200 text-emerald-900'
  if (status === 'Pending') return 'bg-amber-200 text-amber-900 animate-pulse'
  if (status === 'Rejected') return 'bg-rose-200 text-rose-900'
  return 'bg-gray-200 text-gray-700'
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
    <div className="space-y-6 text-left pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Council Leave Portal & Entitlement Ledger
          </h1>
          <p className="text-sm text-gray-500">
            Multi-level leave approval pipeline, authorized vs unauthorized no-pay leave monitoring, and annual quota management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsLogUnauthorizedModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <span>⛔ Log Unauthorized No-Pay Absence</span>
          </button>
          <button
            type="button"
            onClick={() => setIsApplyModalOpen(true)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-md transition cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>+ Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 space-x-6">
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition ${
            activeTab === 'requests' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Multi-Level Leave Pipeline ({leaveRequests.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('unauthorized')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'unauthorized' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>Unauthorized No-Pay Absences</span>
          <span className="bg-rose-100 text-rose-800 text-xs px-2 py-0.5 rounded-full font-extrabold">
            {unauthorizedList.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition ${
            activeTab === 'ledger' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Entitlement Quota Ledger
        </button>
      </div>

      {/* Tab 1: Requests Pipeline */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {leaveRequests.map((req) => (
            <div
              key={req.id}
              className={`bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition space-y-5 ${
                req.overallStatus === 'Approved'
                  ? 'border-emerald-200'
                  : req.isUnauthorizedNoPay
                  ? 'border-rose-300 bg-rose-50/20'
                  : 'border-gray-200'
              }`}
            >
              {/* Request Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-100">
                    {req.avatarInitials || req.employeeName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <h3 className="text-base font-bold text-gray-900">{req.employeeName}</h3>
                      <span className="text-xs bg-gray-100 text-gray-700 font-semibold px-2.5 py-0.5 rounded-md">
                        {req.employeeId}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {req.designation} • {req.department} • Applied on {req.appliedOn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                      {req.leaveType}
                    </span>
                    <div className="text-sm font-extrabold text-gray-900 mt-1">
                      {req.startDate} to {req.endDate} ({req.daysCount} {req.daysCount === 1 ? 'Day' : 'Days'})
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason & Status */}
              <div className="space-y-2">
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs text-gray-700">
                  <span className="font-bold text-gray-900">Applicant Reason / Handover Notes: </span>
                  {req.reason}
                </div>

                {req.isUnauthorizedNoPay && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-semibold">
                    ⛔ Unauthorized No-Pay Leave: {req.rejectionReason} (Flagged for payroll deduction).
                  </div>
                )}

                {req.overallStatus.includes('Cancelled') && (
                  <div className="p-3 bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-700 italic">
                    ℹ️ Cancelled by Employee ({req.cancelledAt}): {req.cancellationReason || 'Leave quota restored.'}
                  </div>
                )}
              </div>

              {/* Multi-Level Workflow Steps */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Multi-Level Approval Pipeline
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {req.approvalLevels.map((lvl) => (
                    <div
                      key={lvl.levelNumber}
                      className={`p-4 rounded-xl border flex flex-col justify-between ${getLevelContainerClass(lvl.status)}`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                            Level {lvl.levelNumber}: {lvl.roleName}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${getLevelStatusBadgeClass(lvl.status)}`}
                          >
                            {lvl.status}
                          </span>
                        </div>
                        <div className="font-semibold text-sm text-gray-900">{lvl.approverName}</div>
                        {lvl.timestamp && <div className="text-[11px] text-gray-500 mt-0.5">{lvl.timestamp}</div>}
                        {lvl.comments && (
                          <div className="text-xs italic text-gray-600 mt-2 bg-white/80 p-2 rounded-lg border border-gray-200/60">
                            "{lvl.comments}"
                          </div>
                        )}
                      </div>

                      {lvl.status === 'Pending' && (
                        <div className="mt-4 pt-3 border-t border-amber-200/80 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setRejectingItem({ req, levelNum: lvl.levelNumber })}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition"
                          >
                            Reject (No-Pay)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLevelApproveClick(req.id, lvl.levelNumber)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
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

      {/* Tab 2: Unauthorized No-Pay Absences Log */}
      {activeTab === 'unauthorized' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden space-y-4 p-5">
          <div>
            <h3 className="text-base font-bold text-gray-900">Unauthorized No-Pay Absences Log</h3>
            <p className="text-xs text-gray-500">
              Absences rejected by superiors or unexcused by HR. These entries carry a 100% daily salary deduction penalty.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-rose-50 border-b border-rose-200 text-xs font-bold uppercase text-rose-900">
                  <th className="py-3.5 px-4">Leave ID</th>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Absence Dates</th>
                  <th className="py-3.5 px-4">Unpaid Days</th>
                  <th className="py-3.5 px-4">Rejection / Unauthorized Remarks</th>
                  <th className="py-3.5 px-4 text-center">Payroll Penalty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {unauthorizedList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">
                      No unauthorized no-pay absences recorded.
                    </td>
                  </tr>
                ) : (
                  unauthorizedList.map((item) => (
                    <tr key={item.id} className="hover:bg-rose-50/30 transition">
                      <td className="py-4 px-4 font-bold text-gray-900">{item.id}</td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-900">{item.employeeName}</div>
                        <div className="text-xs text-gray-500">
                          {item.employeeId} • {item.department}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-800">
                        {item.startDate} to {item.endDate}
                      </td>
                      <td className="py-4 px-4 font-extrabold text-rose-700">{item.daysCount} Days</td>
                      <td className="py-4 px-4 max-w-xs text-xs text-gray-700">
                        {item.rejectionReason || item.reason}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-3 py-1 bg-rose-100 text-rose-800 font-extrabold text-xs rounded-full border border-rose-300">
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

      {/* Tab 3: Entitlement Ledger */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-base font-bold text-gray-900">2026 Annual Staff Leave Quotas & Balances Ledger</h3>
            <p className="text-xs text-gray-500">
              Live balances for Casual (14), Annual (14), Medical (21), Duty (10), and Comp-Off. Balances restore automatically if leave is cancelled or rejected (set to no-pay).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                  <th className="py-3.5 px-5">Employee</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4 text-center">Casual Leave (14)</th>
                  <th className="py-3.5 px-4 text-center">Annual Leave (14)</th>
                  <th className="py-3.5 px-4 text-center">Medical Leave (21)</th>
                  <th className="py-3.5 px-4 text-center">Duty Leave (10)</th>
                  <th className="py-3.5 px-4 text-center">Comp-Off</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {leaveBalances.map((bal) => (
                  <tr key={bal.employeeId} className="hover:bg-gray-50/60 transition">
                    <td className="py-4 px-5">
                      <div className="font-bold text-gray-900">{bal.employeeName}</div>
                      <div className="text-xs text-gray-500">
                        {bal.employeeId} • {bal.designation}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700 font-medium">{bal.department}</td>

                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                        <span className="font-extrabold text-blue-900">{bal.casual.remaining}</span>
                        <span className="text-xs text-blue-600">left of {bal.casual.total}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center space-x-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <span className="font-extrabold text-emerald-900">{bal.annual.remaining}</span>
                        <span className="text-xs text-emerald-600">left of {bal.annual.total}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center space-x-2 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
                        <span className="font-extrabold text-purple-900">{bal.medical.remaining}</span>
                        <span className="text-xs text-purple-600">left of {bal.medical.total}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center space-x-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                        <span className="font-extrabold text-amber-900">{bal.duty.remaining}</span>
                        <span className="text-xs text-amber-600">left of {bal.duty.total}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      {bal.compOff ? (
                        <div className="inline-flex items-center space-x-2 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
                          <span className="font-extrabold text-indigo-900">{bal.compOff.remaining}</span>
                          <span className="text-xs text-indigo-600">left of {bal.compOff.total}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">0 Earned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Unauthorized Absence Direct Action Modal */}
      {isLogUnauthorizedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xl max-w-lg w-full text-left space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center space-x-2 text-rose-700">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center font-bold">⛔</div>
                <h3 className="text-base font-bold text-gray-900">Log Unauthorized No-Pay Absence</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLogUnauthorizedModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogUnauthorizedSubmit} className="space-y-4">
              <div>
                <label htmlFor="unauth-employee-select" className="block text-xs font-semibold uppercase text-gray-600 mb-1">Select Employee</label>
                <select
                  id="unauth-employee-select"
                  value={unauthEmpId}
                  onChange={(e) => setUnauthEmpId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-800"
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
                  <label htmlFor="unauth-start-date" className="block text-xs font-semibold uppercase text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    id="unauth-start-date"
                    value={unauthStartDate}
                    onChange={(e) => setUnauthStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-800"
                  />
                </div>
                <div>
                  <label htmlFor="unauth-end-date" className="block text-xs font-semibold uppercase text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    id="unauth-end-date"
                    value={unauthEndDate}
                    onChange={(e) => setUnauthEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-800"
                  />
                </div>
                <div>
                  <label htmlFor="unauth-working-days" className="block text-xs font-semibold uppercase text-gray-600 mb-1">Days Count</label>
                  <input
                    type="number"
                    id="unauth-working-days"
                    min={0.5}
                    step={0.5}
                    value={unauthDaysCount}
                    onChange={(e) => setUnauthDaysCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-rose-700"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="unauth-reason-input" className="block text-xs font-semibold uppercase text-gray-600 mb-1">Reason / HR Audit Notes</label>
                <textarea
                  id="unauth-reason-input"
                  rows={3}
                  required
                  placeholder="State reason for marking unexcused absence as Unauthorized No-Pay Leave..."
                  value={unauthReason}
                  onChange={(e) => setUnauthReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-800"
                />
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800">
                This action creates an <strong>Unauthorized No-Pay Leave</strong> record and flags the employee's payroll for a 100% daily pay deduction.
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogUnauthorizedModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xl max-w-md w-full text-left space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center font-bold">⛔</div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Reject Level {rejectingItem.levelNum}</h3>
                <p className="text-xs text-gray-500">ID: {rejectingItem.req.id}</p>
              </div>
            </div>

            <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-xs text-rose-900">
              Rejecting this leave converts it to <strong>Unauthorized No-Pay Leave</strong>. Paid leave quotas will be restored and payroll salary deduction will apply.
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label htmlFor="rejection-reason-pipeline-input" className="block text-xs font-semibold text-gray-700 mb-1">
                  Rejection Remarks
                </label>
                <textarea
                  id="rejection-reason-pipeline-input"
                  rows={3}
                  required
                  placeholder="State rejection reason..."
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-800"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingItem(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      <ApplyLeaveModal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} />
    </div>
  )
}
