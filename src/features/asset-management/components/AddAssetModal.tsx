import React, { useState, useEffect } from 'react'
import { type AssetRecord } from '../hooks/useAssetData'

interface AddAssetModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (assetData: Omit<AssetRecord, 'id' | 'dateAdded'>) => void
}

/** Renders the close icon used by the modal header. */
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

/** Renders the dropdown indicator used by select fields. */
const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400 shrink-0 pointer-events-none">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

/** Renders a form modal for adding a digital asset record. */
export const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<AssetRecord['category']>('Land')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState<AssetRecord['status']>('Operational')
  const [value, setValue] = useState<number>(1)
  const [unit, setUnit] = useState('Plots')

  /** Returns the default measurement unit for an asset category. */
  const getDefaultUnit = (cat: string) => {
    switch (cat) {
      case 'Land': return 'Plots'
      case 'Road': return 'KM'
      case 'Building': return 'Units'
      default: return 'Items'
    }
  }

  // Reset fields on modal open/close
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setName('')
        setCategory('Land')
        setLocation('')
        setStatus('Operational')
        setValue(1)
        setUnit('Plots')
      }, 0)
    }
  }, [isOpen])

  if (!isOpen) return null

  /** Validates the form and submits the new asset record. */
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !location.trim()) {
      alert('Please fill in all fields.')
      return
    }
    onSubmit({
      name: name.trim(),
      category,
      location: location.trim(),
      status,
      value: Number(value),
      unit,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Overlay */}
      <button
        type="button"
        aria-label="Close modal"
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content container */}
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden z-10 animate-fade-in">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A31736]" />
            <h3 className="text-lg font-bold text-gray-900">Add Digital Record</h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          
          {/* Asset Name Field */}
          <div>
            <label htmlFor="assetName" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Asset Name / Sub-category <span className="text-red-500">*</span>
            </label>
            <input
              id="assetName"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Surface Roadway, Community Hall, Excavator"
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736] transition-all"
            />
          </div>

          {/* Category & Status Dropdowns (2 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Category Dropdown */}
            <div>
              <label htmlFor="assetCategory" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="assetCategory"
                  value={category}
                  onChange={(e) => {
                    const cat = e.target.value as AssetRecord['category']
                    setCategory(cat)
                    setUnit(getDefaultUnit(cat))
                  }}
                  className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736] pr-8 cursor-pointer"
                >
                  <option value="Land">Land</option>
                  <option value="Road">Road</option>
                  <option value="Building">Building</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Machinery & Equipment">Machinery & Equipment</option>
                  <option value="Utility / Infrastructure">Utility / Infrastructure</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none">
                  <ChevronDownIcon />
                </div>
              </div>
            </div>

            {/* Status Dropdown */}
            <div>
              <label htmlFor="assetStatus" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="assetStatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AssetRecord['status'])}
                  className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736] pr-8 cursor-pointer"
                >
                  <option value="Operational">Operational</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Disputed">Disputed</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none">
                  <ChevronDownIcon />
                </div>
              </div>
            </div>

          </div>

          {/* Location / Ward Text Field */}
          <div>
            <label htmlFor="assetLocation" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Location / Ward <span className="text-red-500">*</span>
            </label>
            <input
              id="assetLocation"
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Ward 04, Central North"
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736] transition-all"
            />
          </div>

          {/* Quantity & Unit (2 columns) */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Quantity */}
            <div>
              <label htmlFor="assetValue" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Quantity / Value
              </label>
              <input
                id="assetValue"
                type="number"
                min="0.1"
                step="any"
                value={value}
                onChange={(e) => setValue(Number.parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736] transition-all"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Measurement Unit
              </label>
              <input
                type="text"
                disabled
                value={unit}
                className="w-full bg-gray-200 border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-500 cursor-not-allowed select-none"
              />
            </div>

          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#A31736] hover:bg-[#801028] text-white rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              Save Asset
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
export default AddAssetModal

