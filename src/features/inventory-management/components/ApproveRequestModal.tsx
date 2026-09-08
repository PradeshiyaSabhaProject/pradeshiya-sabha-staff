import React, { useState } from 'react'
import type { InventoryApprovalRequest } from '../data/initialInventoryData'

interface ApproveRequestModalProps {
  isOpen: boolean
  onClose: () => void
  request: InventoryApprovalRequest | null
  onApprove: (requestId: string, approverName: string) => void
  onReject: (requestId: string, reason: string, approverName: string) => void
}

/**
 * Modal for reviewing and deciding on a pending inventory request.
 * Displays request details and allows approval or rejection with optional approver name and reason.
 */
export const ApproveRequestModal: React.FC<ApproveRequestModalProps> = ({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
}) => {
  const [approverName, setApproverName] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  if (!isOpen || !request) return null

  const handleApprove = () => {
    onApprove(request.id, approverName.trim() || 'Administrative Officer')
    onClose()
  }

  const handleReject = () => {
    onReject(request.id, rejectionReason.trim() || 'Request rejected by reviewing authority', approverName.trim() || 'Administrative Officer')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded border border-gray-300 shadow-2xl p-6 max-w-lg w-full relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <span className="font-mono text-xs font-bold text-[#1e3a8a]">{request.requestNumber}</span>
            <h3 className="font-bold text-gray-900 text-base uppercase tracking-wide">
              Review Inventory Request
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 font-bold text-base cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="bg-gray-50 border border-gray-200 rounded p-3 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-500 font-semibold uppercase tracking-wider">Item Requested:</span>
              <span className="font-bold text-gray-900 text-right">{request.itemName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-semibold uppercase tracking-wider">Quantity:</span>
              <span className="font-bold text-[#1e3a8a]">{request.quantityRequested} units</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-semibold uppercase tracking-wider">Requested By:</span>
              <span className="text-gray-800">{request.requestedBy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-semibold uppercase tracking-wider">Date Requested:</span>
              <span className="text-gray-800">{request.requestedAt}</span>
            </div>
            <div className="border-t border-gray-200 pt-1.5 mt-1.5">
              <span className="text-gray-500 font-semibold uppercase tracking-wider block mb-0.5">Justification:</span>
              <p className="text-gray-700 italic">{request.reason}</p>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-wider">
              Approving / Reviewing Officer Name
            </label>
            <input
              type="text"
              placeholder="e.g. Eng. H.L. Jayawardena"
              value={approverName}
              onChange={(e) => setApproverName(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
            />
          </div>

          {showRejectForm && (
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={2}
                placeholder="Reason for declining this request"
                className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736]"
              />
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex justify-between items-center border-t border-gray-200 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex gap-2">
              {showRejectForm ? (
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Confirm Reject
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowRejectForm(true)}
                  className="px-4 py-2 bg-white border border-red-300 text-red-700 hover:bg-red-50 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Reject...
                </button>
              )}

              <button
                type="button"
                onClick={handleApprove}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
              >
                Approve Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApproveRequestModal

