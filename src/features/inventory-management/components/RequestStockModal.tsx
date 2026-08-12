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

export const RequestStockModal: React.FC<RequestStockModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [itemName, setItemName] = useState('')
  const [quantityRequested, setQuantityRequested] = useState(1)
  const [reason, setReason] = useState('')
  const [requestedBy, setRequestedBy] = useState('')
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen)
    if (isOpen) {
      setItemName('')
      setQuantityRequested(1)
      setReason('')
      setRequestedBy('')
    }
  }

  if (!isOpen) return null

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ itemName, quantityRequested, reason, requestedBy })
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

      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden z-10 animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A31736]" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">Request New Stock</h3>
              <p className="text-xs text-gray-500">Submit a request for replenishment approval</p>
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
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#1e3a8a] shrink-0" />
            <span>
              This request will be sent to the Inventory Approvals board for review before stock is
              added.
            </span>
          </div>

          <div>
            <label htmlFor="req-item-name" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
              Item Name
            </label>
            <input
              type="text"
              id="req-item-name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Printer Toner Cartridge (Black)"
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
              required
            />
          </div>

          <div>
            <label htmlFor="req-quantity" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
              Quantity Needed
            </label>
            <input
              type="number"
              id="req-quantity"
              min={1}
              value={quantityRequested}
              onChange={(e) => setQuantityRequested(Number(e.target.value))}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
              required
            />
          </div>

          <div>
            <label htmlFor="req-reason" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
              Reason / Justification
            </label>
            <textarea
              id="req-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
              required
            />
          </div>

          <div>
            <label htmlFor="req-by" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
              Requested By
            </label>
            <input
              type="text"
              id="req-by"
              value={requestedBy}
              onChange={(e) => setRequestedBy(e.target.value)}
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
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
