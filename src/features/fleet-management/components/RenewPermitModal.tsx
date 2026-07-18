import React, { useState, useEffect } from 'react'
import type { VehicleRecord } from '../data/initialFleetData'

interface RenewPermitModalProps {
  isOpen: boolean
  onClose: () => void
  vehicle: VehicleRecord | null
  onRenew: (
    vehicleId: string,
    dates: {
      permitExpiryDate: string
      revenueLicenseExpiryDate: string
      insuranceExpiryDate: string
    }
  ) => void
}

export const RenewPermitModal: React.FC<RenewPermitModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onRenew,
}) => {
  const [permitExpiryDate, setPermitExpiryDate] = useState('')
  const [revenueLicenseExpiryDate, setRevenueLicenseExpiryDate] = useState('')
  const [insuranceExpiryDate, setInsuranceExpiryDate] = useState('')

  useEffect(() => {
    if (isOpen && vehicle) {
      setPermitExpiryDate(vehicle.permitExpiryDate)
      setRevenueLicenseExpiryDate(vehicle.revenueLicenseExpiryDate)
      setInsuranceExpiryDate(vehicle.insuranceExpiryDate)
    }
  }, [isOpen, vehicle])

  if (!isOpen || !vehicle) return null

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onRenew(vehicle.id, {
      permitExpiryDate,
      revenueLicenseExpiryDate,
      insuranceExpiryDate,
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
              <h3 className="text-lg font-bold text-gray-900">Renew Regulatory Permits & Insurance</h3>
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
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#A31736] shrink-0" />
            <span>
              Update expiration dates after completing municipal permit renewals and insurance payments.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
              Route Permit Expiry Date
            </label>
            <input
              type="date"
              value={permitExpiryDate}
              onChange={(e) => setPermitExpiryDate(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
              Revenue License Expiry Date
            </label>
            <input
              type="date"
              value={revenueLicenseExpiryDate}
              onChange={(e) => setRevenueLicenseExpiryDate(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
              Insurance Policy Expiry Date
            </label>
            <input
              type="date"
              value={insuranceExpiryDate}
              onChange={(e) => setInsuranceExpiryDate(e.target.value)}
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
              className="px-6 py-2.5 rounded bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              Save & Clear Permit Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

