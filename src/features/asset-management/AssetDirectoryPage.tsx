import React, { useState } from 'react'
import { useAssetData, type AssetRecord } from './hooks/useAssetData'
import AddAssetWizardModal from './components/AddAssetWizardModal'

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────
const AddIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
)

const BankIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-[#A31736]">
    <path d="M3 21h18" />
    <path d="M3 10h18" />
    <path d="M5 6l7-3 7 3" />
    <path d="M4 10v11" />
    <path d="M20 10v11" />
    <path d="M8 14v3" />
    <path d="M12 14v3" />
    <path d="M16 14v3" />
  </svg>
)

const MoneyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-gray-600">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
)

const InspectionIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-orange-600">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <circle cx="12" cy="14" r="2" />
    <path d="M12 12v-1" />
  </svg>
)

const FilterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-700">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400 shrink-0 pointer-events-none">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const ChevronLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

export const AssetDirectoryPage: React.FC = () => {
  const {
    assets,
    addAsset,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    setSearchQuery,
  } = useAssetData()

  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [wardFilter, setWardFilter] = useState('')
  const [selectedAssetForView, setSelectedAssetForView] = useState<AssetRecord | null>(null)
  const [currentPageLocal, setCurrentPageLocal] = useState(1)
  const pageSizeLocal = 4

  // Filter assets by ward if selected
  const displayedAssets = assets.filter((asset) => {
    if (!wardFilter || wardFilter === 'All Wards') return true
    return asset.location.toLowerCase().includes(wardFilter.toLowerCase())
  })

  // Local pagination to match screenshot (showing 4 items per page)
  const totalPagesLocal = Math.ceil(displayedAssets.length / pageSizeLocal) || 1
  const paginatedList = displayedAssets.slice(
    (currentPageLocal - 1) * pageSizeLocal,
    currentPageLocal * pageSizeLocal
  )

  const handleClearFilters = () => {
    setCategoryFilter('')
    setStatusFilter('')
    setWardFilter('')
    setSearchQuery('')
    setCurrentPageLocal(1)
  }

  const handleAddAssetSubmit = (newAssetData: Omit<AssetRecord, 'id' | 'dateAdded'>) => {
    addAsset(newAssetData)
  }

  // Calculate formatted valuation string
  const formatValuation = (asset: AssetRecord) => {
    if (asset.valuation) {
      return `Rs. ${asset.valuation.toLocaleString('en-US', { minimumFractionDigits: 0 })}`
    }
    // Default mock valuation calculation if not set
    const baseVal = asset.category === 'Land' ? 124500000
      : asset.category === 'Road' ? 45200000
      : asset.category === 'Building' ? 32800000
      : 85000000
    return `Rs. ${(baseVal * (asset.value || 1)).toLocaleString('en-US')}`
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in pb-16">
      
      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#800020] tracking-tight">
            Asset Directory
          </h1>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            Manage and track all local government physical infrastructure and assets.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsWizardOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#800020] hover:bg-[#600018] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
        >
          <AddIcon />
          Add New Asset
        </button>
      </div>

      {/* ── 3 SUMMARY KPI CARDS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Total Assets */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 flex items-center gap-5 shadow-xs hover:shadow-md transition-all">
          <div className="p-4 bg-red-50/80 border border-red-100 rounded-2xl shrink-0">
            <BankIcon />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              TOTAL ASSETS
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 block tracking-tight">
              1,482
            </span>
          </div>
        </div>

        {/* Card 2: Total Valuation */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 flex items-center gap-5 shadow-xs hover:shadow-md transition-all">
          <div className="p-4 bg-gray-100/80 border border-gray-200 rounded-2xl shrink-0">
            <MoneyIcon />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              TOTAL VALUATION
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 block tracking-tight">
              Rs. 842.5M
            </span>
          </div>
        </div>

        {/* Card 3: Pending Inspections */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 flex items-center gap-5 shadow-xs hover:shadow-md transition-all">
          <div className="p-4 bg-orange-50/80 border border-orange-100 rounded-2xl shrink-0">
            <InspectionIcon />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              PENDING INSPECTIONS
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                24
              </span>
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                Priority
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ── ADVANCED FILTERS BAR ────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FilterIcon />
            <h3 className="text-sm font-extrabold text-gray-800 tracking-wider uppercase">
              ADVANCED FILTERS
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4 items-end">
          
          {/* Asset Type Dropdown */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              Asset Type
            </label>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  setCurrentPageLocal(1)
                }}
                className="w-full appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#800020] focus:ring-1 focus:ring-[#800020] pr-10 cursor-pointer"
              >
                <option value="">All Types</option>
                <option value="Land">Land</option>
                <option value="Road">Road</option>
                <option value="Building">Building</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Machinery & Equipment">Machinery & Equipment</option>
                <option value="Utility / Infrastructure">Utility / Infrastructure</option>
              </select>
              <div className="absolute right-3.5 top-3.5 pointer-events-none">
                <ChevronDownIcon />
              </div>
            </div>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              Status
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPageLocal(1)
                }}
                className="w-full appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#800020] focus:ring-1 focus:ring-[#800020] pr-10 cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="Operational">Operational</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Disputed">Disputed</option>
                <option value="Verified">Verified</option>
                <option value="Digitized">Digitized</option>
                <option value="Audit Pending">Audit Pending</option>
              </select>
              <div className="absolute right-3.5 top-3.5 pointer-events-none">
                <ChevronDownIcon />
              </div>
            </div>
          </div>

          {/* Location / Ward Dropdown */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              Location / Ward
            </label>
            <div className="relative">
              <select
                value={wardFilter}
                onChange={(e) => {
                  setWardFilter(e.target.value)
                  setCurrentPageLocal(1)
                }}
                className="w-full appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#800020] focus:ring-1 focus:ring-[#800020] pr-10 cursor-pointer"
              >
                <option value="">All Wards</option>
                <option value="Ward 01">Ward 01 - Town Center</option>
                <option value="Ward 02">Ward 02 - Central Junction</option>
                <option value="Ward 03">Ward 03 - Homagama</option>
                <option value="Ward 04">Ward 04 - West Point</option>
                <option value="Ward 05">Ward 05 - Godagama</option>
              </select>
              <div className="absolute right-3.5 top-3.5 pointer-events-none">
                <ChevronDownIcon />
              </div>
            </div>
          </div>

          {/* Apply Search Button */}
          <div>
            <button
              type="button"
              onClick={() => setCurrentPageLocal(1)}
              className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-bold py-2.5 px-6 rounded-xl transition-all cursor-pointer shadow-xs text-sm"
            >
              Apply Search
            </button>
          </div>

        </div>
      </div>

      {/* ── ASSETS DIRECTORY TABLE ──────────────────────────────────────── */}
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch]">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">ASSET ID</th>
                <th className="py-4 px-6">NAME</th>
                <th className="py-4 px-6">CATEGORY</th>
                <th className="py-4 px-6">LOCATION</th>
                <th className="py-4 px-6">CURRENT VALUATION</th>
                <th className="py-4 px-6">STATUS</th>
                <th className="py-4 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 italic">
                    No assets found matching the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedList.map((asset) => {
                  const isOperational = asset.status === 'Operational' || asset.status === 'Verified'
                  const isMaintenance = asset.status === 'Under Maintenance' || asset.status === 'Audit Pending'
                  
                  return (
                    <tr key={asset.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Asset ID */}
                      <td className="py-4 px-6 font-mono text-xs font-bold text-[#800020]">
                        {asset.id}
                      </td>

                      {/* Name */}
                      <td className="py-4 px-6">
                        <span className="font-bold text-gray-900 block">{asset.name}</span>
                        <span className="text-[11px] text-gray-400 font-medium mt-0.5 block">
                          Added: {asset.dateAdded}
                        </span>
                      </td>

                      {/* Category Badge */}
                      <td className="py-4 px-6">
                        <span className="bg-gray-150 border border-gray-200/80 text-gray-700 text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider inline-block">
                          {asset.category}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-6 text-gray-700 font-medium">
                        {asset.location}
                      </td>

                      {/* Valuation */}
                      <td className="py-4 px-6 font-bold text-gray-900">
                        {formatValuation(asset)}
                      </td>

                      {/* Status Dot */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isOperational
                                ? 'bg-emerald-500'
                                : isMaintenance
                                ? 'bg-red-500'
                                : 'bg-gray-400'
                            }`}
                          />
                          <span
                            className={`text-xs font-semibold ${
                              isOperational
                                ? 'text-emerald-700'
                                : isMaintenance
                                ? 'text-red-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {asset.status}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedAssetForView(asset)}
                          className="text-xs font-bold text-[#800020] hover:underline cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50/50 border-t border-gray-200 text-xs text-gray-600">
          <div>
            Showing <span className="font-bold text-gray-800">1-{paginatedList.length}</span> of{' '}
            <span className="font-bold text-gray-800">1,482</span> assets
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPageLocal((p) => Math.max(1, p - 1))}
              disabled={currentPageLocal === 1}
              className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeftIcon />
            </button>
            
            <button
              type="button"
              onClick={() => setCurrentPageLocal(1)}
              className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-colors cursor-pointer ${
                currentPageLocal === 1
                  ? 'bg-[#800020] text-white shadow-xs'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              1
            </button>

            {totalPagesLocal >= 2 && (
              <button
                type="button"
                onClick={() => setCurrentPageLocal(2)}
                className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-colors cursor-pointer ${
                  currentPageLocal === 2
                    ? 'bg-[#800020] text-white shadow-xs'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                2
              </button>
            )}

            {totalPagesLocal >= 3 && (
              <button
                type="button"
                onClick={() => setCurrentPageLocal(3)}
                className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-colors cursor-pointer ${
                  currentPageLocal === 3
                    ? 'bg-[#800020] text-white shadow-xs'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                3
              </button>
            )}

            <span className="px-1 text-gray-400">...</span>

            <button
              type="button"
              onClick={() => setCurrentPageLocal(371)}
              className="w-10 h-8 rounded-lg font-bold hover:bg-gray-100 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              371
            </button>

            <button
              type="button"
              onClick={() => setCurrentPageLocal((p) => Math.min(totalPagesLocal, p + 1))}
              disabled={currentPageLocal === totalPagesLocal}
              className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      </div>

      {/* ── 5-STAGE ADD ASSET WIZARD MODAL ─────────────────────────────── */}
      <AddAssetWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSubmit={handleAddAssetSubmit}
      />

      {/* ── SIMPLE ASSET DETAILS VIEW MODAL ─────────────────────────────── */}
      {selectedAssetForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close asset details"
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setSelectedAssetForView(null)}
          />
          <div className="relative bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-200 z-10 animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Asset Record Details</h3>
              <button
                type="button"
                onClick={() => setSelectedAssetForView(null)}
                className="text-gray-400 hover:text-gray-700 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Asset ID:</span>
                <span className="font-mono font-bold text-[#800020]">{selectedAssetForView.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Name:</span>
                <span className="font-bold text-gray-900">{selectedAssetForView.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Category:</span>
                <span className="font-semibold">{selectedAssetForView.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Location:</span>
                <span className="font-semibold">{selectedAssetForView.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Valuation:</span>
                <span className="font-bold">{formatValuation(selectedAssetForView)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Status:</span>
                <span className="font-semibold text-emerald-600">{selectedAssetForView.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Date Added:</span>
                <span className="text-gray-600">{selectedAssetForView.dateAdded}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedAssetForView(null)}
                className="px-4 py-2 bg-[#800020] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
export default AssetDirectoryPage

