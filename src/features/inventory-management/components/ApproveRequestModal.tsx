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
export const ApproveRequestModal: React.FC<ApproveRequestModalProps> = ({ isOpen, onClose, request, onApprove, onReject }) => {
  const [approverName, setApproverName] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  if (!isOpen || !request) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 cursor-default" onClick={onClose} aria-label="Close modal" />
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden z-10 animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#801028]" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">Review Inventory Request</h3>
              <p className="text-xs text-gray-500 font-mono">{request.requestNumber}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer font-bold text-lg">×</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">{request.itemName}</p>
            <p className="mt-2">{request.reason}</p>
            <p className="mt-2">Requested by: {request.requestedBy}</p>
            {request.quantityRequested ? <p className="mt-2">Quantity: {request.quantityRequested}</p> : null}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Approver Name</label>
            <input value={approverName} onChange={(e) => setApproverName(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#801028] focus:ring-1 focus:ring-[#801028] transition-all" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Rejection Reason</label>
            <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={4} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#801028] focus:ring-1 focus:ring-[#801028] transition-all" />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button type="button" onClick={() => onReject(request.id, rejectionReason || 'No reason provided', approverName || 'Authorized Manager / Stores Lead')} className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer">Reject</button>
            <button type="button" onClick={() => onApprove(request.id, approverName || 'Authorized Manager / Stores Lead')} className="px-6 py-2.5 rounded-xl bg-[#801028] hover:bg-[#680c20] text-white text-xs font-semibold uppercase tracking-wider shadow-xs transition-all cursor-pointer">Approve</button>
          </div>
        </div>
      </div>
    </div>
  )
}
