import React, { useState } from 'react'
import type {
  Zone,
  Ward,
  Road,
  PropertyType,
  Property,
} from '../../types/varipanam'
import { validateNewProperty } from '../../rules/varipanamRules'

interface AddPropertyDrawerProps {
  isOpen: boolean
  onClose: () => void
  zones: Zone[]
  wards: Ward[]
  roads: Road[]
  existingProperties: Property[]
  initialCoords: { latitude: number; longitude: number } | null
  onSave: (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'dues' | 'status'>) => Promise<void>
  onCreateRoad: (roadData: Omit<Road, 'id'>) => Promise<Road>
}

export const AddPropertyDrawer: React.FC<AddPropertyDrawerProps> = ({
  isOpen,
  onClose,
  zones,
  wards,
  roads,
  existingProperties,
  initialCoords,
  onSave,
  onCreateRoad,
}) => {
  // Form state
  const [zoneId, setZoneId] = useState<string>(() => zones[0]?.id || '')
  const [wardId, setWardId] = useState<string>(() => wards.find((w) => w.zoneId === zones[0]?.id)?.id || '')
  const [roadId, setRoadId] = useState<string>(() => roads.find((r) => r.zoneId === zones[0]?.id)?.id || '')
  const [assessmentNumber, setAssessmentNumber] = useState<string>('')
  const [propertyNumber, setPropertyNumber] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [propertyType, setPropertyType] = useState<PropertyType>('Residential')
  const [annualAssessedValue, setAnnualAssessedValue] = useState<string>('200000')

  // Owner fields
  const [ownerName, setOwnerName] = useState<string>('')
  const [ownerNic, setOwnerNic] = useState<string>('')
  const [ownerMobile, setOwnerMobile] = useState<string>('')
  const [postalAddress, setPostalAddress] = useState<string>('')

  // Coordinates
  const [latitude, setLatitude] = useState<number>(() => initialCoords?.latitude ?? 6.8415)
  const [longitude, setLongitude] = useState<number>(() => initialCoords?.longitude ?? 80.0035)
  const [prevCoords, setPrevCoords] = useState(initialCoords)

  if (initialCoords && initialCoords !== prevCoords) {
    setPrevCoords(initialCoords)
    setLatitude(initialCoords.latitude)
    setLongitude(initialCoords.longitude)
  }

  // Modals & Warnings
  const [showNewRoadModal, setShowNewRoadModal] = useState<boolean>(false)
  const [newRoadName, setNewRoadName] = useState<string>('')
  const [newRoadCode, setNewRoadCode] = useState<string>('')
  const [addressSearchQuery, setAddressSearchQuery] = useState<string>('')

  const [validationError, setValidationError] = useState<string | null>(null)
  const [proximityWarning, setProximityWarning] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Boundary check (derived)
  const boundaryWarning =
    latitude < 6.82 || latitude > 6.865 || longitude < 79.98 || longitude > 80.035
      ? 'Notice: This coordinate lies near or outside the standard Homagama Sabha boundary polygon.'
      : null

  // Filter wards and roads cascading by selected zone
  const visibleWards = wards.filter((w) => w.zoneId === zoneId)
  const visibleRoads = roads.filter((r) => r.zoneId === zoneId && (!wardId || r.wardId === wardId))

  const handleZoneChange = (newZone: string) => {
    setZoneId(newZone)
    const firstWard = wards.find((w) => w.zoneId === newZone)?.id || ''
    setWardId(firstWard)
    const firstRoad = roads.find((r) => r.zoneId === newZone && (!firstWard || r.wardId === firstWard))?.id || ''
    setRoadId(firstRoad)
  }

  const handleWardChange = (newWard: string) => {
    setWardId(newWard)
    const firstRoad = roads.find((r) => r.zoneId === zoneId && (!newWard || r.wardId === newWard))?.id || ''
    setRoadId(firstRoad)
  }

  if (!isOpen) return null

  // Address search geocode simulator
  const handleAddressSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!addressSearchQuery.trim()) return

    const q = addressSearchQuery.toLowerCase()
    if (q.includes('station') || q.includes('railway')) {
      setLatitude(6.8405)
      setLongitude(80.0022)
    } else if (q.includes('court') || q.includes('temple')) {
      setLatitude(6.8455)
      setLongitude(80.0065)
    } else if (q.includes('wateraka') || q.includes('godagama')) {
      setLatitude(6.8488)
      setLongitude(80.0192)
    } else if (q.includes('makumbura') || q.includes('expressway')) {
      setLatitude(6.8415)
      setLongitude(80.0105)
    } else {
      // Default nearby offset
      setLatitude(6.8415 + (Math.random() - 0.5) * 0.005)
      setLongitude(80.0035 + (Math.random() - 0.5) * 0.005)
    }
  }

  // Handle Create New Road under selected zone
  const handleCreateRoad = async () => {
    const trimmedName = newRoadName.trim()
    if (!trimmedName) return
    const targetZone = zoneId || zones[0]?.id || ''
    const targetWard = wardId || visibleWards[0]?.id || wards.find((w) => w.zoneId === targetZone)?.id || ''
    const code = newRoadCode.trim().toUpperCase() || `RD-${trimmedName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase()}`

    try {
      const created = await onCreateRoad({
        zoneId: targetZone,
        wardId: targetWard,
        name: trimmedName,
        code,
      })
      setZoneId(targetZone)
      if (targetWard) setWardId(targetWard)
      setRoadId(created.id)
      setShowNewRoadModal(false)
      setNewRoadName('')
      setNewRoadCode('')
    } catch {
      // handle error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    // Run rules validation
    const validation = validateNewProperty(
      assessmentNumber,
      { latitude, longitude },
      existingProperties
    )

    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid assessment property input.')
      return
    }

    if (validation.warning) {
      setProximityWarning(validation.warning)
    }

    if (!ownerName.trim() || !ownerNic.trim() || !ownerMobile.trim()) {
      setValidationError('Please provide complete property owner details (Name, NIC, and Mobile).')
      return
    }

    setIsSubmitting(true)
    try {
      await onSave({
        assessmentNumber: assessmentNumber.trim(),
        propertyNumber: propertyNumber.trim() || `No. ${assessmentNumber}`,
        description: description.trim() || `${propertyType} property assessment unit`,
        propertyType,
        annualAssessedValue: parseFloat(annualAssessedValue) || 100000,
        latitude,
        longitude,
        zoneId,
        wardId,
        roadId,
        currentOwner: {
          id: `own-${Date.now()}`,
          name: ownerName.trim(),
          nic: ownerNic.trim(),
          mobile: ownerMobile.trim(),
          postalAddress: postalAddress.trim() || `${propertyNumber}, Homagama`,
        },
      })
      onClose()
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Failed to register property.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10">
        {/* Header */}
        <div className="px-6 py-4 bg-[#A31736] text-white flex items-center justify-between shadow-xs border-b border-rose-900">
          <div>
            <h2 className="text-base font-bold uppercase tracking-wide">Register Property by Location</h2>
            <p className="text-xs text-rose-100">Add assessment unit via map pin coordinates</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="18" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Validation Alert */}
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-start gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0 text-rose-600 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{validationError}</span>
            </div>
          )}

          {/* Proximity Warning */}
          {proximityWarning && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex items-start gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0 text-amber-600 mt-0.5">
                <polygon points="12 2 22 22 2 22" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>{proximityWarning}</span>
            </div>
          )}

          {/* Boundary Warning */}
          {boundaryWarning && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 flex items-start gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0 text-blue-600 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{boundaryWarning}</span>
            </div>
          )}

          {/* Quick Address Search Bar */}
          <div className="bg-gray-50/70 p-3 rounded border border-gray-300">
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              Search Address or Landmark
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={addressSearchQuery}
                onChange={(e) => setAddressSearchQuery(e.target.value)}
                placeholder="e.g. Station Road, Homagama Town..."
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#A31736]"
              />
              <button
                type="button"
                onClick={handleAddressSearch}
                className="px-3 py-1.5 bg-gray-900 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-gray-800 cursor-pointer shadow-2xs"
              >
                Locate
              </button>
            </div>
          </div>

          {/* GPS Coordinates (Read-only or manual tweak) */}
          <div className="grid grid-cols-2 gap-3 bg-amber-50/60 p-3 rounded border border-amber-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Pin Latitude</span>
              <p className="font-mono text-xs font-bold text-gray-900">{latitude.toFixed(6)}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Pin Longitude</span>
              <p className="font-mono text-xs font-bold text-gray-900">{longitude.toFixed(6)}</p>
            </div>
          </div>

          {/* Section 1: Geographic Cascading (Zone > Ward > Road) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1.5">
              1. Geographic & Location Assignment
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">Zone *</label>
                <select
                  value={zoneId}
                  onChange={(e) => handleZoneChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#A31736] cursor-pointer"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">Ward *</label>
                <select
                  value={wardId}
                  onChange={(e) => handleWardChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#A31736] cursor-pointer"
                >
                  {visibleWards.map((w) => (
                    <option key={w.id} value={w.id}>
                      Ward {w.number}: {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Road Selector with "+ New Road" Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Road Network *</label>
                <button
                  type="button"
                  onClick={() => setShowNewRoadModal(true)}
                  className="text-[11px] font-bold text-[#A31736] hover:underline cursor-pointer uppercase tracking-wider"
                >
                  + Create New Road
                </button>
              </div>
              <select
                value={roadId}
                onChange={(e) => setRoadId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#A31736] cursor-pointer"
              >
                {visibleRoads.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Assessment Unit Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1.5">
              2. Assessment Unit Identifiers
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Assessment Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 78/12a"
                  value={assessmentNumber}
                  onChange={(e) => setAssessmentNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#A31736]"
                />
                <span className="text-[10px] text-gray-400">Unique municipal assessment unit</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Property Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. No. 45/2"
                  value={propertyNumber}
                  onChange={(e) => setPropertyNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#A31736]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">Property Description</label>
              <textarea
                rows={2}
                placeholder="e.g. Two-storey residential dwelling with perimeter boundary wall"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#A31736]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">Property Type *</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#A31736] cursor-pointer"
                >
                  <option value="Residential">Residential (10%)</option>
                  <option value="Commercial">Commercial (15%)</option>
                  <option value="Government">Government (7%)</option>
                  <option value="Religious">Religious (0%)</option>
                  <option value="Bare land">Bare land (7%)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Annual Assessed Value (LKR) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={1000}
                  value={annualAssessedValue}
                  onChange={(e) => setAnnualAssessedValue(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#A31736]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Owner Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1.5">
              3. Current Ownership Details
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">Owner Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sunil Shantha Perera"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#A31736]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">Owner NIC *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 197512400321"
                  value={ownerNic}
                  onChange={(e) => setOwnerNic(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#A31736]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">Mobile Contact *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +94 77 123 4567"
                  value={ownerMobile}
                  onChange={(e) => setOwnerMobile(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#A31736]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">Postal Address</label>
              <input
                type="text"
                placeholder="e.g. No. 78/12A, High Level Road, Homagama"
                value={postalAddress}
                onChange={(e) => setPostalAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#A31736]"
              />
            </div>
          </div>

          {/* Modal for Creating New Road */}
          {showNewRoadModal && (
            <div className="p-4 bg-gray-50/70 border border-gray-300 rounded space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Create Road under Zone</h4>
                <button
                  type="button"
                  onClick={() => setShowNewRoadModal(false)}
                  className="text-xs text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                placeholder="Road Name (e.g. Sumanatissa Mawatha)"
                value={newRoadName}
                onChange={(e) => setNewRoadName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#A31736]"
              />
              <input
                type="text"
                placeholder="Road Code (e.g. HMG-STM)"
                value={newRoadCode}
                onChange={(e) => setNewRoadCode(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded uppercase focus:outline-none focus:ring-1 focus:ring-[#A31736]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewRoadModal(false)}
                  className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateRoad}
                  className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-[#A31736] hover:bg-[#801028] rounded cursor-pointer shadow-2xs"
                >
                  Add Road
                </button>
              </div>
            </div>
          )}

          {/* Submit Action Buttons */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold px-3.5 py-2 rounded border border-gray-300 transition-colors uppercase tracking-wider shadow-2xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold px-4 py-2 rounded transition-colors shadow-2xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Save Assessment Unit</span>
                  <span>✓</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddPropertyDrawer
