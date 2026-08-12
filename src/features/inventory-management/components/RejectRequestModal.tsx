import React, { useState } from 'react'
import type { InventoryApprovalRequest } from '../data/initialInventoryData'

interface RejectRequestModalProps {
  isOpen: boolean
  onClose: () => void
  request: InventoryApprovalRequest | null
  onReject: (requestId: string, reason: string) => void
}

export const RejectRequestModal: React.FC<RejectRequestModalProps> = ({
  isOpen,
  onClose,
  request,
  onReject,
}) => {
  const [reason, setReason] = useState('')
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen)
    if (isOpen) setReason('')
  }

  if (!isOpen || !request) return null

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onReject(request.id, reason)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 cursor-default"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden z-10 animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A31736]" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">Reject Request</h3>
              <p className="text-xs text-gray-500 font-mono">{request.requestNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer font-bold text-lg"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#A31736] shrink-0" />
            <span>
              Rejecting <strong>{request.itemName}</strong> ({request.quantityRequested} units) will
              notify the requester. Please provide a reason.
            </span>
          </div>

          <div>
            <label htmlFor="reject-reason" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
              Rejection Reason
            </label>
            <textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Budget not available this quarter"
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
              required
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
