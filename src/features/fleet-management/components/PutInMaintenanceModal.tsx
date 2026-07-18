import React, { useState, useEffect } from 'react'
import type { VehicleRecord } from '../data/initialFleetData'

interface PutInMaintenanceModalProps {
  isOpen: boolean
  onClose: () => void
  vehicle: VehicleRecord | null
  onSubmit: (vehicleId: string, details: {
    workshopName: string
    startDate: string
    estimatedCompletionDate: string
    maintenanceType: string
    estimatedCostLKR: number
    notes: string
  }) => void
}

export const PutInMaintenanceModal: React.FC<PutInMaintenanceModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onSubmit,
}) => {
  const [workshopName, setWorkshopName] = useState('Municipal Central Workshop')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState('')
  const [maintenanceType, setMaintenanceType] = useState('Routine Engine & Mechanical Service')
  const [estimatedCostLKR, setEstimatedCostLKR] = useState<number>(45000)

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0]
      const nextWeek = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0]
      setStartDate(today)
      setEstimatedCompletionDate(nextWeek)
      setWorkshopName('Municipal Central Workshop')
      setMaintenanceType('Routine Engine & Mechanical Service')
      setEstimatedCostLKR(45000)
    }
  }, [isOpen])

  if (!isOpen || !vehicle) return null

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(vehicle.id, {
      workshopName,
      startDate,
      estimatedCompletionDate,
      maintenanceType,
      estimatedCostLKR: Number(estimatedCostLKR) || 0,
      notes: '',
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
              <h3 className="text-lg font-bold text-gray-900">Schedule Vehicle Maintenance</h3>
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
          <div className="p-3.5 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-800 flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-orange-600 shrink-0" />
            <span>
              Putting this vehicle into maintenance will change its status to{' '}
              <strong>In Maintenance</strong> and log a workshop job order in the council service registry.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
              Workshop / Service Garage
            </label>
            <select
              value={workshopName}
              onChange={(e) => setWorkshopName(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
            >
              <option value="Municipal Central Workshop">Municipal Central Workshop</option>
              <option value="Authorized Brand Dealer Service Centre">
                Authorized Brand Dealer Service Centre
              </option>
              <option value="Hydraulic Specialist Engineering Works">
                Hydraulic Specialist Engineering Works
              </option>
              <option value="Emergency Roadside Mobile Service">
                Emergency Roadside Mobile Service
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
              Maintenance Type / Scope
            </label>
            <select
              value={maintenanceType}
              onChange={(e) => setMaintenanceType(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
            >
              <option value="Routine Engine & Mechanical Service">Routine Engine & Mechanical Service</option>
              <option value="Oil Change & Lubrication Service">Oil Change & Lubrication Service</option>
              <option value="Hydraulic System & Compactor Repair">Hydraulic System & Compactor Repair</option>
              <option value="Brake System & Suspension Overhaul">Brake System & Suspension Overhaul</option>
              <option value="Tyre Replacement & Wheel Alignment">Tyre Replacement & Wheel Alignment</option>
              <option value="Electrical & Battery System Repair">Electrical & Battery System Repair</option>
              <option value="Body Repair & Painting">Body Repair & Painting</option>
              <option value="Emergency Roadside Breakdown Repair">Emergency Roadside Breakdown Repair</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                Est. Completion Date
              </label>
              <input
                type="date"
                value={estimatedCompletionDate}
                onChange={(e) => setEstimatedCompletionDate(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
              Estimated Cost (LKR)
            </label>
            <input
              type="number"
              min="0"
              step="500"
              value={estimatedCostLKR}
              onChange={(e) => setEstimatedCostLKR(parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
              required
            />
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
              <span>Confirm & Put Into Maintenance</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

