import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Download } from 'lucide-react'
import { useVaripanam } from '../context/VaripanamContext'
import FilterBar from '../components/property/FilterBar'
import PropertyRegistryTable from '../components/property/PropertyRegistryTable'
import Property360Modal from '../components/property/Property360Modal'
import NeedsConfirmationBadge from '../components/shared/NeedsConfirmationBadge'

export const PropertyRegistryPage: React.FC = () => {
  const navigate = useNavigate()
  const [modalPropertyId, setModalPropertyId] = useState<string | null>(null)
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
    setModalPropertyId(propertyId)
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
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Loading Property Registry Master...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                ACTIVE SHIFT: 08:00 - 16:30
              </span>
              <NeedsConfirmationBadge tooltip="Assessment identifiers are perpetual legal records and cannot be cancelled or overwritten." />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase mt-1">
              PROPERTIES & ASSESSMENT MASTER
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Official property tax register for Homagama & Wateraka divisions ({filteredProperties.length} records)
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold px-3.5 py-2 rounded border border-gray-300 transition-colors uppercase tracking-wider shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>EXPORT CSV</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/varipanam/add-property')}
              className="inline-flex items-center gap-1.5 bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold px-4 py-2 rounded transition-colors shadow-2xs uppercase tracking-wider cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ADD NEW PROPERTY</span>
            </button>
          </div>
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
        onAddPropertyClick={() => navigate('/varipanam/add-property')}
        isPickMode={false}
        totalFilteredCount={filteredProperties.length}
      />

      {/* ── Master Registry Table ── */}
      <PropertyRegistryTable
        properties={filteredProperties}
        roads={roads}
        onOpenProperty={handleOpenProperty}
      />

      {/* ── Property 360 Pop-up Modal ── */}
      <Property360Modal
        propertyId={modalPropertyId}
        isOpen={!!modalPropertyId}
        onClose={() => setModalPropertyId(null)}
      />
    </div>
  )
}

export default PropertyRegistryPage
