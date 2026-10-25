import React, { useState } from 'react'
import { Calculator, HeartHandshake, Clock, CheckCircle } from 'lucide-react'
import { useVaripanam } from '../context/VaripanamContext'
import NeedsConfirmationBadge from '../components/shared/NeedsConfirmationBadge'
import { formatLKR } from '../utils/formatters'

export const ValuationReliefPage: React.FC = () => {
  const { properties } = useVaripanam()

  const [activeTab, setActiveTab] = useState<'valuation' | 'relief'>('relief')
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || '')

  // Relief form state
  const [reliefType, setReliefType] = useState<'Poverty' | 'ClosedBusiness'>('Poverty')
  const [reliefReason, setReliefReason] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Valuation revision state
  const [newValuationAmount, setNewValuationAmount] = useState<string>('300000')
  const [valuationReason, setValuationReason] = useState<string>('Building construction verified with COC')

  const property = properties.find((p) => p.id === selectedPropertyId)

  // Mock list of active relief records
  const mockReliefRecords = [
    {
      id: 'rel-01',
      propertyAssessment: '78/12a',
      ownerName: 'Sunil Shantha Perera',
      type: 'Poverty (100% Tax Relief -> Rs. 0)',
      startDate: '2025-06-01',
      expiryDate: '2026-05-31',
      daysRemaining: 42,
      isExpiringSoon: true,
      reason: 'Low income elder citizen declaration verified by Grama Niladhari',
    },
    {
      id: 'rel-02',
      propertyAssessment: '31/C',
      ownerName: 'Prasanna Ranatunga',
      type: 'Closed Business (50% Tax Relief)',
      startDate: '2025-11-15',
      expiryDate: '2026-11-14',
      daysRemaining: 210,
      isExpiringSoon: false,
      reason: 'Retail shop closed due to zero commercial sales in macroeconomic downturn',
    },
  ]

  const handleGrantRelief = (e: React.FormEvent) => {
    e.preventDefault()
    if (!property) return

    setSuccessMessage(
      `Statutory ${reliefType === 'Poverty' ? '100% Poverty Relief (Rs. 0)' : '50% Closed Business Relief'} granted for property ${property.assessmentNumber}. Valid for 1 year from today (expiring in 365 days).`
    )
    setReliefReason('')
  }

  const handleUpdateValuation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!property) return

    setSuccessMessage(
      `Master valuation updated for property ${property.assessmentNumber}. Annual value adjusted from ${formatLKR(property.annualAssessedValue)} to ${formatLKR(Number(newValuationAmount))}.`
    )
  }

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              Valuation & Statutory Tax Relief
            </h1>
            <NeedsConfirmationBadge tooltip="Relief validity is strictly limited to 1 year (Poverty = Rs. 0 / Closed Business = 50%)." />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Property reassessment inspections, master valuation adjustments, and poverty/business hardship relief exemptions.
          </p>
        </div>

        <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
          <button
            type="button"
            onClick={() => setActiveTab('relief')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'relief' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'
            }`}
          >
            Statutory Relief (1-Yr)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('valuation')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'valuation' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'
            }`}
          >
            Master Valuation
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {activeTab === 'relief' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Grant Relief Form (Col 6) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-[#A31736]" />
              <span>Grant Annual Hardship Tax Relief</span>
            </h2>

            <form onSubmit={handleGrantRelief} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Target Property *</label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-[#A31736]"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.assessmentNumber} — {p.currentOwner.name} ({formatLKR(p.annualAssessedValue)}/yr)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Relief Category *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReliefType('Poverty')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      reliefType === 'Poverty'
                        ? 'bg-rose-50 border-[#A31736] text-rose-900 font-bold shadow-2xs'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <p className="font-bold">Declared Poverty</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Annual value becomes Rs. 0 (100% relief for 1 year)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReliefType('ClosedBusiness')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      reliefType === 'ClosedBusiness'
                        ? 'bg-rose-50 border-[#A31736] text-rose-900 font-bold shadow-2xs'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <p className="font-bold">Closed Business</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">50% relief for no commercial sales (1 year max)</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Statutory Grounds / Declaration *</label>
                <textarea
                  value={reliefReason}
                  onChange={(e) => setReliefReason(e.target.value)}
                  placeholder="e.g. Low income elder affidavit verified by Grama Niladhari or trade closure certificate."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736] h-20 resize-none"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold">Automatic Expiry Clause:</p>
                <p className="text-[11px]">
                  Relief is valid for exactly 1 calendar year. The system automatically tracks expiration. Once business resumes, owner is legally bound to inform Council.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Authorize 1-Year Relief
              </button>
            </form>
          </div>

          {/* Right: Active Relief & Expiring Soon Desk (Col 6) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#A31736]" />
              <span>Active Relief Exemptions & Expiring Watchlist</span>
            </h2>

            <div className="space-y-3">
              {mockReliefRecords.map((r) => (
                <div key={r.id} className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">
                      Assessment No: {r.propertyAssessment} ({r.ownerName})
                    </span>
                    {r.isExpiringSoon && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                        Expiring Soon ({r.daysRemaining} days left)
                      </span>
                    )}
                  </div>
                  <p className="text-[#A31736] font-semibold">{r.type}</p>
                  <p className="text-gray-500 text-[11px]">Reason: {r.reason}</p>
                  <div className="text-[10px] text-gray-400 flex justify-between pt-1 border-t border-gray-200">
                    <span>Valid from: {r.startDate}</span>
                    <span>Expires: {r.expiryDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── Master Valuation Reassessment ── */
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs max-w-2xl mx-auto space-y-5">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#A31736]" />
            <span>Master Valuation Reassessment & Property Type Adjustment</span>
          </h2>

          <form onSubmit={handleUpdateValuation} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Select Property *</label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-[#A31736]"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.assessmentNumber} — Current Value: {formatLKR(p.annualAssessedValue)} ({p.propertyType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">New Assessed Annual Value (LKR) *</label>
              <input
                type="number"
                value={newValuationAmount}
                onChange={(e) => setNewValuationAmount(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 outline-none focus:border-[#A31736]"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Statutory Grounds / COC Inspection Memo *</label>
              <input
                type="text"
                value={valuationReason}
                onChange={(e) => setValuationReason(e.target.value)}
                placeholder="e.g. Field inspection by RI confirmed two-storey expansion with valid COC."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Sign & Commit Master Valuation
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default ValuationReliefPage
