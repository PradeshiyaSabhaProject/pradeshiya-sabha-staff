import React, { useState, useEffect } from 'react'
import { type AssetRecord, type AssetAttachment } from '../hooks/useAssetData'

interface AddAssetWizardModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (assetData: Omit<AssetRecord, 'id' | 'dateAdded'>) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400 shrink-0 pointer-events-none">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[#A31736] shrink-0">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const CloudUploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-[#A31736]">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
  </svg>
)

const FileDocIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-500">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
)

const FileImageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-500">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400 hover:text-red-600 transition-colors">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 mr-1 inline-block">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

export const AddAssetWizardModal: React.FC<AddAssetWizardModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState<number>(1)

  // Stage 1 State
  const [name, setName] = useState('')
  const [category, setCategory] = useState<AssetRecord['category']>('Land')
  const [location, setLocation] = useState('')
  const [assetIdPreview, setAssetIdPreview] = useState('PS-AST-2026-8821')

  // Stage 2 State
  const [valuation, setValuation] = useState<string>('45250000.00')
  const [acquisitionDate, setAcquisitionDate] = useState<string>('2026-10-14')
  const [fundingSource, setFundingSource] = useState<string>('Municipal Grant #882')
  const [depreciation] = useState<string>('Straight Line (5%)')

  // Stage 3 State
  const [areaSize, setAreaSize] = useState<string>('12400')
  const [unit, setUnit] = useState<string>('sq.ft')
  const [conditionStatus, setConditionStatus] = useState<AssetRecord['status']>('Operational')
  const [latitude, setLatitude] = useState<string>('6.841240')
  const [longitude, setLongitude] = useState<string>('79.998520')
  const [mapPicked, setMapPicked] = useState<boolean>(true)

  // Stage 4 State
  const [attachments, setAttachments] = useState<AssetAttachment[]>([
    { name: 'Site_Deed_Registry_2026.pdf', size: '4.2 MB • Uploaded 2 mins ago', type: 'pdf', status: 'Verified' },
    { name: 'Site_Boundary_North_View.jpg', size: '1.8 MB • Uploaded 1 min ago', type: 'image', status: 'Image' },
    { name: 'Structural_Survey_Final.docx', size: '2.4 MB • Uploaded just now', type: 'doc', status: 'Document' },
  ])

  const getCategoryDefaults = (cat: string) => {
    const randomBytes = new Uint32Array(1)
    crypto.getRandomValues(randomBytes)
    const rand = 1000 + (randomBytes[0] % 9000)

    switch (cat) {
      case 'Land':
        return { unit: 'Plots', id: `PS-LN-2026-${rand}` }
      case 'Road':
        return { unit: 'KM', id: `PS-RD-2026-${rand}` }
      case 'Building':
        return { unit: 'sq.ft', id: `PS-BL-2026-${rand}` }
      case 'Vehicle':
      case 'Machinery & Equipment':
      case 'Utility / Infrastructure':
        return { unit: 'Items', id: `PS-AST-2026-${rand}` }
      default:
        return { unit: 'Items', id: `PS-AST-2026-${rand}` }
    }
  }

  // Reset wizard on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setStep(1)
      }, 0)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handlePickFromMap = () => {
    // Simulate interactive GIS mapping coordinate selection in Homagama
    const randomBytes = new Uint32Array(2)
    crypto.getRandomValues(randomBytes)
    const lat = (6.840000 + (randomBytes[0] % 10) / 1000).toFixed(6)
    const lng = (79.990000 + (randomBytes[1] % 10) / 1000).toFixed(6)
    setLatitude(lat)
    setLongitude(lng)
    setMapPicked(true)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: AssetAttachment[] = Array.from(e.target.files).map((file) => ({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB • Uploaded just now`,
        type: file.name.endsWith('.jpg') || file.name.endsWith('.png') ? 'image' : 'pdf',
        status: 'Verified',
      }))
      setAttachments((prev) => [...prev, ...newFiles])
    }
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const getStatusBadgeClass = (status?: string) => {
    if (status === 'Verified') return 'bg-emerald-100 text-emerald-800'
    if (status === 'Image') return 'bg-blue-100 text-blue-800'
    return 'bg-purple-100 text-purple-800'
  }

  const handleNext = () => {
    if (step === 1 && (!name.trim() || !location.trim())) {
      alert('Please fill in Asset Name and Ward / Location to proceed.')
      return
    }
    if (step < 5) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleFinalSubmit = () => {
    onSubmit({
      name: name.trim() || 'Untitled Asset',
      category,
      location: location.trim() || 'General Ward',
      status: conditionStatus,
      value: Number.parseFloat(areaSize) || 1,
      unit,
      valuation: Number.parseFloat(valuation) || 0,
      acquisitionDate,
      fundingSource,
      areaSize: `${areaSize} ${unit}`,
      conditionStatus,
      coordinates: { lat: latitude, lng: longitude },
      attachments,
      depreciation,
    })
    onClose()
  }

  const stepTitles = [
    'General Info',
    'Financial Details',
    'Technical Specs',
    'Attachments',
    'Review',
  ]

  const getSubtitle = () => {
    switch (step) {
      case 1:
        return 'Submit initial data for civic asset identification'
      case 2:
        return 'Provide acquisition and valuation data for precise asset tracking'
      case 3:
        return 'Specify physical measurements, condition, and precise GIS mapping coordinates'
      case 4:
        return 'Upload deed documents, site photos, structural plans, or survey reports'
      case 5:
        return 'Please review the information below before final submission to the registry'
      default:
        return 'New Infrastructure Entry'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close wizard modal"
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-10 animate-fade-in flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A31736]" />
              <h3 className="text-lg font-bold text-gray-900">Asset Registration</h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{getSubtitle()}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 transition-all cursor-pointer"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Progress Stepper Bar */}
        <div className="px-8 py-5 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center justify-between relative max-w-xl mx-auto">
            {stepTitles.map((title, idx) => {
              const stepNum = idx + 1
              const isActive = step === stepNum
              const isCompleted = step > stepNum
              const stepCircleClass = isActive
                ? 'bg-[#A31736] text-white ring-4 ring-[#A31736]/15 scale-105'
                : isCompleted
                ? 'bg-[#A31736] text-white'
                : 'bg-white border-2 border-gray-200 text-gray-400'

              return (
                <React.Fragment key={title}>
                  {/* Connector Line */}
                  {idx > 0 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                        step >= stepNum ? 'bg-[#A31736]' : 'bg-gray-200'
                      }`}
                    />
                  )}

                  {/* Step Item */}
                  <button
                    type="button"
                    onClick={() => {
                      // Allow jumping to completed steps or current step
                      if (stepNum < step) setStep(stepNum)
                    }}
                    className={`flex flex-col items-center group ${
                      stepNum < step ? 'cursor-pointer' : ''
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-xs ${stepCircleClass}`}
                    >
                      {isCompleted ? <CheckIcon /> : stepNum}
                    </div>
                    <span
                      className={`text-[11px] font-semibold mt-1.5 whitespace-nowrap transition-colors ${
                        isActive
                          ? 'text-[#A31736]'
                          : isCompleted
                          ? 'text-gray-700'
                          : 'text-gray-400'
                      }`}
                    >
                      {title}
                    </span>
                  </button>
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Form Body - Scrollable */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 bg-white">
          
          {/* ── STAGE 1: GENERAL INFO ─────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Asset Name */}
                <div>
                  <label htmlFor="wizardAssetName" className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Asset Name *
                  </label>
                  <input
                    id="wizardAssetName"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Central Park Road"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736] transition-all font-medium"
                  />
                </div>

                {/* Asset ID */}
                <div>
                  <label htmlFor="wizardAssetId" className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Asset ID (Auto-generated)
                  </label>
                  <input
                    id="wizardAssetId"
                    type="text"
                    disabled
                    value={assetIdPreview}
                    className="w-full bg-gray-100/80 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 font-mono cursor-not-allowed select-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Category */}
                <div>
                  <label htmlFor="wizardCategory" className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <div className="relative">
                    <select
                      id="wizardCategory"
                      value={category}
                      onChange={(e) => {
                        const cat = e.target.value as AssetRecord['category']
                        setCategory(cat)
                        const defaults = getCategoryDefaults(cat)
                        setUnit(defaults.unit)
                        setAssetIdPreview(defaults.id)
                      }}
                      className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 font-medium focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736] pr-10 cursor-pointer"
                    >
                      <option value="Land">Land</option>
                      <option value="Road">Road</option>
                      <option value="Building">Building</option>
                      <option value="Vehicle">Vehicle</option>
                      <option value="Machinery & Equipment">Machinery & Equipment</option>
                      <option value="Utility / Infrastructure">Utility / Infrastructure</option>
                    </select>
                    <div className="absolute right-3.5 top-3.5 pointer-events-none">
                      <ChevronDownIcon />
                    </div>
                  </div>
                </div>

                {/* Ward / Location */}
                <div>
                  <label htmlFor="wizardLocation" className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Ward / Location *
                  </label>
                  <div className="relative">
                    <input
                      id="wizardLocation"
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Search ward or coordinates"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 font-medium focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736] transition-all"
                    />
                    <div className="absolute left-3.5 top-3 text-gray-400">
                      <MapPinIcon />
                    </div>
                  </div>
                </div>
              </div>

              {/* Information Visibility Notice */}
              <div className="bg-red-50/60 border border-red-100 rounded-xl p-4 flex items-start gap-3 mt-4">
                <div className="p-1 bg-red-100 rounded-lg shrink-0 mt-0.5">
                  <InfoIcon />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Information Visibility
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Once submitted, the General Info of this asset will be visible to the Ward Supervisor for preliminary verification. Ensure the Asset Name matches official gazette records.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── STAGE 2: FINANCIAL DETAILS ────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h4 className="text-base font-bold text-gray-900">Financial Information</h4>
                <p className="text-xs text-gray-500">Provide acquisition and valuation data for precise asset tracking.</p>
              </div>

              {/* Valuation Input */}
              <div>
                <label htmlFor="initialValuation" className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  Initial Valuation (LKR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-sm font-bold text-gray-500">
                    Rs.
                  </span>
                  <input
                    id="initialValuation"
                    type="number"
                    step="0.01"
                    value={valuation}
                    onChange={(e) => setValuation(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-12 pr-4 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736] transition-all"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  Enter the total cost including taxes and installation fees.
                </p>
              </div>

              {/* Acquisition Date & Funding Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="acquisitionDate" className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Acquisition Date
                  </label>
                  <input
                    id="acquisitionDate"
                    type="date"
                    value={acquisitionDate}
                    onChange={(e) => setAcquisitionDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736] transition-all cursor-pointer"
                  />
                </div>

                <div>
                  <label htmlFor="fundingSource" className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Funding Source
                  </label>
                  <div className="relative">
                    <select
                      id="fundingSource"
                      value={fundingSource}
                      onChange={(e) => setFundingSource(e.target.value)}
                      className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736] pr-10 cursor-pointer"
                    >
                      <option value="Municipal Grant #882">Municipal Grant #882</option>
                      <option value="Provincial Council Allocation">Provincial Council Allocation</option>
                      <option value="World Bank Infrastructure Loan">World Bank Infrastructure Loan</option>
                      <option value="Direct Treasury Funding">Direct Treasury Funding</option>
                      <option value="Public / Citizen Donation">Public / Citizen Donation</option>
                    </select>
                    <div className="absolute right-3.5 top-3.5 pointer-events-none">
                      <ChevronDownIcon />
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Note */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start gap-3 mt-4">
                <div className="p-1 bg-gray-200/80 rounded-lg shrink-0 mt-0.5">
                  <InfoIcon />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Compliance Note
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Ensure that the valuation matches the invoice or the approved appraisal report for auditing purposes by the Pradeshiya Sabha.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── STAGE 3: TECHNICAL SPECS ──────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Area / Size */}
                <div>
                  <label htmlFor="wizardAreaSize" className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Area / Size *
                  </label>
                  <div className="flex">
                    <input
                      id="wizardAreaSize"
                      type="number"
                      step="any"
                      required
                      value={areaSize}
                      onChange={(e) => setAreaSize(e.target.value)}
                      placeholder="e.g. 1200.50"
                      className="w-full bg-gray-50 border border-r-0 border-gray-300 rounded-l-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
                    />
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="bg-gray-100 border border-gray-300 rounded-r-xl px-3 py-2.5 text-xs font-bold text-gray-600 focus:outline-none focus:border-[#A31736] cursor-pointer shrink-0"
                    >
                      <option value="sq.ft">sq.ft</option>
                      <option value="sq.m">sq.m</option>
                      <option value="KM">KM</option>
                      <option value="Plots">Plots</option>
                      <option value="Units">Units</option>
                      <option value="Items">Items</option>
                    </select>
                  </div>
                </div>

                {/* Condition Status */}
                <div>
                  <label htmlFor="wizardConditionStatus" className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Condition Status *
                  </label>
                  <div className="relative">
                    <select
                      id="wizardConditionStatus"
                      value={conditionStatus}
                      onChange={(e) => setConditionStatus(e.target.value as AssetRecord['status'])}
                      className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736] pr-10 cursor-pointer"
                    >
                      <option value="Operational">Operational (Good Condition)</option>
                      <option value="Under Maintenance">Under Maintenance / Repair</option>
                      <option value="Verified">Verified by Engineer</option>
                      <option value="Digitized">Digitized Record Only</option>
                      <option value="Audit Pending">Audit Pending</option>
                      <option value="Disputed">Disputed / Legal Hold</option>
                    </select>
                    <div className="absolute right-3.5 top-3.5 pointer-events-none">
                      <ChevronDownIcon />
                    </div>
                  </div>
                </div>
              </div>

              {/* GIS Coordinates Box */}
              <div className="border border-gray-200 rounded-2xl p-5 space-y-4 bg-gray-50/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPinIcon />
                    <span className="text-sm font-bold text-gray-800">GIS Coordinates</span>
                  </div>
                  <button
                    type="button"
                    onClick={handlePickFromMap}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <MapPinIcon />
                    Pick from Map
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="latitude" className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      LATITUDE
                    </label>
                    <input
                      id="latitude"
                      type="text"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="00.000000"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-800 focus:outline-none focus:border-[#A31736]"
                    />
                  </div>
                  <div>
                    <label htmlFor="longitude" className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      LONGITUDE
                    </label>
                    <input
                      id="longitude"
                      type="text"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="00.000000"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-800 focus:outline-none focus:border-[#A31736]"
                    />
                  </div>
                </div>

                {/* Map Visual Preview Mockup */}
                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-[#A8C7B5] flex items-center justify-center">
                  {/* Styled SVG grid lines to mimic GIS map */}
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                  <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#fff" strokeWidth="3" />
                    <line x1="40%" y1="0" x2="60%" y2="100%" stroke="#fff" strokeWidth="4" />
                    <line x1="10%" y1="20%" x2="90%" y2="80%" stroke="#fff" strokeWidth="2" />
                    <circle cx="50%" cy="50%" r="60" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="4 4" />
                  </svg>
                  
                  {/* Pin Target in center */}
                  {mapPicked && (
                    <div className="relative z-10 flex flex-col items-center animate-bounce">
                      <div className="w-8 h-8 rounded-full border-2 border-[#A31736] bg-white/90 flex items-center justify-center shadow-lg">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#A31736]" />
                      </div>
                      <span className="text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded shadow mt-1">
                        Homagama Ward Central ({latitude}, {longitude})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── STAGE 4: DOCUMENT ATTACHMENTS ─────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              {/* Drag and Drop Box */}
              <div className="border-2 border-dashed border-gray-300 hover:border-[#A31736]/50 rounded-2xl p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition-all">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <CloudUploadIcon />
                </div>
                <h4 className="text-sm font-bold text-gray-800">Drag & Drop Files Here</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Upload deed documents, site photos, structural plans, or survey reports. (Max 10MB per file)
                </p>
                
                <label htmlFor="wizardFileUpload" className="mt-4 inline-block px-5 py-2 border-2 border-[#A31736] text-[#A31736] hover:bg-[#A31736] hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs">
                  Browse Files
                </label>
                <input
                  id="wizardFileUpload"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Uploaded Files List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    UPLOADED FILES ({attachments.length})
                  </span>
                  {attachments.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAttachments([])}
                      className="text-xs font-bold text-[#A31736] hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {attachments.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-400 italic bg-gray-50 rounded-xl border border-gray-100">
                    No documents attached yet. Click Browse Files above to attach supporting documents.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {attachments.map((file, idx) => (
                      <div
                        key={file.name}
                        className="flex items-center justify-between p-3.5 bg-gray-50/80 hover:bg-gray-100/80 border border-gray-200/80 rounded-xl transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-white rounded-lg border border-gray-200 shrink-0">
                            {file.type === 'image' ? <FileImageIcon /> : <FileDocIcon />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{file.name}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{file.size}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          {file.status && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadgeClass(file.status)}`}>
                              {file.status}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(idx)}
                            className="p-1 hover:bg-white rounded-lg transition-colors cursor-pointer"
                            title="Remove attachment"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STAGE 5: REVIEW ASSET DETAILS ─────────────────────────────── */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              {/* Card 1: General Info */}
              <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-xs hover:border-gray-300 transition-all">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">General Info</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-[#A31736] hover:underline flex items-center cursor-pointer"
                  >
                    <EditIcon /> Edit
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block font-medium">ASSET NAME</span>
                    <span className="font-bold text-gray-900 text-sm mt-0.5 block">{name || 'N/A'}</span>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <span className="text-gray-400 block font-medium">ASSET ID</span>
                      <span className="font-mono font-semibold text-gray-800 mt-0.5 block">{assetIdPreview}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-medium">CATEGORY</span>
                      <span className="font-semibold text-gray-800 mt-0.5 block">{category}</span>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 block font-medium">LOCATION</span>
                    <span className="font-semibold text-gray-800 mt-0.5 block">{location || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Financial */}
              <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-xs hover:border-gray-300 transition-all">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Financial</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-bold text-[#A31736] hover:underline flex items-center cursor-pointer"
                  >
                    <EditIcon /> Edit
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block font-medium">VALUATION AMOUNT</span>
                    <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                      LKR {Number.parseFloat(valuation || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <span className="text-gray-400 block font-medium">ACQUISITION DATE</span>
                      <span className="font-semibold text-gray-800 mt-0.5 block">{acquisitionDate}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-medium">DEPRECIATION</span>
                      <span className="font-semibold text-gray-800 mt-0.5 block">{depreciation}</span>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 block font-medium">FUNDING SOURCE</span>
                    <span className="font-semibold text-gray-800 mt-0.5 block">{fundingSource}</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Technical */}
              <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-xs hover:border-gray-300 transition-all">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Technical</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs font-bold text-[#A31736] hover:underline flex items-center cursor-pointer"
                  >
                    <EditIcon /> Edit
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block font-medium">TOTAL AREA / SIZE</span>
                    <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                      {areaSize} {unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium">STRUCTURE / TYPE</span>
                    <span className="font-semibold text-gray-800 mt-0.5 block">Reinforced Concrete</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium">LAST INSPECTION</span>
                    <span className="font-semibold text-gray-800 mt-0.5 block">Feb 01, 2024 (Certified)</span>
                  </div>
                  <div className="sm:col-span-3 flex items-center gap-2 pt-1">
                    <span className="text-gray-400 font-medium">MAINTENANCE PRIORITY:</span>
                    <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      MEDIUM
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 4: Attachments */}
              <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-xs hover:border-gray-300 transition-all">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Attachments ({attachments.length})
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="text-xs font-bold text-[#A31736] hover:underline flex items-center cursor-pointer"
                  >
                    <EditIcon /> Edit
                  </button>
                </div>
                <div className="space-y-2">
                  {attachments.map((file) => (
                    <div key={file.name} className="flex items-center gap-2.5 text-xs bg-gray-50 px-3 py-2 rounded-lg border border-gray-150">
                      <FileDocIcon />
                      <span className="font-semibold text-gray-800 truncate flex-1">{file.name}</span>
                      <span className="text-[11px] text-gray-500">{file.size.split('•')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-gray-200/80 bg-gray-50/70 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                ← Back
              </button>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-[#A31736] hover:bg-[#801028] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-6 py-2 bg-[#A31736] hover:bg-[#801028] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
              >
                Save Asset ➢
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
export default AddAssetWizardModal

