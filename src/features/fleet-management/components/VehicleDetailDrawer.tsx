import React from 'react'
import type { VehicleRecord } from '../data/initialFleetData'
import { getVehicleComplianceInfo } from '../hooks/useFleetData'

interface VehicleDetailDrawerProps {
  vehicle: VehicleRecord | null
  onClose: () => void
  onOpenPutInMaintenance: (v: VehicleRecord) => void
  onOpenDispatch: (v: VehicleRecord) => void
  onOpenAssignDriver: (v: VehicleRecord) => void
  onOpenRenewPermit: (v: VehicleRecord) => void
  onCompleteMaintenance: (vehicleId: string) => void
  onReturnFromMission: (vehicleId: string) => void
}

export const VehicleDetailDrawer: React.FC<VehicleDetailDrawerProps> = ({
  vehicle,
  onClose,
  onOpenPutInMaintenance,
  onOpenDispatch,
  onOpenAssignDriver,
  onOpenRenewPermit,
  onCompleteMaintenance,
  onReturnFromMission,
}) => {
  if (!vehicle) return null

  const compliance = getVehicleComplianceInfo(vehicle)

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
      case 'On Mission':
        return 'bg-blue-50 text-blue-700 border-blue-200 font-semibold'
      case 'In Maintenance':
        return 'bg-orange-50 text-orange-700 border-orange-200 font-semibold'
      case 'Permit Due':
        return 'bg-red-50 text-red-700 border-red-200 font-bold'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 font-semibold'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container matching Asset Management Detail Modal */}
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-10 animate-scale-up max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A31736]" />
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono text-xs font-bold text-[#1e3a8a] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                  {vehicle.registrationNumber}
                </span>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded border uppercase tracking-wider ${getStatusBadgeStyle(
                    vehicle.status
                  )}`}
                >
                  {vehicle.status}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-[#0f172a] tracking-tight">
                {vehicle.name} — Vehicle Inspection Dossier
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all font-bold text-lg cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Action Toolbar matching Letter & Asset Management */}
        <div className="bg-white px-6 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Quick Council Operations
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {vehicle.status !== 'In Maintenance' ? (
              <button
                type="button"
                onClick={() => onOpenPutInMaintenance(vehicle)}
                className="px-3.5 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider shadow-xs transition-all cursor-pointer"
              >
                Schedule Maintenance
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onCompleteMaintenance(vehicle.id)}
                className="px-3.5 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              >
                Complete Workshop Order
              </button>
            )}

            {vehicle.status !== 'On Mission' ? (
              <button
                type="button"
                onClick={() => onOpenDispatch(vehicle)}
                className="px-3.5 py-1.5 rounded border border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white text-xs font-semibold uppercase tracking-wider shadow-xs transition-all cursor-pointer"
              >
                Dispatch to Mission
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onReturnFromMission(vehicle.id)}
                className="px-3.5 py-1.5 rounded bg-[#1e3a8a] hover:bg-blue-900 text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              >
                Return to Depot
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenAssignDriver(vehicle)}
              className="px-3.5 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider shadow-xs transition-all cursor-pointer"
            >
              Assign Driver
            </button>

            <button
              type="button"
              onClick={() => onOpenRenewPermit(vehicle)}
              className="px-3.5 py-1.5 rounded bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              Renew Permits
            </button>
          </div>
        </div>

        {/* Scrollable Dossier Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Regulatory Compliance Alert Banner */}
          {compliance.hasAnyAlert && (
            <div className="p-4 rounded border border-red-300 bg-red-50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#A31736] text-white flex items-center justify-center font-bold shrink-0">
                  !
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#A31736] uppercase tracking-wider">
                    Legal Compliance Action Required
                  </h4>
                  <p className="text-xs text-gray-700">{compliance.alertMessage}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenRenewPermit(vehicle)}
                className="px-4 py-2 bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold rounded uppercase tracking-wider shadow-sm shrink-0 cursor-pointer"
              >
                Renew Legal Permits
              </button>
            </div>
          )}

          {/* Section 1: Mechanical & Registry Specifications */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">
              Municipal Vehicle Specifications
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-bold text-gray-400 text-xs uppercase tracking-wider">Registration #</span>
                <span className="font-mono font-bold text-[#1e3a8a]">{vehicle.registrationNumber}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-bold text-gray-400 text-xs uppercase tracking-wider">Department</span>
                <span className="font-bold text-gray-900">{vehicle.department}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-bold text-gray-400 text-xs uppercase tracking-wider">Category</span>
                <span className="font-semibold text-gray-800">{vehicle.category}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-bold text-gray-400 text-xs uppercase tracking-wider">Fuel Type</span>
                <span className="font-semibold text-gray-800">{vehicle.fuelType}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-bold text-gray-400 text-xs uppercase tracking-wider">Manufacture Year</span>
                <span className="font-semibold text-gray-800">{vehicle.yearOfManufacture}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-bold text-gray-400 text-xs uppercase tracking-wider">Odometer Reading</span>
                <span className="font-bold text-gray-900">{vehicle.odometerKm.toLocaleString()} km</span>
              </div>
            </div>
          </div>

          {/* Section 2: Where It Is At The Moment & Driver Assignment */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">
              Where It Is At The Moment & Driver Assignment
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-bold text-gray-400 text-xs uppercase tracking-wider">Current Location</span>
                <span className="font-bold text-gray-900 truncate max-w-[220px]">{vehicle.currentLocation}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-bold text-gray-400 text-xs uppercase tracking-wider">Assigned Driver</span>
                <span className="font-bold text-[#1e3a8a]">
                  {vehicle.assignedDriverName || 'Unassigned'}
                </span>
              </div>
              {vehicle.activeMission && (
                <div className="col-span-2 p-3 bg-blue-50/60 border border-blue-200 rounded text-xs space-y-1">
                  <div className="font-bold text-[#1e3a8a] uppercase tracking-wider">Active Field Mission</div>
                  <p className="text-gray-800">
                    <strong>Purpose:</strong> {vehicle.activeMission.purpose}
                  </p>
                  <p className="text-gray-600">
                    <strong>Estimated Return:</strong> {vehicle.activeMission.estimatedReturn}
                  </p>
                </div>
              )}
              {vehicle.activeMaintenance && (
                <div className="col-span-2 p-3 bg-orange-50/60 border border-orange-200 rounded text-xs space-y-1">
                  <div className="font-bold text-orange-800 uppercase tracking-wider">Active Workshop Repair</div>
                  <p className="text-gray-800">
                    <strong>Workshop:</strong> {vehicle.activeMaintenance.workshopName} ({vehicle.activeMaintenance.maintenanceType})
                  </p>
                  <p className="text-gray-600">
                    <strong>Estimated Completion:</strong> {vehicle.activeMaintenance.estimatedCompletionDate}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Legal Validity & Regulatory Expiry Matrix */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">
              Legal Compliance & Regulatory Expiry Dates
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3.5 bg-gray-50 rounded border border-gray-200 text-center">
                <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Route Permit Expiry
                </span>
                <span
                  className={`text-sm font-bold mt-1 block ${
                    compliance.isPermitOverdue ? 'text-[#A31736]' : 'text-gray-900'
                  }`}
                >
                  {vehicle.permitExpiryDate}
                </span>
              </div>

              <div className="p-3.5 bg-gray-50 rounded border border-gray-200 text-center">
                <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Revenue License Expiry
                </span>
                <span
                  className={`text-sm font-bold mt-1 block ${
                    compliance.isRevenueOverdue ? 'text-[#A31736]' : 'text-gray-900'
                  }`}
                >
                  {vehicle.revenueLicenseExpiryDate}
                </span>
              </div>

              <div className="p-3.5 bg-gray-50 rounded border border-gray-200 text-center">
                <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Insurance Expiry
                </span>
                <span
                  className={`text-sm font-bold mt-1 block ${
                    compliance.isInsuranceOverdue ? 'text-[#A31736]' : 'text-gray-900'
                  }`}
                >
                  {vehicle.insuranceExpiryDate}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Maintenance History Log */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">
              Workshop Repair History
            </h4>

            {(!vehicle.maintenanceHistory || vehicle.maintenanceHistory.length === 0) ? (
              <p className="text-xs text-gray-400 italic text-center py-4">
                No recorded maintenance logs for this vehicle.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3">DATE</th>
                      <th className="py-2.5 px-3">WORKSHOP</th>
                      <th className="py-2.5 px-3">SCOPE</th>
                      <th className="py-2.5 px-3">COST</th>
                      <th className="py-2.5 px-3">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {vehicle.maintenanceHistory.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/50">
                        <td className="py-2 px-3 font-semibold text-gray-800">{log.startDate}</td>
                        <td className="py-2 px-3 text-gray-700">{log.workshopName}</td>
                        <td className="py-2 px-3 text-gray-800 font-medium">{log.maintenanceType}</td>
                        <td className="py-2 px-3 font-bold text-gray-900">
                          LKR {log.costLKR.toLocaleString()}
                        </td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold uppercase text-[10px]">
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  )
}

