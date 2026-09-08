import React, { useMemo, useState } from 'react'
import { useInventoryData } from '../hooks/useInventoryData'
import { RequestStockModal } from '../components/RequestStockModal'
import { ApprovalStatusBadge } from '../components/StatusBadges'
import type { ApprovalStatus } from '../data/initialInventoryData'

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────
const AddIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const RequestCardIcon = () => (
  <div className="p-1.5 bg-blue-50/60 rounded text-blue-800 shrink-0">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  </div>
)

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

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-gray-400 shrink-0 pointer-events-none">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

/**
 * Page for staff to submit stock replenishment requests.
 * Displays submission form and history of all requests with their current approval status.
 */
export const InventoryRequestPage: React.FC = () => {
  const { requests, requestStock } = useInventoryData()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'All'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6

  const totalRequests = requests.length
  const pendingCount = requests.filter((r) => r.status === 'Pending Approval').length
  const approvedCount = requests.filter((r) => r.status === 'Approved').length

  const filteredRequests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return requests.filter((req) => {
      const matchesStatus = statusFilter === 'All' || req.status === statusFilter
      const matchesSearch =
        !q ||
        req.requestNumber.toLowerCase().includes(q) ||
        req.itemName.toLowerCase().includes(q) ||
        req.requestedBy.toLowerCase().includes(q) ||
        req.reason.toLowerCase().includes(q)
      return matchesStatus && matchesSearch
    })
  }, [requests, statusFilter, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / pageSize) || 1
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Municipal Store Requisitions & Supply Orders
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Submit and track store material replenishment requisitions for council administration and storekeeper review.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold px-4 py-2 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <AddIcon />
          <span>+ New Requisition</span>
        </button>
      </div>

      {/* ── 3 Summary KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Total Requisitions
            </span>
            <RequestCardIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {totalRequests}
            </p>
            <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              All Orders
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Pending Authorization
            </span>
            <PendingCardIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-800 tracking-tight">
              {pendingCount}
            </p>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Awaiting Review
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Approved & Dispatched
            </span>
            <ApprovedCardIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800 tracking-tight">
              {approvedCount}
            </p>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Authorized
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Container: Requests Ledger Table ── */}
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
        {/* Table Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide">
              Municipal Stock Requisitions Ledger
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Comprehensive log of replenishment requests, justifications, and managerial approval outcomes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert('Exporting REQUISITIONS.csv...')}
              className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer text-center"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 bg-gray-50/50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search request #, item, requester..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full sm:w-72 bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9 font-medium"
            />

            <div className="relative min-w-[170px]">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as ApprovalStatus | 'All')
                  setCurrentPage(1)
                }}
                className="w-full appearance-none bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#A31736] pr-8 cursor-pointer h-9 font-medium"
              >
                <option value="All">All Requisition Statuses</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <div className="absolute right-2.5 top-2.5 pointer-events-none">
                <ChevronDownIcon />
              </div>
            </div>
          </div>

          {(statusFilter !== 'All' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('All')
                setSearchQuery('')
                setCurrentPage(1)
              }}
              className="text-xs font-bold text-[#A31736] hover:text-[#801028] transition-colors cursor-pointer uppercase tracking-wider self-start sm:self-auto"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-100 border-y border-gray-300 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-6 w-36">Request #</th>
                <th className="py-3 px-6">Item Requested</th>
                <th className="py-3 px-6">Qty Needed</th>
                <th className="py-3 px-6">Requested By</th>
                <th className="py-3 px-6">Date Requested</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6">Decision & Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {paginatedRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <span className="font-mono text-xs font-bold text-[#1e3a8a]">
                      {req.requestNumber}
                    </span>
                  </td>

                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <p className="font-bold text-gray-900 text-xs">{req.itemName}</p>
                    <p className="text-[11px] text-gray-500 font-medium max-w-xs truncate">{req.reason}</p>
                  </td>

                  <td className="py-3.5 px-6 font-bold text-gray-900 text-xs whitespace-nowrap">
                    {req.quantityRequested} units
                  </td>

                  <td className="py-3.5 px-6 text-xs text-gray-700 font-medium whitespace-nowrap">
                    {req.requestedBy}
                  </td>

                  <td className="py-3.5 px-6 text-xs text-gray-600 font-mono whitespace-nowrap">
                    {req.requestedAt}
                  </td>

                  <td className="py-3.5 px-6 text-center whitespace-nowrap">
                    <ApprovalStatusBadge status={req.status} />
                  </td>

                  <td className="py-3.5 px-6 text-xs whitespace-nowrap">
                    {req.status === 'Approved' && req.approverName && (
                      <span className="text-emerald-800 font-medium">
                        Approved by {req.approverName} ({req.approvedAt})
                      </span>
                    )}
                    {req.status === 'Rejected' && req.rejectionReason && (
                      <span className="text-red-800 font-medium">
                        Rejected: {req.rejectionReason}
                      </span>
                    )}
                    {req.status === 'Pending Approval' && (
                      <span className="text-amber-800 font-medium italic">
                        Under administrative review
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {paginatedRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 font-medium italic">
                    No requisition requests found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-gray-600 font-semibold">
            Showing {filteredRequests.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, filteredRequests.length)} of {filteredRequests.length} requisitions
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                className="w-8 h-8 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer shadow-3xs text-xs font-bold"
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const p = idx + 1
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded text-xs font-bold transition-all cursor-pointer ${
                      currentPage === p
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
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                className="w-8 h-8 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer shadow-3xs text-xs font-bold"
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>

      <RequestStockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={requestStock}
      />
    </div>
  )
}

export default InventoryRequestPage

