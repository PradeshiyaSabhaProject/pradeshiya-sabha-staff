import React, { useState } from 'react'
import {
  ShieldAlert,
  Gavel,
  CheckCircle,
} from 'lucide-react'
import { useVaripanam } from '../context/VaripanamContext'
import NeedsConfirmationBadge from '../components/shared/NeedsConfirmationBadge'
import { formatLKR } from '../utils/formatters'

const CHAIN_STEPS = [
  { step: 'Counter', title: '1. Counter Initiates' },
  { step: 'CC', title: '2. CC Verification' },
  { step: 'Secretary', title: '3. Secretary Authorisation & Signature' },
  { step: 'RelevantCounter', title: '4. Relevant Counter Issuance' },
  { step: 'DO', title: '5. Distraining Officer (DO) Seizure' },
]

export const ArrearsWarrantsPage: React.FC = () => {
  const { properties, settings } = useVaripanam()

  const [activeTab, setActiveTab] = useState<'eligible' | 'active'>('eligible')
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')
  const [showIssueModal, setShowIssueModal] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [warrantCost, setWarrantCost] = useState<string>('1500')

  // Properties eligible for warrant review (>= 2 unpaid overdue quarters without active warrant)
  const eligibleProperties = properties.filter((p) => {
    if (p.activeWarrant) return false
    const unpaidCount = p.dues.filter((d) => d.status === 'Overdue' || (d.year < 2026 && d.status !== 'Paid')).length
    return unpaidCount >= (settings.gracePeriodQuarters || 2)
  })

  // Properties with active warrants
  const warrantProperties = properties.filter((p) => p.activeWarrant)

  const selectedProp = properties.find((p) => p.id === selectedPropertyId)

  const handleIssueWarrant = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProp) return

    setSuccessMessage(
      `Statutory Warrant successfully authorised and signed by Secretary for property ${selectedProp.assessmentNumber}. 15% warrant penalty charge of ${formatLKR(Number(warrantCost))} legally levied.`
    )
    setShowIssueModal(false)
  }

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              Arrears & Legal Distress Warrants
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
              {warrantProperties.length} Active Warrants
            </span>
            <NeedsConfirmationBadge tooltip="Warrant charges are NEVER added automatically. Statutory decision requires administrative human authorisation." />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Legal recovery enforcement lifecycle: Counter ➔ CC ➔ Secretary Signature ➔ Counter ➔ DO (Distraining Officer).
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
          <button
            type="button"
            onClick={() => setActiveTab('eligible')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'eligible' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'
            }`}
          >
            Review Eligible ({eligibleProperties.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'active' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'
            }`}
          >
            Issued Warrants ({warrantProperties.length})
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ── TAB 1: Properties Eligible for Warrant Review ── */}
      {activeTab === 'eligible' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Properties Past Grace Period (2+ Unpaid Quarters)</span>
            </h2>
            <span className="text-xs text-gray-500">Requires Administrative Sign-off</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-3.5">Assessment No</th>
                  <th className="p-3.5">Owner Particulars</th>
                  <th className="p-3.5">Property Type</th>
                  <th className="p-3.5">Overdue Quarters</th>
                  <th className="p-3.5">Principal Arrears</th>
                  <th className="p-3.5">15% Penalty If Issued</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {eligibleProperties.map((prop) => {
                  const unpaidQuarters = prop.dues.filter((d) => d.status !== 'Paid').length
                  const arrearsTotal = prop.dues
                    .filter((d) => d.status !== 'Paid')
                    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0)
                  const estimatedPenalty = Math.round(arrearsTotal * 0.15)

                  return (
                    <tr key={prop.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5 font-black text-gray-900">{prop.assessmentNumber}</td>
                      <td className="p-3.5">
                        <p className="font-semibold text-gray-800">{prop.currentOwner.name}</p>
                        <p className="text-[11px] text-gray-400">{prop.currentOwner.mobile}</p>
                      </td>
                      <td className="p-3.5">{prop.propertyType}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          {unpaidQuarters} Quarters
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-rose-700">{formatLKR(arrearsTotal)}</td>
                      <td className="p-3.5 font-mono font-semibold text-red-700">{formatLKR(estimatedPenalty)}</td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPropertyId(prop.id)
                            setWarrantCost(String(estimatedPenalty))
                            setShowIssueModal(true)
                          }}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-98 rounded-lg shadow-2xs transition-all cursor-pointer"
                        >
                          Issue Warrant
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: Active Distress Warrants Desk ── */}
      {activeTab === 'active' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Gavel className="w-4 h-4 text-red-600" />
            <span>Active Distress Warrants in Enforcement</span>
          </h2>

          <div className="space-y-4">
            {warrantProperties.map((prop) => {
              const war = prop.activeWarrant!
              return (
                <div key={war.id} className="p-4 bg-gray-50 border border-red-200 rounded-2xl text-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-gray-900 text-sm">
                          Warrant Ref: {war.id} • Unit: {prop.assessmentNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                          {war.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-[11px] mt-0.5">
                        Authorised & Signed by {war.signedBy} on {war.issuedDate}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-gray-400">Statutory Warrant Cost (15%)</p>
                      <p className="font-mono font-black text-red-700 text-sm">{formatLKR(war.warrantCost)}</p>
                    </div>
                  </div>

                  {/* 5-Step Warrant Chain Stepper */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    {CHAIN_STEPS.map((step) => {
                      const matched = war.chainSteps.find((s) => s.step === step.step)
                      const isDone = matched?.status === 'Completed'
                      return (
                        <div
                          key={step.step}
                          className={`p-2.5 rounded-xl border text-[11px] ${
                            isDone ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold' : 'bg-white border-gray-200 text-gray-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{step.title}</span>
                            {isDone && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                          </div>
                          {matched?.officer && <p className="text-[10px] opacity-75 mt-0.5">{matched.officer}</p>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Modal: Issue Warrant ── */}
      {showIssueModal && selectedProp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Gavel className="w-5 h-5 text-red-600" />
              <span>Authorise Distress Warrant</span>
            </h3>

            <p className="text-xs text-gray-600">
              Issuing statutory warrant for assessment unit <strong>{selectedProp.assessmentNumber}</strong> ({selectedProp.currentOwner.name}).
            </p>

            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs space-y-1 text-red-900">
              <p className="font-bold">Distress Warrant Chain of Custody:</p>
              <p>Counter ➔ CC ➔ Secretary Signature ➔ Relevant Counter ➔ Distraining Officer (DO)</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Warrant Penalty Charge (15%)</label>
              <input
                type="number"
                value={warrantCost}
                onChange={(e) => setWarrantCost(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-red-700 outline-none"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowIssueModal(false)}
                className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleIssueWarrant}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-98 rounded-lg cursor-pointer shadow-xs"
              >
                Sign & Issue Warrant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ArrearsWarrantsPage
