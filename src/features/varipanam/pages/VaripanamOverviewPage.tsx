import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  RotateCw,
  Download,
  MapPin,
  ListFilter,
  ShieldAlert,
  ArrowUpRight,
  X,
  User,
  Building,
  CreditCard,
} from 'lucide-react'
import { useVaripanam } from '../context/VaripanamContext'
import KpiCards from '../components/shared/KpiCards'
import ArrearsAgeChart from '../components/shared/ArrearsAgeChart'
import FilterBar from '../components/property/FilterBar'
import VaripanamMap from '../components/map/VaripanamMap'
import NeedsConfirmationBadge from '../components/shared/NeedsConfirmationBadge'
import StatusBadge from '../components/shared/StatusBadge'
import { formatLKR } from '../utils/formatters'

export const VaripanamOverviewPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    properties,
    filteredProperties,
    zones,
    wards,
    roads,
    settings,
    fieldCollections,
    isLoading,
    filters,
    setFilters,
    resetFilters,
    selectedProperty,
    setSelectedProperty,
    mobileTab,
    setMobileTab,
    refreshData,
  } = useVaripanam()

  const [isExporting, setIsExporting] = useState(false)
  const [rightPanelTab, setRightPanelTab] = useState<'details' | 'list'>('details')

  const handleSelectProperty = (prop: typeof properties[0] | null) => {
    setSelectedProperty(prop)
    if (prop) {
      setRightPanelTab('details')
    }
  }

  const selectedRoad = selectedProperty ? roads.find((r) => r.id === selectedProperty.roadId) : null
  const selectedWard = selectedProperty ? wards.find((w) => w.id === selectedProperty.wardId) : null
  const selectedZone = selectedProperty ? zones.find((z) => z.id === selectedProperty.zoneId) : null
  const selectedTotalDue = selectedProperty
    ? selectedProperty.dues
      .filter((d) => d.status !== 'Paid')
      .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0)
    : 0
  const selectedArrears = selectedProperty
    ? selectedProperty.dues
      .filter((d) => d.status === 'Overdue' || d.status === 'Warrant')
      .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0)
    : 0

  const handleOpenProperty = (propertyId: string) => {
    navigate(`/finances/varipanam/properties/${propertyId}`)
  }

  const handleExportCsv = () => {
    setIsExporting(true)
    try {
      const headers = ['Assessment No', 'Property No', 'Owner', 'NIC', 'Phone', 'Type', 'Annual Value', 'Status']
      const rows = filteredProperties.map((p) => [
        `"${p.assessmentNumber}"`,
        `"${p.propertyNumber}"`,
        `"${p.currentOwner.name}"`,
        `"${p.currentOwner.nic}"`,
        `"${p.currentOwner.mobile}"`,
        `"${p.propertyType}"`,
        p.annualAssessedValue,
        `"${p.status}"`,
      ])
      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `varipanam-overview-${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-[#A31736]/20 border-t-[#A31736] rounded-full animate-spin" />
        <p className="text-xs font-semibold text-gray-500">Loading Varipanam Command Overview...</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* ── Executive Command Header (Matching Municipal Style) ── */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ACTIVE SHIFT: 08:00 - 16:30
              </span>
              <span className="text-[11px] text-gray-400">
                Synced at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <NeedsConfirmationBadge tooltip="Property tax rates (Residential 10%, Commercial 15%) and penalty rules are awaiting gazette ratification." />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              HOMAGAMA PRADESHIYA SABHA • VARIPANAM COMMAND OVERVIEW
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Unified property tax governance hub: monitor billed revenues, collections, arrears aging, warrant enforcement, and GIS cadastre.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={isExporting}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>{isExporting ? 'EXPORTING...' : 'EXPORT CSV'}</span>
            </button>
            <button
              type="button"
              onClick={() => refreshData()}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <RotateCw className="w-3.5 h-3.5 text-gray-500" />
              <span>REFRESH</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <KpiCards
        properties={properties}
        fieldCollections={fieldCollections}
        onFilterUnpaidTwoQuarters={() => setFilters({ status: 'Overdue' })}
        onFilterWarrants={() => setFilters({ status: 'Warrant issued' })}
        onFilterOverdue={() => setFilters({ status: 'Overdue' })}
      />

      {/* ── Filter Bar ── */}
      <FilterBar
        zones={zones}
        wards={wards}
        roads={roads}
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={resetFilters}
        onAddPropertyClick={() => navigate('/finances/varipanam/add-property')}
        isPickMode={false}
        totalFilteredCount={filteredProperties.length}
      />

      {/* ── Mobile Tab Switcher (Map vs List) ── */}
      <div className="flex sm:hidden border-b border-gray-200 bg-white rounded-xl p-1 shadow-2xs">
        <button
          type="button"
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mobileTab === 'map' ? 'bg-[#A31736] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          GIS Map View
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mobileTab === 'list' ? 'bg-[#A31736] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Properties List ({filteredProperties.length})
        </button>
      </div>

      {/* ── Main Split Container: Map on Left / List on Right ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[580px]">
        {/* Left: GIS Leaflet Map (Col 7 on desktop) */}
        <div className={`lg:col-span-7 h-[580px] ${mobileTab === 'list' ? 'hidden sm:block' : 'block'}`}>
          <div className="h-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#A31736]" />
                <span className="text-xs font-bold text-gray-800">
                  Sabha Cadastral Map (Homagama & Wateraka)
                </span>
              </div>
              <span className="text-[11px] font-semibold text-gray-500">
                {filteredProperties.length} approved plots shown
              </span>
            </div>
            <div className="flex-1 w-full min-h-[520px] relative">
              <VaripanamMap
                properties={filteredProperties}
                settings={settings}
                roads={roads}
                selectedProperty={selectedProperty}
                onSelectProperty={handleSelectProperty}
                onOpenProperty={handleOpenProperty}
                isPickMode={false}
                pickedCoords={null}
                onMapClickCoord={() => { }}
                heightClass="h-[520px]"
              />
            </div>
          </div>
        </div>

        {/* Right: Synchronized Properties List or Exact Details Dossier (Col 5 on desktop) */}
        <div className={`lg:col-span-5 h-[580px] ${mobileTab === 'map' ? 'hidden sm:block' : 'block'}`}>
          <div className="h-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs flex flex-col">
            {/* Header Tabs: Exact Details vs All Units */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
              <div className="flex items-center gap-1.5">
                {selectedProperty && (
                  <button
                    type="button"
                    onClick={() => setRightPanelTab('details')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${rightPanelTab === 'details'
                        ? 'bg-white text-[#A31736] shadow-2xs border border-gray-200'
                        : 'text-gray-500 hover:text-gray-900'
                      }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#A31736]" />
                    <span>Exact Details</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A31736] animate-pulse" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setRightPanelTab('list')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${rightPanelTab === 'list' || !selectedProperty
                      ? 'bg-white text-gray-900 shadow-2xs border border-gray-200'
                      : 'text-gray-500 hover:text-gray-900'
                    }`}
                >
                  <ListFilter className="w-3.5 h-3.5 text-gray-500" />
                  <span>All Units ({filteredProperties.length})</span>
                </button>
              </div>

              {selectedProperty && (
                <button
                  type="button"
                  onClick={() => setSelectedProperty(null)}
                  className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 flex items-center gap-1 cursor-pointer px-2 py-1 rounded hover:bg-gray-100"
                  title="Deselect property"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Content: Either Exact Property Details or List */}
            {selectedProperty && rightPanelTab === 'details' ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {/* Header Unit Overview */}
                <div className="p-3.5 bg-gradient-to-r from-rose-50/60 to-white border border-rose-100 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-gray-900 tracking-tight">
                        {selectedProperty.assessmentNumber}
                      </span>
                      <StatusBadge status={selectedProperty.status} size="sm" />
                    </div>
                    <span className="text-xs font-bold text-gray-600">
                      {selectedProperty.propertyNumber}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{selectedProperty.description}</p>
                </div>

                {/* Primary Owner Information */}
                <div className="p-3 bg-gray-50/80 border border-gray-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800 text-[11px] uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 text-[#A31736]" />
                    <span>Primary Owner Information</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-gray-700">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Owner Name</span>
                      <span className="font-bold text-gray-900">{selectedProperty.currentOwner.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">NIC Number</span>
                      <span className="font-mono font-bold text-gray-800">{selectedProperty.currentOwner.nic}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Telephone / Mobile</span>
                      <span className="font-mono font-semibold">{selectedProperty.currentOwner.mobile || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Postal Address</span>
                      <span className="truncate block font-medium" title={selectedProperty.currentOwner.postalAddress}>
                        {selectedProperty.currentOwner.postalAddress || 'Homagama'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cadastral Jurisdiction */}
                <div className="p-3 bg-gray-50/80 border border-gray-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800 text-[11px] uppercase tracking-wider">
                    <Building className="w-3.5 h-3.5 text-[#A31736]" />
                    <span>Cadastral Location</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-gray-700">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Road / Street</span>
                      <span className="font-bold text-gray-900">{selectedRoad?.name || 'Assigned Road'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Ward Jurisdiction</span>
                      <span className="font-semibold text-gray-800">
                        {selectedWard ? `Ward ${selectedWard.number}: ${selectedWard.name}` : 'Homagama Ward'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Administrative Zone</span>
                      <span className="font-semibold text-gray-800">{selectedZone?.name || 'Homagama (HMG)'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">GPS Pin Coordinates</span>
                      <span className="font-mono text-[11px] font-semibold text-gray-700">
                        {selectedProperty.latitude.toFixed(5)}, {selectedProperty.longitude.toFixed(5)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Valuation & Financial Dues */}
                <div className="p-3 bg-gray-50/80 border border-gray-200 rounded-xl space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-gray-800 text-[11px] uppercase tracking-wider">
                      <CreditCard className="w-3.5 h-3.5 text-[#A31736]" />
                      <span>Valuation & Tax Assessment</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#A31736] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {selectedProperty.propertyType}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                      <span className="text-[10px] text-gray-400 block font-semibold">Annual Assessed Value</span>
                      <span className="text-sm font-black text-gray-900">
                        {formatLKR(selectedProperty.annualAssessedValue)}
                      </span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                      <span className="text-[10px] text-gray-400 block font-semibold">Total Outstanding Due</span>
                      <span className={`text-sm font-black ${selectedTotalDue > 0 ? 'text-[#A31736]' : 'text-emerald-600'}`}>
                        {formatLKR(selectedTotalDue)}
                      </span>
                    </div>
                  </div>

                  {selectedArrears > 0 && (
                    <div className="flex items-center justify-between px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 font-semibold text-xs">
                      <span>Accumulated Arrears Debt:</span>
                      <span className="font-bold">{formatLKR(selectedArrears)}</span>
                    </div>
                  )}

                  {/* 4 Quarters Breakdown */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1.5">
                      2026 Quarterly Payment Status
                    </span>
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      {selectedProperty.dues.slice(0, 4).map((due) => (
                        <div
                          key={due.id}
                          className={`p-2 rounded-lg border text-[10px] font-bold ${due.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : due.status === 'Due'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                        >
                          <div>Q{due.quarter}</div>
                          <div className="text-[9px] mt-0.5 uppercase">{due.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenProperty(selectedProperty.id)}
                    className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Open Full Property 360 View</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/finances/varipanam/billing?assessment=${encodeURIComponent(selectedProperty.assessmentNumber)}`)}
                    className="w-full py-2 text-xs font-bold text-[#A31736] bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Record / Collect Payment</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2">
                {filteredProperties.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400">
                    <ShieldAlert className="w-10 h-10 mb-2 opacity-40 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-600">No properties match your filter</p>
                    <p className="text-xs text-gray-400 mt-1">Try resetting zone, road, or status filters.</p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-3 px-3 py-1.5 text-xs font-bold text-[#A31736] bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  filteredProperties.map((prop) => {
                    const isSelected = selectedProperty?.id === prop.id
                    const road = roads.find((r) => r.id === prop.roadId)
                    const totalDue = prop.dues
                      .filter((d) => d.status !== 'Paid')
                      .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0)

                    return (
                      <div
                        key={prop.id}
                        onClick={() => handleSelectProperty(prop)}
                        className={`p-3 rounded-xl cursor-pointer transition-all ${isSelected
                            ? 'bg-rose-50/80 border border-[#A31736]/30 shadow-2xs'
                            : 'hover:bg-gray-50 border border-transparent'
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-gray-900 tracking-tight">
                                {prop.assessmentNumber}
                              </span>
                              <StatusBadge status={prop.status} size="sm" />
                            </div>
                            <p className="text-xs font-medium text-gray-700 mt-0.5 truncate max-w-[200px]">
                              {prop.currentOwner.name}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate max-w-[220px]">
                              {road?.name || 'Assigned Road'} • {prop.propertyType}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-[10px] text-gray-400 uppercase font-semibold">Outstanding</p>
                            <p className={`text-xs font-black ${totalDue > 0 ? 'text-[#A31736]' : 'text-emerald-600'}`}>
                              {formatLKR(totalDue)}
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenProperty(prop.id)
                              }}
                              className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-bold text-[#A31736] hover:underline"
                            >
                              <span>Open 360</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Arrears Age Analysis Chart ── */}
      <ArrearsAgeChart properties={properties} />
    </div>
  )
}

export default VaripanamOverviewPage
