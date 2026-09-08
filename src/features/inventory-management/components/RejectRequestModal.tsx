import React, { useState } from 'react'
import type { InventoryApprovalRequest } from '../data/initialInventoryData'

interface RejectRequestModalProps {
  isOpen: boolean
  onClose: () => void
  request: InventoryApprovalRequest | null
  onReject: (requestId: string, reason: string) => void
}

/**
 * Modal form for rejecting a pending inventory request.
 * Collects a reason and calls onReject with the request ID and reason.
 */
export const RejectRequestModal: React.FC<RejectRequestModalProps> = ({
  isOpen,
  onClose,
  request,
  onReject,
}) => {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen)
    if (isOpen) {
      setReason('')
      setError('')
    }
  }

  if (!isOpen || !request) return null

  /** Validates rejection reason and calls onReject with the request ID and reason. */
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError('Please provide a reason for rejecting this stock request.')
      return
    }
    onReject(request.id, reason.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded border border-gray-300 shadow-2xl p-6 max-w-md w-full relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <span className="font-mono text-xs font-bold text-[#1e3a8a]">{request.requestNumber}</span>
            <h3 className="font-bold text-gray-900 text-base uppercase tracking-wide">
              Reject Stock Request
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-700 font-bold text-base cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4 pt-1">
          <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800">
            Rejecting <strong>{request.itemName}</strong> ({request.quantityRequested} units requested by {request.requestedBy}).
          </div>

          {error && (
            <div className="rounded border border-red-200 bg-red-50 p-2.5 text-xs text-red-800 font-semibold">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="reject-reason" className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-wider">
              Rejection Reason / Remarks *
            </label>
            <textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Budget allocation exhausted for this quarter or duplicate request"
              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736]"
              required
            />
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-2.5 border-t border-gray-200 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#A31736] hover:bg-[#801028] text-white rounded text-xs font-bold uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RejectRequestModal

