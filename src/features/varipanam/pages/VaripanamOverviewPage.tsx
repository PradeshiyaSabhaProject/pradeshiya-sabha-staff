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
import Property360Modal from '../components/property/Property360Modal'
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
  const [modalPropertyId, setModalPropertyId] = useState<string | null>(null)

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
    setModalPropertyId(propertyId)
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
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Loading Varipanam Command Overview...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── 1. Page Header & Operational Shift Banner ── */}
      <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                ACTIVE SHIFT: 08:00 - 16:30
              </span>
              <span className="text-xs text-gray-500 font-medium hidden sm:inline">
                Synced at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <NeedsConfirmationBadge tooltip="Property tax rates (Residential 10%, Commercial 15%) and penalty rules are awaiting gazette ratification." />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase mt-1">
              HOMAGAMA PRADESHIYA SABHA • VARIPANAM COMMAND OVERVIEW
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Live property tax governance hub: monitor billed revenues, collections, arrears aging, warrant enforcement, and GIS cadastre.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => refreshData()}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold px-3.5 py-2 rounded border border-gray-300 transition-colors uppercase tracking-wider shadow-2xs cursor-pointer"
              title="Refresh municipal varipanam records"
            >
              <RotateCw className="w-3.5 h-3.5 text-gray-600" />
              <span>REFRESH</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold px-4 py-2 rounded transition-colors shadow-2xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'EXPORTING...' : 'EXECUTIVE EXPORT'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Top Executive KPI Summary Cards ── */}
      <KpiCards
        properties={properties}
        fieldCollections={fieldCollections}
        onFilterUnpaidTwoQuarters={() => setFilters({ status: 'Overdue' })}
        onFilterWarrants={() => setFilters({ status: 'Warrant issued' })}
        onFilterOverdue={() => setFilters({ status: 'Overdue' })}
      />

      {/* ── 3. Cascading Municipal Filter Bar ── */}
      <FilterBar
        zones={zones}
        wards={wards}
        roads={roads}
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={resetFilters}
        onAddPropertyClick={() => navigate('/varipanam/add-property')}
        isPickMode={false}
        totalFilteredCount={filteredProperties.length}
      />

      {/* ── Mobile Tab Switcher (Map vs List) ── */}
      <div className="flex sm:hidden border border-gray-300 bg-white rounded p-1 shadow-2xs gap-1">
        <button
          type="button"
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-colors ${
            mobileTab === 'map' ? 'bg-[#A31736] text-white' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          GIS Map View
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-colors ${
            mobileTab === 'list' ? 'bg-[#A31736] text-white' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Properties List ({filteredProperties.length})
        </button>
      </div>

      {/* ── 4. Main Central Operational Split: Map on Left / List & Details on Right ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* Left: GIS Leaflet Map (Col 7 on desktop) */}
        <div className={`lg:col-span-7 h-[580px] ${mobileTab === 'list' ? 'hidden sm:block' : 'block'}`}>
          <div className="h-full bg-white border border-gray-300 rounded shadow-xs overflow-hidden flex flex-col">
            <div className="p-3.5 sm:p-4 border-b border-gray-200 bg-gray-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#A31736]" />
                <span className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Sabha Cadastral Map (Homagama & Wateraka)
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                {filteredProperties.length} PLOTS SHOWN
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
          <div className="h-full bg-white border border-gray-300 rounded shadow-xs overflow-hidden flex flex-col">
            {/* Header Tabs: Exact Details vs All Units */}
            <div className="p-3.5 sm:p-4 border-b border-gray-200 bg-gray-50/70 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {selectedProperty && (
                  <button
                    type="button"
                    onClick={() => setRightPanelTab('details')}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      rightPanelTab === 'details'
                        ? 'bg-[#A31736] text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Exact Details</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setRightPanelTab('list')}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                    rightPanelTab === 'list' || !selectedProperty
                      ? 'bg-[#A31736] text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>All Units ({filteredProperties.length})</span>
                </button>
              </div>

              {selectedProperty && (
                <button
                  type="button"
                  onClick={() => setSelectedProperty(null)}
                  className="text-[10px] font-bold uppercase tracking-wider text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-pointer px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 shadow-2xs"
                  title="Deselect property"
                >
                  <X className="w-3 h-3" />
                  <span>CLEAR</span>
                </button>
              )}
            </div>

            {/* Content: Either Exact Property Details or List */}
            {selectedProperty && rightPanelTab === 'details' ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {/* Header Unit Overview */}
                <div className="p-3.5 bg-rose-50/50 border border-rose-200 rounded space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-gray-900 tracking-tight font-mono">
                        {selectedProperty.assessmentNumber}
                      </span>
                      <StatusBadge status={selectedProperty.status} size="sm" />
                    </div>
                    <span className="text-xs font-bold text-gray-600 font-mono">
                      {selectedProperty.propertyNumber}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{selectedProperty.description}</p>
                </div>

                {/* Primary Owner Information */}
                <div className="p-3.5 bg-white border border-gray-200 rounded space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800 text-[11px] uppercase tracking-wider border-b border-gray-100 pb-1.5">
                    <User className="w-3.5 h-3.5 text-[#A31736]" />
                    <span>Primary Owner Information</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-gray-700">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Owner Name</span>
                      <span className="font-bold text-gray-900">{selectedProperty.currentOwner.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">NIC Number</span>
                      <span className="font-mono font-bold text-gray-800">{selectedProperty.currentOwner.nic}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Telephone / Mobile</span>
                      <span className="font-mono font-semibold">{selectedProperty.currentOwner.mobile || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Postal Address</span>
                      <span className="truncate block font-medium" title={selectedProperty.currentOwner.postalAddress}>
                        {selectedProperty.currentOwner.postalAddress || 'Homagama'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cadastral Jurisdiction */}
                <div className="p-3.5 bg-white border border-gray-200 rounded space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800 text-[11px] uppercase tracking-wider border-b border-gray-100 pb-1.5">
                    <Building className="w-3.5 h-3.5 text-[#A31736]" />
                    <span>Cadastral Location</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-gray-700">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Road / Street</span>
                      <span className="font-bold text-gray-900">{selectedRoad?.name || 'Assigned Road'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Ward Jurisdiction</span>
                      <span className="font-semibold text-gray-800">
                        {selectedWard ? `Ward ${selectedWard.number}: ${selectedWard.name}` : 'Homagama Ward'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Administrative Zone</span>
                      <span className="font-semibold text-gray-800">{selectedZone?.name || 'Homagama (HMG)'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">GPS Coordinates</span>
                      <span className="font-mono text-[11px] font-semibold text-gray-700">
                        {selectedProperty.latitude.toFixed(5)}, {selectedProperty.longitude.toFixed(5)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Valuation & Financial Dues */}
                <div className="p-3.5 bg-white border border-gray-200 rounded space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-gray-800 text-[11px] uppercase tracking-wider">
                      <CreditCard className="w-3.5 h-3.5 text-[#A31736]" />
                      <span>Valuation & Tax Assessment</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A31736] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {selectedProperty.propertyType}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-gray-50 rounded border border-gray-200">
                      <span className="text-[10px] text-gray-500 block font-bold uppercase tracking-wider">Annual Assessed Value</span>
                      <span className="text-sm font-bold text-gray-900 font-mono">
                        {formatLKR(selectedProperty.annualAssessedValue)}
                      </span>
                    </div>
                    <div className="p-2.5 bg-gray-50 rounded border border-gray-200">
                      <span className="text-[10px] text-gray-500 block font-bold uppercase tracking-wider">Total Outstanding Due</span>
                      <span className={`text-sm font-bold font-mono ${selectedTotalDue > 0 ? 'text-[#A31736]' : 'text-emerald-700'}`}>
                        {formatLKR(selectedTotalDue)}
                      </span>
                    </div>
                  </div>

                  {selectedArrears > 0 && (
                    <div className="flex items-center justify-between px-3 py-2 bg-rose-50 border border-rose-200 rounded text-rose-800 font-semibold text-xs">
                      <span className="uppercase tracking-wider font-bold text-[10px]">Accumulated Arrears Debt:</span>
                      <span className="font-bold font-mono">{formatLKR(selectedArrears)}</span>
                    </div>
                  )}

                  {/* 4 Quarters Breakdown */}
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block mb-1.5">
                      2026 Quarterly Payment Status
                    </span>
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      {selectedProperty.dues.slice(0, 4).map((due) => (
                        <div
                          key={due.id}
                          className={`p-2 rounded border text-[10px] font-bold ${
                            due.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : due.status === 'Due'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          <div>Q{due.quarter}</div>
                          <div className="text-[9px] mt-0.5 uppercase tracking-wider">{due.status}</div>
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
                    className="w-full py-2 px-3 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded shadow-2xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Open Full Property 360 View</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/varipanam/billing-payments?assessment=${encodeURIComponent(selectedProperty.assessmentNumber)}`)}
                    className="w-full py-2 px-3 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded shadow-2xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-gray-500" />
                    <span>Record / Collect Payment</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2">
                {filteredProperties.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400">
                    <ShieldAlert className="w-10 h-10 mb-2 opacity-40 text-gray-400" />
                    <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">No properties match your filter</p>
                    <p className="text-xs text-gray-400 mt-1">Try resetting zone, road, or status filters.</p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-3 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#A31736] bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors cursor-pointer"
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
                        className={`p-3 rounded transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-rose-50/70 border-l-4 border-l-[#A31736] border border-rose-200 shadow-2xs'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold font-mono text-gray-900 tracking-tight">
                                {prop.assessmentNumber}
                              </span>
                              <StatusBadge status={prop.status} size="sm" />
                            </div>
                            <p className="text-xs font-semibold text-gray-800 mt-0.5 truncate max-w-[200px]">
                              {prop.currentOwner.name}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate max-w-[220px]">
                              {road?.name || 'Assigned Road'} • {prop.propertyType}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Outstanding</p>
                            <p className={`text-xs font-bold font-mono ${totalDue > 0 ? 'text-[#A31736]' : 'text-emerald-700'}`}>
                              {formatLKR(totalDue)}
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenProperty(prop.id)
                              }}
                              className="mt-1 border border-[#A31736] text-[#A31736] hover:bg-rose-50 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded inline-flex items-center gap-1 transition-colors cursor-pointer"
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

      {/* ── 5. Arrears Age Analysis Chart ── */}
      <ArrearsAgeChart properties={properties} />

      {/* ── Property 360 Pop-up Modal ── */}
      <Property360Modal
        propertyId={modalPropertyId}
        isOpen={!!modalPropertyId}
        onClose={() => setModalPropertyId(null)}
      />
    </div>
  )
}

export default VaripanamOverviewPage
