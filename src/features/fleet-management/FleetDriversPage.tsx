import React, { useState } from 'react'
import { useFleetData } from './hooks/useFleetData'
import type { VehicleRecord } from './data/initialFleetData'
import { AssignDriverModal } from './components/AssignDriverModal'

export const FleetDriversPage: React.FC = () => {
  const { vehicles, drivers, assignDriver } = useFleetData()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVehicleForDriver, setSelectedVehicleForDriver] =
    useState<VehicleRecord | null>(null)

  const filteredDrivers = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.assignedVehicleReg?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const assignedCount = drivers.filter((d) => d.assignedVehicleId).length

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* ── Page Header matching Overview Design Language ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Driver & Equipment Operator Roster
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 max-w-2xl">
            Manage licensed municipal drivers, verify license categories, and assign operators to council transport vehicles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-[#1e3a8a] rounded text-xs font-bold uppercase tracking-wider">
            {assignedCount} of {drivers.length} Drivers Assigned
          </span>
        </div>
      </div>

      {/* ── Search Toolbar ── */}
      <div className="bg-white p-4 border border-gray-300 rounded shadow-sm flex items-center justify-between">
        <input
          type="text"
          placeholder="Search driver name, employee ID, license number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-96 bg-white border border-gray-300 rounded px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#A31736]"
        />

        <span className="text-xs text-gray-500 font-semibold">
          Showing <strong className="text-gray-900">{filteredDrivers.length}</strong> drivers
        </span>
      </div>

      {/* ── Driver Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredDrivers.map((drv) => {
          const assignedVehicle = vehicles.find((v) => v.id === drv.assignedVehicleId)

          return (
            <div
              key={drv.id}
              className="bg-white rounded border border-gray-300 p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-11 h-11 rounded bg-[#1e3a8a] text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                    {drv.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded border uppercase tracking-wider font-semibold ${
                      drv.status === 'On Duty'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    {drv.status}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="text-base font-bold text-gray-900">{drv.name}</h3>
                  <p className="text-xs font-mono text-gray-500">{drv.employeeId} • {drv.phone}</p>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-xs">
                  <div className="text-gray-500">License Number:</div>
                  <div className="font-mono font-bold text-gray-800">{drv.licenseNumber}</div>
                  <div className="text-[10px] text-[#1e3a8a] font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded inline-block mt-1 uppercase tracking-wider">
                    {drv.licenseGrade}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1.5">
                  Assigned Vehicle
                </div>
                {assignedVehicle ? (
                  <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-[#1e3a8a] text-xs">
                        {assignedVehicle.registrationNumber}
                      </span>
                      <p className="text-xs text-gray-700 truncate max-w-[150px]">
                        {assignedVehicle.name}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedVehicleForDriver(assignedVehicle)}
                      className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-300 rounded text-[11px] font-bold uppercase tracking-wider text-gray-700 cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 border border-dashed border-gray-300 rounded text-center">
                    <p className="text-xs text-gray-500">No Vehicle Assigned</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Quick Vehicle Assignment Board ── */}
      <div className="bg-white rounded border border-gray-300 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">Vehicle Assignment Matrix</h2>
          <p className="text-xs text-gray-500">Select any vehicle to assign or re-assign a driver</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-5">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="p-4 rounded border border-gray-300 bg-gray-50/60 flex items-center justify-between gap-3"
            >
              <div>
                <span className="font-mono text-xs font-bold text-[#1e3a8a] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  {v.registrationNumber}
                </span>
                <h4 className="text-sm font-bold text-gray-900 mt-1">{v.name}</h4>
                <p className="text-xs text-gray-500">
                  Driver: <strong className="text-gray-800">{v.assignedDriverName || 'Unassigned'}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedVehicleForDriver(v)}
                className="px-3.5 py-1.5 bg-[#A31736] hover:bg-[#801028] text-white rounded text-xs font-semibold uppercase tracking-wider shadow-sm shrink-0 cursor-pointer"
              >
                Assign
              </button>
            </div>
          ))}
        </div>
      </div>

      <AssignDriverModal
        isOpen={!!selectedVehicleForDriver}
        onClose={() => setSelectedVehicleForDriver(null)}
        vehicle={selectedVehicleForDriver}
        drivers={drivers}
        onAssign={assignDriver}
      />
    </div>
  )
}

