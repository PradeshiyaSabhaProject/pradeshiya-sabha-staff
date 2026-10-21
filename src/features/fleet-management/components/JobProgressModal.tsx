import React, { useState } from 'react'
import {
  type BookingRecord,
  type BookingStatus,
  type DisposalLog,
  type DeliveryLog,
} from '../data/initialBookingData'

interface JobProgressModalProps {
  isOpen: boolean
  onClose: () => void
  booking: BookingRecord | null
  onAdvanceJobStep: (
    bookingId: string,
    newStatus: BookingStatus,
    note?: string,
    actor?: string,
    extraData?: {
      disposalLog?: DisposalLog
      deliveryLog?: DeliveryLog
    }
  ) => void
}

/**
 * Modal to progress an active bowser booking through field driver steps:
 * 1. Start Trip (Vehicle Assigned → En Route)
 * 2. Arrive On Site (En Route → Service In Progress)
 * 3. Pit Emptied / Transit (Gully: Service In Progress → In Transit to Plant)
 * 4. Log Disposal at Treatment Plant (Gully: In Transit to Plant → Pending Closeout)
 * 5. Log Water Delivery & Flowmeter (Water: Service In Progress → Pending Closeout)
 *
 * Enforces the spec release rule: Vehicle and Driver become 'Available' at Pending Closeout.
 */
