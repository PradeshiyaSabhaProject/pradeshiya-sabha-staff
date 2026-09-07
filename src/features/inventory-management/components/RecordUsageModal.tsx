import React, { useState } from 'react'
import type { InventoryItemRecord } from '../data/initialInventoryData'

interface RecordUsageModalProps {
  isOpen: boolean
  onClose: () => void
  item: InventoryItemRecord | null
  onSubmit: (
    itemId: string,
    details: { quantityUsed: number; usedBy: string; department: string; notes: string },
  ) => InventoryItemRecord | null
}

/**
 * Modal form for recording consumption of an inventory item.
 * Validates quantity does not exceed available stock and calls onSubmit with usage details.
 */
export const RecordUsageModal: React.FC<RecordUsageModalProps> = ({
  isOpen,
  onClose,
  item,
  onSubmit,
}) => {
  const [quantityUsed, setQuantityUsed] = useState(1)
  const [usedBy, setUsedBy] = useState('')
  const [department, setDepartment] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [prevItemId, setPrevItemId] = useState(item?.id)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  if (isOpen !== prevIsOpen || item?.id !== prevItemId) {
    setPrevIsOpen(isOpen)
    setPrevItemId(item?.id)
    if (isOpen) {
      setQuantityUsed(1)
      setUsedBy('')
      setDepartment(item?.department || '')
      setNotes('')
      setError('')
    }
  }

  if (!isOpen || !item) return null

  /** Validates usage quantity and department, then calls onSubmit to record the usage entry. */
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (quantityUsed <= 0) {
      setError('Quantity used must be at least 1.')
      return
    }
    if (quantityUsed > item.quantityAvailable) {
      setError(`Only ${item.quantityAvailable} ${item.unit} available — cannot record more than that.`)
      return
    }
    const result = onSubmit(item.id, { quantityUsed, usedBy, department, notes })
    if (!result) {
      setError('Could not record usage. Please check the values and try again.')
      return
    }
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
            <span className="w-2.5 h-2.5 rounded-full bg-[#801028]" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">Record Stock Usage</h3>
              <p className="text-xs text-gray-500 font-mono">
                {item.itemCode} • {item.name}
              </p>
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
              Recording usage reduces this item's available quantity immediately. Currently{' '}
              <strong>{item.quantityAvailable} {item.unit}</strong> in stock.
            </span>
          </div>

          <div>
            <label htmlFor="usage-quantity" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
              Quantity Used ({item.unit})
            </label>
            <input
              type="number"
              id="usage-quantity"
              min={1}
              max={item.quantityAvailable}
              value={quantityUsed}
              onChange={(e) => setQuantityUsed(Number(e.target.value))}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#801028] focus:ring-1 focus:ring-[#801028] transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="usage-by" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
              Used By
            </label>
            <input
              type="text"
              id="usage-by"
              value={usedBy}
              onChange={(e) => setUsedBy(e.target.value)}
              placeholder="Staff member name"
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#801028] focus:ring-1 focus:ring-[#801028] transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="usage-department" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
              Department
            </label>
            <input
              type="text"
              id="usage-department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#801028] focus:ring-1 focus:ring-[#801028] transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="usage-notes" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
              Notes (optional)
            </label>
            <textarea
              id="usage-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Used for council meeting handouts"
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#801028] focus:ring-1 focus:ring-[#801028] transition-all"
            />
          </div>

          {error && (
            <p className="text-xs font-semibold text-[#801028]">{error}</p>
          )}

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#801028] hover:bg-[#680c20] text-white text-xs font-semibold uppercase tracking-wider shadow-xs transition-all cursor-pointer"
            >
              Record Usage
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
