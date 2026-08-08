import React, { useState } from 'react'
import { useLeave } from '../../context/LeaveContext'
import { ApplyLeaveModal } from './components/ApplyLeaveModal'
import type { LeaveRequest } from './data/mockAttendanceData'

const getStatusBadgeClass = (status: string) => {
  if (status === 'Approved') {
    return 'bg-emerald-100 text-emerald-800 border border-emerald-300'
  }
  if (status.includes('Pending')) {
    return 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
  }
  if (status.includes('Unauthorized') || status.includes('Rejected')) {
    return 'bg-rose-100 text-rose-800 border border-rose-300'
  }
  if (status.includes('Cancelled')) {
    return 'bg-gray-100 text-gray-700 border border-gray-300'
  }
  return 'bg-blue-100 text-blue-800 border border-blue-200'
}

const getTimelineCircleClass = (status: string) => {
  if (status === 'Approved') {
    return 'bg-emerald-500 border-emerald-600 text-white'
  }
  if (status === 'Pending') {
    return 'bg-amber-400 border-amber-500 text-white animate-pulse'
  }
  if (status === 'Rejected') {
    return 'bg-rose-500 border-rose-600 text-white'
  }
  return 'bg-gray-400 border-gray-500 text-white'
}

const getTimelineStatusBadgeClass = (status: string) => {
  if (status === 'Approved') return 'bg-emerald-100 text-emerald-800'
  if (status === 'Pending') return 'bg-amber-100 text-amber-800'
  if (status === 'Rejected') return 'bg-rose-100 text-rose-800'
  return 'bg-gray-100 text-gray-700'
}

