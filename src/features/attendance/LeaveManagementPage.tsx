import React, { useState } from 'react'
import { MOCK_LEAVE_REQUESTS, MOCK_LEAVE_BALANCES, type LeaveRequest } from './data/mockAttendanceData'
import { ApplyLeaveModal } from './components/ApplyLeaveModal'

const getLevelContainerClass = (status: string) => {
  if (status === 'Approved') {
    return 'bg-emerald-50/70 border-emerald-300'
  }
  if (status === 'Pending') {
    return 'bg-amber-50/70 border-amber-300 shadow-xs'
  }
  return 'bg-gray-50 border-gray-200 opacity-70'
}

const getLevelStatusBadgeClass = (status: string) => {
  if (status === 'Approved') {
    return 'bg-emerald-200 text-emerald-900'
  }
  if (status === 'Pending') {
    return 'bg-amber-200 text-amber-900 animate-pulse'
  }
  return 'bg-gray-200 text-gray-700'
}

export const LeaveManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'ledger'>('requests')
  const [requests, setRequests] = useState<LeaveRequest[]>(MOCK_LEAVE_REQUESTS)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)

  const handleLevelApprove = (reqId: string, levelNum: number) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== reqId) return r
        const updatedLevels = r.approvalLevels.map((lvl) => {
          if (lvl.levelNumber === levelNum) {
            return {
              ...lvl,
              status: 'Approved' as const,
              timestamp: 'Just now',
              comments: 'Supervisor signature verified.'
            }
          }
          if (lvl.levelNumber === levelNum + 1) {
            return {
              ...lvl,
              status: 'Pending' as const
            }
          }
          return lvl
        })

        const allApproved = updatedLevels.every((l) => l.status === 'Approved')
        return {
          ...r,
          approvalLevels: updatedLevels,
          overallStatus: (allApproved ? 'Approved' : `Pending Level ${levelNum + 1}`) as LeaveRequest['overallStatus']
        }
      })
    )
  }

  return (
    <div className="space-y-6 text-left pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Leave Applications & Multi-Level Approvals
          </h1>
          <p className="text-sm text-gray-500">
            Hierarchical government leave approval pipeline (Line Manager $\rightarrow$ Dept Head $\rightarrow$ Secretary/HR) & annual entitlement ledgers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsApplyModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-md transition"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>+ Apply for Leave</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-5 text-sm font-bold border-b-2 transition ${
            activeTab === 'requests'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Multi-Level Leave Pipeline ({requests.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 px-5 text-sm font-bold border-b-2 transition ${
            activeTab === 'ledger'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Leave Entitlement & Quota Balances
        </button>
      </div>

      {activeTab === 'requests' ? (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition space-y-5"
            >
              {/* Request Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-100">
                    {req.employeeName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
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

              {/* Reason */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs text-gray-700">
                <span className="font-bold text-gray-900">Applicant Reason / Handover: </span>
                {req.reason}
              </div>

              {/* Multi-Level Workflow Steps */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Multi-Level Supervisor Approval Status
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
                        <div className="mt-4 pt-3 border-t border-amber-200/80 flex items-center justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => handleLevelApprove(req.id, lvl.levelNumber)}
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
      ) : (
        /* Leave Balances Ledger Table */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">2026 Annual Staff Leave Quotas & Balances</h3>
              <p className="text-xs text-gray-500">
                Track Casual (14), Annual (14), Medical (21), Duty Leave (10), and Compensatory Off earned from Saturday/Sunday weekend duty and overtime.
              </p>
            </div>
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
                  <th className="py-3.5 px-4 text-center">Comp-Off (Weekend/OT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {MOCK_LEAVE_BALANCES.map((bal) => (
                  <tr key={bal.employeeId} className="hover:bg-gray-50/60 transition">
                    <td className="py-4 px-5">
                      <div className="font-bold text-gray-900">{bal.employeeName}</div>
                      <div className="text-xs text-gray-500">{bal.employeeId} • {bal.designation}</div>
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

      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSubmit={() => {}}
      />
    </div>
  )
}

