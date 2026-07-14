import React, { useState } from 'react'
import { useAssetData, type AssetRecord } from './hooks/useAssetData'
import AddAssetModal from './components/AddAssetModal'

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Icons
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const AddIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
)

const ExportIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const PrintIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-gray-400 shrink-0 pointer-events-none">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

// Category Icons
const LandIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-emerald-600 shrink-0">
    <path d="M12 2L2 22h20L12 2z" />
    <path d="M12 2L6 14h12L12 2z" />
  </svg>
)

const RoadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-500 shrink-0">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="4 4" />
  </svg>
)

const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-blue-600 shrink-0">
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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-blue-700">
    <path d="M3 20h18L12 4z" />
    <path d="M7 20h10" />
  </svg>
)

const RoadCardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-emerald-700">
    <path d="M3 12h18" />
    <path d="M3 6h18M3 18h18" />
  </svg>
)

const BuildingCardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-blue-800">
    <path d="M3 21h18M5 21V7l7-4 7 4v14" />
    <path d="M9 9h6M9 13h6M9 17h6" />
  </svg>
)

const MaterialCardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-slate-800">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)

// Small pencil/edit icon for the new Edit button
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 shrink-0">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
  </svg>
)

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Component
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ NEW: edit mode state for the detail popup â”€â”€
  const [isEditingDetails, setIsEditingDetails] = useState(false)
  const [editFormData, setEditFormData] = useState<AssetRecord | null>(null)

  // Opens the detail popup in READ mode (used by Asset ID link + Manage button)
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

  // Switches the popup into EDIT mode
  const startEditing = () => {
    if (!activeAssetDetails) return
    setEditFormData(activeAssetDetails)
    setIsEditingDetails(true)
  }

  // Cancels edit mode, goes back to read-only view (popup stays open)
  const cancelEditing = () => {
    setEditFormData(activeAssetDetails)
    setIsEditingDetails(false)
  }

  // Saves changes -> updates the hook's data (and therefore the table),
  // then updates the popup's own view, and exits edit mode.
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
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
      case 'DIGITIZED':
        return 'bg-blue-50 text-blue-700 border-blue-200/60'
      case 'AUDIT PENDING':
      case 'DISPUTED':
        return 'bg-red-50 text-red-700 border-red-200/60 font-semibold'
      case 'UNDER MAINTENANCE':
        return 'bg-orange-50 text-orange-700 border-orange-200/60'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
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

  const skeleton = (h = 'h-28') => (
    <div className={`${h} bg-gray-100 rounded-2xl animate-pulse`} />
  )

  return (
    <div className="space-y-6 animate-fade-in pb-8">

      {/* â”€â”€ Page Header â”€â”€ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold text-[#0f172a] tracking-tight">Asset Overview</h1>
          <p className="text-gray-500 text-sm mt-1 max-w-2xl leading-relaxed">
            Real-time monitoring of public assets, infrastructure records, and GIS mapping for the Pradeshiya Sabha jurisdiction.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-4 py-2.5 rounded shadow-sm transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <AddIcon />
            <span>Add Digital Record</span>
          </button>

          <button
            onClick={() => alert('PDF Export triggered (Simulated)')}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2.5 rounded transition-all flex items-center gap-2 cursor-pointer shadow-sm uppercase tracking-wider"
          >
            <ExportIcon />
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => window.print()}
            className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-4 py-2.5 rounded transition-all flex items-center gap-2 cursor-pointer shadow-sm uppercase tracking-wider"
          >
            <PrintIcon />
            <span>Print Summary</span>
          </button>
        </div>
      </div>

      {/* â”€â”€ KPI Cards â”€â”€ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: Municipal Lands */}
        <div className="bg-white border border-gray-300 rounded p-5 shadow-sm flex flex-col justify-between cursor-default hover:shadow transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Municipal Lands</span>
              <p className="text-2xl font-black text-gray-900 tracking-tight mt-1.5">
                {formatStatValue(stats.municipalLands.value, stats.municipalLands.label)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {stats.municipalLands.change}
              </span>
              <div className="p-1.5 bg-blue-50 rounded">
                <LandsCardIcon />
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-5 overflow-hidden">
            <div className="bg-[#1e3a8a] h-1.5 rounded-sm transition-all duration-1000" style={{ width: '70%' }} />
          </div>
        </div>

        {/* Card 2: Road Infrastructure */}
        <div className="bg-white border border-gray-300 rounded p-5 shadow-sm flex flex-col justify-between cursor-default hover:shadow transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Road Infrastructure</span>
              <p className="text-2xl font-black text-gray-900 tracking-tight mt-1.5">
                {formatStatValue(stats.roadInfrastructure.value, stats.roadInfrastructure.label)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {stats.roadInfrastructure.change}
              </span>
              <div className="p-1.5 bg-emerald-50 rounded">
                <RoadCardIcon />
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-5 overflow-hidden">
            <div className="bg-[#22c55e] h-1.5 rounded-sm transition-all duration-1000" style={{ width: '60%' }} />
          </div>
        </div>

        {/* Card 3: Building Units */}
        <div className="bg-white border border-gray-300 rounded p-5 shadow-sm flex flex-col justify-between cursor-default hover:shadow transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Building Units</span>
              <p className="text-2xl font-black text-gray-900 tracking-tight mt-1.5">
                {formatStatValue(stats.buildingUnits.value, stats.buildingUnits.label)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {stats.buildingUnits.change}
              </span>
              <div className="p-1.5 bg-blue-50 rounded">
                <BuildingCardIcon />
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-5 overflow-hidden">
            <div className="bg-[#1e40af] h-1.5 rounded-sm transition-all duration-1000" style={{ width: '75%' }} />
          </div>
        </div>

        {/* Card 4: Material Assets */}
        <div className="bg-white border border-gray-300 rounded p-5 shadow-sm flex flex-col justify-between cursor-default hover:shadow transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Material Assets</span>
              <p className="text-2xl font-black text-gray-900 tracking-tight mt-1.5">
                {formatStatValue(stats.materialAssets.value, stats.materialAssets.label)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[10px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                {stats.materialAssets.change}
              </span>
              <div className="p-1.5 bg-slate-50 rounded">
                <MaterialCardIcon />
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-5 overflow-hidden">
            <div className="bg-[#1f2937] h-1.5 rounded-full transition-all duration-1000" style={{ width: '45%' }} />
          </div>
        </div>

      </div>

      {/* â”€â”€ Recent Digital Records Table Card â”€â”€ */}
      <div className="bg-white border border-gray-200/80 rounded-xl shadow-xs overflow-hidden flex flex-col">

        {/* Table Header Section */}
        <div className="p-6 border-b border-gray-100 flex flex-col gap-4">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Recent Digital Records</h2>
              <p className="text-xs text-gray-500 mt-0.5">Verification history and latest infrastructure updates.</p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2.5">

              {/* Category Dropdown Filter */}
              <div className="relative min-w-[170px]">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full appearance-none bg-gray-50/80 border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#A31736] pr-8 cursor-pointer"
                >
                  <option value="">All Categories</option>
                  <option value="Land">Land</option>
                  <option value="Road">Road</option>
                  <option value="Building">Building</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Machinery & Equipment">Machinery & Equipment</option>
                  <option value="Utility / Infrastructure">Utility / Infrastructure</option>
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
                  className="w-full appearance-none bg-gray-50/80 border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#A31736] pr-8 cursor-pointer"
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

              {/* Reset Filters button */}
              {(categoryFilter || statusFilter || searchQuery) && (
                <button
                  onClick={() => { setCategoryFilter(''); setStatusFilter(''); setSearchQuery(''); }}
                  className="text-xs font-bold text-[#A31736] hover:text-[#801028] px-2 py-2 transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}

              {/* Text Search Field */}
              <div className="relative w-full sm:w-60">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ID, name, location..."
                  className="w-full bg-gray-50/80 border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:border-[#A31736] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 text-sm font-bold"
                  >
                    Ã—
                  </button>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Responsive Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-6">Asset ID</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Location/Ward</th>
                <th className="py-3 px-6">Date Added</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-4 px-6">{skeleton('h-8')}</td>
                  </tr>
                ))
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50/60 transition-colors">

                    {/* Asset ID (Styled as blue link in mockup) */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <button
                        onClick={() => openAssetDetails(asset)}
                        className="text-sm font-extrabold text-[#1e3a8a] font-mono hover:underline text-left cursor-pointer"
                      >
                        {asset.id}
                      </button>
                    </td>

                    {/* Category Label with corresponding inline SVG icon */}
                    <td className="py-4 px-6 font-semibold text-gray-800 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1 bg-gray-50 border border-gray-200/50 rounded-md">
                          {renderCategoryIcon(asset.category)}
                        </div>
                        <span>{asset.name}</span>
                      </div>
                    </td>

                    {/* Location/Ward */}
                    <td className="py-4 px-6 text-gray-600 whitespace-nowrap">{asset.location}</td>

                    {/* Date Added */}
                    <td className="py-4 px-6 text-gray-500 whitespace-nowrap">{asset.dateAdded}</td>

                    {/* Status Badge */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider inline-block ${getStatusBadgeStyle(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>

                    {/* Action Manage Button */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => openAssetDetails(asset)}
                        className="text-xs font-bold text-[#1e3a8a] hover:text-blue-800 cursor-pointer"
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
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                    No digital records match the filter criteria.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

        {/* â”€â”€ Table Pagination Footer (matches 1st image exactly) â”€â”€ */}
        <div className="px-6 py-4.5 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Display Items Range */}
          <div className="text-xs text-gray-500 font-semibold">
            {totalItems > 0 ? (
              <span>
                Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)}-{Math.min(currentPage * pageSize, totalItems)} of {totalItems.toLocaleString()} infrastructure items
              </span>
            ) : (
              <span>Showing 0 infrastructure items</span>
            )}
          </div>

          {/* Page Buttons Wrapper */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">

              {/* Previous page button */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center text-gray-500 transition-all select-none ${currentPage === 1
                    ? 'border-gray-200 bg-gray-50/50 text-gray-300 cursor-not-allowed'
                    : 'border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-700 cursor-pointer'
                  }`}
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
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all select-none cursor-pointer ${isActive
                        ? 'bg-[#A31736] text-white border-[#A31736] shadow-2xs'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              {/* Next page button */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center text-gray-500 transition-all select-none ${currentPage === totalPages
                    ? 'border-gray-200 bg-gray-50/50 text-gray-300 cursor-not-allowed'
                    : 'border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-700 cursor-pointer'
                  }`}
              >
                &gt;
              </button>

            </div>
          )}

        </div>

      </div>

      {/* â”€â”€ Asset Details Overlay Panel (now with Edit + Update) â”€â”€ */}
      {activeAssetDetails && editFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={closeAssetDetails} />
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 max-w-md w-full relative z-10 animate-scale-up">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-bold text-gray-900 text-lg">
                {isEditingDetails ? 'Edit Asset Record' : 'Asset Detail Log'}
              </h3>
              <button
                onClick={closeAssetDetails}
                className="text-gray-400 hover:text-gray-600 font-extrabold text-lg cursor-pointer"
              >
                Ã—
              </button>
            </div>

            {/* â”€â”€ READ-ONLY VIEW â”€â”€ */}
            {!isEditingDetails && (
              <>
                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="font-bold text-gray-400 text-xs uppercase tracking-wider">Asset ID</span>
                    <span className="font-mono font-extrabold text-[#1e3a8a]">{activeAssetDetails.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="font-bold text-gray-400 text-xs uppercase tracking-wider">Asset Name</span>
                    <span className="font-bold text-gray-900">{activeAssetDetails.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="font-bold text-gray-400 text-xs uppercase tracking-wider">Category</span>
                    <span className="font-semibold text-gray-800">{activeAssetDetails.category}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="font-bold text-gray-400 text-xs uppercase tracking-wider">Location/Ward</span>
                    <span className="font-medium text-gray-700">{activeAssetDetails.location}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="font-bold text-gray-400 text-xs uppercase tracking-wider">Date Added</span>
                    <span className="text-gray-600">{activeAssetDetails.dateAdded}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="font-bold text-gray-400 text-xs uppercase tracking-wider">Asset Quantity</span>
                    <span className="font-bold text-gray-900">{activeAssetDetails.value} {activeAssetDetails.unit}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="font-bold text-gray-400 text-xs uppercase tracking-wider">Current Status</span>
                    <span className={`text-xs font-bold px-3 py-0.5 rounded-full border uppercase ${getStatusBadgeStyle(activeAssetDetails.status)}`}>
                      {activeAssetDetails.status}
                    </span>
                  </div>
                </div>

                {/* Footer buttons: Close + Edit */}
                <div className="mt-6 flex justify-end gap-2.5">
                  <button
                    onClick={closeAssetDetails}
                    className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Close View
                  </button>
                  <button
                    onClick={startEditing}
                    className="px-5 py-2 bg-[#A31736] hover:bg-[#801028] text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <EditIcon />
                    Edit
                  </button>
                </div>
              </>
            )}

            {/* â”€â”€ EDIT VIEW â”€â”€ */}
            {isEditingDetails && (
              <>
                <div className="space-y-4 text-sm">

                  {/* Asset ID - read only, never editable */}
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="font-bold text-gray-400 text-xs uppercase tracking-wider">Asset ID</span>
                    <span className="font-mono font-extrabold text-[#1e3a8a]">{editFormData.id}</span>
                  </div>

                  {/* Asset Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Asset Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
                    />
                  </div>

                  {/* Category + Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Category
                      </label>
                      <select
                        value={editFormData.category}
                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value as AssetRecord['category'] })}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-[#A31736]"
                      >
                        <option value="Land">Land</option>
                        <option value="Road">Road</option>
                        <option value="Building">Building</option>
                        <option value="Vehicle">Vehicle</option>
                        <option value="Machinery & Equipment">Machinery & Equipment</option>
                        <option value="Utility / Infrastructure">Utility / Infrastructure</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Status
                      </label>
                      <select
                        value={editFormData.status}
                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as AssetRecord['status'] })}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-[#A31736]"
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
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Location / Ward
                    </label>
                    <input
                      type="text"
                      value={editFormData.location}
                      onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
                    />
                  </div>

                  {/* Quantity + Unit */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={editFormData.value}
                        onChange={(e) => setEditFormData({ ...editFormData, value: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={editFormData.unit}
                        onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
                      />
                    </div>
                  </div>

                  {/* Date Added - read only */}
                  <div className="flex justify-between items-center border-t border-gray-50 pt-2">
                    <span className="font-bold text-gray-400 text-xs uppercase tracking-wider">Date Added</span>
                    <span className="text-gray-500 text-xs">{editFormData.dateAdded}</span>
                  </div>
                </div>

                {/* Footer buttons: Cancel + Update */}
                <div className="mt-6 flex justify-end gap-2.5">
                  <button
                    onClick={cancelEditing}
                    className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateAsset}
                    className="px-5 py-2 bg-[#A31736] hover:bg-[#801028] text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Update
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* â”€â”€ Create Record Modal â”€â”€ */}
      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(newAsset) => {
          const created = addAsset(newAsset)
          // Alert user and show newly added asset details for confirm
          openAssetDetails(created)
        }}
      />

    </div>
  )
}

export default AssetOverviewPage

