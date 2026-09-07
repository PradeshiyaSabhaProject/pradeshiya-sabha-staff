import React, { useState } from 'react'
import { useLeave } from '../../context/LeaveContext'
import { ApplyLeaveModal } from './components/ApplyLeaveModal'
import type { LeaveRequest } from './data/mockAttendanceData'

const getStatusBadgeClass = (status: string) => {
  if (status === 'Approved') {
    return 'bg-emerald-100 text-emerald-800 border-emerald-300'
  }
  if (status.includes('Pending')) {
    return 'bg-amber-100 text-amber-800 border-amber-300'
  }
  if (status.includes('Unauthorized') || status.includes('Rejected')) {
    return 'bg-red-100 text-red-700 border-red-300'
  }
  if (status.includes('Cancelled')) {
    return 'bg-gray-200 text-gray-700 border-gray-300'
  }
  return 'bg-blue-100 text-blue-800 border-blue-200'
}

const getTimelineCircleClass = (status: string) => {
  if (status === 'Approved') {
    return 'bg-emerald-600 border-emerald-700 text-white'
  }
  if (status === 'Pending') {
    return 'bg-amber-500 border-amber-600 text-white'
  }
  if (status === 'Rejected') {
    return 'bg-red-600 border-red-700 text-white'
  }
  return 'bg-gray-400 border-gray-500 text-white'
}

