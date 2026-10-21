import React, { useState } from 'react'
import { Users, FileText, CheckCircle } from 'lucide-react'
import { useVaripanam } from '../context/VaripanamContext'
import NeedsConfirmationBadge from '../components/shared/NeedsConfirmationBadge'
import { formatLKR } from '../utils/formatters'

export const OwnershipChangePage: React.FC = () => {
  const { properties } = useVaripanam()

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || '')
  const [newOwnerName, setNewOwnerName] = useState<string>('')
  const [newOwnerNic, setNewOwnerNic] = useState<string>('')
  const [newOwnerMobile, setNewOwnerMobile] = useState<string>('')
  const [newPostalAddress, setNewPostalAddress] = useState<string>('')
  const [deedNumber, setDeedNumber] = useState<string>('')
  const [notaryReportRef, setNotaryReportRef] = useState<string>('')
  const [effectiveDate, setEffectiveDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const property = properties.find((p) => p.id === selectedPropertyId)

  // Current arrears on this property
  const currentArrears = property
    ? property.dues
        .filter((d) => d.status !== 'Paid')
        .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0)
    : 0

  const handleTransferOwnership = (e: React.FormEvent) => {
    e.preventDefault()
    if (!property || !newOwnerName.trim() || !newOwnerNic.trim()) return

    setSuccessMessage(
      `Ownership successfully transferred to ${newOwnerName} (Postal: ${newPostalAddress || property.currentOwner.postalAddress}). Previous owner (${property.currentOwner.name}) archived to history. Arrears of ${formatLKR(currentArrears)} remain attached to property ${property.assessmentNumber}.`
    )

    setNewOwnerName('')
    setNewOwnerNic('')
    setNewOwnerMobile('')
    setNewPostalAddress('')
    setDeedNumber('')
    setNotaryReportRef('')
  }

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Ownership Title Change</h1>
            <NeedsConfirmationBadge tooltip="The assessment number NEVER changes when ownership changes. Arrears remain attached to the continuous property account." />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Legal record succession backed by ATD dossier, notary reports, and registered deed filings.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Change Form (Col 6) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#A31736]" />
            <span>Record New Title Holder</span>
          </h2>

          <form onSubmit={handleTransferOwnership} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Target Property *</label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-[#A31736]"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.assessmentNumber} — {p.currentOwner.name} ({p.propertyNumber})
                  </option>
                ))}
              </select>
            </div>

            {property && (
              <div className="p-3 bg-rose-50/60 border border-rose-200/80 rounded-xl text-xs space-y-1 text-gray-800">
                <p className="font-bold text-[#A31736]">Current Assessment Account Status:</p>
                <p>
                  Current Owner: <span className="font-semibold">{property.currentOwner.name}</span> ({property.currentOwner.nic})
                </p>
                <p>
                  Outstanding Arrears: <span className="font-bold text-[#A31736]">{formatLKR(currentArrears)}</span>
                </p>
                <p className="text-[11px] text-gray-500">
                  Note: Statutory rule mandates that new owner assumes all existing arrears upon transfer.
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100">
              <label className="text-xs font-semibold text-gray-700 block mb-1">New Owner Full Name *</label>
              <input
                type="text"
                value={newOwnerName}
                onChange={(e) => setNewOwnerName(e.target.value)}
                placeholder="e.g. Mahinda Siriwardena"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">New Owner NIC *</label>
                <input
                  type="text"
                  value={newOwnerNic}
                  onChange={(e) => setNewOwnerNic(e.target.value)}
                  placeholder="e.g. 197210200331"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736]"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Mobile Telephone</label>
                <input
                  type="text"
                  value={newOwnerMobile}
                  onChange={(e) => setNewOwnerMobile(e.target.value)}
                  placeholder="+94 77 111 2222"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Deed Registration No *</label>
                <input
                  type="text"
                  value={deedNumber}
                  onChange={(e) => setDeedNumber(e.target.value)}
                  placeholder="e.g. DEED-7712"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736]"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Notary Report Ref</label>
                <input
                  type="text"
                  value={notaryReportRef}
                  onChange={(e) => setNotaryReportRef(e.target.value)}
                  placeholder="e.g. NOT-REP-4401"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Effective Legal Date</label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Commit Ownership Change
            </button>
          </form>
        </div>

        {/* Right: Ownership Principles & Audit rules (Col 6) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#A31736]" />
            <span>Statutory Ownership Rules</span>
          </h2>

          <div className="space-y-3 text-xs text-gray-600">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="font-bold text-gray-800">1. Assessment Number Continuity</p>
              <p className="mt-0.5 text-gray-500">
                The assessment number does not change when the owner changes. The property unit remains the permanent anchor.
              </p>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="font-bold text-gray-800">2. Financial Obligation Succession</p>
              <p className="mt-0.5 text-gray-500">
                If the outgoing owner left outstanding tax arrears, the new owner inherits the debt. All previous payments and receipts remain in historical audit logs.
              </p>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="font-bold text-gray-800">3. Immutable Ownership Chain</p>
              <p className="mt-0.5 text-gray-500">
                Previous owners are NEVER deleted. They are archived into the Property 360 timeline with start and end dates, deed numbers, and approving officers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OwnershipChangePage
