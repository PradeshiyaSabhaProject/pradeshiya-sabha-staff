import React, { useState, useEffect } from 'react'
import type { VehicleRecord, DriverRecord } from '../data/initialFleetData'

interface AssignDriverModalProps {
  isOpen: boolean
  onClose: () => void
  vehicle: VehicleRecord | null
  drivers: DriverRecord[]
  onAssign: (vehicleId: string, driverId: string | null) => void
}

export const AssignDriverModal: React.FC<AssignDriverModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  drivers,
  onAssign,
}) => {
  const [selectedDriverId, setSelectedDriverId] = useState<string>('')

  useEffect(() => {
    if (isOpen && vehicle) {
      setSelectedDriverId(vehicle.assignedDriverId || '')
    }
  }, [isOpen, vehicle])

  if (!isOpen || !vehicle) return null

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAssign(vehicle.id, selectedDriverId ? selectedDriverId : null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container matching Asset/Letter Management UI */}
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden z-10 animate-fade-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A31736]" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">Assign Driver & Operator</h3>
              <p className="text-xs text-gray-500 font-mono">
                {vehicle.registrationNumber} â€¢ {vehicle.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer font-bold text-lg"
          >
            Ã—
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#1e3a8a] shrink-0" />
            <span>
              Select a licensed municipal driver or equipment operator for this vehicle. Unassigning will make the vehicle available for new drivers.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
              Select Municipal Driver / Operator
            </label>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
            >
              <option value="">-- Unassign Driver (No Driver Assigned) --</option>
              {drivers.map((drv) => {
                const isAssignedElsewhere =
                  drv.assignedVehicleId && drv.assignedVehicleId !== vehicle.id
                return (
                  <option key={drv.id} value={drv.id}>
                    {drv.name} â€” {drv.licenseGrade} ({drv.phone})
                    {isAssignedElsewhere ? ` [Currently on ${drv.assignedVehicleReg}]` : ''}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              Save Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

