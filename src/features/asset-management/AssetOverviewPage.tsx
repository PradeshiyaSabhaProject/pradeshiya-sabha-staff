import React, { useState } from 'react'
import { useAssetData, type AssetRecord } from './hooks/useAssetData'
import AddAssetModal from './components/AddAssetModal'

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────
const AddIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const ExportIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 shrink-0">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const PrintIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 shrink-0">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-gray-400 shrink-0 pointer-events-none">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

// Category Icons
const LandIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-emerald-700 shrink-0">
    <path d="M12 2L2 22h20L12 2z" />
    <path d="M12 2L6 14h12L12 2z" />
  </svg>
)

const RoadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-600 shrink-0">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="4 4" />
  </svg>
)

const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-blue-700 shrink-0">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="9" y1="22" x2="9" y2="6" />
    <line x1="15" y1="22" x2="15" y2="6" />
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="11" x2="20" y2="11" />
    <line x1="4" y1="16" x2="20" y2="16" />
  </svg>
)

const VehicleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-orange-600 shrink-0">
    <rect x="1" y="3" width="22" height="13" rx="2" />
    <circle cx="6" cy="20" r="2" />
    <circle cx="18" cy="20" r="2" />
    <path d="M14 9h5v4h-5z" />
  </svg>
)

const MachineryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-amber-600 shrink-0">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

const UtilityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-violet-600 shrink-0">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
)

// KPI Card SVG Icons
const LandsCardIcon = () => (
  <div className="p-1.5 bg-blue-50/60 rounded text-blue-800 shrink-0">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M3 20h18L12 4z" />
      <path d="M7 20h10" />
    </svg>
  </div>
)

const RoadCardIcon = () => (
  <div className="p-1.5 bg-emerald-50/60 rounded text-emerald-800 shrink-0">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M3 12h18" />
      <path d="M3 6h18M3 18h18" />
    </svg>
  </div>
)

const BuildingCardIcon = () => (
  <div className="p-1.5 bg-blue-50/60 rounded text-blue-900 shrink-0">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M3 21h18M5 21V7l7-4 7 4v14" />
      <path d="M9 9h6M9 13h6M9 17h6" />
    </svg>
  </div>
)

