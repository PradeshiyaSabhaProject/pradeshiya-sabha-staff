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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded border border-gray-300 shadow-2xl p-6 max-w-lg w-full relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <span className="font-mono text-xs font-bold text-[#1e3a8a]">{item.itemCode}</span>
            <h3 className="font-bold text-gray-900 text-base uppercase tracking-wide">
              Record Stock Usage
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
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 flex items-center gap-2">
            <span className="font-bold">Notice:</span>
            <span>
              Reduces current stock immediately. Currently{' '}
              <strong>{item.quantityAvailable} {item.unit}</strong> available in store.
            </span>
          </div>

          {error && (
            <div className="rounded border border-red-200 bg-red-50 p-2.5 text-xs text-red-800 font-semibold">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="usage-quantity" className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-wider">
              Quantity Used ({item.unit}) *
            </label>
            <input
              type="number"
              id="usage-quantity"
              min={1}
              max={item.quantityAvailable}
              value={quantityUsed}
              onChange={(e) => setQuantityUsed(Number(e.target.value))}
              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
              required
            />
          </div>

          <div>
            <label htmlFor="usage-by" className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-wider">
              Staff Member / Taken By *
            </label>
            <input
              type="text"
              id="usage-by"
              value={usedBy}
              onChange={(e) => setUsedBy(e.target.value)}
              placeholder="e.g. Nimali Perera"
              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
              required
            />
          </div>

          <div>
            <label htmlFor="usage-department" className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-wider">
              Department / Section *
            </label>
            <input
              type="text"
              id="usage-department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Administration, Works & Engineering"
              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
              required
            />
          </div>

          <div>
            <label htmlFor="usage-notes" className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-wider">
              Usage Purpose / Notes (Optional)
            </label>
            <textarea
              id="usage-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Used for monthly council meeting handouts"
              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736]"
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
              Confirm Usage
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RecordUsageModal