const getTimelineStatusBadgeClass = (status: string) => {
  if (status === 'Approved') return 'bg-emerald-100 text-emerald-800 border-emerald-300'
  if (status === 'Pending') return 'bg-amber-100 text-amber-800 border-amber-300'
  if (status === 'Rejected') return 'bg-red-100 text-red-700 border-red-300'
  return 'bg-gray-100 text-gray-700 border-gray-300'
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
    <div className="space-y-6 text-left pb-8 animate-fade-in">
      {/* ── 1. Top Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            My Leave Portal
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            View annual entitlement balances, submit leave applications, and track multi-level approvals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsApplyingModalOpen(true)}
          className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Apply for Leave</span>
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
            Total Requests: <span className="font-extrabold text-gray-900">{myRequests.length}</span>
          </div>
          <div>
            Pending: <span className="font-extrabold text-amber-700">{myRequests.filter((r) => r.overallStatus.includes('Pending')).length}</span>
          </div>
          <div>
            Authorized: <span className="font-extrabold text-emerald-700">{myRequests.filter((r) => r.overallStatus === 'Approved').length}</span>
          </div>
        </div>
      </div>

      {/* ── 3. Quota Balances Grid (Overview Card System) ─────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Casual */}
        <div className="bg-white border border-gray-300 rounded p-4 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 truncate mr-2">Casual Leave</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-blue-100 text-blue-800 border border-blue-200">Paid</span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{myBalance.casual.remaining}</span>
              <span className="text-xs text-gray-500 font-medium">/ {myBalance.casual.total} left</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-2.5 overflow-hidden">
              <div
                className="bg-[#1e3a8a] h-full rounded-sm transition-all duration-700"
                style={{ width: `${(myBalance.casual.remaining / myBalance.casual.total) * 100}%` }}
              />
            </div>
          </div>
          <div className="mt-2 text-[11px] text-gray-500 font-medium">
            Used: {myBalance.casual.used} days this year
          </div>
        </div>

        {/* Annual */}
        <div className="bg-white border border-gray-300 rounded p-4 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 truncate mr-2">Annual Leave</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">Paid</span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{myBalance.annual.remaining}</span>
              <span className="text-xs text-gray-500 font-medium">/ {myBalance.annual.total} left</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-2.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-sm transition-all duration-700"
                style={{ width: `${(myBalance.annual.remaining / myBalance.annual.total) * 100}%` }}
              />
            </div>
          </div>
          <div className="mt-2 text-[11px] text-gray-500 font-medium">
            Used: {myBalance.annual.used} days this year
          </div>
        </div>

        {/* Medical */}
        <div className="bg-white border border-gray-300 rounded p-4 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 truncate mr-2">Medical Leave</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-purple-100 text-purple-800 border border-purple-200">Medical</span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{myBalance.medical.remaining}</span>
              <span className="text-xs text-gray-500 font-medium">/ {myBalance.medical.total} left</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-2.5 overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-sm transition-all duration-700"
                style={{ width: `${(myBalance.medical.remaining / myBalance.medical.total) * 100}%` }}
              />
            </div>
          </div>
          <div className="mt-2 text-[11px] text-gray-500 font-medium">
            Used: {myBalance.medical.used} days this year
          </div>
        </div>

        {/* Duty */}
        <div className="bg-white border border-gray-300 rounded p-4 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 truncate mr-2">Duty Leave</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-amber-100 text-amber-800 border border-amber-200">Official</span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{myBalance.duty.remaining}</span>
              <span className="text-xs text-gray-500 font-medium">/ {myBalance.duty.total} left</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-2.5 overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-sm transition-all duration-700"
                style={{ width: `${(myBalance.duty.remaining / myBalance.duty.total) * 100}%` }}
              />
            </div>
          </div>
          <div className="mt-2 text-[11px] text-gray-500 font-medium">
            Used: {myBalance.duty.used} days this year
          </div>
        </div>

        {/* Comp-Off */}
        <div className="bg-white border border-gray-300 rounded p-4 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 truncate mr-2">Comp-Off</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-indigo-100 text-indigo-800 border border-indigo-200">Earned</span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{myBalance.compOff?.remaining ?? 0}</span>
              <span className="text-xs text-gray-500 font-medium">/ {myBalance.compOff?.total ?? 0} earned</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-2.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-sm transition-all duration-700"
                style={{
                  width: `${
                    myBalance.compOff ? (myBalance.compOff.remaining / (myBalance.compOff.total || 1)) * 100 : 0
                  }%`
                }}
              />
            </div>
          </div>
          <div className="mt-2 text-[11px] text-gray-500 font-medium">
            Used: {myBalance.compOff?.used ?? 0} comp-offs
          </div>
        </div>
      </div>

      {/* ── 4. Leave History Table Card (Overview Table Style) ────────── */}
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide">
              Personal Leave Applications &amp; History
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Track multi-level approval pipeline and self-cancellation status
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {['All', 'Pending', 'Approved', 'Unauthorized', 'Cancelled'].map((f) => (
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
                {f === 'Unauthorized' ? 'No-Pay / Unauth' : f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto flex-1 relative [-webkit-overflow-scrolling:touch]">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-gray-100 border-y border-gray-300 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6">LEAVE REF &amp; APPLIED DATE</th>
                <th className="py-3 px-4 sm:px-6">CATEGORY</th>
                <th className="py-3 px-4 sm:px-6">DURATION &amp; DATES</th>
                <th className="py-3 px-4 sm:px-6">REASON &amp; ACTING OFFICER</th>
                <th className="py-3 px-4 sm:px-6 text-center">APPROVAL STATUS</th>
                <th className="py-3 px-4 sm:px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No leave applications found matching current filter.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-3 px-4 sm:px-6 font-mono text-xs whitespace-nowrap">
                      <div className="font-bold text-gray-900">{rec.id}</div>
                      <div className="text-[11px] text-gray-500">Applied: {rec.appliedOn}</div>
                    </td>

                    <td className="py-3 px-4 sm:px-6 whitespace-nowrap">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border bg-blue-50 text-[#1e3a8a] border-blue-200">
                        {rec.leaveType}
                      </span>
                    </td>

                    <td className="py-3 px-4 sm:px-6 whitespace-nowrap">
                      <div className="font-bold text-gray-900 text-xs">
                        {rec.daysCount} {rec.daysCount === 1 ? 'Day' : 'Days'}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {rec.startDate} to {rec.endDate}
                      </div>
                    </td>

                    <td className="py-3 px-4 sm:px-6 max-w-xs">
                      <div className="text-xs text-gray-800 truncate">{rec.reason}</div>
                      {rec.handoverOfficer && (
                        <div className="text-[11px] text-gray-500 mt-0.5">Handover: {rec.handoverOfficer}</div>
                      )}
                      {rec.rejectionReason && (
                        <div className="text-[11px] text-red-700 font-semibold mt-1 bg-red-50 p-1 rounded border border-red-200">
                          Rejection note: {rec.rejectionReason}
                        </div>
                      )}
                      {rec.cancellationReason && (
                        <div className="text-[11px] text-gray-600 italic mt-1 bg-gray-50 p-1 rounded border border-gray-200">
                          Cancellation note: {rec.cancellationReason}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 sm:px-6 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide inline-block border ${getStatusBadgeClass(
                            rec.overallStatus
                          )}`}
                        >
                          {rec.overallStatus === 'Approved' ? 'Authorized Leave' : rec.overallStatus}
                        </span>
                        {rec.isUnauthorizedNoPay && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wide bg-red-100 text-red-700 border border-red-300">
                            Unpaid Pay-Cut
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 sm:px-6 text-right whitespace-nowrap space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRecordForTimeline(rec)}
                        className="border border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white transition-all text-xs font-semibold px-3 py-1 rounded bg-white shadow-xs cursor-pointer uppercase tracking-wider"
                      >
                        Timeline
                      </button>

                      {!rec.overallStatus.includes('Cancelled') && !rec.overallStatus.includes('Unauthorized') && (
                        <button
                          type="button"
                          onClick={() => setCancellingRequest(rec)}
                          className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all text-xs font-semibold px-3 py-1 rounded bg-white shadow-xs cursor-pointer uppercase tracking-wider"
                        >
                          Cancel
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

      {/* Cancellation Confirmation Modal */}
      {cancellingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white border border-gray-300 rounded shadow-xl max-w-md w-full overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">Cancel Leave Application</h3>
              <button
                type="button"
                onClick={() => setCancellingRequest(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-700 leading-relaxed">
                Are you sure you want to cancel your <strong>{cancellingRequest.leaveType}</strong> for{' '}
                <strong>{cancellingRequest.startDate}</strong> to <strong>{cancellingRequest.endDate}</strong> ({cancellingRequest.daysCount} days)?
                Cancelling will restore your leave balance.
              </p>

              <form onSubmit={handleConfirmCancel} className="space-y-4">
                <div>
                  <label htmlFor="cancellation-reason-input" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Reason for Cancellation
                  </label>
                  <textarea
                    id="cancellation-reason-input"
                    rows={2}
                    required
                    placeholder="State reason for cancelling..."
                    value={cancellationReasonInput}
                    onChange={(e) => setCancellationReasonInput(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-gray-300 text-xs text-gray-800 focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setCancellingRequest(null)}
                    className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold px-3.5 py-1.5 rounded border border-gray-300 transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    Keep Application
                  </button>
                  <button
                    type="submit"
                    className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </form>
            </div>
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
                <p className="text-xs text-gray-500 mt-0.5">{selectedRecordForTimeline.leaveType} ({selectedRecordForTimeline.daysCount} Days)</p>
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
              {/* Summary box */}
              <div className="bg-gray-50 p-4 rounded border border-gray-200 text-xs space-y-1.5 text-gray-700">
                <div>
                  <strong className="text-gray-900 uppercase text-[11px] tracking-wider">Dates Requested:</strong> {selectedRecordForTimeline.startDate} to {selectedRecordForTimeline.endDate}
                </div>
                <div>
                  <strong className="text-gray-900 uppercase text-[11px] tracking-wider">Reason:</strong> {selectedRecordForTimeline.reason}
                </div>
                {selectedRecordForTimeline.handoverOfficer && (
                  <div>
                    <strong className="text-gray-900 uppercase text-[11px] tracking-wider">Acting Officer:</strong> {selectedRecordForTimeline.handoverOfficer}
                  </div>
                )}
              </div>

              {/* Vertical Multi-Level Timeline */}
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {selectedRecordForTimeline.approvalLevels.map((step) => (
                  <div key={`${step.levelNumber}-${step.roleName}`} className="relative">
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
                          Level {step.levelNumber} • {step.roleName}
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

export default MyLeavePage