const MaterialCardIcon = () => (
  <div className="p-1.5 bg-slate-100 rounded text-slate-800 shrink-0">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  </div>
)

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 shrink-0">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
  </svg>
)

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const AssetOverviewPage: React.FC = () => {
  const {
    loading,
    assets,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    setCurrentPage,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    addAsset,
    updateAsset,
    stats,
  } = useAssetData()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [activeAssetDetails, setActiveAssetDetails] = useState<AssetRecord | null>(null)

  // Edit mode state for the detail modal
  const [isEditingDetails, setIsEditingDetails] = useState(false)
  const [editFormData, setEditFormData] = useState<AssetRecord | null>(null)

  const openAssetDetails = (asset: AssetRecord) => {
    setActiveAssetDetails(asset)
    setIsEditingDetails(false)
    setEditFormData(asset)
  }

  const closeAssetDetails = () => {
    setActiveAssetDetails(null)
    setIsEditingDetails(false)
    setEditFormData(null)
  }

  const startEditing = () => {
    if (!activeAssetDetails) return
    setEditFormData(activeAssetDetails)
    setIsEditingDetails(true)
  }

  const cancelEditing = () => {
    setEditFormData(activeAssetDetails)
    setIsEditingDetails(false)
  }

  const handleUpdateAsset = () => {
    if (!editFormData) return
    const saved = updateAsset(editFormData.id, {
      name: editFormData.name,
      category: editFormData.category,
      location: editFormData.location,
      value: editFormData.value,
      unit: editFormData.unit,
      status: editFormData.status,
    })
    setActiveAssetDetails(saved)
    setIsEditingDetails(false)
  }

  // Status Style Badges
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

  // Category Icon Resolver
  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case 'Land':
        return <LandIcon />
      case 'Road':
        return <RoadIcon />
      case 'Building':
        return <BuildingIcon />
      case 'Vehicle':
        return <VehicleIcon />
      case 'Machinery & Equipment':
        return <MachineryIcon />
      case 'Utility / Infrastructure':
        return <UtilityIcon />
      default:
        return <LandIcon />
    }
  }

  // Format Dynamic Stat values
  const formatStatValue = (val: number, label: string) => {
    if (label === 'Road Infrastructure') return `${val} KM`
    if (label === 'Municipal Lands') return `${val} Plots`
    if (label === 'Building Units') return `${val.toLocaleString()} Units`
    if (label === 'Material Assets') {
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}k Items`
      }
      return `${val} Items`
    }
    return val
  }

  const skeleton = (h = 'h-10') => (
    <div className={`${h} bg-gray-100 rounded animate-pulse w-full`} />
  )

  return (
    <div className="space-y-6 animate-fade-in pb-8">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">Public Asset Overview</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Real-time monitoring of public assets, infrastructure records, and GIS mapping for Homagama jurisdiction.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold px-4 py-2 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <AddIcon />
            <span>+ Add Digital Record</span>
          </button>

          <button
            type="button"
            onClick={() => alert('PDF Export generated (Simulated)')}
            className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ExportIcon />
            <span>Export PDF</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <PrintIcon />
            <span>Print Summary</span>
          </button>
        </div>
      </div>

      {/* ── Top 4 KPI Cards (Matching Overview Design System) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: Municipal Lands */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Municipal Lands</span>
            <LandsCardIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {formatStatValue(stats.municipalLands.value, stats.municipalLands.label)}
            </p>
            <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {stats.municipalLands.change}
            </span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-3 overflow-hidden">
            <div className="bg-[#1e3a8a] h-1.5 rounded-sm transition-all duration-1000" style={{ width: '70%' }} />
          </div>
        </div>

        {/* Card 2: Road Infrastructure */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Road Infrastructure</span>
            <RoadCardIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {formatStatValue(stats.roadInfrastructure.value, stats.roadInfrastructure.label)}
            </p>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {stats.roadInfrastructure.change}
            </span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-3 overflow-hidden">
            <div className="bg-emerald-600 h-1.5 rounded-sm transition-all duration-1000" style={{ width: '85%' }} />
          </div>
        </div>

        {/* Card 3: Building Units */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Building Units</span>
            <BuildingCardIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {formatStatValue(stats.buildingUnits.value, stats.buildingUnits.label)}
            </p>
            <span className="text-[11px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              {stats.buildingUnits.change}
            </span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-3 overflow-hidden">
            <div className="bg-[#1e40af] h-1.5 rounded-sm transition-all duration-1000" style={{ width: '75%' }} />
          </div>
        </div>

        {/* Card 4: Material Assets */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Material Assets</span>
            <MaterialCardIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {formatStatValue(stats.materialAssets.value, stats.materialAssets.label)}
            </p>
            <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              {stats.materialAssets.change}
            </span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-3 overflow-hidden">
            <div className="bg-[#1f2937] h-1.5 rounded-sm transition-all duration-1000" style={{ width: '45%' }} />
          </div>
        </div>

      </div>

      {/* ── Recent Digital Records Table Container ── */}
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">

        {/* Table Header / Toolbar Section */}
        <div className="p-4 bg-gray-50/50 border-b border-gray-200 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Recent Digital Records</h2>
              <p className="text-xs text-gray-500">Verification history and latest municipal infrastructure updates.</p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2.5">

              {/* Category Dropdown Filter */}
              <div className="relative min-w-[160px]">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#A31736] pr-8 cursor-pointer h-9 font-medium"
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

              {/* Status Dropdown Filter */}
              <div className="relative min-w-[150px]">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#A31736] pr-8 cursor-pointer h-9 font-medium"
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

              {/* Text Search Field */}
              <div className="relative w-full sm:w-60">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ID, name, location..."
                  className="w-full bg-white border border-gray-300 rounded pl-3 pr-8 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 text-sm font-bold"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Reset Filters button */}
              {(categoryFilter || statusFilter || searchQuery) && (
                <button
                  type="button"
                  onClick={() => { setCategoryFilter(''); setStatusFilter(''); setSearchQuery(''); }}
                  className="border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded transition-colors uppercase tracking-wider h-9 cursor-pointer"
                >
                  Reset
                </button>
              )}

            </div>
          </div>
        </div>

        {/* Responsive Data Table */}
        <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-100 border-y border-gray-300 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-6 w-36">Asset ID</th>
                <th className="py-3 px-6">Asset Item & Description</th>
                <th className="py-3 px-6">Location / Ward</th>
                <th className="py-3 px-6">Date Added</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-right w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-4 px-6">{skeleton('h-8')}</td>
                  </tr>
                ))
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50 transition-colors">

                    {/* Asset ID */}
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openAssetDetails(asset)}
                        className="text-xs font-mono font-bold text-[#1e3a8a] hover:underline text-left cursor-pointer"
                      >
                        {asset.id}
                      </button>
                    </td>

                    {/* Category Label with inline SVG icon */}
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1 bg-gray-50 border border-gray-200 rounded">
                          {renderCategoryIcon(asset.category)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-xs">{asset.name}</p>
                          <p className="text-[11px] text-gray-500 font-medium">{asset.category}</p>
                        </div>
                      </div>
                    </td>

                    {/* Location/Ward */}
                    <td className="py-3.5 px-6 text-gray-700 text-xs font-medium whitespace-nowrap">{asset.location}</td>

                    {/* Date Added */}
                    <td className="py-3.5 px-6 text-gray-500 text-xs whitespace-nowrap">{asset.dateAdded}</td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-6 text-center whitespace-nowrap">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wide inline-block border ${getStatusBadgeStyle(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>

                    {/* Action Manage Button */}
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openAssetDetails(asset)}
                        className="text-xs font-bold text-[#1e3a8a] hover:underline cursor-pointer uppercase tracking-wider"
                      >
                        Manage
                      </button>
                    </td>

                  </tr>
                ))
              )}

              {/* Zero state feedback */}
              {!loading && assets.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 font-medium italic">
                    No digital records match the selected filter criteria.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

        {/* ── Table Pagination Footer ── */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Display Items Range */}
          <div className="text-xs text-gray-600 font-semibold">
            {totalItems > 0 ? (
              <span>
                Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems.toLocaleString()} infrastructure items
              </span>
            ) : (
              <span>Showing 0 infrastructure items</span>
            )}
          </div>

          {/* Page Buttons Wrapper */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">

              {/* Previous page button */}
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="w-8 h-8 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer shadow-3xs text-xs font-bold"
              >
                &lt;
              </button>

              {/* Page Number Loop */}
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1
                const isActive = currentPage === pageNum
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded text-xs font-bold transition-all cursor-pointer ${isActive
                        ? 'bg-[#A31736] text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              {/* Next page button */}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="w-8 h-8 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer shadow-3xs text-xs font-bold"
              >
                &gt;
              </button>

            </div>
          )}

        </div>

      </div>

      {/* ── Asset Details Overlay Modal ── */}
      {activeAssetDetails && editFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded border border-gray-300 shadow-2xl p-6 max-w-md w-full relative z-10">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <h3 className="font-bold text-gray-900 text-base uppercase tracking-wide">
                {isEditingDetails ? 'Edit Asset Record' : 'Asset Detail Record'}
              </h3>
              <button
                type="button"
                onClick={closeAssetDetails}
                className="text-gray-400 hover:text-gray-700 font-bold text-base cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* ── READ-ONLY VIEW ── */}
            {!isEditingDetails && (
              <>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="font-bold text-gray-500 uppercase tracking-wider">Asset ID</span>
                    <span className="font-mono font-bold text-[#1e3a8a]">{activeAssetDetails.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="font-bold text-gray-500 uppercase tracking-wider">Asset Name</span>
                    <span className="font-bold text-gray-900 text-right">{activeAssetDetails.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="font-bold text-gray-500 uppercase tracking-wider">Category</span>
                    <span className="font-semibold text-gray-800">{activeAssetDetails.category}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="font-bold text-gray-500 uppercase tracking-wider">Location/Ward</span>
                    <span className="font-medium text-gray-700 text-right">{activeAssetDetails.location}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="font-bold text-gray-500 uppercase tracking-wider">Date Added</span>
                    <span className="text-gray-600">{activeAssetDetails.dateAdded}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="font-bold text-gray-500 uppercase tracking-wider">Asset Quantity</span>
                    <span className="font-bold text-gray-900">{activeAssetDetails.value} {activeAssetDetails.unit}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="font-bold text-gray-500 uppercase tracking-wider">Current Status</span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded border uppercase ${getStatusBadgeStyle(activeAssetDetails.status)}`}>
                      {activeAssetDetails.status}
                    </span>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="mt-6 flex justify-end gap-2 border-t border-gray-200 pt-3">
                  <button
                    type="button"
                    onClick={closeAssetDetails}
                    className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-bold transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={startEditing}
                    className="px-4 py-2 bg-[#A31736] hover:bg-[#801028] text-white rounded text-xs font-bold transition-colors uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <EditIcon />
                    <span>Edit Record</span>
                  </button>
                </div>
              </>
            )}

            {/* ── EDIT VIEW ── */}
            {isEditingDetails && (
              <>
                <div className="space-y-3.5 text-xs">

                  {/* Asset ID - read only */}
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="font-bold text-gray-500 uppercase tracking-wider">Asset ID</span>
                    <span className="font-mono font-bold text-[#1e3a8a]">{editFormData.id}</span>
                  </div>

                  {/* Asset Name */}
                  <div>
                    <label htmlFor="editAssetName" className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Asset Name
                    </label>
                    <input
                      id="editAssetName"
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736]"
                    />
                  </div>

                  {/* Category + Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="editCategory" className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        id="editCategory"
                        value={editFormData.category}
                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value as AssetRecord['category'] })}
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736]"
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
                    </div>
                    <div>
                      <label htmlFor="editStatus" className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        id="editStatus"
                        value={editFormData.status}
                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as AssetRecord['status'] })}
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736]"
                      >
                        <option value="Operational">Operational</option>
                        <option value="Under Maintenance">Under Maintenance</option>
                        <option value="Disputed">Disputed</option>
                        <option value="Verified">Verified</option>
                        <option value="Digitized">Digitized</option>
                        <option value="Audit Pending">Audit Pending</option>
                      </select>
                    </div>
                  </div>

                  {/* Location/Ward */}
                  <div>
                    <label htmlFor="editLocation" className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Location / Ward
                    </label>
                    <input
                      id="editLocation"
                      type="text"
                      value={editFormData.location}
                      onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736]"
                    />
                  </div>

                  {/* Quantity + Unit */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="editQuantity" className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        id="editQuantity"
                        type="number"
                        min="0"
                        step="any"
                        value={editFormData.value}
                        onChange={(e) => setEditFormData({ ...editFormData, value: Number.parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736]"
                      />
                    </div>
                    <div>
                      <label htmlFor="editUnit" className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Unit
                      </label>
                      <input
                        id="editUnit"
                        type="text"
                        value={editFormData.unit}
                        onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736]"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="mt-6 flex justify-end gap-2 border-t border-gray-200 pt-3">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-bold transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateAsset}
                    className="px-4 py-2 bg-[#A31736] hover:bg-[#801028] text-white rounded text-xs font-bold transition-colors uppercase tracking-wider cursor-pointer shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* ── Create Record Modal ── */}
      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(newAsset) => {
          const created = addAsset(newAsset)
          openAssetDetails(created)
        }}
      />

    </div>
  )
}

export default AssetOverviewPage
