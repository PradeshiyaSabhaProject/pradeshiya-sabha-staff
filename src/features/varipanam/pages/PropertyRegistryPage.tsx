import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Building2, Download } from 'lucide-react'
import { useVaripanam } from '../context/VaripanamContext'
import FilterBar from '../components/property/FilterBar'
import PropertyRegistryTable from '../components/property/PropertyRegistryTable'
import NeedsConfirmationBadge from '../components/shared/NeedsConfirmationBadge'

export const PropertyRegistryPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    filteredProperties,
    zones,
    wards,
    roads,
    isLoading,
    filters,
    setFilters,
    resetFilters,
  } = useVaripanam()

  const handleOpenProperty = (propertyId: string) => {
    navigate(`/finances/varipanam/properties/${propertyId}`)
  }

  const handleExportCsv = () => {
    const headers = [
      'Assessment No',
      'Property No',
      'Description',
      'Type',
      'Owner Name',
      'NIC',
      'Mobile',
      'Postal Address',
      'Zone',
      'Ward',
      'Road',
      'Annual Value (LKR)',
      'Status',
    ]

    const rows = filteredProperties.map((p) => {
      const zone = zones.find((z) => z.id === p.zoneId)?.name || ''
      const ward = wards.find((w) => w.id === p.wardId)?.name || ''
      const road = roads.find((r) => r.id === p.roadId)?.name || ''
      return [
        `"${p.assessmentNumber}"`,
        `"${p.propertyNumber}"`,
        `"${p.description}"`,
        `"${p.propertyType}"`,
        `"${p.currentOwner.name}"`,
        `"${p.currentOwner.nic}"`,
        `"${p.currentOwner.mobile}"`,
        `"${p.currentOwner.postalAddress}"`,
        `"${zone}"`,
        `"${ward}"`,
        `"${road}"`,
        p.annualAssessedValue,
        `"${p.status}"`,
      ]
    })

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `varipanam-property-registry-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-[#A31736]/20 border-t-[#A31736] rounded-full animate-spin" />
        <p className="text-xs font-semibold text-gray-500">Loading Property Registry Master...</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#A31736] flex items-center justify-center border border-rose-100">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-gray-900 tracking-tight">
                  Properties & Assessment Master
                </h1>
                <NeedsConfirmationBadge tooltip="Assessment identifiers are perpetual legal records and cannot be cancelled or overwritten." />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Official property tax register for Homagama & Wateraka divisions ({filteredProperties.length} records)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>EXPORT CSV</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/finances/varipanam/add-property')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>ADD NEW PROPERTY</span>
          </button>
        </div>
      </div>

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

      {/* ── Master Registry Table ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
        <PropertyRegistryTable
          properties={filteredProperties}
          roads={roads}
          onOpenProperty={handleOpenProperty}
        />
      </div>
    </div>
  )
}

export default PropertyRegistryPage
