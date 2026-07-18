import React, { useState } from 'react'
import type { VehicleRecord, DriverRecord } from '../data/initialFleetData'

interface DispatchVehicleModalProps {
  isOpen: boolean
  onClose: () => void
  vehicle: VehicleRecord | null
  drivers: DriverRecord[]
  onDispatch: (
    vehicleId: string,
    details: {
      destinationWard: string
      purpose: string
      estimatedReturn: string
      driverId?: string | null
    }
  ) => void
}

export const DispatchVehicleModal: React.FC<DispatchVehicleModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  drivers,
  onDispatch,
}) => {
  const [destinationWard, setDestinationWard] = useState(
    'Ward 01 - Town Center & Market Area'
  )
  const [purpose, setPurpose] = useState(
    'Routine Municipal Solid Waste Collection'
  )
  const [returnDate, setReturnDate] = useState(() => new Date().toISOString().split('T')[0])
  const [returnTime, setReturnTime] = useState('16:30')
  const [selectedDriverId, setSelectedDriverId] = useState<string>('')
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
  const [prevVehicleId, setPrevVehicleId] = useState(vehicle?.id)

  if (isOpen !== prevIsOpen || vehicle?.id !== prevVehicleId) {
    setPrevIsOpen(isOpen)
    setPrevVehicleId(vehicle?.id)
    if (isOpen && vehicle) {
      setDestinationWard('Ward 01 - Town Center & Market Area')
      setPurpose('Routine Municipal Solid Waste Collection')
      setReturnDate(new Date().toISOString().split('T')[0])
      setReturnTime('16:30')
      setSelectedDriverId(vehicle.assignedDriverId || '')
    }
  }

  if (!isOpen || !vehicle) return null

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formattedReturn = `${returnDate} at ${returnTime}`
    onDispatch(vehicle.id, {
      destinationWard,
      purpose,
      estimatedReturn: formattedReturn,
      driverId: selectedDriverId ? selectedDriverId : null,
    })
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
              <h3 className="text-lg font-bold text-gray-900">Dispatch Vehicle to Field Mission</h3>
              <p className="text-xs text-gray-500 font-mono">
                {vehicle.registrationNumber} • {vehicle.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer font-bold text-lg"
          >
            ×
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#1e3a8a] shrink-0" />
            <span>
              Dispatching will assign this vehicle to field duty and update its ward location on the live map.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
              Destination Ward / Location
            </label>
            <select
              value={destinationWard}
              onChange={(e) => setDestinationWard(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
            >
              <option value="Ward 01 - Town Center & Market Area">
                Ward 01 - Town Center & Market Area
              </option>
              <option value="Ward 03 - Piliyandala Road & Commercial">
                Ward 03 - Piliyandala Road & Commercial
              </option>
              <option value="Ward 04 - Solid Waste Route A">
                Ward 04 - Solid Waste Route A
              </option>
              <option value="Ward 07 - Road Grading Project">
                Ward 07 - Road Grading Project
              </option>
              <option value="Ward 08 - Rural Access Roads">
                Ward 08 - Rural Access Roads
              </option>
              <option value="Municipal Emergency Flood Relief Sector">
                Municipal Emergency Flood Relief Sector
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
              Purpose / Task Description
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Garbage collection / Culvert repair inspection"
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
              required
            />
          </div>

          {/* Calendar & Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                Estimated Return Date
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                Estimated Return Time
              </label>
              <input
                type="time"
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
              Assigned Driver for Mission
            </label>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
            >
              <option value="">-- No Specific Driver --</option>
              {drivers.map((drv) => (
                <option key={drv.id} value={drv.id}>
                  {drv.name} ({drv.licenseGrade.split(' ')[0]})
                </option>
              ))}
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
              className="px-6 py-2.5 rounded bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Dispatch Vehicle</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

