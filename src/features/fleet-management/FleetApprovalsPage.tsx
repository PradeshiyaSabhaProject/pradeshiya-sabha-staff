import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useFleetData } from './hooks/useFleetData'
import type { FleetApprovalRequest, ApprovalStatus } from './data/initialFleetData'

export const FleetApprovalsPage: React.FC = () => {
  const location = useLocation()
  const { approvalRequests, approveRequest, rejectRequest } = useFleetData()

  const [activeTab, setActiveTab] = useState<'All' | ApprovalStatus>('Pending Approval')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<FleetApprovalRequest | null>(null)
  const [rejectModalReq, setRejectModalReq] = useState<FleetApprovalRequest | null>(null)
  const [rejectionNote, setRejectionNote] = useState('')

  const pendingCount = approvalRequests.filter((r) => r.status === 'Pending Approval').length
  const approvedCount = approvalRequests.filter((r) => r.status === 'Approved').length
  const rejectedCount = approvalRequests.filter((r) => r.status === 'Rejected').length

  const filteredRequests = approvalRequests.filter((r) => {
    const matchStatus = activeTab === 'All' || r.status === activeTab
    const matchSearch =
      searchTerm === '' ||
      r.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.targetVehicleReg?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchStatus && matchSearch
  })

  const getActionBadgeStyle = (actionType: string) => {
    switch (actionType) {
      case 'DISPATCH_VEHICLE':
        return 'bg-blue-50 text-[#1e3a8a] border-blue-200'
      case 'SCHEDULE_MAINTENANCE':
        return 'bg-orange-50 text-orange-800 border-orange-200'
      case 'ADD_VEHICLE':
        return 'bg-purple-50 text-purple-800 border-purple-200'
      case 'ASSIGN_DRIVER':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200'
      case 'RETURN_MISSION':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200'
      case 'COMPLETE_MAINTENANCE':
        return 'bg-teal-50 text-teal-800 border-teal-200'
      case 'RENEW_PERMIT':
        return 'bg-pink-50 text-pink-800 border-pink-200'
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200'
    }
  }

  const formatActionLabel = (actionType: string) => {
    switch (actionType) {
      case 'DISPATCH_VEHICLE':
        return 'Mission Dispatch'
      case 'SCHEDULE_MAINTENANCE':
        return 'Workshop Maintenance'
      case 'ADD_VEHICLE':
        return 'New Fleet Asset'
      case 'ASSIGN_DRIVER':
        return 'Driver Assignment'
      case 'RETURN_MISSION':
        return 'Return to Depot'
      case 'COMPLETE_MAINTENANCE':
        return 'Complete Repair'
      case 'RENEW_PERMIT':
        return 'Permit & License'
      default:
        return actionType
    }
  }

  const handleApprove = (req: FleetApprovalRequest) => {
    approveRequest(req.id, 'Eng. H.L. Jayawardena (Municipal Engineer)')
  }

  const handleRejectConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectModalReq) return
    rejectRequest(
      rejectModalReq.id,
      rejectionNote || 'Does not meet municipal authorization criteria.',
      'Eng. H.L. Jayawardena (Municipal Engineer)'
    )
    setRejectModalReq(null)
    setRejectionNote('')
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
            Pradeshiya Sabha Administration • Fleet Management
          </div>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
            Fleet Governance & Management Approvals
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Authorize vehicle dispatch orders, workshop repairs, driver assignments, and asset registrations
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
        <Link
          to="/fleet/overview"
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
            location.pathname.includes('/overview')
              ? 'bg-[#A31736] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          Overview
        </Link>
        <Link
          to="/fleet/vehicles"
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
            location.pathname.includes('/vehicles')
              ? 'bg-[#A31736] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          Vehicle Directory
        </Link>
        <Link
          to="/fleet/dispatch"
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
            location.pathname.includes('/dispatch')
              ? 'bg-[#A31736] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          Mission Dispatch
        </Link>
        <Link
          to="/fleet/maintenance"
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
            location.pathname.includes('/maintenance')
              ? 'bg-[#A31736] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          Maintenance Hub
        </Link>
        <Link
          to="/fleet/drivers"
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
            location.pathname.includes('/drivers')
              ? 'bg-[#A31736] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          Drivers & Operators
        </Link>
        <Link
          to="/fleet/approvals"
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
            location.pathname.includes('/approvals')
              ? 'bg-[#A31736] text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <span>Approvals Desk</span>
          {pendingCount > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                location.pathname.includes('/approvals')
                  ? 'bg-white text-[#A31736]'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {pendingCount}
            </span>
          )}
        </Link>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Pending Authorization
            </span>
            <span className="text-2xl font-extrabold text-amber-600">{pendingCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            !
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Authorized & Executed
            </span>
            <span className="text-2xl font-extrabold text-emerald-600">{approvedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            ✓
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Declined / Rejected
            </span>
            <span className="text-2xl font-extrabold text-[#A31736]">{rejectedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#A31736] flex items-center justify-center font-bold">
            ×
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {(['Pending Approval', 'All', 'Approved', 'Rejected'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-[#A31736] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab === 'All' ? 'All Requests' : tab}
            </button>
          ))}
        </div>

        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search request #, vehicle, or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#A31736]"
          />
        </div>
      </div>

      {/* Requests Table / Cards */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs font-semibold">
            No approval requests match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch]">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">REQUEST ID</th>
                  <th className="py-3 px-4">OPERATION TYPE</th>
                  <th className="py-3 px-4">ACTION & DETAILS</th>
                  <th className="py-3 px-4">REQUESTED BY</th>
                  <th className="py-3 px-4">REQUIRED AUTHORITY</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">MANAGEMENT ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#1e3a8a]">
                      {req.requestNumber}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded border text-[10px] font-extrabold uppercase tracking-wider ${getActionBadgeStyle(
                          req.actionType
                        )}`}
                      >
                        {formatActionLabel(req.actionType)}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-bold text-gray-900">{req.title}</div>
                      <p className="text-gray-500 text-[11px] truncate mt-0.5">
                        {req.description}
                      </p>
                      {req.targetVehicleReg && (
                        <span className="inline-block mt-1 text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono font-bold">
                          Vehicle: {req.targetVehicleReg}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-800">{req.requestedBy}</div>
                      <div className="text-[10px] text-gray-400">{req.requestedAt}</div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-gray-700">
                      {req.requiredApproverRole}
                    </td>

                    <td className="py-3 px-4">
                      {req.status === 'Pending Approval' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px] uppercase">
                          Pending Approval
                        </span>
                      )}
                      {req.status === 'Approved' && (
                        <div>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] uppercase">
                            Approved
                          </span>
                          {req.approverName && (
                            <div className="text-[10px] text-gray-400 mt-1">
                              By: {req.approverName}
                            </div>
                          )}
                        </div>
                      )}
                      {req.status === 'Rejected' && (
                        <div>
                          <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold text-[10px] uppercase">
                            Rejected
                          </span>
                          {req.rejectionReason && (
                            <div className="text-[10px] text-gray-500 mt-1 max-w-xs truncate">
                              Note: {req.rejectionReason}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {req.status === 'Pending Approval' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(req)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer"
                          >
                            Approve & Execute
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectModalReq(req)}
                            className="px-3 py-1.5 bg-[#A31736] hover:bg-[#801028] text-white rounded text-[11px] font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedRequest(req)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[11px] font-semibold uppercase tracking-wider cursor-pointer"
                        >
                          View Log
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Reason Modal */}
      {rejectModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-default"
            onClick={() => setRejectModalReq(null)}
            aria-label="Close modal"
          />
          <div className="relative bg-white max-w-md w-full rounded-2xl shadow-2xl border border-gray-200 p-6 z-10 animate-scale-up text-left">
            <h3 className="text-base font-extrabold text-[#0f172a] mb-1">
              Decline Authorization Request
            </h3>
            <p className="text-xs text-gray-500 mb-4 font-mono">
              {rejectModalReq.requestNumber} • {rejectModalReq.title}
            </p>

            <form onSubmit={handleRejectConfirm} className="space-y-4">
              <div>
                <label htmlFor="reject-reason-text" className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">
                  Reason for Rejection *
                </label>
                <textarea
                  id="reject-reason-text"
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  placeholder="State municipal reason for denying this fleet operation..."
                  className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs focus:outline-none focus:border-[#A31736]"
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalReq(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#A31736] hover:bg-[#801028] text-white rounded text-xs font-semibold uppercase tracking-wider shadow-sm cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Log Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-default"
            onClick={() => setSelectedRequest(null)}
            aria-label="Close details"
          />
          <div className="relative bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-gray-200 p-6 z-10 animate-scale-up space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#1e3a8a]">
                  {selectedRequest.requestNumber}
                </span>
                <h3 className="text-base font-extrabold text-[#0f172a] mt-0.5">
                  {selectedRequest.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-700 font-bold text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-2 text-xs text-gray-700">
              <div className="flex justify-between border-b border-gray-50 pb-1.5">
                <span className="font-bold text-gray-400 uppercase">Status</span>
                <span className="font-bold text-gray-900">{selectedRequest.status}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-1.5">
                <span className="font-bold text-gray-400 uppercase">Requested By</span>
                <span>{selectedRequest.requestedBy}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-1.5">
                <span className="font-bold text-gray-400 uppercase">Requested At</span>
                <span>{selectedRequest.requestedAt}</span>
              </div>
              {selectedRequest.approverName && (
                <div className="flex justify-between border-b border-gray-50 pb-1.5">
                  <span className="font-bold text-gray-400 uppercase">Authorized By</span>
                  <span className="font-semibold text-emerald-800">
                    {selectedRequest.approverName}
                  </span>
                </div>
              )}
              {selectedRequest.rejectionReason && (
                <div className="p-3 rounded bg-red-50 border border-red-200 text-red-800">
                  <strong className="block uppercase tracking-wider text-[10px] text-[#A31736] mb-0.5">
                    Rejection Reason
                  </strong>
                  {selectedRequest.rejectionReason}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

