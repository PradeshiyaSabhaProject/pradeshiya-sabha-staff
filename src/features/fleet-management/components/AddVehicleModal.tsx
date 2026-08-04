import React, { useState } from 'react'
import type { VehicleCategory, VehicleStatus, DriverRecord } from '../data/initialFleetData'

interface AddVehicleModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (vehicle: {
    registrationNumber: string
    name: string
    category: VehicleCategory
    department: string
    fuelType: 'Diesel' | 'Petrol' | 'EV'
    odometerKm: number
    yearOfManufacture: number
    status: VehicleStatus
    currentLocation: string
    assignedDriverId?: string | null
    permitExpiryDate: string
    revenueLicenseExpiryDate: string
    insuranceExpiryDate: string
  }) => void
  drivers: DriverRecord[]
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  drivers,
}) => {
  const [regNum, setRegNum] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState<VehicleCategory>('Garbage Compactor')
  const [department, setDepartment] = useState('Solid Waste Management')
  const [fuelType, setFuelType] = useState<'Diesel' | 'Petrol' | 'EV'>('Diesel')
  const [odometerKm, setOdometerKm] = useState(12000)
  const [yearOfManufacture, setYearOfManufacture] = useState(2026)
  const [currentLocation, setCurrentLocation] = useState('Municipal Central Depot - Bay 01')
  const [status] = useState<VehicleStatus>('Available')
  const [assignedDriverId, setAssignedDriverId] = useState<string>('')
  const [permitExpiryDate, setPermitExpiryDate] = useState('2027-06-30')
  const [revenueLicenseExpiryDate, setRevenueLicenseExpiryDate] = useState('2027-06-30')
  const [insuranceExpiryDate, setInsuranceExpiryDate] = useState('2027-06-30')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!regNum.trim() || !name.trim()) {
      setError('Please provide vehicle registration number and make/model name.')
      return
    }

    onAdd({
      registrationNumber: regNum.trim().toUpperCase(),
      name: name.trim(),
      category,
      department,
      fuelType,
      odometerKm: Number(odometerKm) || 0,
      yearOfManufacture: Number(yearOfManufacture) || 2026,
      status,
      currentLocation,
      assignedDriverId: assignedDriverId || null,
      permitExpiryDate,
      revenueLicenseExpiryDate,
      insuranceExpiryDate,
    })

    setRegNum('')
    setName('')
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Overlay */}
      <button
        type="button"
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 cursor-default"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal Container matching Asset/Letter Management UI */}
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden z-10 animate-fade-in flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A31736]" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">Register New Council Vehicle</h3>
              <p className="text-xs text-gray-500">
                Add a municipal fleet asset with permit tracking and driver assignment
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Section 1: Core Identification */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-1.5">
              1. Vehicle Identification & Make
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="add-veh-reg" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Registration Number *
                </label>
                <input
                  type="text"
                  id="add-veh-reg"
                  value={regNum}
                  onChange={(e) => setRegNum(e.target.value)}
                  placeholder="e.g. WP LA-4821 / CAB-9012"
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
                  required
                />
              </div>

              <div>
                <label htmlFor="add-veh-name" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Make & Model Name *
                </label>
                <input
                  type="text"
                  id="add-veh-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Isuzu Forward Compactor 10T"
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Municipal Category & Department */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-1.5">
              2. Municipal Category & Department
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="add-veh-category" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Vehicle Category
                </label>
                <select
                  id="add-veh-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as VehicleCategory)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
                >
                  <option value="Garbage Compactor">Garbage Compactor</option>
                  <option value="Water Bowser">Water Bowser</option>
                  <option value="Heavy Equipment (JCB)">Heavy Equipment (JCB)</option>
                  <option value="Official Vehicle (Cab/Van)">Official Vehicle (Cab/Van)</option>
                  <option value="Tractor & Trailer">Tractor & Trailer</option>
                  <option value="Gully Bowser">Gully Bowser</option>
                </select>
              </div>

              <div>
                <label htmlFor="add-veh-dept" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Assigned Council Department
                </label>
                <select
                  id="add-veh-dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
                >
                  <option value="Solid Waste Management">Solid Waste Management</option>
                  <option value="Roads & Works Department">Roads & Works Department</option>
                  <option value="Public Health & Sanitation">Public Health & Sanitation</option>
                  <option value="Water Supply & Infrastructure">Water Supply & Infrastructure</option>
                  <option value="Administration & Secretarial">Administration & Secretarial</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Technical Specs & Status */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-1.5">
              3. Technical Specifications & Current Status
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="add-veh-fuel" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Fuel Type
                </label>
                <select
                  id="add-veh-fuel"
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value as 'Diesel' | 'Petrol' | 'EV')}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
                >
                  <option value="Diesel">Diesel</option>
                  <option value="Petrol">Petrol</option>
                  <option value="EV">EV (Electric)</option>
                </select>
              </div>

              <div>
                <label htmlFor="add-veh-odometer" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Odometer (KM)
                </label>
                <input
                  type="number"
                  id="add-veh-odometer"
                  min="0"
                  step="100"
                  value={odometerKm}
                  onChange={(e) => setOdometerKm(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
                />
              </div>

              <div>
                <label htmlFor="add-veh-year" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Manufacture Year
                </label>
                <input
                  type="number"
                  id="add-veh-year"
                  min="1990"
                  max="2030"
                  value={yearOfManufacture}
                  onChange={(e) => setYearOfManufacture(Number(e.target.value) || 2026)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label htmlFor="add-veh-location" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Where It Is At The Moment (Location)
                </label>
                <select
                  id="add-veh-location"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
                >
                  <option value="Municipal Central Depot - Bay 01">Municipal Central Depot - Bay 01</option>
                  <option value="Municipal Central Depot - Bay 02">Municipal Central Depot - Bay 02</option>
                  <option value="Heavy Equipment Yard - Piliyandala">Heavy Equipment Yard - Piliyandala</option>
                  <option value="Municipal Works Yard - Ward 03">Municipal Works Yard - Ward 03</option>
                  <option value="Sanitation Division Garage - Ward 01">Sanitation Division Garage - Ward 01</option>
                  <option value="Municipal Main Council Premises">Municipal Main Council Premises</option>
                  <option value="Water Services Depot - East Sector">Water Services Depot - East Sector</option>
                </select>
              </div>

              <div>
                <label htmlFor="add-veh-driver" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Assign Municipal Driver / Operator
                </label>
                <select
                  id="add-veh-driver"
                  value={assignedDriverId}
                  onChange={(e) => setAssignedDriverId(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
                >
                  <option value="">-- No Assigned Driver --</option>
                  {drivers.map((drv) => (
                    <option key={drv.id} value={drv.id}>
                      {drv.name} ({drv.licenseGrade.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Regulatory Expiry Matrix */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-1.5">
              4. Regulatory Compliance & Permit Expirations
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="add-veh-permit" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Route Permit Expiry
                </label>
                <input
                  type="date"
                  id="add-veh-permit"
                  value={permitExpiryDate}
                  onChange={(e) => setPermitExpiryDate(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
                />
              </div>

              <div>
                <label htmlFor="add-veh-rev-lic" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Revenue License Expiry
                </label>
                <input
                  type="date"
                  id="add-veh-rev-lic"
                  value={revenueLicenseExpiryDate}
                  onChange={(e) => setRevenueLicenseExpiryDate(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
                />
              </div>

              <div>
                <label htmlFor="add-veh-insurance" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Insurance Policy Expiry
                </label>
                <input
                  type="date"
                  id="add-veh-insurance"
                  value={insuranceExpiryDate}
                  onChange={(e) => setInsuranceExpiryDate(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
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
              <span>Register Vehicle</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

