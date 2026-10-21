import React, { useState } from 'react'
import { Settings as SettingsIcon, Save, CheckCircle, Lock } from 'lucide-react'
import { useVaripanam } from '../context/VaripanamContext'
import NeedsConfirmationBadge from '../components/shared/NeedsConfirmationBadge'

export const VaripanamSettingsPage: React.FC = () => {
  const { settings, updateSettings } = useVaripanam()

  // Local settings state initialized from Context
  const [yearlyDiscount, setYearlyDiscount] = useState<number>(settings.yearlyPaymentDiscount)
  const [quarterlyDiscount, setQuarterlyDiscount] = useState<number>(settings.quarterlyPaymentDiscount)
  const [graceQuarters, setGraceQuarters] = useState<number>(settings.gracePeriodQuarters)
  const [warrantPenalty, setWarrantPenalty] = useState<number>(settings.warrantPenaltyPercentage)
  const [dueSoonDays, setDueSoonDays] = useState<number>(settings.dueSoonWindowDays)
  const [atdMode, setAtdMode] = useState<'MANUAL' | 'AUTO'>(settings.atdNumberMode)
  const [retentionYears, setRetentionYears] = useState<number>(settings.historicalSearchRetentionYears)
  const [subdivisionRule, setSubdivisionRule] = useState<'EQUAL_SPLIT' | 'VALUE_PROPORTIONAL' | 'ASSIGN_TO_PRIMARY'>(
    settings.subdivisionArrearsRule
  )

  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await updateSettings({
        yearlyPaymentDiscount: yearlyDiscount,
        quarterlyPaymentDiscount: quarterlyDiscount,
        gracePeriodQuarters: graceQuarters,
        warrantPenaltyPercentage: warrantPenalty,
        dueSoonWindowDays: dueSoonDays,
        atdNumberMode: atdMode,
        historicalSearchRetentionYears: retentionYears,
        subdivisionArrearsRule: subdivisionRule,
      })

      setSuccessMessage('Varipanam assessment settings and parameters committed successfully.')
      setTimeout(() => setSuccessMessage(null), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              Varipanam System Settings & Policy Rules
            </h1>
            <NeedsConfirmationBadge tooltip="Parameters marked with 'Needs confirmation' can be fine-tuned without code changes." />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure statutory tax percentages, prompt payment rebates, warrant grace thresholds, and GIS parameters.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'SAVING...' : 'SAVE SETTINGS'}</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Section 1: Property Tax Rates (Locked Statutory Gazette Rates) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gray-100 text-black flex items-center justify-center border border-gray-300 shrink-0">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-black flex items-center gap-1.5 flex-wrap">
                  <span>Assessment Tax Rates (% of Assessed Value)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-100 text-black border border-gray-300">
                    LOCKED (STATUTORY GAZETTE)
                  </span>
                </h2>
                <p className="text-[11px] text-black">
                  Statutory rates enacted by Council resolution & Gazette notification. Display-only.
                </p>
              </div>
            </div>
            <NeedsConfirmationBadge tooltip="Assessment tax rates are fixed by official ministerial gazette and cannot be altered via admin panel." />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-black">Residential</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-black font-bold">
                  <Lock className="w-2.5 h-2.5 text-black" />
                  <span>Fixed</span>
                </span>
              </div>
              <p className="text-xl font-black text-black font-mono">
                {settings.taxRates.residential}%
              </p>
              <p className="text-[11px] text-black mt-0.5 font-medium">Domestic dwellings & housing</p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-black">Commercial</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-black font-bold">
                  <Lock className="w-2.5 h-2.5 text-black" />
                  <span>Fixed</span>
                </span>
              </div>
              <p className="text-xl font-black text-black font-mono">
                {settings.taxRates.commercial}%
              </p>
              <p className="text-[11px] text-black mt-0.5 font-medium">Businesses, retail & offices</p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-black">Government</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-black font-bold">
                  <Lock className="w-2.5 h-2.5 text-black" />
                  <span>Fixed</span>
                </span>
              </div>
              <p className="text-xl font-black text-black font-mono">
                {settings.taxRates.government}%
              </p>
              <p className="text-[11px] text-black mt-0.5 font-medium">State & institutional land</p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-black">Bare Land</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-black font-bold">
                  <Lock className="w-2.5 h-2.5 text-black" />
                  <span>Fixed</span>
                </span>
              </div>
              <p className="text-xl font-black text-black font-mono">
                {settings.taxRates.bareLand}%
              </p>
              <p className="text-[11px] text-black mt-0.5 font-medium">Undeveloped cadastral plots</p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-2xs col-span-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-black">Religious Institutions</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-black border border-gray-300">
                  100% STATUTORY EXEMPT
                </span>
              </div>
              <p className="text-xl font-black text-black font-mono">
                {settings.taxRates.religious}% (Zero Rated)
              </p>
              <p className="text-[11px] text-black mt-0.5 font-medium">
                Temples, kovils, churches & registered sacred places of worship
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Discounts & Warrant Rules */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-[#A31736]" />
              <span>Prompt Payment Discounts & Warrant Policies</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Annual Advance Discount (%)</label>
              <input
                type="number"
                value={yearlyDiscount}
                onChange={(e) => setYearlyDiscount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-emerald-700 outline-none"
              />
              <span className="text-[10px] text-gray-400">Settled before end of January</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Quarterly Discount (%)</label>
              <input
                type="number"
                value={quarterlyDiscount}
                onChange={(e) => setQuarterlyDiscount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-emerald-700 outline-none"
              />
              <span className="text-[10px] text-gray-400">Paid in 1st month of quarter</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Grace Period (Quarters)</label>
              <input
                type="number"
                value={graceQuarters}
                onChange={(e) => setGraceQuarters(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 outline-none"
              />
              <span className="text-[10px] text-gray-400">Before warrant review (Default: 2)</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Warrant Penalty Surcharge (%)</label>
              <input
                type="number"
                value={warrantPenalty}
                onChange={(e) => setWarrantPenalty(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-purple-700 outline-none"
              />
              <span className="text-[10px] text-gray-400">Applied ONLY when warrant signed</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Due-Soon Window (Days)</label>
              <input
                type="number"
                value={dueSoonDays}
                onChange={(e) => setDueSoonDays(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-amber-700 outline-none"
              />
              <span className="text-[10px] text-gray-400">Days before quarter end (Default: 14)</span>
            </div>
          </div>
        </div>

        {/* Section 3: ATD & Workflow Configuration */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-[#A31736]" />
              <span>ATD & Cadastral Subdivision Operations</span>
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">ATD Reference Number Generation</label>
              <select
                value={atdMode}
                onChange={(e) => setAtdMode(e.target.value as 'MANUAL' | 'AUTO')}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none"
              >
                <option value="MANUAL">Manual Pradeshiya Sabha Registry Number Entry</option>
                <option value="AUTO">Automated System Sequence (ATD-YYYY-XXXX)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Subdivision Default Arrears Rule</label>
              <select
                value={subdivisionRule}
                onChange={(e) => setSubdivisionRule(e.target.value as 'EQUAL_SPLIT' | 'VALUE_PROPORTIONAL' | 'ASSIGN_TO_PRIMARY')}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none"
              >
                <option value="EQUAL_SPLIT">Equal Split across child units</option>
                <option value="VALUE_PROPORTIONAL">Proportional to Assessed Child Plot Value</option>
                <option value="ASSIGN_TO_PRIMARY">Assign 100% Arrears to Primary Unit</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Boundary & GIS Parameters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-[#A31736]" />
              <span>GIS Map Centre & Historical Archive</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Map Centre Coordinates</label>
              <input
                type="text"
                value="6.8415, 80.0035 (Homagama)"
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs font-mono text-gray-600 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Retention Archive (Years)</label>
              <input
                type="number"
                value={retentionYears}
                onChange={(e) => setRetentionYears(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 outline-none"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default VaripanamSettingsPage
