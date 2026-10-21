import React, { useState } from 'react'
import { Search, Download, FileText, User, Building } from 'lucide-react'
import { useVaripanam } from '../context/VaripanamContext'
import NeedsConfirmationBadge from '../components/shared/NeedsConfirmationBadge'
import { formatLKR } from '../utils/formatters'

export const HistoricalSearchPage: React.FC = () => {
  const { properties } = useVaripanam()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || '')

  const property = properties.find((p) => p.id === selectedPropertyId)

  // Filter properties
  const filteredList = properties.filter((p) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      p.assessmentNumber.toLowerCase().includes(q) ||
      p.currentOwner.name.toLowerCase().includes(q) ||
      p.currentOwner.nic.toLowerCase().includes(q) ||
      p.propertyNumber.toLowerCase().includes(q)
    )
  })

  const statutoryDisclaimer =
    'This reflects Pradeshiya Sabha records and is not legal proof of title unless the competent authority defines it as such.'

  const handleExportHistoricalAudit = () => {
    if (!property) return
    const textContent = `
HOMAGAMA PRADESHIYA SABHA • HISTORICAL ASSESSMENT AUDIT REPORT
Generated Date: ${new Date().toLocaleString()}
Assessment Number: ${property.assessmentNumber}
Property Number: ${property.propertyNumber}
Type: ${property.propertyType}
Current Owner: ${property.currentOwner.name} (${property.currentOwner.nic})
Assessed Annual Value: LKR ${property.annualAssessedValue}

STATUTORY DISCLAIMER:
"${statutoryDisclaimer}"
    `
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `varipanam-history-${property.assessmentNumber.replace('/', '-')}.txt`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              Historical Assessment Search
            </h1>
            <NeedsConfirmationBadge tooltip="Historical record retention period is configured in Settings (Default: 10 Years, starting 2026)." />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Perpetual audit trail of obsolete assessment numbers, owner chains, valuation adjustments, and location modifications.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportHistoricalAudit}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-xl transition-all cursor-pointer shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>EXPORT HISTORICAL DOSSIER</span>
        </button>
      </div>

      {/* ── Statutory Disclaimer Banner ── */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Search & Property Selector (Col 4) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assessment no, old no, NIC..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#A31736]"
            />
          </div>

          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {filteredList.map((p) => {
              const isSelected = p.id === selectedPropertyId
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPropertyId(p.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-rose-50 border border-[#A31736]/30' : 'hover:bg-gray-50'
                    }`}
                >
                  <p className="font-black text-gray-900 text-xs">{p.assessmentNumber}</p>
                  <p className="text-gray-700 font-semibold text-xs mt-0.5">{p.currentOwner.name}</p>
                  <p className="text-gray-400 text-[11px]">{p.propertyNumber} • {p.propertyType}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Historical Timeline (Col 8) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
          {property ? (
            <>
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-base font-black text-gray-900 tracking-tight">
                  Perpetual Chronological Record: {property.assessmentNumber}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Current Owner: {property.currentOwner.name} ({property.currentOwner.nic}) • Assessed Annual Value: {formatLKR(property.annualAssessedValue)}
                </p>
              </div>

              {/* Identifier History */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-[#A31736]" />
                  <span>1. Assessment Identifier Continuity</span>
                </h3>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>Active Identifier: {property.assessmentNumber}</span>
                    <span className="text-emerald-700">Valid</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Previous Obsolete Identifiers: <strong>78/12 (Archived 2023)</strong>. Identifiers are never deleted and remain linked.
                  </p>
                </div>
              </div>

              {/* Ownership History */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#A31736]" />
                  <span>2. Historical Ownership Chain</span>
                </h3>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-900">Current: {property.currentOwner.name} ({property.currentOwner.nic})</span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">Present</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 text-gray-600 text-[11px] space-y-1">
                    <p>• Prior Owner: <strong>K. L. Siriwardena</strong> (1998 - 2023)</p>
                    <p>• Transfer Basis: Deed No. 3310 registered with Homagama Notary Registry</p>
                  </div>
                </div>
              </div>

              {/* Valuation & Assessment Changes */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#A31736]" />
                  <span>3. Valuation History</span>
                </h3>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1 text-gray-700">
                  <p>• 2025 - Present: {formatLKR(property.annualAssessedValue)} ({property.propertyType})</p>
                  <p className="text-gray-400">• 2020 - 2024: Rs. 150,000.00 (Single-storey baseline valuation)</p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-400">Select a property on the left to examine historical records.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default HistoricalSearchPage
