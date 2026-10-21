import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useVaripanam, VaripanamProvider } from '../context/VaripanamContext'
import KpiCards from '../components/shared/KpiCards'
import ArrearsAgeChart from '../components/shared/ArrearsAgeChart'
import FilterBar from '../components/property/FilterBar'
import VaripanamMap from '../components/map/VaripanamMap'
import PropertyRegistryTable from '../components/property/PropertyRegistryTable'
import AddPropertyDrawer from '../components/map/AddPropertyDrawer'
import NeedsConfirmationBadge from '../components/shared/NeedsConfirmationBadge'
import StatusBadge from '../components/shared/StatusBadge'
import { formatLKR } from '../utils/formatters'

const DashboardContent: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
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
    isPickMode,
    setIsPickMode,
    pickedCoords,
    setPickedCoords,
    isDrawerOpen,
    setIsDrawerOpen,
    mobileTab,
    setMobileTab,
    addProperty,
    createRoad,
  } = useVaripanam()

  // View Mode: 'split' (Map + List side-by-side) or 'table' (Full Registry Table)
  const isPropertiesPath = location.pathname.includes('/properties')
  const [viewMode, setViewMode] = useState<'split' | 'table'>(isPropertiesPath ? 'table' : 'split')

  useEffect(() => {
    if (location.pathname.includes('/properties')) {
      setViewMode('table')
    } else if (location.pathname.includes('/dashboard')) {
      setViewMode('split')
    }
  }, [location.pathname])

  const handleOpenProperty = (propertyId: string) => {
    navigate(`/varipanam/properties/${propertyId}`)
  }

  const handleStartPickMode = () => {
    setIsPickMode(true)
    setPickedCoords({ latitude: settings.mapCentre[0], longitude: settings.mapCentre[1] })
    setIsDrawerOpen(true)
  }

  const handleMapClickCoord = (coords: { latitude: number; longitude: number }) => {
    setPickedCoords(coords)
    setIsDrawerOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-[#A31736]/20 border-t-[#A31736] rounded-full animate-spin" />
        <p className="text-xs font-semibold text-gray-500">Loading Varipanam Assessment Rates & GIS Map...</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Varipanam / Assessment Rates
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-[#A31736] border border-rose-200">
              Super Admin Desk
            </span>
            <NeedsConfirmationBadge tooltip="Property tax rates (Residential 10%, Commercial 15%) and penalty rules are awaiting gazette ratification." />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Pradeshiya Sabha Property Tax Management, GIS Geo-Spatial Cadastre, Arrears Aging & Warrant Enforcement
          </p>
        </div>

        {/* View Switcher & Action */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
            <button
              type="button"
              onClick={() => {
                setViewMode('split')
                navigate('/varipanam/dashboard')
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'split' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'
              }`}
            >
              GIS Map + List
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('table')
                navigate('/varipanam/properties')
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'
              }`}
            >
              Registry Table View
            </button>
          </div>

          <button
            type="button"
            onClick={handleStartPickMode}
            className="px-4 py-2 bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <KpiCards
        properties={filteredProperties}
        fieldCollections={fieldCollections}
        onFilterOverdue={() => setFilters({ status: 'Overdue' })}
        onFilterWarrants={() => setFilters({ status: 'Warrant issued' })}
        onFilterUnpaidTwoQuarters={() => setFilters({ status: 'Overdue' })}
      />

      {/* ── Arrears Age-Analysis Chart ── */}
      <ArrearsAgeChart properties={filteredProperties} />

      {/* ── Filter Bar (Synced to URL Query String) ── */}
      <FilterBar
        zones={zones}
        wards={wards}
        roads={roads}
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={resetFilters}
        onAddPropertyClick={handleStartPickMode}
        isPickMode={isPickMode}
        totalFilteredCount={filteredProperties.length}
      />

      {/* ── Mobile Tab Navigation (Map / List) ── */}
      <div className="flex lg:hidden bg-gray-200 p-1 rounded-xl text-xs font-bold text-gray-700">
        <button
          type="button"
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-2 text-center rounded-lg transition-all ${
            mobileTab === 'map' ? 'bg-white text-[#A31736] shadow-xs' : 'text-gray-600'
          }`}
        >
          Interactive Map
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-2 text-center rounded-lg transition-all ${
            mobileTab === 'list' ? 'bg-white text-[#A31736] shadow-xs' : 'text-gray-600'
          }`}
        >
          Property List ({filteredProperties.length})
        </button>
      </div>

      {/* ── Main View Content ── */}
      {viewMode === 'table' ? (
        /* Full Data Table View */
        <PropertyRegistryTable
          properties={filteredProperties}
          roads={roads}
          selectedProperty={selectedProperty}
          onSelectProperty={setSelectedProperty}
          onOpenProperty={handleOpenProperty}
        />
      ) : (
        /* Split View: Map (Left) + List (Right) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Map Column */}
          <div
            className={`lg:col-span-7 xl:col-span-8 ${
              mobileTab === 'list' ? 'hidden lg:block' : 'block'
            }`}
          >
            <VaripanamMap
              properties={filteredProperties}
              settings={settings}
              roads={roads}
              selectedProperty={selectedProperty}
              onSelectProperty={setSelectedProperty}
              onOpenProperty={handleOpenProperty}
              isPickMode={isPickMode}
              pickedCoords={pickedCoords}
              onMapClickCoord={handleMapClickCoord}
              heightClass="h-[620px]"
            />
          </div>

          {/* Properties List Column */}
          <div
            className={`lg:col-span-5 xl:col-span-4 space-y-3 ${
              mobileTab === 'map' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col h-[620px]">
              {/* List Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Properties In View
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Click row to highlight & center map
                  </p>
                </div>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#A31736]/10 text-[#A31736]">
                  {filteredProperties.length}
                </span>
              </div>

              {/* Scrollable List Body */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2 space-y-1">
                {filteredProperties.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs">
                    No properties match current filters.
                  </div>
                ) : (
                  filteredProperties.map((prop) => {
                    const isSelected = selectedProperty?.id === prop.id
                    const amountDue = prop.dues.reduce((s, d) => s + (d.amount - d.paidAmount), 0)

                    return (
                      <div
                        key={prop.id}
                        onClick={() => setSelectedProperty(prop)}
                        className={`p-3 rounded-xl transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-rose-50/80 border-[#A31736] shadow-xs'
                            : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-mono text-xs font-extrabold text-gray-900">
                            {prop.assessmentNumber}
                          </span>
                          <StatusBadge status={prop.status} size="sm" />
                        </div>
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {prop.currentOwner.name}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {prop.propertyNumber} • {prop.description}
                        </p>
                        <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-gray-100/80">
                          <span className="text-gray-400 font-mono text-[10px]">
                            {prop.latitude.toFixed(4)}, {prop.longitude.toFixed(4)}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-mono font-bold ${
                                amountDue > 0 ? 'text-rose-600' : 'text-emerald-600'
                              }`}
                            >
                              {formatLKR(amountDue)}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenProperty(prop.id)
                              }}
                              className="text-[10px] font-bold text-[#A31736] hover:underline"
                            >
                              360 →
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Property By Location Side Drawer ── */}
      <AddPropertyDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false)
          setIsPickMode(false)
        }}
        zones={zones}
        wards={wards}
        roads={roads}
        existingProperties={properties}
        initialCoords={pickedCoords}
        onSave={addProperty}
        onCreateRoad={createRoad}
      />
    </div>
  )
}

export const VaripanamDashboardPage: React.FC = () => {
  return (
    <VaripanamProvider>
      <DashboardContent />
    </VaripanamProvider>
  )
}

export default VaripanamDashboardPage
