import React, { useState } from 'react'
import {
  SERVICE_CONFIG,
  type BookingRecord,
} from '../data/initialBookingData'

interface CloseoutBookingModalProps {
  isOpen: boolean
  onClose: () => void
  booking: BookingRecord | null
  onCloseout: (
    bookingId: string,
    citizenSignOff: string,
    supervisorNote?: string,
    supervisorName?: string
  ) => void
}

/**
 * Modal for Fleet Supervisor or Water Supply Supervisor to audit field logs,
 * verify citizen service satisfaction sign-off, and close out the bowser booking dossier.
 */
export const CloseoutBookingModal: React.FC<CloseoutBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onCloseout,
}) => {
  const [citizenSignOff, setCitizenSignOff] = useState('')
  const [supervisorNote, setSupervisorNote] = useState('')
  const [supervisorName, setSupervisorName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isGully = booking?.serviceType === 'GULLY_BOWSER'
  const cfg = booking ? SERVICE_CONFIG[booking.serviceType] : null

  const [prevBookingId, setPrevBookingId] = useState<string | null>(null)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  // Sync initial values when modal opens or booking changes (no effect setState)
  if (isOpen !== prevIsOpen || booking?.id !== prevBookingId) {
    setPrevIsOpen(isOpen)
    setPrevBookingId(booking?.id || null)
    if (booking && isOpen) {
      setError(null)
      setCitizenSignOff(`${booking.applicant.name} (Beneficiary)`)
      setSupervisorNote('Service inspected and verified against municipal standards. Job closed.')
      setSupervisorName(`${cfg?.supervisorTitle || 'Supervisor'} (Audit Desk)`)
    }
  }

  if (!isOpen || !booking || !cfg) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!citizenSignOff.trim()) {
      setError('Please record the citizen sign-off name or verification confirmation.')
      return
    }

    onCloseout(
      booking.id,
      citizenSignOff.trim(),
      supervisorNote.trim() || undefined,
      supervisorName.trim() || undefined
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
            <span className="w-3 h-3 rounded-full bg-emerald-600" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#A31736] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                  {booking.referenceNumber}
                </span>
                <span className="text-xs text-gray-500 font-medium">{cfg.supervisorTitle} Verification</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                Verify Service & Close Booking Dossier
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Service Summary Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-400 block font-medium">Applicant & Site</span>
              <span className="font-bold text-gray-900 block">{booking.applicant.name}</span>
              <span className="text-gray-500 block truncate">{booking.location.label}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Released Vehicle</span>
              <span className="font-bold text-emerald-800 font-mono block">
                {booking.assignedVehicleReg} (Available)
              </span>
              <span className="text-gray-500 block">Driver: {booking.assignedDriverName}</span>
            </div>
          </div>

          {/* Field Log Audit Card */}
          {isGully && booking.disposalLog && (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2 text-xs">
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-900 block">
                Septage Disposal Audit Record
              </span>
              <div className="grid grid-cols-3 gap-2 text-emerald-950">
                <div>
                  <span className="text-emerald-700 block text-[11px]">Facility:</span>
                  <span className="font-bold">{booking.disposalLog.plantName}</span>
                </div>
                <div>
                  <span className="text-emerald-700 block text-[11px]">Ticket #:</span>
                  <span className="font-mono font-bold">{booking.disposalLog.weighbridgeTicketNo}</span>
                </div>
                <div>
                  <span className="text-emerald-700 block text-[11px]">Volume / Weight:</span>
                  <span className="font-bold">
                    {booking.disposalLog.volumeLitres.toLocaleString()} L ({booking.disposalLog.weightKg.toLocaleString()} kg)
                  </span>
                </div>
              </div>
            </div>
          )}

          {!isGully && booking.deliveryLog && (
            <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2 text-xs">
              <span className="text-[10px] uppercase tracking-wider font-bold text-blue-900 block">
                Water Flowmeter Delivery Audit
              </span>
              <div className="grid grid-cols-3 gap-2 text-blue-950">
                <div>
                  <span className="text-blue-700 block text-[11px]">Start Reading:</span>
                  <span className="font-mono font-bold">{booking.deliveryLog.flowmeterStart.toLocaleString()} L</span>
                </div>
                <div>
                  <span className="text-blue-700 block text-[11px]">End Reading:</span>
                  <span className="font-mono font-bold">{booking.deliveryLog.flowmeterEnd.toLocaleString()} L</span>
                </div>
                <div>
                  <span className="text-blue-700 block text-[11px]">Total Delivered:</span>
                  <span className="font-mono font-extrabold text-blue-900">
                    {booking.deliveryLog.litresDelivered.toLocaleString()} L
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Citizen Sign-Off Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
              Citizen / Householder Sign-Off Confirmation *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. S.K. Jayasinghe (Signed on paper service card)"
              value={citizenSignOff}
              onChange={(e) => setCitizenSignOff(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-emerald-600"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">
              Confirms applicant acknowledgment of satisfactory service delivery.
            </span>
          </div>

          {/* Supervisor Closeout Audit Note */}
          <div>
            <label className="block text-xs text-gray-600 mb-1 font-medium">
              Supervisor Verification & Audit Note
            </label>
            <textarea
              rows={2}
              value={supervisorNote}
              onChange={(e) => setSupervisorNote(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Supervisor Name */}
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">
              Closing Supervisor Name
            </label>
            <input
              type="text"
              value={supervisorName}
              onChange={(e) => setSupervisorName(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-medium"
            />
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
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>✓ Verify & Complete Booking Dossier</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
