import React, { useState, useMemo, useRef } from 'react'
import {
  SERVICE_CONFIG,
  type BookingRecord,
  type TOChecklistResult,
  type FeeBreakdown,
} from '../data/initialBookingData'
import { calculateFee, formatLKR, formatTimestamp } from '../utils/bookingUtils'
import { filterNumericInput, validateFreeText, validateNumber } from '../utils/validators'
import type { BookingActionResult } from '../utils/validators'

interface TechnicalReviewModalProps {
  isOpen: boolean
  onClose: () => void
  booking: BookingRecord | null
  onApprove: (
    bookingId: string,
    params: {
      checklist: TOChecklistResult
      adjustedLoads?: number
      adjustedDistanceKm?: number
      finalFee: FeeBreakdown
      approverName?: string
    }
  ) => BookingActionResult<void>
  onReject: (bookingId: string, reason: string, approverName?: string) => BookingActionResult<void>
}

/**
 * Modal for Technical Officer (TO) review.
 * Enforces technical site checklists, allows operational adjustments to loads
 * and route kilometres, confirms final fee, and either approves (initiating 24h
 * payment window) or rejects with an audit reason.
 */
export const TechnicalReviewModal: React.FC<TechnicalReviewModalProps> = ({
  isOpen,
  onClose,
  booking,
  onApprove,
  onReject,
}) => {
  const isGully = booking?.serviceType === 'GULLY_BOWSER'

  // Checklist state
  const [roadAccess, setRoadAccess] = useState(true)
  const [vehicleTurningRadius, setVehicleTurningRadius] = useState(true)
  const [suctionDistance, setSuctionDistance] = useState(true)
  const [bowserCapacity, setBowserCapacity] = useState(true)
  const [deliveryRoadBridgeLimits, setDeliveryRoadBridgeLimits] = useState(true)
  const [slope, setSlope] = useState(true)
  const [pumpingHoseReach, setPumpingHoseReach] = useState(true)
  const [waterReservoirStock, setWaterReservoirStock] = useState(true)

  // Adjustments state
  const [loads, setLoads] = useState('1')
  const [distanceKm, setDistanceKm] = useState('0')
  const [approverName, setApproverName] = useState('Eng. K.L. Samaraweera (Technical Officer)')

  // Reject state
  const [isRejectMode, setIsRejectMode] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement | null>(null)

  const [prevBookingId, setPrevBookingId] = useState<string | null>(null)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  // Populate initial values when modal opens or booking changes (no effect setState)
  if (isOpen !== prevIsOpen || (booking?.id ?? null) !== prevBookingId) {
    setPrevIsOpen(isOpen)
    setPrevBookingId(booking?.id || null)
    if (booking && isOpen) {
      setLoads(String(booking.estimatedFee.loads))
      setDistanceKm(String(booking.estimatedFee.distanceKm))
      setIsRejectMode(false)
      setRejectionReason('')
      setError(null)
      setFieldErrors({})
      setSubmitting(false)
      setRoadAccess(true)
      setVehicleTurningRadius(true)
      setSuctionDistance(true)
      setBowserCapacity(true)
      setDeliveryRoadBridgeLimits(true)
      setSlope(true)
      setPumpingHoseReach(true)
      setWaterReservoirStock(true)
    }
  }

  // Recalculate fee dynamically based on adjusted values
  const finalFee: FeeBreakdown = useMemo(() => {
    if (!booking) {
      return { loads: 1, distanceKm: 0, farePerLoad: 0, transportFeePerKm: 0, totalLKR: 0 }
    }
    const ranges = SERVICE_CONFIG[booking.serviceType].bookingRanges
    return calculateFee(
      booking.serviceType,
      Math.max(ranges.technicalLoads.min, Number(loads)),
      Math.max(ranges.technicalDistanceKm.min, Number(distanceKm))
    )
  }, [booking, loads, distanceKm])

  if (!isOpen || !booking) return null

  const cfg = SERVICE_CONFIG[booking.serviceType]
  const checklistComplete = roadAccess && (isGully
    ? vehicleTurningRadius && suctionDistance && bowserCapacity
    : deliveryRoadBridgeLimits && slope && pumpingHoseReach && waterReservoirStock)

  const handleApproveSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const ranges = SERVICE_CONFIG[booking.serviceType].bookingRanges
    const loadsResult = validateNumber(loads, ranges.technicalLoads.min, ranges.technicalLoads.max, true)
    const distanceResult = validateNumber(distanceKm, ranges.technicalDistanceKm.min, ranges.technicalDistanceKm.max)
    const distancePrecisionValid = Number(distanceKm) * 10 === Math.round(Number(distanceKm) * 10)
    const nextErrors: Record<string, string> = {}
    if (!loadsResult.valid) nextErrors.loads = loadsResult.error
    if (!distanceResult.valid || !distancePrecisionValid) {
      nextErrors.distanceKm = distanceResult.error || 'Route distance must use no more than one decimal place.'
    }
    if (!checklistComplete) nextErrors.checklist = 'Complete every technical checklist item before approving.'
    setFieldErrors(nextErrors)
    const firstField = Object.keys(nextErrors)[0]
    if (firstField) {
      const id = firstField === 'loads' ? 'review-confirmed-loads' : firstField === 'distanceKm' ? 'review-route-distance' : 'review-road-access'
      const target = formRef.current?.querySelector<HTMLElement>(`#${id}`)
      target?.focus()
      target?.scrollIntoView({ block: 'center' })
      setError(nextErrors[firstField])
      return
    }
    setSubmitting(true)

    // Build checklist object
    const checklist: TOChecklistResult = {
      roadAccess,
      ...(isGully
        ? {
            vehicleTurningRadius,
            suctionDistance,
            bowserCapacity,
          }
        : {
            deliveryRoadBridgeLimits,
            slope,
            pumpingHoseReach,
            waterReservoirStock,
          }),
    }

    const result = onApprove(booking.id, {
      checklist,
      adjustedLoads: Number(loads) !== booking.estimatedFee.loads ? Number(loads) : undefined,
      adjustedDistanceKm: Number(distanceKm) !== booking.estimatedFee.distanceKm ? Number(distanceKm) : undefined,
      finalFee,
      approverName,
    })
    if (!result.ok) {
      setError(Object.values(result.errors).join(' '))
      setSubmitting(false)
      return
    }

    onClose()
  }

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const reason = validateFreeText(rejectionReason, { required: true, min: 10, max: 300 })
    if (!reason.valid) {
      setError(reason.error)
      setFieldErrors({ rejectionReason: reason.error })
      const target = document.getElementById('review-rejection-reason')
      target?.focus()
      target?.scrollIntoView({ block: 'center' })
      return
    }
    setFieldErrors({})

    setSubmitting(true)
    const result = onReject(booking.id, reason.value, approverName)
    if (!result.ok) {
      setError(Object.values(result.errors).join(' '))
      setSubmitting(false)
      return
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 cursor-default"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal Dialog */}
      <div className="relative bg-white w-full max-w-3xl max-h-[92vh] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-10 animate-scale-up flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#A31736]" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#A31736] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                  {booking.referenceNumber}
                </span>
                <span className="text-xs text-gray-500 font-medium">Technical Officer Assessment</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                Technical Review & Site Feasibility
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer font-bold text-xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1 text-sm">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Booking Dossier Summary Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-gray-400 block font-medium">Service</span>
              <span className="font-bold text-gray-900">{cfg.label}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Applicant</span>
              <span className="font-bold text-gray-900">{booking.applicant.name}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Site Location</span>
              <span className="font-bold text-gray-900 truncate block" title={booking.location.label}>
                {booking.location.label}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Scheduled Date</span>
              <span className="font-bold text-gray-900">
                {booking.scheduledDate} ({booking.scheduledTime})
              </span>
            </div>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-gray-400 block font-medium">Source</span>
                <span className="font-bold text-gray-900">{booking.source}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">NIC</span>
                <span className="font-bold text-gray-900">{booking.applicant.nic}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Telephone</span>
                <span className="font-bold text-gray-900">{booking.applicant.phone}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Ward</span>
                <span className="font-bold text-gray-900">{booking.applicant.ward}</span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-gray-400 block font-medium">Applicant address</span>
                <span className="font-semibold text-gray-900">{booking.applicant.address}</span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-gray-400 block font-medium">Service location</span>
                <span className="font-semibold text-gray-900">{booking.location.label}</span>
                <span className="block mt-0.5 font-mono text-[11px] text-gray-500">
                  {booking.location.lat.toFixed(5)}, {booking.location.lng.toFixed(5)}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-gray-400 block font-medium">Submitted</span>
                <span className="font-semibold text-gray-900">
                  {booking.timeline[0]?.at ? formatTimestamp(booking.timeline[0].at) : 'Submission time unavailable'}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Service-specific booking details
              </h4>
              {'pitVolumeLitres' in booking.serviceDetails ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div><span className="text-gray-400 block">Pit volume</span><strong>{booking.serviceDetails.pitVolumeLitres.toLocaleString()} L</strong></div>
                  <div><span className="text-gray-400 block">Waste type</span><strong>{booking.serviceDetails.wasteType}</strong></div>
                  <div><span className="text-gray-400 block">Distance from gate</span><strong>{booking.serviceDetails.distanceFromGateM} m</strong></div>
                  <div><span className="text-gray-400 block">Hose required</span><strong>{booking.serviceDetails.hoseLengthRequiredM} m</strong></div>
                  <div><span className="text-gray-400 block">Road width</span><strong>{booking.serviceDetails.roadWidthM} m</strong></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div><span className="text-gray-400 block">Water volume</span><strong>{booking.serviceDetails.waterVolumeLitres.toLocaleString()} L</strong></div>
                  <div><span className="text-gray-400 block">Requested loads</span><strong>{booking.serviceDetails.loadsRequired}</strong></div>
                  <div><span className="text-gray-400 block">Purpose</span><strong>{booking.serviceDetails.purpose}</strong></div>
                  <div><span className="text-gray-400 block">Storage type</span><strong>{booking.serviceDetails.storageTankType}</strong></div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-1.5">
              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Estimated fee breakdown
              </h4>
              <div className="flex justify-between gap-3">
                <span>Base ({booking.estimatedFee.loads} load(s) × {formatLKR(booking.estimatedFee.farePerLoad)})</span>
                <strong>{formatLKR(booking.estimatedFee.loads * booking.estimatedFee.farePerLoad)}</strong>
              </div>
              <div className="flex justify-between gap-3">
                <span>Transport ({booking.estimatedFee.distanceKm.toFixed(1)} km × {formatLKR(booking.estimatedFee.transportFeePerKm)}/km)</span>
                <strong>{formatLKR(booking.estimatedFee.distanceKm * booking.estimatedFee.transportFeePerKm)}</strong>
              </div>
              <div className="flex justify-between gap-3 border-t border-gray-100 pt-1.5 font-extrabold text-gray-900">
                <span>Estimated total</span>
                <span>{formatLKR(booking.estimatedFee.totalLKR)}</span>
              </div>
            </div>
          </div>

          {!isRejectMode ? (
            <form ref={formRef} onSubmit={handleApproveSubmit} className="space-y-5" noValidate>
              {/* Technical Checklist */}
              <div>
                <p className="block text-xs font-bold text-gray-700 mb-2.5 uppercase tracking-wider">
                  1. Technical Feasibility Checklist ({isGully ? 'Gully Bowser' : 'Water Bowser'})
                </p>
                <div className="space-y-2 p-4 bg-gray-50/70 rounded-xl border border-gray-200 text-xs">
                  <label htmlFor="review-road-access" className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      id="review-road-access"
                      type="checkbox"
                      checked={roadAccess}
                      onChange={(e) => setRoadAccess(e.target.checked)}
                      className="mt-0.5 rounded text-[#A31736] focus:ring-[#A31736]"
                    />
                    <div>
                      <span className="font-bold text-gray-800">Roadway & Access Passage Clearance:</span>
                      <p className="text-gray-500">
                        Access road width (&gt; 3.5m) and bridge load capacity verified for heavy bowser access.
                      </p>
                    </div>
                  </label>

                  {isGully ? (
                    <>
                      <label htmlFor="review-turning-radius" className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          id="review-turning-radius"
                          type="checkbox"
                          checked={vehicleTurningRadius}
                          onChange={(e) => setVehicleTurningRadius(e.target.checked)}
                          className="mt-0.5 rounded text-[#A31736] focus:ring-[#A31736]"
                        />
                        <div>
                          <span className="font-bold text-gray-800">Vehicle Turning Radius & Reversal:</span>
                          <p className="text-gray-500">
                            Adequate turnaround bay or clear reverse trajectory into septic pit approach.
                          </p>
                        </div>
                      </label>

                      <label htmlFor="review-suction-distance" className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          id="review-suction-distance"
                          type="checkbox"
                          checked={suctionDistance}
                          onChange={(e) => setSuctionDistance(e.target.checked)}
                          className="mt-0.5 rounded text-[#A31736] focus:ring-[#A31736]"
                        />
                        <div>
                          <span className="font-bold text-gray-800">Suction Distance & Hose Length:</span>
                          <p className="text-gray-500">
                            Pit distance from gate is within 25m suction pump lift limits.
                          </p>
                        </div>
                      </label>

                      <label htmlFor="review-bowser-capacity" className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          id="review-bowser-capacity"
                          type="checkbox"
                          checked={bowserCapacity}
                          onChange={(e) => setBowserCapacity(e.target.checked)}
                          className="mt-0.5 rounded text-[#A31736] focus:ring-[#A31736]"
                        />
                        <div>
                          <span className="font-bold text-gray-800">Bowser Capacity vs Pit Volume:</span>
                          <p className="text-gray-500">
                            Required capacity matched with fleet vacuum tankers and disposal intake quota.
                          </p>
                        </div>
                      </label>
                    </>
                  ) : (
                    <>
                      <label htmlFor="review-delivery-bridge" className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          id="review-delivery-bridge"
                          type="checkbox"
                          checked={deliveryRoadBridgeLimits}
                          onChange={(e) => setDeliveryRoadBridgeLimits(e.target.checked)}
                          className="mt-0.5 rounded text-[#A31736] focus:ring-[#A31736]"
                        />
                        <div>
                          <span className="font-bold text-gray-800">Culvert & Bridge Weight Tolerances:</span>
                          <p className="text-gray-500">
                            Local neighborhood access bridges safely support 12-tonne loaded bowsers.
                          </p>
                        </div>
                      </label>

                      <label htmlFor="review-water-slope" className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          id="review-water-slope"
                          type="checkbox"
                          checked={slope}
                          onChange={(e) => setSlope(e.target.checked)}
                          className="mt-0.5 rounded text-[#A31736] focus:ring-[#A31736]"
                        />
                        <div>
                          <span className="font-bold text-gray-800">Gradient & Safe Parked Pumping:</span>
                          <p className="text-gray-500">
                            Road gradient is safe for heavy vehicle stationary pumping with chocks.
                          </p>
                        </div>
                      </label>

                      <label htmlFor="review-pumping-hose" className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          id="review-pumping-hose"
                          type="checkbox"
                          checked={pumpingHoseReach}
                          onChange={(e) => setPumpingHoseReach(e.target.checked)}
                          className="mt-0.5 rounded text-[#A31736] focus:ring-[#A31736]"
                        />
                        <div>
                          <span className="font-bold text-gray-800">Pumping Hose Reach to Storage:</span>
                          <p className="text-gray-500">
                            Discharge hose reaches applicant&apos;s tank/sump without excessive head loss.
                          </p>
                        </div>
                      </label>

                      <label htmlFor="review-water-stock" className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          id="review-water-stock"
                          type="checkbox"
                          checked={waterReservoirStock}
                          onChange={(e) => setWaterReservoirStock(e.target.checked)}
                          className="mt-0.5 rounded text-[#A31736] focus:ring-[#A31736]"
                        />
                        <div>
                          <span className="font-bold text-gray-800">Depot Water Reservoir Stock:</span>
                          <p className="text-gray-500">
                            Treated municipal water volume available on the requested date.
                          </p>
                        </div>
                      </label>
                    </>
                  )}
                </div>
              </div>

              {/* Operational Adjustments (Loads & Distance) */}
              <div>
                <p className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  2. Operational Adjustments & Final Fee Confirmation
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50/70 rounded-xl border border-gray-200">
                  <div>
                    <label htmlFor="review-confirmed-loads" className="block text-xs text-gray-600 mb-1 font-medium">
                      Confirmed Loads ({cfg.label})
                    </label>
                    <input
                      id="review-confirmed-loads"
                      type="text"
                      inputMode="numeric"
                      value={loads}
                      onChange={(e) => setLoads(filterNumericInput(e.target.value, false))}
                      aria-invalid={Boolean(fieldErrors.loads)}
                      aria-describedby={fieldErrors.loads ? 'review-loads-error' : undefined}
                      onBlur={() => {
                        const range = cfg.bookingRanges.technicalLoads
                        const result = validateNumber(loads, range.min, range.max, true)
                        setFieldErrors((prev) => ({ ...prev, loads: result.valid ? '' : result.error }))
                      }}
                      className={`w-full bg-white border rounded-lg px-3 py-1.5 text-xs font-bold ${fieldErrors.loads ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
                    />
                    {fieldErrors.loads && <p id="review-loads-error" className="mt-1 text-xs text-red-700">{fieldErrors.loads}</p>}
                    <span className="text-[10px] text-gray-400">
                      Applicant requested {booking.estimatedFee.loads} load(s)
                    </span>
                  </div>

                  <div>
                    <label htmlFor="review-route-distance" className="block text-xs text-gray-600 mb-1 font-medium">
                      Confirmed Route Distance (km)
                    </label>
                    <input
                      id="review-route-distance"
                      type="text"
                      inputMode="decimal"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(filterNumericInput(e.target.value, true))}
                      aria-invalid={Boolean(fieldErrors.distanceKm)}
                      aria-describedby={fieldErrors.distanceKm ? 'review-distance-error' : undefined}
                      onBlur={() => {
                        const range = cfg.bookingRanges.technicalDistanceKm
                        const result = validateNumber(distanceKm, range.min, range.max)
                        const precisionValid = Number(distanceKm) * 10 === Math.round(Number(distanceKm) * 10)
                        const message = result.valid && precisionValid ? '' : result.error || 'Route distance must use no more than one decimal place.'
                        setFieldErrors((prev) => ({ ...prev, distanceKm: message }))
                      }}
                      className={`w-full bg-white border rounded-lg px-3 py-1.5 text-xs font-bold ${fieldErrors.distanceKm ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
                    />
                    {fieldErrors.distanceKm && <p id="review-distance-error" className="mt-1 text-xs text-red-700">{fieldErrors.distanceKm}</p>}
                    <span className="text-[10px] text-gray-400">
                      Estimated straight-line was {booking.estimatedFee.distanceKm.toFixed(1)} km
                    </span>
                  </div>
                </div>
              </div>

              {/* Fee Breakdown Preview */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5">
                <div className="flex justify-between text-xs text-emerald-900">
                  <span>Base Fee ({finalFee.loads} load{finalFee.loads > 1 ? 's' : ''} × {formatLKR(finalFee.farePerLoad)}):</span>
                  <span className="font-semibold">{formatLKR(finalFee.loads * finalFee.farePerLoad)}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-900">
                  <span>Transport Fee ({finalFee.distanceKm.toFixed(1)} km × {formatLKR(finalFee.transportFeePerKm)}/km):</span>
                  <span className="font-semibold">{formatLKR(finalFee.distanceKm * finalFee.transportFeePerKm)}</span>
                </div>
                <div className="border-t border-emerald-200 pt-1.5 flex justify-between items-center text-sm font-extrabold text-emerald-950">
                  <span>Final Approved Fee Payable by Citizen:</span>
                  <span className="text-base text-emerald-700">{formatLKR(finalFee.totalLKR)}</span>
                </div>
                <div className="text-[11px] text-emerald-800 flex items-center gap-1.5 mt-1">
                  <span>⏱️</span>
                  <span>Approval will start a <strong>24-hour payment countdown</strong> for the applicant.</span>
                </div>
              </div>

              {/* Approver Signature */}
              <div>
                <label htmlFor="review-approver-name" className="block text-xs text-gray-500 mb-1 font-medium">
                  Reviewing Technical Officer Name / Designation
                </label>
                <input
                  id="review-approver-name"
                  type="text"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-medium"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsRejectMode(true)}
                  className="px-4 py-2.5 rounded-xl border border-red-300 text-red-700 font-bold text-xs hover:bg-red-50 transition-all cursor-pointer"
                >
                  Reject Application...
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!checklistComplete || submitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>✓ Approve & Issue 24h Payment Notice</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider">
                  Technical Rejection Notice
                </h4>
                <p className="text-xs text-red-700">
                  Rejecting this booking will terminate the workflow. The citizen will be notified with the reason and must re-apply if requirements change.
                </p>
              </div>

              <div>
                <label htmlFor="review-rejection-reason" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Rejection Reason *
                </label>
                <textarea
                  id="review-rejection-reason"
                  rows={3}
                  placeholder="e.g. Access road bridge weight limit is 3.5 tonnes, insufficient for 12-tonne heavy bowser; no alternative turning bay available."
                  value={rejectionReason}
                  maxLength={300}
                  onChange={(e) => setRejectionReason(e.target.value.slice(0, 300))}
                  aria-invalid={Boolean(fieldErrors.rejectionReason)}
                  aria-describedby={fieldErrors.rejectionReason ? 'review-rejection-error' : undefined}
                  onBlur={() => {
                    const result = validateFreeText(rejectionReason, { required: true, min: 10, max: 300 })
                    setFieldErrors((prev) => ({ ...prev, rejectionReason: result.valid ? '' : result.error }))
                  }}
                  className={`w-full bg-white border rounded-xl p-3 text-xs focus:outline-none focus:border-red-600 ${fieldErrors.rejectionReason ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
                />
                {fieldErrors.rejectionReason && <p id="review-rejection-error" className="mt-1 text-xs text-red-700">{fieldErrors.rejectionReason}</p>}
              </div>

              <div>
                <label htmlFor="review-rejection-officer" className="block text-xs text-gray-500 mb-1 font-medium">
                  Reviewing Technical Officer Name
                </label>
                <input
                  id="review-rejection-officer"
                  type="text"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsRejectMode(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-all cursor-pointer"
                >
                  ← Back to Checklist
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
