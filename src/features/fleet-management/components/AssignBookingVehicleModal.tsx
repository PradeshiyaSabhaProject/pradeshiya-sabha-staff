import React, { useState, useMemo } from 'react'
import {
  SERVICE_CONFIG,
  type BookingRecord,
} from '../data/initialBookingData'
import type { VehicleRecord, DriverRecord } from '../data/initialFleetData'
import type { AssignmentValidationResult } from '../hooks/useBookingData'

interface AssignBookingVehicleModalProps {
  isOpen: boolean
  onClose: () => void
  booking: BookingRecord | null
  vehicles: VehicleRecord[]
  drivers: DriverRecord[]
  onAssign: (
    bookingId: string,
    vehicleId: string,
    driverId: string,
    assignedBy?: string
  ) => AssignmentValidationResult
}

/**
 * Modal for Fleet Supervisor (Gully) or Water Supply Supervisor (Water)
 * to assign an available, compliant bowser vehicle and driver crew.
 * Validates vehicle category, availability, permit compliance, and driver availability.
 */
export const AssignBookingVehicleModal: React.FC<AssignBookingVehicleModalProps> = ({
  isOpen,
  onClose,
  booking,
  vehicles,
  drivers,
  onAssign,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('')
  const [selectedDriverId, setSelectedDriverId] = useState<string>('')
  const [supervisorName, setSupervisorName] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [today] = useState(() => {
    const date = new Date()
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
  })

  const cfg = booking ? SERVICE_CONFIG[booking.serviceType] : null

  // Filter vehicles matching the service category
  const matchingVehicles = useMemo(() => {
    if (!cfg) return []
    return vehicles.filter((v) => v.category === cfg.vehicleCategory)
  }, [vehicles, cfg])

  // Filter drivers
  const eligibleDrivers = useMemo(() => {
    return drivers.filter((d) => d.status === 'On Duty')
  }, [drivers])

  const [prevBookingId, setPrevBookingId] = useState<string | null>(null)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  // Sync default form state when modal opens or booking changes (no effect setState)
  if (isOpen !== prevIsOpen || (booking?.id ?? null) !== prevBookingId) {
    setPrevIsOpen(isOpen)
    setPrevBookingId(booking?.id || null)
    if (isOpen && booking) {
      setValidationError(null)
      setFieldErrors({})
      setSubmitting(false)
      setSupervisorName(`${cfg?.supervisorTitle || 'Fleet Supervisor'} (Duty Officer)`)

      const firstAvailable = matchingVehicles.find((v) => v.status === 'Available')
      setSelectedVehicleId(firstAvailable ? firstAvailable.id : (matchingVehicles[0]?.id || ''))

      if (firstAvailable?.assignedDriverId) {
        setSelectedDriverId(firstAvailable.assignedDriverId)
      } else {
        setSelectedDriverId(eligibleDrivers[0]?.id || '')
      }
    }
  }

  if (!isOpen || !booking || !cfg) return null

  // Selected vehicle details
  const currentVehicle = vehicles.find((v) => v.id === selectedVehicleId)

  // Real-time compliance check for selected vehicle
  const isPermitExpired = currentVehicle ? currentVehicle.permitExpiryDate < today : false
  const isRevenueExpired = currentVehicle ? currentVehicle.revenueLicenseExpiryDate < today : false
  const isInsuranceExpired = currentVehicle ? currentVehicle.insuranceExpiryDate < today : false
  const hasComplianceIssue = isPermitExpired || isRevenueExpired || isInsuranceExpired

  const handleVehicleChange = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId)
    setValidationError(null)
    const veh = vehicles.find((v) => v.id === vehicleId)
    if (veh?.assignedDriverId) {
      setSelectedDriverId(veh.assignedDriverId)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    const nextErrors: Record<string, string> = {}
    if (!selectedVehicleId) nextErrors.vehicleId = 'Please select a service vehicle.'
    if (!selectedDriverId) nextErrors.driverId = 'Please assign a licensed driver / operator.'
    setFieldErrors(nextErrors)
    const firstField = Object.keys(nextErrors)[0]
    if (firstField) {
      const target = document.getElementById(firstField === 'vehicleId' ? 'assign-veh-select' : 'assign-driver-select')
      target?.focus()
      target?.scrollIntoView({ block: 'center' })
      setValidationError(nextErrors[firstField])
      return
    }

    setSubmitting(true)
    const result = onAssign(booking.id, selectedVehicleId, selectedDriverId, supervisorName)
    if (!result.ok) {
      setFieldErrors(result.errors)
      setValidationError(Object.values(result.errors).join(' '))
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
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-10 animate-scale-up flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#A31736]" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#A31736] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                  {booking.referenceNumber}
                </span>
                <span className="text-xs text-gray-500 font-medium">{cfg.supervisorTitle} Desk</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                Assign Vehicle & Driver Crew
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm" noValidate>
          {validationError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-start gap-2.5">
              <span className="text-base shrink-0">🚫</span>
              <div>
                <strong className="block font-bold">Assignment Refused:</strong>
                <span>{validationError}</span>
              </div>
            </div>
          )}

          {/* Booking Summary */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-gray-400 block font-medium">Service</span>
              <span className="font-bold text-gray-900">{cfg.label}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Destination</span>
              <span className="font-bold text-gray-900 truncate block" title={booking.location.label}>
                {booking.location.label}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Scheduled Time</span>
              <span className="font-bold text-gray-900">{booking.scheduledDate} ({booking.scheduledTime})</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Required Loads</span>
              <span className="font-bold text-gray-900">{booking.estimatedFee.loads} load(s)</span>
            </div>
          </div>

          {/* Vehicle Picker */}
          <div>
            <label htmlFor="assign-veh-select" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              1. Select {cfg.vehicleCategory} (Fleet)
            </label>
            <select
              id="assign-veh-select"
              value={selectedVehicleId}
              onChange={(e) => handleVehicleChange(e.target.value)}
              aria-invalid={Boolean(fieldErrors.vehicleId)}
              aria-describedby={fieldErrors.vehicleId ? 'assign-vehicle-error' : undefined}
              onBlur={() => {
                setFieldErrors((prev) => ({ ...prev, vehicleId: selectedVehicleId ? '' : 'Please select a service vehicle.' }))
              }}
              className={`w-full bg-white border rounded-xl px-4 py-2.5 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#A31736] ${fieldErrors.vehicleId ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
            >
              <option value="">-- Choose Bowser Vehicle --</option>
              {matchingVehicles.map((v) => {
                const isPermitDue = v.status === 'Permit Due' || v.permitExpiryDate < today
                return (
                  <option key={v.id} value={v.id}>
                    {v.registrationNumber} • {v.name} [{v.status}]
                    {isPermitDue ? ' (⚠️ PERMIT DUE / EXPIRED)' : ''}
                  </option>
                )
              })}
            </select>
            {fieldErrors.vehicleId && <p id="assign-vehicle-error" className="mt-1 text-xs text-red-700">{fieldErrors.vehicleId}</p>}
          </div>

          {/* Selected Vehicle Status Card */}
          {currentVehicle && (
            <div
              className={`p-3.5 rounded-xl border text-xs ${
                hasComplianceIssue
                  ? 'bg-red-50/80 border-red-200 text-red-900'
                  : currentVehicle.status === 'Available'
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono font-bold text-xs">{currentVehicle.registrationNumber}</span>
                <span className="font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-white/80 border">
                  Status: {currentVehicle.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] mt-2 pt-2 border-t border-current/15">
                <div>
                  <span className="opacity-70 block">Route Permit:</span>
                  <span className={`font-semibold ${isPermitExpired ? 'font-bold underline' : ''}`}>
                    {currentVehicle.permitExpiryDate} {isPermitExpired ? '(EXPIRED)' : '✓'}
                  </span>
                </div>
                <div>
                  <span className="opacity-70 block">Revenue License:</span>
                  <span className={`font-semibold ${isRevenueExpired ? 'font-bold underline' : ''}`}>
                    {currentVehicle.revenueLicenseExpiryDate} {isRevenueExpired ? '(EXPIRED)' : '✓'}
                  </span>
                </div>
                <div>
                  <span className="opacity-70 block">Current Location:</span>
                  <span className="font-semibold truncate block">{currentVehicle.currentLocation}</span>
                </div>
              </div>

              {hasComplianceIssue && (
                <div className="mt-2 text-[11px] font-bold text-red-700 bg-white/90 p-2 rounded-lg border border-red-300">
                  ⚠️ This vehicle has expired regulatory documents and cannot be dispatched until renewed.
                </div>
              )}
            </div>
          )}

          {/* Driver Picker */}
          <div>
            <label htmlFor="assign-driver-select" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              2. Assign Licensed Driver / Operator
            </label>
            <select
              id="assign-driver-select"
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              aria-invalid={Boolean(fieldErrors.driverId)}
              aria-describedby={fieldErrors.driverId ? 'assign-driver-error' : undefined}
              onBlur={() => {
                setFieldErrors((prev) => ({ ...prev, driverId: selectedDriverId ? '' : 'Please assign a licensed driver / operator.' }))
              }}
              className={`w-full bg-white border rounded-xl px-4 py-2.5 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#A31736] ${fieldErrors.driverId ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
            >
              <option value="">-- Choose Driver --</option>
              {eligibleDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.licenseGrade} ({d.phone})
                  {d.assignedVehicleReg ? ` [Assigned to ${d.assignedVehicleReg}]` : ''}
                </option>
              ))}
            </select>
            {fieldErrors.driverId && <p id="assign-driver-error" className="mt-1 text-xs text-red-700">{fieldErrors.driverId}</p>}
          </div>

          {/* Supervisor Name */}
          <div>
            <label htmlFor="assign-booking-supervisor" className="block text-xs text-gray-500 mb-1 font-medium">
              Authorizing Supervisor Name / Call Sign
            </label>
            <input
              id="assign-booking-supervisor"
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
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={hasComplianceIssue || submitting}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 ${
                hasComplianceIssue
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#A31736] hover:bg-[#85122b] text-white cursor-pointer'
              }`}
            >
              <span>Dispatch Job & Alert Driver</span>
              <span>→</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
