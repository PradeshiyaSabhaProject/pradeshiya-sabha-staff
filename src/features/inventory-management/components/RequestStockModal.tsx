import React, { useState } from 'react'

interface RequestStockModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (details: {
    itemName: string
    quantityRequested: number
    reason: string
    requestedBy: string
  }) => void
}

/**
 * Modal form for submitting a stock replenishment request.
 * Collects item name, quantity, justification, and requester info, then calls onSubmit.
 */
export const RequestStockModal: React.FC<RequestStockModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [itemName, setItemName] = useState('')
  const [quantityRequested, setQuantityRequested] = useState(1)
  const [reason, setReason] = useState('')
  const [requestedBy, setRequestedBy] = useState('')
  const [error, setError] = useState('')
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen)
    if (isOpen) {
      setItemName('')
      setQuantityRequested(1)
      setReason('')
      setRequestedBy('')
      setError('')
    }
  }

  if (!isOpen) return null

  /** Collects form data and calls onSubmit with request details, then closes the modal. */
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemName.trim()) {
      setError('Please provide the item name requested.')
      return
    }
    if (quantityRequested <= 0) {
      setError('Quantity requested must be greater than 0.')
      return
    }
    if (!requestedBy.trim()) {
      setError('Please specify who is requesting the stock.')
      return
    }
    onSubmit({ itemName: itemName.trim(), quantityRequested, reason: reason.trim(), requestedBy: requestedBy.trim() })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded border border-gray-300 shadow-2xl p-6 max-w-lg w-full relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <h3 className="font-bold text-gray-900 text-base uppercase tracking-wide">
              Request New Stock
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Submit a stock replenishment request for administrative review & approval.
            </p>
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
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 flex items-center gap-2">
            <span className="font-bold">Info:</span>
            <span>
              This request will be routed to the Inventory Approvals board for manager authorization.
            </span>
          </div>

          {error && (
            <div className="rounded border border-red-200 bg-red-50 p-2.5 text-xs text-red-800 font-semibold">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="req-item-name" className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-wider">
              Item Name *
            </label>
            <input
              type="text"
              id="req-item-name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Printer Toner Cartridge (Black) or A4 Paper"
              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
              required
            />
          </div>

          <div>
            <label htmlFor="req-quantity" className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-wider">
              Quantity Needed *
            </label>
            <input
              type="number"
              id="req-quantity"
              min={1}
              value={quantityRequested}
              onChange={(e) => setQuantityRequested(Number(e.target.value))}
              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
              required
            />
          </div>

          <div>
            <label htmlFor="req-reason" className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-wider">
              Reason / Justification
            </label>
            <textarea
              id="req-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Current stock critically low, required for upcoming council session"
              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736]"
              required
            />
          </div>

          <div>
            <label htmlFor="req-by" className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-wider">
              Requested By (Officer / Section) *
            </label>
            <input
              type="text"
              id="req-by"
              value={requestedBy}
              onChange={(e) => setRequestedBy(e.target.value)}
              placeholder="e.g. Nimali Perera (Administration)"
              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
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
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RequestStockModal