export const MyLeavePage: React.FC = () => {
  const { leaveRequests, leaveBalances, cancelLeave } = useLeave()

  const [isApplyingModalOpen, setIsApplyingModalOpen] = useState(false)
  const [selectedRecordForTimeline, setSelectedRecordForTimeline] = useState<LeaveRequest | null>(null)
  const [cancellingRequest, setCancellingRequest] = useState<LeaveRequest | null>(null)
  const [cancellationReasonInput, setCancellationReasonInput] = useState('')
  const [filterType, setFilterType] = useState('All')

  // Filter for Kasun Perera (PS-EMP-0012)
  const myEmployeeId = 'PS-EMP-0012'
  const myRequests = leaveRequests.filter((r) => r.employeeId === myEmployeeId)
  const myBalance = leaveBalances.find((b) => b.employeeId === myEmployeeId) || {
    casual: { total: 14, used: 4, remaining: 10 },
    annual: { total: 14, used: 5, remaining: 9 },
    medical: { total: 21, used: 2, remaining: 19 },
    duty: { total: 10, used: 3, remaining: 7 },
    compOff: { total: 6, used: 1, remaining: 5 }
  }

  const filteredHistory = myRequests.filter((item) => {
    if (filterType === 'All') return true
    if (filterType === 'Pending') return item.overallStatus.includes('Pending')
    if (filterType === 'Approved') return item.overallStatus === 'Approved'
    if (filterType === 'Unauthorized') return item.overallStatus.includes('Unauthorized') || item.overallStatus.includes('Rejected')
    if (filterType === 'Cancelled') return item.overallStatus.includes('Cancelled')
    return true
  })

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cancellingRequest) return
    cancelLeave(cancellingRequest.id, cancellationReasonInput || 'Employee requested leave cancellation.')
    setCancellingRequest(null)
    setCancellationReasonInput('')
  }

  return (
    <div className="space-y-6 text-left pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">My Leave Portal</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            View annual entitlement balances, submit leave applications, track multi-level approvals, and self-cancel leave requests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsApplyingModalOpen(true)}
          className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md transition flex items-center space-x-2 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 shrink-0">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>+ Apply for Leave</span>
        </button>
      </div>

      {/* Logged-In Officer Profile Card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-base shadow-sm">
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
            Total Requests: <span className="font-extrabold text-gray-900">{myRequests.length}</span>
          </div>
          <div>
            Pending: <span className="font-extrabold text-amber-600">{myRequests.filter((r) => r.overallStatus.includes('Pending')).length}</span>
          </div>
          <div>
            Authorized: <span className="font-extrabold text-emerald-600">{myRequests.filter((r) => r.overallStatus === 'Approved').length}</span>
          </div>
        </div>
      </div>

      {/* Quota Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Casual */}
        <div className="bg-white p-5 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Casual Leave</span>
            <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">Paid</span>
          </div>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-3xl font-extrabold text-gray-900">{myBalance.casual.remaining}</span>
            <span className="text-sm font-medium text-gray-500">/ {myBalance.casual.total} days left</span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{ width: `${(myBalance.casual.remaining / myBalance.casual.total) * 100}%` }}
            />
          </div>
        </div>

        {/* Annual */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Annual Leave</span>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">Paid</span>
          </div>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-3xl font-extrabold text-gray-900">{myBalance.annual.remaining}</span>
            <span className="text-sm font-medium text-gray-500">/ {myBalance.annual.total} days left</span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all"
              style={{ width: `${(myBalance.annual.remaining / myBalance.annual.total) * 100}%` }}
            />
          </div>
        </div>

        {/* Medical */}
        <div className="bg-white p-5 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Medical Leave</span>
            <span className="text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">Medical</span>
          </div>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-3xl font-extrabold text-gray-900">{myBalance.medical.remaining}</span>
            <span className="text-sm font-medium text-gray-500">/ {myBalance.medical.total} days left</span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-purple-600 h-full rounded-full transition-all"
              style={{ width: `${(myBalance.medical.remaining / myBalance.medical.total) * 100}%` }}
            />
          </div>
        </div>

        {/* Duty */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Duty Leave</span>
            <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">Official</span>
          </div>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-3xl font-extrabold text-gray-900">{myBalance.duty.remaining}</span>
            <span className="text-sm font-medium text-gray-500">/ {myBalance.duty.total} days left</span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-amber-600 h-full rounded-full transition-all"
              style={{ width: `${(myBalance.duty.remaining / myBalance.duty.total) * 100}%` }}
            />
          </div>
        </div>

        {/* Comp-Off */}
        <div className="bg-white p-5 rounded-2xl border border-indigo-200 bg-indigo-50/20 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Comp-Off</span>
            <span className="text-xs font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md">Earned</span>
          </div>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-3xl font-extrabold text-gray-900">{myBalance.compOff?.remaining ?? 0}</span>
            <span className="text-sm font-medium text-gray-500">/ {myBalance.compOff?.total ?? 0} earned</span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all"
              style={{
                width: `${
                  myBalance.compOff ? (myBalance.compOff.remaining / (myBalance.compOff.total || 1)) * 100 : 0
                }%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Leaves Taken / Requested Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">Personal Leave Applications & History</h3>
            <p className="text-xs text-gray-500">
              Track authorized leaves, pending multi-level approvals, unauthorized no-pay leave entries, and self-cancellation status.
            </p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl shrink-0 flex-wrap gap-1">
            {['All', 'Pending', 'Approved', 'Unauthorized', 'Cancelled'].map((f) => (
              <button
                type="button"
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterType === f ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {f === 'Unauthorized' ? 'No-Pay / Unauthorized' : f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                <th className="py-3.5 px-5">Leave ID & Applied Date</th>
                <th className="py-3.5 px-4">Leave Category</th>
                <th className="py-3.5 px-4">Duration & Dates</th>
                <th className="py-3.5 px-4">Reason & Handover Officer</th>
                <th className="py-3.5 px-4 text-center">Approval Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">
                    No leave applications found matching current filter.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((rec) => (
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

                    <td className="py-4 px-4 max-w-xs">
                      <div className="font-medium text-gray-900 text-xs truncate">{rec.reason}</div>
                      {rec.handoverOfficer && (
                        <div className="text-[11px] text-gray-500 mt-0.5">Handover: {rec.handoverOfficer}</div>
                      )}
                      {rec.rejectionReason && (
                        <div className="text-[11px] text-rose-600 font-semibold mt-1 bg-rose-50 p-1.5 rounded-md border border-rose-200">
                          Rejection note: {rec.rejectionReason}
                        </div>
                      )}
                      {rec.cancellationReason && (
                        <div className="text-[11px] text-gray-600 italic mt-1 bg-gray-50 p-1 rounded border border-gray-200">
                          Cancellation note: {rec.cancellationReason}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(
                            rec.overallStatus
                          )}`}
                        >
                          {rec.overallStatus === 'Approved'
                            ? 'Authorized Leave'
                            : rec.overallStatus}
                        </span>
                        {rec.isUnauthorizedNoPay && (
                          <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300">
                            Unpaid Pay-Cut Penalty
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRecordForTimeline(rec)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition shadow-2xs cursor-pointer"
                        title="View Multi-Level Approval Timeline"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span>Timeline</span>
                      </button>

                      {/* Cancel Leave button for employee */}
                      {!rec.overallStatus.includes('Cancelled') && !rec.overallStatus.includes('Unauthorized') && (
                        <button
                          type="button"
                          onClick={() => setCancellingRequest(rec)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition shadow-2xs cursor-pointer"
                          title="Cancel your leave application"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          <span>Cancel Leave</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <ApplyLeaveModal isOpen={isApplyingModalOpen} onClose={() => setIsApplyingModalOpen(false)} />

      {/* Employee Cancellation Confirmation Modal */}
      {cancellingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xl max-w-md w-full text-left space-y-4">
            <div className="flex items-center space-x-3 text-amber-600">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-bold">
                ⚠️
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Cancel Leave Application</h3>
                <p className="text-xs text-gray-500">ID: {cancellingRequest.id}</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to cancel your <strong>{cancellingRequest.leaveType}</strong> for{' '}
              <strong>{cancellingRequest.startDate}</strong> to <strong>{cancellingRequest.endDate}</strong> ({cancellingRequest.daysCount} days)?
              Cancelling this leave will restore your leave quota balance and close the approval workflow.
            </p>

            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div>
                <label htmlFor="cancellation-reason-input" className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason for Cancellation
                </label>
                <textarea
                  id="cancellation-reason-input"
                  rows={2}
                  required
                  placeholder="State reason for cancelling (e.g. Travel postponed)..."
                  value={cancellationReasonInput}
                  onChange={(e) => setCancellationReasonInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingRequest(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Keep Application
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              {selectedRecordForTimeline.handoverOfficer && (
                <div>
                  <strong className="text-gray-900">Acting Officer:</strong> {selectedRecordForTimeline.handoverOfficer}
                </div>
              )}
            </div>

            {/* Superior Rejection Banner if Unauthorized No-Pay */}
            {selectedRecordForTimeline.isUnauthorizedNoPay && (
              <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-xs space-y-1 text-rose-900">
                <div className="font-bold flex items-center space-x-1.5">
                  <span>⛔</span>
                  <span>SUPERIOR REJECTED LEAVE — CONVERTED TO UNAUTHORIZED NO-PAY LEAVE</span>
                </div>
                <p className="text-rose-700">{selectedRecordForTimeline.rejectionReason}</p>
                <div className="text-[11px] font-semibold text-rose-800">
                  Status: Recorded as unpaid absence subject to monthly salary deduction.
                </div>
              </div>
            )}

            {/* Employee Cancellation Banner */}
            {selectedRecordForTimeline.overallStatus.includes('Cancelled') && (
              <div className="p-3.5 bg-gray-100 border border-gray-300 rounded-xl text-xs space-y-1 text-gray-800">
                <div className="font-bold flex items-center space-x-1.5 text-gray-900">
                  <span>ℹ️</span>
                  <span>CANCELLED BY EMPLOYEE</span>
                </div>
                <p className="text-gray-600">{selectedRecordForTimeline.cancellationReason || 'Employee self-cancelled leave.'}</p>
                <div className="text-[11px] font-semibold text-emerald-700">
                  Leave quota restored back to annual entitlement ledger.
                </div>
              </div>
            )}

            {/* Vertical Multi-Level Timeline */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {selectedRecordForTimeline.approvalLevels.map((step) => (
                <div key={`${step.levelNumber}-${step.roleName}`} className="relative">
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
                        Level {step.levelNumber} • {step.roleName}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${getTimelineStatusBadgeClass(step.status)}`}
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
