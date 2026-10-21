import React, { useState, useRef } from 'react'
import {
  SERVICE_CONFIG,
  type BookingRecord,
} from '../data/initialBookingData'
import type { BookingActionResult } from '../utils/validators'
import { validateFreeText } from '../utils/validators'

interface CloseoutBookingModalProps {
  isOpen: boolean
  onClose: () => void
  booking: BookingRecord | null
  onCloseout: (
    bookingId: string,
    citizenSignOff: string,
    signOffConfirmed: boolean,
    supervisorNote?: string,
    supervisorName?: string
  ) => BookingActionResult<void>
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
  const [signOffConfirmed, setSignOffConfirmed] = useState(false)
  const [supervisorNote, setSupervisorNote] = useState('')
  const [supervisorName, setSupervisorName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement | null>(null)

  const isGully = booking?.serviceType === 'GULLY_BOWSER'
  const cfg = booking ? SERVICE_CONFIG[booking.serviceType] : null

  const [prevBookingId, setPrevBookingId] = useState<string | null>(null)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  // Sync initial values when modal opens or booking changes (no effect setState)
  if (isOpen !== prevIsOpen || (booking?.id ?? null) !== prevBookingId) {
    setPrevIsOpen(isOpen)
    setPrevBookingId(booking?.id || null)
    if (booking && isOpen) {
      setError(null)
      setFieldErrors({})
      setSubmitting(false)
      setCitizenSignOff(`${booking.applicant.name} (Beneficiary)`)
      setSignOffConfirmed(false)
      setSupervisorNote('Service inspected and verified against municipal standards. Job closed.')
      setSupervisorName(`${cfg?.supervisorTitle || 'Supervisor'} (Audit Desk)`)
    }
  }

  if (!isOpen || !booking || !cfg) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const signOff = validateFreeText(citizenSignOff, { required: true, min: 3, max: 120 })
    const remarks = validateFreeText(supervisorNote, { max: 300 })
    const nextErrors: Record<string, string> = {}
    if (!signOffConfirmed) nextErrors.signOffConfirmed = 'Confirm that the citizen sign-off was received.'
    if (!signOff.valid) nextErrors.signOff = signOff.error
    if (!remarks.valid) nextErrors.remarks = remarks.error
    setFieldErrors(nextErrors)
    const firstField = Object.keys(nextErrors)[0]
    if (firstField) {
      const targetId = firstField === 'signOffConfirmed'
        ? 'closeout-signoff-confirmed'
        : firstField === 'signOff' ? 'closeout-citizen-signoff' : 'closeout-supervisor-note'
      const target = formRef.current?.querySelector<HTMLElement>(`#${targetId}`)
      target?.focus()
      target?.scrollIntoView({ block: 'center' })
      setError(nextErrors[firstField])
      return
    }
    setSubmitting(true)
    if (!signOffConfirmed) {
      setError('Confirm that the citizen sign-off was received before closing this booking.')
      return
    }

    const result = onCloseout(
      booking.id,
      signOff.value,
      signOffConfirmed,
      remarks.value || undefined,
      supervisorName.trim() || undefined
    )
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
        <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-5 text-sm" noValidate>
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
            <label htmlFor="closeout-citizen-signoff" className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
              Citizen / Householder Sign-Off Confirmation *
            </label>
            <input
              id="closeout-citizen-signoff"
              type="text"
              required
              placeholder="e.g. S.K. Jayasinghe (Signed on paper service card)"
              value={citizenSignOff}
              onChange={(e) => setCitizenSignOff(e.target.value)}
              maxLength={120}
              aria-invalid={Boolean(fieldErrors.signOff)}
              aria-describedby={fieldErrors.signOff ? 'closeout-signoff-error' : undefined}
              onBlur={() => {
                const result = validateFreeText(citizenSignOff, { required: true, min: 3, max: 120 })
                setFieldErrors((prev) => ({ ...prev, signOff: result.valid ? '' : result.error }))
              }}
              className={`w-full bg-white border rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-emerald-600 ${fieldErrors.signOff ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
            />
            {fieldErrors.signOff && <p id="closeout-signoff-error" className="mt-1 text-xs text-red-700">{fieldErrors.signOff}</p>}
            <span className="text-[10px] text-gray-400 mt-1 block">
              Confirms applicant acknowledgment of satisfactory service delivery.
            </span>
          </div>
          <label htmlFor="closeout-signoff-confirmed" className="flex items-start gap-2 text-xs text-gray-700">
            <input
              id="closeout-signoff-confirmed"
              type="checkbox"
              checked={signOffConfirmed}
              onChange={(e) => setSignOffConfirmed(e.target.checked)}
              aria-invalid={Boolean(fieldErrors.signOffConfirmed)}
              aria-describedby={fieldErrors.signOffConfirmed ? 'closeout-confirmation-error' : undefined}
              className="mt-0.5 rounded"
            />
            I confirm the citizen/householder sign-off was received.
          </label>
          {fieldErrors.signOffConfirmed && <p id="closeout-confirmation-error" className="text-xs text-red-700">{fieldErrors.signOffConfirmed}</p>}

          {/* Supervisor Closeout Audit Note */}
          <div>
            <label htmlFor="closeout-supervisor-note" className="block text-xs text-gray-600 mb-1 font-medium">
              Supervisor Verification & Audit Note
            </label>
            <textarea
              id="closeout-supervisor-note"
              rows={2}
              maxLength={300}
              value={supervisorNote}
              onChange={(e) => setSupervisorNote(e.target.value)}
              aria-invalid={Boolean(fieldErrors.remarks)}
              aria-describedby={fieldErrors.remarks ? 'closeout-remarks-error' : undefined}
              onBlur={() => {
                const result = validateFreeText(supervisorNote, { max: 300 })
                setFieldErrors((prev) => ({ ...prev, remarks: result.valid ? '' : result.error }))
              }}
              className={`w-full bg-white border rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-600 ${fieldErrors.remarks ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
            />
            {fieldErrors.remarks && <p id="closeout-remarks-error" className="mt-1 text-xs text-red-700">{fieldErrors.remarks}</p>}
          </div>

          {/* Supervisor Name */}
          <div>
            <label htmlFor="closeout-supervisor-name" className="block text-xs text-gray-500 mb-1 font-medium">
              Closing Supervisor Name
            </label>
            <input
              id="closeout-supervisor-name"
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
              disabled={submitting}
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