export const JobProgressModal: React.FC<JobProgressModalProps> = ({
  isOpen,
  onClose,
  booking,
  onAdvanceJobStep,
}) => {
  const isGully = booking?.serviceType === 'GULLY_BOWSER'

  // Actor / notes
  const [operatorName, setOperatorName] = useState('')
  const [operationalNotes, setOperationalNotes] = useState('')

  // Gully Disposal Log fields
  const [plantName, setPlantName] = useState('Kerawalapitiya Septage Treatment Plant')
  const [weighbridgeTicketNo, setWeighbridgeTicketNo] = useState('')
  const [disposalVolumeLitres, setDisposalVolumeLitres] = useState<number>(5000)
  const [disposalWeightKg, setDisposalWeightKg] = useState<number>(5150)

  // Water Delivery Log fields
  const [flowmeterStart, setFlowmeterStart] = useState<number>(10000)
  const [flowmeterEnd, setFlowmeterEnd] = useState<number>(18000)

  const [error, setError] = useState<string | null>(null)

  const [prevBookingId, setPrevBookingId] = useState<string | null>(null)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  // Sync initial log fields when modal opens or booking changes (no effect setState)
  if (isOpen !== prevIsOpen || (booking?.id ?? null) !== prevBookingId) {
    setPrevIsOpen(isOpen)
    setPrevBookingId(booking?.id || null)
    if (booking && isOpen) {
      setError(null)
      setOperatorName(booking.assignedDriverName || 'Field Crew Operator')
      setOperationalNotes('')

      const array = new Uint32Array(1)
      window.crypto.getRandomValues(array)
      const randomSuffix = 1000 + (array[0] % 9000)
      setWeighbridgeTicketNo(`WB-TK-${randomSuffix}`)

      if (isGully) {
        const pitVol = 'pitVolumeLitres' in booking.serviceDetails ? booking.serviceDetails.pitVolumeLitres : 5000
        setDisposalVolumeLitres(pitVol)
        setDisposalWeightKg(Math.round(pitVol * 1.03))
      } else {
        const waterVol = 'waterVolumeLitres' in booking.serviceDetails ? booking.serviceDetails.waterVolumeLitres : 8000
        setFlowmeterStart(15200)
        setFlowmeterEnd(15200 + waterVol)
      }
    }
  }

  if (!isOpen || !booking) return null

  const currentStatus = booking.status

  // Determine target next step
  let targetNextStatus: BookingStatus | null = null
  let stepTitle = ''
  let stepDescription = ''

  if (currentStatus === 'Vehicle Assigned') {
    targetNextStatus = 'En Route'
    stepTitle = 'Start Trip — En Route to Site'
    stepDescription = 'Dispatch driver crew from municipal depot. Live simulated GPS tracking will be activated.'
  } else if (currentStatus === 'En Route') {
    targetNextStatus = 'Service In Progress'
    stepTitle = 'Mark Arrived on Site'
    stepDescription = 'Confirm arrival at applicant location. Bowser hookup and site operations begin.'
  } else if (currentStatus === 'Service In Progress') {
    if (isGully) {
      targetNextStatus = 'In Transit to Plant'
      stepTitle = 'Pit Emptied — In Transit to Treatment Plant'
      stepDescription = 'Septic pit emptying completed. Bowser sealed and in transit to licensed septage plant.'
    } else {
      targetNextStatus = 'Pending Closeout'
      stepTitle = 'Log Water Pumping Delivery'
      stepDescription = 'Water discharge completed. Record flowmeter readings to verify delivered volume.'
    }
  } else if (currentStatus === 'In Transit to Plant' && isGully) {
    targetNextStatus = 'Pending Closeout'
    stepTitle = 'Log Septage Discharge at Treatment Plant'
    stepDescription = 'Discharge waste at treatment facility. Record weighbridge ticket and disposal parameters.'
  }

  const isReleasingVehicle = targetNextStatus === 'Pending Closeout'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!targetNextStatus) return

    let extraData: { disposalLog?: DisposalLog; deliveryLog?: DeliveryLog } | undefined

    if (targetNextStatus === 'Pending Closeout') {
      if (isGully) {
        if (!weighbridgeTicketNo.trim()) {
          setError('Please provide a weighbridge ticket number for plant disposal.')
          return
        }
        extraData = {
          disposalLog: {
            plantName,
            weighbridgeTicketNo: weighbridgeTicketNo.trim(),
            volumeLitres: disposalVolumeLitres,
            weightKg: disposalWeightKg,
          },
        }
      } else {
        const delivered = flowmeterEnd - flowmeterStart
        if (delivered <= 0) {
          setError('Flowmeter end reading must exceed start reading.')
          return
        }
        extraData = {
          deliveryLog: {
            flowmeterStart,
            flowmeterEnd,
            litresDelivered: delivered,
          },
        }
      }
    }

    onAdvanceJobStep(
      booking.id,
      targetNextStatus,
      operationalNotes.trim() || undefined,
      operatorName.trim() || undefined,
      extraData
    )

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
      <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-10 animate-scale-up flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#A31736] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                  {booking.referenceNumber}
                </span>
                <span className="text-xs text-gray-500 font-medium">Driver / Crew Action</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mt-0.5">{stepTitle}</h3>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Step description */}
          <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-200">
            {stepDescription}
          </p>

          {/* Vehicle and Driver details */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-400 block font-medium">Assigned Vehicle</span>
              <span className="font-bold text-gray-900 font-mono">
                {booking.assignedVehicleReg || 'WP GB-XXXX'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Driver & Operator</span>
              <span className="font-bold text-gray-900">{booking.assignedDriverName || 'Driver Crew'}</span>
            </div>
          </div>

          {/* Special Log Inputs for Pending Closeout step */}
          {targetNextStatus === 'Pending Closeout' && isGully && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Septage Plant Disposal Log
              </h4>

              <div>
                <label htmlFor="job-disposal-facility" className="block text-[11px] text-gray-600 mb-1 font-medium">
                  Treatment Plant Facility *
                </label>
                <select
                  id="job-disposal-facility"
                  value={plantName}
                  onChange={(e) => setPlantName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium"
                >
                  <option value="Kerawalapitiya Septage Treatment Plant">
                    Kerawalapitiya Septage Treatment Plant
                  </option>
                  <option value="Homagama Regional Sludge Lagoon">
                    Homagama Regional Sludge Lagoon
                  </option>
                  <option value="Kolonnawa Septage Processing Centre">
                    Kolonnawa Septage Processing Centre
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label htmlFor="job-weighbridge-ticket" className="block text-[11px] text-gray-600 mb-1 font-medium">
                    Ticket # *
                  </label>
                  <input
                    id="job-weighbridge-ticket"
                    type="text"
                    required
                    value={weighbridgeTicketNo}
                    onChange={(e) => setWeighbridgeTicketNo(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label htmlFor="job-disposal-volume" className="block text-[11px] text-gray-600 mb-1 font-medium">
                    Volume (L)
                  </label>
                  <input
                    id="job-disposal-volume"
                    type="number"
                    min="100"
                    value={disposalVolumeLitres}
                    onChange={(e) => setDisposalVolumeLitres(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label htmlFor="job-disposal-weight" className="block text-[11px] text-gray-600 mb-1 font-medium">
                    Weight (kg)
                  </label>
                  <input
                    id="job-disposal-weight"
                    type="number"
                    min="100"
                    value={disposalWeightKg}
                    onChange={(e) => setDisposalWeightKg(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {targetNextStatus === 'Pending Closeout' && !isGully && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Water Bowser Flowmeter Audit Log
              </h4>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label htmlFor="job-flowmeter-start" className="block text-[11px] text-gray-600 mb-1 font-medium">
                    Meter Start (L)
                  </label>
                  <input
                    id="job-flowmeter-start"
                    type="number"
                    value={flowmeterStart}
                    onChange={(e) => setFlowmeterStart(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label htmlFor="job-flowmeter-end" className="block text-[11px] text-gray-600 mb-1 font-medium">
                    Meter End (L)
                  </label>
                  <input
                    id="job-flowmeter-end"
                    type="number"
                    value={flowmeterEnd}
                    onChange={(e) => setFlowmeterEnd(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <p className="block text-[11px] text-gray-600 mb-1 font-medium">
                    Delivered (L)
                  </p>
                  <div className="w-full bg-blue-100/60 border border-blue-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-black text-blue-900">
                    {(flowmeterEnd - flowmeterStart).toLocaleString()} L
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Release Rule Alert */}
          {isReleasingVehicle && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
              <span className="text-base">🔄</span>
              <div>
                <strong className="block font-bold">Fleet Release Rule Active:</strong>
                <span>
                  Advancing to <strong>Pending Closeout</strong> will immediately release vehicle{' '}
                  <strong>{booking.assignedVehicleReg}</strong> and driver back to <strong>Available</strong>{' '}
                  status at the municipal depot. Administrative closeout paperwork will not block fleet capacity.
                </span>
              </div>
            </div>
          )}

          {/* Notes & Operator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="job-reporting-driver" className="block text-xs text-gray-500 mb-1 font-medium">
                Reporting Driver / Crew Name
              </label>
              <input
                id="job-reporting-driver"
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-medium"
              />
            </div>

            <div>
              <label htmlFor="job-operational-notes" className="block text-xs text-gray-500 mb-1 font-medium">
                Operational Notes (Optional)
              </label>
              <input
                id="job-operational-notes"
                type="text"
                placeholder="e.g. Suction complete; no hose leaks"
                value={operationalNotes}
                onChange={(e) => setOperationalNotes(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#A31736] hover:bg-[#85122b] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Confirm & Advance to {targetNextStatus}</span>
              <span>→</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
