import React, { useState } from 'react'
import type { InventoryItemRecord, ItemCategory } from '../data/initialInventoryData'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (item: Omit<InventoryItemRecord, 'id' | 'status' | 'usageHistory'>) => void
}

/**
 * Modal form for registering a new inventory item.
 * Collects item details (code, name, category, quantities, location) and calls onAdd on form submission.
 */
export const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [itemCode, setItemCode] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState<ItemCategory>('Office Supplies')
  const [department, setDepartment] = useState('Administration')
  const [unit, setUnit] = useState('Units')
  const [quantityAvailable, setQuantityAvailable] = useState(20)
  const [reorderLevel, setReorderLevel] = useState(8)
  const [maxStock, setMaxStock] = useState(100)
  const [location, setLocation] = useState('Store Room 1 - Shelf A1')
  const [lastUpdated, setLastUpdated] = useState(() => new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')

  if (!isOpen) return null

  /** Validates form inputs and calls onAdd with collected item data, then closes the modal. */
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!itemCode.trim() || !name.trim()) {
      setError('Please provide an item code and item name.')
      return
    }

    onAdd({
      itemCode: itemCode.trim().toUpperCase(),
      name: name.trim(),
      category,
      department,
      unit,
      quantityAvailable: Number(quantityAvailable) || 0,
      reorderLevel: Number(reorderLevel) || 0,
      maxStock: Number(maxStock) || 0,
      location,
      lastUpdated,
    })

    setItemCode('')
    setName('')
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded border border-gray-300 shadow-2xl p-6 max-w-2xl w-full relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <h3 className="font-bold text-gray-900 text-base uppercase tracking-wide">
              Register New Inventory Item
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Add a new physical stock item with initial quantity and reorder threshold.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 font-bold text-base cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {error && (
            <div className="rounded border border-red-200 bg-red-50 p-2.5 text-xs text-red-800 font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                Item Code *
              </label>
              <input
                type="text"
                placeholder="e.g. INV-0022"
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 font-mono focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                Item Name *
              </label>
              <input
                type="text"
                placeholder="e.g. A4 Copy Paper 80gsm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9 cursor-pointer"
              >
                <option value="Office Supplies">Office Supplies</option>
                <option value="Utilities">Utilities</option>
                <option value="Facilities">Facilities</option>
                <option value="IT Equipment">IT Equipment</option>
                <option value="Safety Equipment">Safety Equipment</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                Department
              </label>
              <input
                type="text"
                placeholder="e.g. Administration, Works & Engineering"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                Unit of Measure
              </label>
              <input
                type="text"
                placeholder="Reams, Boxes, Litres, Units"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                Initial Quantity
              </label>
              <input
                type="number"
                min="0"
                value={quantityAvailable}
                onChange={(e) => setQuantityAvailable(Number(e.target.value))}
                className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                Reorder Threshold
              </label>
              <input
                type="number"
                min="0"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(Number(e.target.value))}
                className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                Maximum Stock Capacity
              </label>
              <input
                type="number"
                min="1"
                value={maxStock}
                onChange={(e) => setMaxStock(Number(e.target.value))}
                className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                Storage Location / Shelf
              </label>
              <input
                type="text"
                placeholder="e.g. Main Store - Shelf B2"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-wider">
              Registration Date
            </label>
            <input
              type="date"
              value={lastUpdated}
              onChange={(e) => setLastUpdated(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
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
              Save Item Record
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddItemModal

