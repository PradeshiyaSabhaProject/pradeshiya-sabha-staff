import React, { useState, useEffect } from 'react'
import { type AssetRecord } from '../hooks/useAssetData'

interface AddAssetModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (assetData: Omit<AssetRecord, 'id' | 'dateAdded'>) => void
}

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400 shrink-0 pointer-events-none">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

export const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<AssetRecord['category']>('Land')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState<AssetRecord['status']>('Operational')
  const [value, setValue] = useState<number>(1)
  const [unit, setUnit] = useState('Plots')

  const getDefaultUnit = (cat: string) => {
    switch (cat) {
      case 'Land': return 'Plots'
      case 'Road': return 'KM'
      case 'Building': return 'Units'
      case 'Streetlamp': return 'Pole'
      case 'Grounds': return 'Acres'
      default: return 'Items'
    }
  }

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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !location.trim()) {
      alert('Please fill in all mandatory asset fields.')
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      {/* Modal Content container */}
      <div className="relative bg-white w-full max-w-lg rounded border border-gray-300 shadow-2xl overflow-hidden z-10">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/75">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A31736]" />
            <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
              Add Digital Asset Record
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Asset Name Field */}
          <div>
            <label htmlFor="assetName" className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              Asset Name / Item Description <span className="text-red-500">*</span>
            </label>
            <input
              id="assetName"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Surface Roadway, Community Hall, Streetlamp Pole"
              className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736]"
            />
          </div>

          {/* Category & Status Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Category Dropdown */}
            <div>
              <label htmlFor="assetCategory" className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
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
                  className="w-full appearance-none bg-white border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736] pr-8 cursor-pointer font-medium"
                >
                  <option value="Land">Land</option>
                  <option value="Road">Road</option>
                  <option value="Building">Building</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Machinery & Equipment">Machinery & Equipment</option>
                  <option value="Utility / Infrastructure">Utility / Infrastructure</option>
                  <option value="Streetlamp">Streetlamp</option>
                  <option value="Grounds">Grounds</option>
                </select>
                <div className="absolute right-3 top-2.5 pointer-events-none">
                  <ChevronDownIcon />
                </div>
              </div>
            </div>

            {/* Status Dropdown */}
            <div>
              <label htmlFor="assetStatus" className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="assetStatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AssetRecord['status'])}
                  className="w-full appearance-none bg-white border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736] pr-8 cursor-pointer font-medium"
                >
                  <option value="Operational">Operational</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Disputed">Disputed</option>
                  <option value="Verified">Verified</option>
                  <option value="Digitized">Digitized</option>
                  <option value="Audit Pending">Audit Pending</option>
                </select>
                <div className="absolute right-3 top-2.5 pointer-events-none">
                  <ChevronDownIcon />
                </div>
              </div>
            </div>

          </div>

          {/* Location / Ward */}
          <div>
            <label htmlFor="assetLocation" className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              Location / Ward / Zone <span className="text-red-500">*</span>
            </label>
            <input
              id="assetLocation"
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Ward 04, Homagama Central"
              className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736]"
            />
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="assetValue" className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                Quantity / Magnitude
              </label>
              <input
                id="assetValue"
                type="number"
                min="0.1"
                step="any"
                value={value}
                onChange={(e) => setValue(Number.parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                Measurement Unit
              </label>
              <input
                type="text"
                disabled
                value={unit}
                className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-xs text-gray-600 cursor-not-allowed select-none font-semibold"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-50 uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#A31736] hover:bg-[#801028] text-white rounded text-xs font-bold uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
            >
              Save Asset Record
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}

export default AddAssetModal
