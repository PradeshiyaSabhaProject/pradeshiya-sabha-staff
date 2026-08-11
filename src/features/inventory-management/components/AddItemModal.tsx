import React, { useState } from 'react'
import type { InventoryItemRecord, ItemCategory } from '../data/initialInventoryData'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (item: Omit<InventoryItemRecord, 'id' | 'status' | 'usageHistory'>) => void
}

export const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [itemCode, setItemCode] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState<ItemCategory>('Office Supplies')
  const [department, setDepartment] = useState('Administration Office')
  const [unit, setUnit] = useState('units')
  const [quantityAvailable, setQuantityAvailable] = useState(20)
  const [reorderLevel, setReorderLevel] = useState(8)
  const [maxStock, setMaxStock] = useState(100)
  const [location, setLocation] = useState('Main Store - Shelf A1')
  const [lastUpdated, setLastUpdated] = useState(() => new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')

  if (!isOpen) return null

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} aria-label="Close modal" />
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-10 animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Register New Inventory Item</h3>
            <p className="text-xs text-gray-500">Add a new stock item with quantity and reorder threshold.</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 text-lg font-bold">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Item Code *</label>
              <input value={itemCode} onChange={(e) => setItemCode(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm" required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Item Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as ItemCategory)} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm">
                <option value="Office Supplies">Office Supplies</option>
                <option value="Cleaning Supplies">Cleaning Supplies</option>
                <option value="IT Equipment">IT Equipment</option>
                <option value="Safety Equipment">Safety Equipment</option>
                <option value="Furniture">Furniture</option>
                <option value="Tools & Hardware">Tools & Hardware</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Department</label>
              <input value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Unit</label>
              <input value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Quantity</label>
              <input type="number" min="0" value={quantityAvailable} onChange={(e) => setQuantityAvailable(Number(e.target.value))} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Reorder Level</label>
              <input type="number" min="0" value={reorderLevel} onChange={(e) => setReorderLevel(Number(e.target.value))} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Maximum Stock</label>
              <input type="number" min="0" value={maxStock} onChange={(e) => setMaxStock(Number(e.target.value))} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Last Updated</label>
              <input type="date" value={lastUpdated} onChange={(e) => setLastUpdated(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm" />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700">Cancel</button>
            <button type="submit" className="rounded-xl bg-[#A31736] px-4 py-2.5 text-sm font-semibold text-white">Save Item</button>
          </div>
        </form>
      </div>
    </div>
  )
}
