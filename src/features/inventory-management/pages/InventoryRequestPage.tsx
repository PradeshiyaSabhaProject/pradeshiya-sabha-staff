import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useInventoryData } from '../hooks/useInventoryData'
import { RequestStockModal } from '../components/RequestStockModal'
import { ApprovalStatusBadge } from '../components/StatusBadges'

const InventoryRequestPage: React.FC = () => {
  const { requests, requestStock } = useInventoryData()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const pendingCount = requests.filter((r) => r.status === 'Pending Approval').length

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
              Inventory Request
            </span>
          </div>
          <h1 className="text-[26px] font-extrabold text-[#0f172a] tracking-tight">
            Request New Stock
          </h1>
          <p className="text-gray-500 text-sm mt-1 max-w-2xl leading-relaxed">
            Submit a request for stock replenishment. Requests are reviewed on the Inventory
            Approvals board.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-[#A31736] hover:bg-[#801028] text-white rounded text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer shrink-0"
        >
          + New Request
        </button>
      </div>

      <div className="bg-white rounded border border-gray-300 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Request History</h2>
            <p className="text-xs text-gray-500">All stock requests and their current status</p>
          </div>
          <span className="px-3.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded text-xs font-bold uppercase tracking-wider">
            {pendingCount} Pending
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {requests.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No requests submitted yet. Click "New Request" to get started.
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-3"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#1e3a8a] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      {request.requestNumber}
                    </span>
                    <ApprovalStatusBadge status={request.status} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {request.itemName} — {request.quantityRequested} units
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">{request.reason}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Requested by {request.requestedBy} on {request.requestedAt}
                  </p>
                  {request.status === 'Approved' && request.approverName && (
                    <p className="text-xs text-emerald-700 mt-1">
                      Approved by {request.approverName} on {request.approvedAt}
                    </p>
                  )}
                  {request.status === 'Rejected' && request.rejectionReason && (
                    <p className="text-xs text-[#A31736] mt-1">
                      Rejected: {request.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            ))
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
