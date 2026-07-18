import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFleetData } from './hooks/useFleetData'
import type { VehicleRecord } from './data/initialFleetData'
import { PutInMaintenanceModal } from './components/PutInMaintenanceModal'

export const FleetMaintenancePage: React.FC = () => {
  const { vehicles, putInMaintenance, completeMaintenance } = useFleetData()

  const [selectedVehicleForMaintenance, setSelectedVehicleForMaintenance] =
    useState<VehicleRecord | null>(null)

  const inMaintenanceVehicles = vehicles.filter((v) => v.status === 'In Maintenance')
  const availableOrActiveVehicles = vehicles.filter((v) => v.status !== 'In Maintenance')

  // Aggregate all maintenance logs across all vehicles
  const allLogs = vehicles.flatMap((v) =>
    (v.maintenanceHistory || []).map((log) => ({
      ...log,
      registrationNumber: v.registrationNumber,
      vehicleName: v.name,
    }))
  )

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* ── Page Header matching Letter/Asset Management ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/fleet/overview" className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a] hover:underline">
              Fleet Management
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Maintenance Workshop</span>
          </div>
          <h1 className="text-[26px] font-extrabold text-[#0f172a] tracking-tight">
            Fleet Maintenance & Workshop Hub
          </h1>
          <p className="text-gray-500 text-sm mt-1 max-w-2xl leading-relaxed">
            Schedule vehicle repairs, monitor mechanical service orders at municipal garages, and authorize return to active fleet duty.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold uppercase tracking-wider">
            {inMaintenanceVehicles.length} Vehicles Under Active Repair
          </span>
        </div>
      </div>

      {/* ── Active Maintenance Workshop Orders ── */}
      <div className="bg-white rounded border border-gray-300 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">Vehicles Currently In Workshop</h2>
          <p className="text-xs text-gray-500">Vehicles stationed at service garages awaiting repair completion</p>
        </div>

        {inMaintenanceVehicles.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            No vehicles are currently undergoing maintenance. All municipal fleet units are operational.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
            {inMaintenanceVehicles.map((v) => (
              <div
                key={v.id}
                className="p-5 rounded border border-orange-200 bg-orange-50/40 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-orange-900 bg-orange-100 px-2.5 py-0.5 rounded border border-orange-300">
                      {v.registrationNumber}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 mt-1">{v.name}</h3>
                    <p className="text-xs text-gray-600">{v.category} • {v.department}</p>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 bg-orange-100 text-orange-800 font-bold rounded border border-orange-300 uppercase tracking-wider">
                    In Workshop
                  </span>
                </div>

                <div className="p-3.5 bg-white rounded border border-orange-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Workshop / Garage:</span>
                    <span className="font-bold text-gray-800">{v.activeMaintenance?.workshopName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Repair Scope:</span>
                    <span className="font-semibold text-orange-800">{v.activeMaintenance?.maintenanceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Est. Completion:</span>
                    <span className="font-bold text-gray-900">{v.activeMaintenance?.estimatedCompletionDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Est. Cost:</span>
                    <span className="font-bold text-gray-900">
                      LKR {(v.activeMaintenance?.estimatedCostLKR || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    onClick={() => completeMaintenance(v.id)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                  >
                    Complete Service & Return to Fleet
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Quick Action: Put Operational Vehicle Into Maintenance ── */}
      <div className="bg-white rounded border border-gray-300 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">Put Operational Vehicle Into Maintenance</h2>
          <p className="text-xs text-gray-500">
            Select a vehicle to log a workshop order or schedule service
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-5">
          {availableOrActiveVehicles.map((v) => (
            <div
              key={v.id}
              className="p-4 rounded border border-gray-300 bg-gray-50/60 flex items-center justify-between gap-3"
            >
              <div>
                <span className="font-mono text-xs font-bold text-[#1e3a8a] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  {v.registrationNumber}
                </span>
                <h4 className="text-sm font-bold text-gray-900 mt-1">{v.name}</h4>
                <p className="text-xs text-gray-500">Odometer: {v.odometerKm.toLocaleString()} km</p>
              </div>

              <button
                onClick={() => setSelectedVehicleForMaintenance(v)}
                className="px-3.5 py-1.5 bg-[#A31736] hover:bg-[#801028] text-white rounded text-xs font-semibold uppercase tracking-wider shadow-sm shrink-0 cursor-pointer"
              >
                Put in Service
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Comprehensive Service History Log ── */}
      <div className="bg-white rounded border border-gray-300 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">Comprehensive Council Maintenance History</h2>
          <p className="text-xs text-gray-500">Historical log of all workshop repairs and routine services</p>
        </div>

        <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">REGISTRATION #</th>
                <th className="py-4 px-6">VEHICLE</th>
                <th className="py-4 px-6">WORKSHOP</th>
                <th className="py-4 px-6">MAINTENANCE SCOPE</th>
                <th className="py-4 px-6">DATES</th>
                <th className="py-4 px-6">COST (LKR)</th>
                <th className="py-4 px-6">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {allLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-bold text-[#1e3a8a]">
                    {log.registrationNumber}
                  </td>
                  <td className="py-3.5 px-6 font-bold text-gray-900">{log.vehicleName}</td>
                  <td className="py-3.5 px-6 text-xs font-medium text-gray-700">{log.workshopName}</td>
                  <td className="py-3.5 px-6 text-xs text-gray-800">
                    <div className="font-semibold">{log.maintenanceType}</div>
                    <div className="text-gray-500 italic text-[11px]">{log.notes}</div>
                  </td>
                  <td className="py-3.5 px-6 text-xs">
                    <div>Start: {log.startDate}</div>
                    <div className="text-gray-500">Est: {log.estimatedCompletionDate}</div>
                  </td>
                  <td className="py-3.5 px-6 font-bold text-gray-900">
                    LKR {log.costLKR.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded border uppercase tracking-wider font-semibold ${
                        log.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PutInMaintenanceModal
        isOpen={!!selectedVehicleForMaintenance}
        onClose={() => setSelectedVehicleForMaintenance(null)}
        vehicle={selectedVehicleForMaintenance}
        onSubmit={putInMaintenance}
      />
    </div>
  )
}

