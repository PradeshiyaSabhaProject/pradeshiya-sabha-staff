import React, { useState } from 'react'
import { GitFork, FileText, CheckCircle, ArrowRight } from 'lucide-react'
import { useVaripanam } from '../context/VaripanamContext'
import NeedsConfirmationBadge from '../components/shared/NeedsConfirmationBadge'
import { formatLKR } from '../utils/formatters'

export const SubdivisionPage: React.FC = () => {
  const { properties, subdivisions, createSubdivision } = useVaripanam()

  const [selectedParentId, setSelectedParentId] = useState<string>(properties[0]?.id || '')
  const [childAssessmentNumber, setChildAssessmentNumber] = useState<string>('')
  const [surveyPlanNumber, setSurveyPlanNumber] = useState<string>('')
  const [deedNumber, setDeedNumber] = useState<string>('')
  const [arrearsSplitPercentage, setArrearsSplitPercentage] = useState<number>(50)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const parentProperty = properties.find((p) => p.id === selectedParentId)

  // Arrears on parent property
  const parentArrears = parentProperty
    ? parentProperty.dues
        .filter((d) => d.status !== 'Paid')
        .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0)
    : 0

  const allocatedArrears = Math.round((parentArrears * arrearsSplitPercentage) / 100)

  const handleCreateSubdivision = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!parentProperty || !childAssessmentNumber.trim()) return

    setIsSubmitting(true)
    try {
      await createSubdivision({
        parentPropertyId: parentProperty.id,
        childPropertyId: `child-${Date.now()}`,
        childAssessmentNumber: childAssessmentNumber.trim(),
        surveyPlanNumber: surveyPlanNumber.trim() || 'SP/2026/001',
        deedNumber: deedNumber.trim() || 'DEED-9921',
        splitRule: `Proportional (${arrearsSplitPercentage}%) pass-down`,
        arrearsSplitPercentage,
        allocatedArrears,
      })

      setSuccessMessage(`Subdivision created successfully for child unit "${childAssessmentNumber}". Arrears of ${formatLKR(allocatedArrears)} transferred.`)
      setChildAssessmentNumber('')
      setSurveyPlanNumber('')
      setDeedNumber('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Land & Plot Subdivision</h1>
            <NeedsConfirmationBadge tooltip="The rule for distributing or retaining arrears during subdivision must be confirmed before this is automated. Arrears passing to the new owner is the default setting." />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Cadastral parent-to-child splitting: survey plan linking, unit identifier assignment, and financial obligation succession.
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
        {/* Left: Subdivision Form (Col 6) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <GitFork className="w-4 h-4 text-[#A31736]" />
            <span>Register Child Subdivision Unit</span>
          </h2>

          <form onSubmit={handleCreateSubdivision} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Select Parent Property *</label>
              <select
                value={selectedParentId}
                onChange={(e) => setSelectedParentId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-[#A31736]"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.assessmentNumber} — {p.currentOwner.name} ({p.propertyNumber})
                  </option>
                ))}
              </select>
            </div>

            {parentProperty && (
              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs space-y-1 text-amber-900">
                <p className="font-bold">Parent Property Financial Summary:</p>
                <p>Annual Value: {formatLKR(parentProperty.annualAssessedValue)} | Total Outstanding Arrears: {formatLKR(parentArrears)}</p>
                <p className="text-[11px] text-amber-700">
                  Default Rule: Arrears follow the newly created plots proportional to the agreed split percentage.
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Child Unit Assessment Number *</label>
              <input
                type="text"
                value={childAssessmentNumber}
                onChange={(e) => setChildAssessmentNumber(e.target.value)}
                placeholder="e.g. 78/12a-1 or 78/12b"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-[#A31736]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Approved Survey Plan No *</label>
                <input
                  type="text"
                  value={surveyPlanNumber}
                  onChange={(e) => setSurveyPlanNumber(e.target.value)}
                  placeholder="e.g. SP/2026/89"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Deed Reference *</label>
                <input
                  type="text"
                  value={deedNumber}
                  onChange={(e) => setDeedNumber(e.target.value)}
                  placeholder="e.g. DEED-4412"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736]"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-gray-700">Arrears Allocation Percentage</label>
                <span className="text-xs font-black text-[#A31736]">{arrearsSplitPercentage}% ({formatLKR(allocatedArrears)})</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={arrearsSplitPercentage}
                onChange={(e) => setArrearsSplitPercentage(Number(e.target.value))}
                className="w-full accent-[#A31736] cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Submit Subdivision
            </button>
          </form>
        </div>

        {/* Right: Subdivision History & Relationships (Col 6) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#A31736]" />
            <span>Subdivision Relationship Registry</span>
          </h2>

          <div className="space-y-3">
            {subdivisions.map((s) => {
              const parent = properties.find((p) => p.id === s.parentPropertyId)
              return (
                <div key={s.id} className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 flex items-center gap-1.5">
                      <span>Parent: {parent?.assessmentNumber || s.parentPropertyId}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-[#A31736]">Child: {s.childAssessmentNumber}</span>
                    </span>
                    <span className="text-[10px] text-gray-400">{s.createdDate}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-gray-600 text-[11px]">
                    <p>Survey Plan: {s.surveyPlanNumber}</p>
                    <p>Deed: {s.deedNumber}</p>
                    <p>Rule: {s.splitRule}</p>
                    <p className="font-semibold text-rose-700">Allocated Debt: {formatLKR(s.allocatedArrears)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubdivisionPage
