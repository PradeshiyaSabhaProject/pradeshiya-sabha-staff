import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useInventoryData } from '../hooks/useInventoryData'
import { RejectRequestModal } from '../components/RejectRequestModal'
import { ApprovalStatusBadge } from '../components/StatusBadges'
import type { InventoryApprovalRequest } from '../data/initialInventoryData'

const InventoryApprovePage: React.FC = () => {
  const { user } = useAuth()
  const { requests, approveRequest, rejectRequest } = useInventoryData()
  const [rejectTarget, setRejectTarget] = useState<InventoryApprovalRequest | null>(null)

  // TODO: replace this prototype check with real role-based access control
  // once backend auth/roles are wired up — matches the pattern already used
  // for other restricted actions in this project.
  const canManage = user?.role === 'admin'

  const pendingRequests = requests.filter((r) => r.status === 'Pending Approval')
  const decidedRequests = requests.filter((r) => r.status !== 'Pending Approval')

  if (!canManage) {
    return (
      <div className="space-y-6 animate-fade-in pb-8">
        <div>
          <h1 className="text-[26px] font-extrabold text-[#0f172a] tracking-tight">
            Inventory Approvals
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Review pending inventory requests and approve or reject them.
          </p>
        </div>

        <div className="rounded border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 shadow-sm">
          Access to this approvals board is restricted to administrators for now. A real
          role-based guard should be connected to the authentication service later.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/inventory-management/overview"
              className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a] hover:underline"
            >
              Inventory Management
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              Approvals
            </span>
          </div>
          <h1 className="text-[26px] font-extrabold text-[#0f172a] tracking-tight">
            Inventory Request Approvals
          </h1>
          <p className="text-gray-500 text-sm mt-1 max-w-2xl leading-relaxed">
            Review pending stock requests. Approving adds the quantity to matching stock
            automatically.
          </p>
        </div>

        <span className="px-3.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded text-xs font-bold uppercase tracking-wider">
          {pendingRequests.length} Awaiting Review
        </span>
      </div>

      {/* ── Pending Requests ── */}
      <div className="bg-white rounded border border-gray-300 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">Pending Requests</h2>
          <p className="text-xs text-gray-500">Awaiting a decision</p>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            There are no pending requests at the moment.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="p-5 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1e3a8a] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      {request.requestNumber}
                    </span>
                    <ApprovalStatusBadge status={request.status} />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    {request.itemName} — {request.quantityRequested} units
                  </h3>
                  <p className="text-xs text-gray-600">{request.reason}</p>
                  <p className="text-xs text-gray-400">
                    Requested by {request.requestedBy} on {request.requestedAt} • Requires:{' '}
                    {request.requiredApproverRole}
                  </p>
                </div>

                <div className="flex gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => approveRequest(request.id, user?.name || 'Administrator')}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectTarget(request)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Decision History ── */}
      <div className="bg-white rounded border border-gray-300 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">Decision History</h2>
          <p className="text-xs text-gray-500">Previously approved or rejected requests</p>
        </div>

        <div className="overflow-x-auto relative">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">REQUEST #</th>
                <th className="py-4 px-6">ITEM</th>
                <th className="py-4 px-6">QUANTITY</th>
                <th className="py-4 px-6">STATUS</th>
                <th className="py-4 px-6">DECISION DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {decidedRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 px-6 text-center text-gray-500 text-sm">
                    No decisions have been made yet.
                  </td>
                </tr>
              ) : (
                decidedRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-[#1e3a8a]">
                      {request.requestNumber}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-gray-900">{request.itemName}</td>
                    <td className="py-3.5 px-6 text-gray-700">{request.quantityRequested}</td>
                    <td className="py-3.5 px-6">
                      <ApprovalStatusBadge status={request.status} />
                    </td>
                    <td className="py-3.5 px-6 text-xs text-gray-600">
                      {request.status === 'Approved'
                        ? `Approved by ${request.approverName} on ${request.approvedAt}`
                        : request.rejectionReason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RejectRequestModal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        request={rejectTarget}
        onReject={rejectRequest}
      />
    </div>
  )
}

export default InventoryApprovePage
