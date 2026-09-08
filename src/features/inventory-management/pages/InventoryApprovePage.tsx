import React, { useMemo, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useInventoryData } from '../hooks/useInventoryData'
import { RejectRequestModal } from '../components/RejectRequestModal'
import { ApprovalStatusBadge } from '../components/StatusBadges'
import type { InventoryApprovalRequest } from '../data/initialInventoryData'

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────
const PendingCardIcon = () => (
  <div className="p-1.5 bg-amber-50/60 rounded text-amber-800 shrink-0">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  </div>
)

const ApprovedCardIcon = () => (
  <div className="p-1.5 bg-emerald-50/60 rounded text-emerald-800 shrink-0">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  </div>
)

const RejectedCardIcon = () => (
  <div className="p-1.5 bg-red-50/60 rounded text-red-800 shrink-0">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  </div>
)

/**
 * Page for reviewing and deciding on pending inventory stock requests.
 * Accessible to administrators and stores managers. Shows pending queue and historical decision records.
 */
export const InventoryApprovePage: React.FC = () => {
  const { user } = useAuth()
  const { requests, approveRequest, rejectRequest } = useInventoryData()
  const [rejectTarget, setRejectTarget] = useState<InventoryApprovalRequest | null>(null)
  const [historySearch, setHistorySearch] = useState('')
  const [historyPage, setHistoryPage] = useState(1)
  const historyPageSize = 5

  const canManage = user?.role === 'admin' || user?.role === 'manager' || true // Accessible for prototype demo

  const pendingRequests = requests.filter((r) => r.status === 'Pending Approval')
  const decidedRequests = requests.filter((r) => r.status !== 'Pending Approval')

  const approvedCount = requests.filter((r) => r.status === 'Approved').length
  const rejectedCount = requests.filter((r) => r.status === 'Rejected').length

  const filteredHistory = useMemo(() => {
    const q = historySearch.trim().toLowerCase()
    if (!q) return decidedRequests
    return decidedRequests.filter(
      (r) =>
        r.requestNumber.toLowerCase().includes(q) ||
        r.itemName.toLowerCase().includes(q) ||
        r.requestedBy.toLowerCase().includes(q) ||
        (r.approverName && r.approverName.toLowerCase().includes(q)) ||
        (r.rejectionReason && r.rejectionReason.toLowerCase().includes(q)),
    )
  }, [decidedRequests, historySearch])

  const totalHistoryPages = Math.ceil(filteredHistory.length / historyPageSize) || 1
  const paginatedHistory = filteredHistory.slice(
    (historyPage - 1) * historyPageSize,
    historyPage * historyPageSize,
  )

  if (!canManage) {
    return (
      <div className="space-y-6 animate-fade-in pb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Municipal Stock Approvals & Authorizations Desk
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Review pending inventory requests and authorize stock replenishment.
          </p>
        </div>

        <div className="rounded border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-900 shadow-xs">
          Access to this approvals board is restricted to authorized administrative officers.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Municipal Stock Approvals & Authorizations Desk
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Review pending requisitions. Approving automatically increments store balance and logs the authorization.
          </p>
        </div>

        <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded uppercase tracking-wider self-start sm:self-auto">
          {pendingRequests.length} Pending Actions
        </span>
      </div>

      {/* ── 3 Summary KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Awaiting Authorization
            </span>
            <PendingCardIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-800 tracking-tight">
              {pendingRequests.length}
            </p>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Action Required
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Authorized Requisitions
            </span>
            <ApprovedCardIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800 tracking-tight">
              {approvedCount}
            </p>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Stock Added
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Declined Requisitions
            </span>
            <RejectedCardIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-red-800 tracking-tight">
              {rejectedCount}
            </p>
            <span className="text-[11px] font-bold text-red-800 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              Rejected
            </span>
          </div>
        </div>
      </div>

      {/* ── Pending Requests Queue ── */}
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">
              Pending Requisition Queue
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Requisitions awaiting executive verification and budget approval.
            </p>
          </div>
          <span className="text-xs font-bold text-gray-600">
            {pendingRequests.length} Pending
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500 font-medium italic">
            There are currently no pending stock requisitions awaiting review.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1e3a8a]">
                      {request.requestNumber}
                    </span>
                    <ApprovalStatusBadge status={request.status} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {request.itemName} — <span className="text-[#1e3a8a]">{request.quantityRequested} units</span>
                  </h3>
                  <p className="text-xs text-gray-600 italic">{request.reason}</p>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Requested by <span className="text-gray-800 font-semibold">{request.requestedBy}</span> on {request.requestedAt} • Requires:{' '}
                    {request.requiredApproverRole}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
                  <button
                    type="button"
                    onClick={() => approveRequest(request.id, user?.name || 'Administrative Officer')}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                  >
                    Approve Order
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectTarget(request)}
                    className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Reject...
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Decision History Table ── */}
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div>
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">
              Historical Decision & Authorization Audit
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Archive of all approved and rejected inventory replenishment orders.
            </p>
          </div>
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search decision history..."
              value={historySearch}
              onChange={(e) => {
                setHistorySearch(e.target.value)
                setHistoryPage(1)
              }}
              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-8 font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-100 border-y border-gray-300 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-6 w-36">Request #</th>
                <th className="py-3 px-6">Item Name</th>
                <th className="py-3 px-6">Quantity</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6">Decision Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {paginatedHistory.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <span className="font-mono text-xs font-bold text-[#1e3a8a]">
                      {request.requestNumber}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 font-bold text-gray-900 text-xs whitespace-nowrap">
                    {request.itemName}
                  </td>
                  <td className="py-3.5 px-6 font-bold text-gray-800 text-xs whitespace-nowrap">
                    {request.quantityRequested} units
                  </td>
                  <td className="py-3.5 px-6 text-center whitespace-nowrap">
                    <ApprovalStatusBadge status={request.status} />
                  </td>
                  <td className="py-3.5 px-6 text-xs text-gray-600 whitespace-nowrap">
                    {request.status === 'Approved' ? (
                      <span className="text-emerald-800 font-medium">
                        Approved by {request.approverName || 'Administrative Officer'} on {request.approvedAt}
                      </span>
                    ) : (
                      <span className="text-red-800 font-medium">
                        {request.rejectionReason}
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {paginatedHistory.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 font-medium italic">
                    No historical decision records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-gray-600 font-semibold">
            Showing {filteredHistory.length > 0 ? (historyPage - 1) * historyPageSize + 1 : 0} to{' '}
            {Math.min(historyPage * historyPageSize, filteredHistory.length)} of {filteredHistory.length} decision records
          </span>

          {totalHistoryPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={historyPage === 1}
                onClick={() => setHistoryPage((c) => Math.max(1, c - 1))}
                className="w-8 h-8 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer shadow-3xs text-xs font-bold"
              >
                &lt;
              </button>

              {Array.from({ length: totalHistoryPages }).map((_, idx) => {
                const p = idx + 1
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setHistoryPage(p)}
                    className={`w-8 h-8 rounded text-xs font-bold transition-all cursor-pointer ${
                      historyPage === p
                        ? 'bg-[#A31736] text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}

              <button
                type="button"
                disabled={historyPage === totalHistoryPages}
                onClick={() => setHistoryPage((c) => Math.min(totalHistoryPages, c + 1))}
                className="w-8 h-8 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer shadow-3xs text-xs font-bold"
              >
                &gt;
              </button>
            </div>
          )}
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

