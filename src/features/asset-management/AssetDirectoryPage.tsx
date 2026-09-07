import React, { useState } from 'react'
import { useAssetData, type AssetRecord } from './hooks/useAssetData'
import AddAssetWizardModal from './components/AddAssetWizardModal'

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────
const AddIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const BankIcon = () => (
  <div className="p-1.5 bg-blue-50/60 rounded text-blue-800 shrink-0">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M3 21h18" />
      <path d="M3 10h18" />
      <path d="M5 6l7-3 7 3" />
      <path d="M4 10v11" />
      <path d="M20 10v11" />
      <path d="M8 14v3" />
      <path d="M12 14v3" />
      <path d="M16 14v3" />
    </svg>
  </div>
)

const MoneyIcon = () => (
  <div className="p-1.5 bg-emerald-50/60 rounded text-emerald-800 shrink-0">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  </div>
)

const InspectionIcon = () => (
  <div className="p-1.5 bg-amber-50/60 rounded text-amber-800 shrink-0">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <circle cx="12" cy="14" r="2" />
      <path d="M12 12v-1" />
    </svg>
  </div>
)

const FilterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-700">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-gray-400 shrink-0 pointer-events-none">
    <polyline points="6 9 12 15 18 9" />
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
  const pageSizeLocal = 6

  // Filter assets by ward if selected
  const displayedAssets = assets.filter((asset) => {
    if (!wardFilter || wardFilter === 'All Wards') return true
    return asset.location.toLowerCase().includes(wardFilter.toLowerCase())
  })

  // Local pagination
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

  const formatValuation = (asset: AssetRecord) => {
    if (asset.valuation) {
      return `Rs. ${asset.valuation.toLocaleString('en-US', { minimumFractionDigits: 0 })}`
    }
    const baseVal = getCategoryBaseValue(asset.category)
    return `Rs. ${(baseVal * (asset.value || 1)).toLocaleString('en-US')}`
  }

  const getCategoryBaseValue = (category: string) => {
    if (category === 'Land') return 124500000
    if (category === 'Road') return 45200000
    if (category === 'Building') return 32800000
    return 85000000
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case 'VERIFIED':
      case 'OPERATIONAL':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200'
      case 'DIGITIZED':
        return 'bg-blue-50 text-blue-800 border-blue-200'
      case 'AUDIT PENDING':
      case 'DISPUTED':
        return 'bg-red-50 text-red-800 border-red-200 font-bold'
      case 'UNDER MAINTENANCE':
        return 'bg-amber-50 text-amber-800 border-amber-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-300'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Municipal Asset Directory
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage, verify, and track all local government physical infrastructure and asset registers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsWizardOpen(true)}
          className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold px-4 py-2 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <AddIcon />
          <span>+ Add New Asset</span>
        </button>
      </div>

      {/* ── 3 Summary KPI Cards (Overview Styling) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Total Assets */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Total Municipal Assets
            </span>
            <BankIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {assets.length.toLocaleString()}
            </p>
            <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Verified Register
            </span>
          </div>
        </div>

        {/* Card 2: Total Valuation */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Total Capital Valuation
            </span>
            <MoneyIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800 tracking-tight">
              Rs. 842.5M
            </p>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active Inventory
            </span>
          </div>
        </div>

        {/* Card 3: Pending Inspections */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Pending Audit & Inspections
            </span>
            <InspectionIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-800 tracking-tight">
              {assets.filter(a => a.status === 'Audit Pending' || a.status === 'Under Maintenance').length}
            </p>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Action Required
            </span>
          </div>
        </div>

      </div>

      {/* ── Main Container: Advanced Filter Toolbar + Table ── */}
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
        
        {/* Table Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide">
              Municipal Asset Ledger & Valuation Roster
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Comprehensive catalog of council properties, road networks, vehicles, and equipment.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert('Exporting ASSET_DIRECTORY.csv...')}
              className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer text-center"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 bg-gray-50/50 border-b border-gray-200 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FilterIcon />
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Directory Filters & Criteria
              </h3>
            </div>
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-bold text-[#A31736] hover:text-[#801028] transition-colors cursor-pointer uppercase tracking-wider self-start md:self-auto"
            >
              Clear All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* Category Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Asset Category
              </label>
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#A31736] pr-8 cursor-pointer h-9 font-medium"
                >
                  <option value="">All Categories</option>
                  <option value="Land">Land</option>
                  <option value="Road">Road</option>
                  <option value="Building">Building</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Machinery & Equipment">Machinery & Equipment</option>
                  <option value="Utility / Infrastructure">Utility / Infrastructure</option>
                  <option value="Streetlamp">Streetlamp</option>
                  <option value="Grounds">Grounds</option>
                </select>
                <div className="absolute right-2.5 top-2.5 pointer-events-none">
                  <ChevronDownIcon />
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Asset Status
              </label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#A31736] pr-8 cursor-pointer h-9 font-medium"
                >
                  <option value="">All Statuses</option>
                  <option value="Operational">Operational</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Disputed">Disputed</option>
                  <option value="Verified">Verified</option>
                  <option value="Digitized">Digitized</option>
                  <option value="Audit Pending">Audit Pending</option>
                </select>
                <div className="absolute right-2.5 top-2.5 pointer-events-none">
                  <ChevronDownIcon />
                </div>
              </div>
            </div>

            {/* Ward / Location Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Ward / Electoral Division
              </label>
              <div className="relative">
                <select
                  value={wardFilter}
                  onChange={(e) => setWardFilter(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#A31736] pr-8 cursor-pointer h-9 font-medium"
                >
                  <option value="">All Wards & Zones</option>
                  <option value="Homagama">Homagama Central</option>
                  <option value="Meegoda">Meegoda Ward</option>
                  <option value="Pitipana">Pitipana Ward</option>
                  <option value="Godagama">Godagama Ward</option>
                  <option value="Katuwana">Katuwana Ward</option>
                  <option value="Mattegoda">Mattegoda Ward</option>
                </select>
                <div className="absolute right-2.5 top-2.5 pointer-events-none">
                  <ChevronDownIcon />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-100 border-y border-gray-300 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-6 w-36">Asset Code</th>
                <th className="py-3 px-6">Asset Name & Details</th>
                <th className="py-3 px-6">Location / Ward</th>
                <th className="py-3 px-6">Valuation</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-right w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {paginatedList.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                  
                  {/* Asset Code */}
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <span className="font-mono text-xs font-bold text-[#1e3a8a]">
                      {asset.id}
                    </span>
                  </td>

                  {/* Asset Name */}
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <div>
                      <p className="font-bold text-gray-900 text-xs">{asset.name}</p>
                      <p className="text-[11px] text-gray-500 font-medium">{asset.category} • {asset.value} {asset.unit}</p>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-6 text-xs text-gray-700 font-medium whitespace-nowrap">
                    {asset.location}
                  </td>

                  {/* Valuation */}
                  <td className="py-3.5 px-6 text-xs font-bold text-gray-900 whitespace-nowrap">
                    {formatValuation(asset)}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-6 text-center whitespace-nowrap">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wide inline-block border ${getStatusBadgeStyle(asset.status)}`}>
                      {asset.status}
                    </span>
                  </td>

                  {/* Action Link */}
                  <td className="py-3.5 px-6 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSelectedAssetForView(asset)}
                      className="text-xs font-bold text-[#1e3a8a] hover:underline cursor-pointer uppercase tracking-wider"
                    >
                      Inspect &rarr;
                    </button>
                  </td>

                </tr>
              ))}

              {paginatedList.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 font-medium italic">
                    No asset records found matching the specified directory criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-gray-600 font-semibold">
            Showing {displayedAssets.length > 0 ? (currentPageLocal - 1) * pageSizeLocal + 1 : 0} to{' '}
            {Math.min(currentPageLocal * pageSizeLocal, displayedAssets.length)} of {displayedAssets.length} assets
          </span>

          {totalPagesLocal > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPageLocal === 1}
                onClick={() => setCurrentPageLocal((c) => Math.max(1, c - 1))}
                className="w-8 h-8 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer shadow-3xs text-xs font-bold"
              >
                &lt;
              </button>

              {Array.from({ length: totalPagesLocal }).map((_, idx) => {
                const p = idx + 1
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCurrentPageLocal(p)}
                    className={`w-8 h-8 rounded text-xs font-bold transition-all cursor-pointer ${
                      currentPageLocal === p
                        ? 'bg-[#A31736] text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}

              <button
                type="button"
                disabled={currentPageLocal === totalPagesLocal}
                onClick={() => setCurrentPageLocal((c) => Math.min(totalPagesLocal, c + 1))}
                className="w-8 h-8 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer shadow-3xs text-xs font-bold"
              >
                &gt;
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ── Asset Inspection Drawer Modal ── */}
      {selectedAssetForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded border border-gray-300 shadow-2xl p-6 max-w-md w-full relative z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#1e3a8a]">{selectedAssetForView.id}</span>
                <h3 className="font-bold text-gray-900 text-base uppercase tracking-wide">
                  Asset Inspection Dossier
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAssetForView(null)}
                className="text-gray-400 hover:text-gray-700 font-bold text-base cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-gray-700">
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="font-semibold text-gray-500">Asset Name:</span>
                <span className="font-bold text-gray-900 text-right">{selectedAssetForView.name}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="font-semibold text-gray-500">Category:</span>
                <span className="font-semibold text-gray-900">{selectedAssetForView.category}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="font-semibold text-gray-500">Location:</span>
                <span className="font-medium text-gray-900 text-right">{selectedAssetForView.location}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="font-semibold text-gray-500">Estimated Valuation:</span>
                <span className="font-bold text-emerald-800">{formatValuation(selectedAssetForView)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="font-semibold text-gray-500">Operating Status:</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusBadgeStyle(selectedAssetForView.status)}`}>
                  {selectedAssetForView.status}
                </span>
              </div>
              {selectedAssetForView.conditionStatus && (
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="font-semibold text-gray-500">Condition Report:</span>
                  <span className="font-medium text-gray-900">{selectedAssetForView.conditionStatus}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedAssetForView(null)}
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Wizard Modal ── */}
      <AddAssetWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSubmit={handleAddAssetSubmit}
      />

    </div>
  )
}

export default AssetDirectoryPage
