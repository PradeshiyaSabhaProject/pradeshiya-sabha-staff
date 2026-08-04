import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFleetData, getVehicleComplianceInfo } from './hooks/useFleetData'
import type { VehicleRecord } from './data/initialFleetData'
import { AddVehicleModal } from './components/AddVehicleModal'
import { PutInMaintenanceModal } from './components/PutInMaintenanceModal'
import { DispatchVehicleModal } from './components/DispatchVehicleModal'
import { AssignDriverModal } from './components/AssignDriverModal'
import { RenewPermitModal } from './components/RenewPermitModal'
import { VehicleDetailDrawer } from './components/VehicleDetailDrawer'

const AddIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
)

export const FleetDirectoryPage: React.FC = () => {
  const {
    vehicles,
    filteredVehicles,
    drivers,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    showOnlyPermitAlerts,
    setShowOnlyPermitAlerts,
    submitApprovalRequest,
  } = useFleetData()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedVehicleForMaintenance, setSelectedVehicleForMaintenance] =
    useState<VehicleRecord | null>(null)
  const [selectedVehicleForDispatch, setSelectedVehicleForDispatch] =
    useState<VehicleRecord | null>(null)
  const [selectedVehicleForDriver, setSelectedVehicleForDriver] =
    useState<VehicleRecord | null>(null)
  const [selectedVehicleForPermit, setSelectedVehicleForPermit] =
    useState<VehicleRecord | null>(null)
  const [activeInspectorVehicle, setActiveInspectorVehicle] =
    useState<VehicleRecord | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

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
    <div className="space-y-6 animate-fade-in pb-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/fleet/overview" className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a] hover:underline">
              Fleet Management
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Vehicle Directory</span>
          </div>
          <h1 className="text-[26px] font-extrabold text-[#0f172a] tracking-tight">
            Municipal Vehicle Directory
          </h1>
          <p className="text-gray-500 text-sm mt-1 max-w-2xl leading-relaxed">
            Complete inventory of Pradeshiya Sabha municipal vehicles, permit validity dates, driver assignments, and current real-time locations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-4 py-2.5 rounded shadow-sm transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <AddIcon />
            <span>Add New Vehicle</span>
          </button>

          <Link
            to="/fleet/approvals"
            className="bg-[#1e3a8a] hover:bg-blue-900 text-white text-xs font-semibold px-4 py-2.5 rounded shadow-sm transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <span>Authorizations Desk</span>
          </Link>
        </div>
      </div>

      {/* ── Filter and Search Toolbar ── */}
      <div className="bg-white p-4 border border-gray-300 rounded shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <input
            type="text"
            placeholder="Search reg number, name, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-80 bg-white border border-gray-300 rounded px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#A31736]"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 rounded border border-gray-300 text-sm font-medium text-gray-700 bg-white"
          >
            <option value="All">All Categories ({vehicles.length})</option>
            <option value="Garbage Compactor">Garbage Compactor</option>
            <option value="Water Bowser">Water Bowser</option>
            <option value="Heavy Equipment (JCB)">Heavy Equipment (JCB)</option>
            <option value="Official Vehicle (Cab/Van)">Official Vehicle (Cab/Van)</option>
            <option value="Tractor & Trailer">Tractor & Trailer</option>
            <option value="Gully Bowser">Gully Bowser</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 rounded border border-gray-300 text-sm font-medium text-gray-700 bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Mission">On Mission</option>
            <option value="In Maintenance">In Maintenance</option>
            <option value="Permit Due">Permit Due</option>
          </select>

          <button
            type="button"
            onClick={() => setShowOnlyPermitAlerts(!showOnlyPermitAlerts)}
            className={`w-full sm:w-auto px-4 py-2 rounded border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer text-center ${
              showOnlyPermitAlerts
                ? 'bg-[#A31736] border-[#A31736] text-white shadow-sm'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {showOnlyPermitAlerts ? '✓ Permits Due Only' : 'Filter Permits Due'}
          </button>
        </div>

        <div className="text-xs text-gray-500 font-semibold w-full lg:w-auto text-left lg:text-right">
          Showing <span className="text-gray-900 font-bold">{filteredVehicles.length}</span> vehicles
        </div>
      </div>

      {/* ── Directory Table Matching Asset/Letter Management ── */}
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch]">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">REGISTRATION #</th>
                <th className="py-4 px-6">VEHICLE MAKE & MODEL</th>
                <th className="py-4 px-6">CATEGORY & DEPT</th>
                <th className="py-4 px-6">WHERE IT IS AT THE MOMENT</th>
                <th className="py-4 px-6">ASSIGNED DRIVER</th>
                <th className="py-4 px-6">PERMIT VALIDITY</th>
                <th className="py-4 px-6">STATUS</th>
                <th className="py-4 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredVehicles.map((v) => {
                const compliance = getVehicleComplianceInfo(v)

                return (
                  <tr key={v.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-[#1e3a8a]">
                      {v.registrationNumber}
                    </td>
                    <td className="py-3.5 px-6">
                      <button
                        type="button"
                        onClick={() => setActiveInspectorVehicle(v)}
                        className="font-bold text-gray-900 hover:text-[#1e3a8a] cursor-pointer text-left font-normal"
                      >
                        {v.name}
                      </button>
                      <div className="text-xs text-gray-500">Year {v.yearOfManufacture} • {v.fuelType}</div>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-gray-800">{v.category}</div>
                      <div className="text-xs text-gray-500">{v.department}</div>
                    </td>
                    <td className="py-3.5 px-6 font-medium text-gray-800 max-w-xs truncate">
                      {v.currentLocation}
                    </td>
                    <td className="py-3.5 px-6 font-medium text-gray-800">
                      {v.assignedDriverName || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-6">
                      {compliance.hasAnyAlert ? (
                        <span className="text-[#A31736] font-bold text-xs">
                          Due ({v.permitExpiryDate})
                        </span>
                      ) : (
                        <span className="text-gray-700 font-medium text-xs">
                          Valid ({v.permitExpiryDate})
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded border uppercase tracking-wider ${getStatusBadgeStyle(
                          v.status
                        )}`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveInspectorVehicle(v)}
                          className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                        >
                          Inspect
                        </button>
                        {v.status !== 'In Maintenance' ? (
                          <button
                            type="button"
                            onClick={() => setSelectedVehicleForMaintenance(v)}
                            className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                          >
                            Maintenance
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              submitApprovalRequest(
                                'COMPLETE_MAINTENANCE',
                                `Sign-Off Repair Completion for ${v.registrationNumber}`,
                                `Workshop completion inspection and return to active depot availability.`,
                                { vehicleId: v.id },
                                { targetVehicleId: v.id, targetVehicleReg: v.registrationNumber }
                              )
                              setToastMsg(`Repair completion request submitted for ${v.registrationNumber}.`)
                            }}
                            className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
                          >
                            Return
                          </button>
                        )}

                        {v.status !== 'On Mission' ? (
                          <button
                            type="button"
                            onClick={() => setSelectedVehicleForDispatch(v)}
                            className="px-2.5 py-1 rounded border border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
                          >
                            Dispatch
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              submitApprovalRequest(
                                'RETURN_MISSION',
                                `Log Field Mission Return for ${v.registrationNumber}`,
                                `Confirming vehicle return from field assignment back to municipal depot.`,
                                { vehicleId: v.id },
                                { targetVehicleId: v.id, targetVehicleReg: v.registrationNumber }
                              )
                              setToastMsg(`Mission return request submitted for ${v.registrationNumber}.`)
                            }}
                            className="px-2.5 py-1 rounded bg-[#1e3a8a] text-white hover:bg-blue-900 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                          >
                            Return
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedVehicleForDriver(v)}
                          className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                        >
                          Driver
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals & Drawer */}
      <AddVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={(data) => {
          submitApprovalRequest(
            'ADD_VEHICLE',
            `Register Fleet Asset: ${data.registrationNumber}`,
            `Registration request for ${data.name} (${data.category}) under ${data.department}.`,
            data,
            { targetVehicleReg: data.registrationNumber }
          )
          setToastMsg(`Approval request submitted for registering ${data.registrationNumber}.`)
        }}
        drivers={drivers}
      />

      <PutInMaintenanceModal
        isOpen={!!selectedVehicleForMaintenance}
        onClose={() => setSelectedVehicleForMaintenance(null)}
        vehicle={selectedVehicleForMaintenance}
        onSubmit={(vId, maintenanceData) => {
          const veh = vehicles.find((v) => v.id === vId)
          submitApprovalRequest(
            'SCHEDULE_MAINTENANCE',
            `Schedule Workshop Maintenance for ${veh?.registrationNumber || vId}`,
            `Requested ${maintenanceData.maintenanceType} at ${maintenanceData.workshopName}.`,
            { vehicleId: vId, maintenanceData },
            { targetVehicleId: vId, targetVehicleReg: veh?.registrationNumber }
          )
          setToastMsg(`Maintenance authorization request submitted for ${veh?.registrationNumber || vId}.`)
        }}
      />

      <DispatchVehicleModal
        isOpen={!!selectedVehicleForDispatch}
        onClose={() => setSelectedVehicleForDispatch(null)}
        vehicle={selectedVehicleForDispatch}
        drivers={drivers}
        onDispatch={(vId, mission) => {
          const veh = vehicles.find((v) => v.id === vId)
          submitApprovalRequest(
            'DISPATCH_VEHICLE',
            `Dispatch Vehicle ${veh?.registrationNumber || vId} to ${mission.destinationWard}`,
            `Mission purpose: ${mission.purpose} (Est. return: ${mission.estimatedReturn}).`,
            { vehicleId: vId, mission },
            { targetVehicleId: vId, targetVehicleReg: veh?.registrationNumber }
          )
          setToastMsg(`Dispatch approval request submitted for ${veh?.registrationNumber || vId}.`)
        }}
      />

      <AssignDriverModal
        isOpen={!!selectedVehicleForDriver}
        onClose={() => setSelectedVehicleForDriver(null)}
        vehicle={selectedVehicleForDriver}
        drivers={drivers}
        onAssign={(vId, driverId) => {
          const veh = vehicles.find((v) => v.id === vId)
          const drv = drivers.find((d) => d.id === driverId)
          submitApprovalRequest(
            'ASSIGN_DRIVER',
            `Assign Driver ${drv?.name || 'Operator'} to ${veh?.registrationNumber || vId}`,
            `Formal operator allocation for council vehicle ${veh?.registrationNumber}.`,
            { vehicleId: vId, driverId },
            { targetVehicleId: vId, targetVehicleReg: veh?.registrationNumber, targetDriverName: drv?.name }
          )
          setToastMsg(`Driver assignment request submitted for ${veh?.registrationNumber || vId}.`)
        }}
      />

      <RenewPermitModal
        isOpen={!!selectedVehicleForPermit}
        onClose={() => setSelectedVehicleForPermit(null)}
        vehicle={selectedVehicleForPermit}
        onRenew={(vId, dates) => {
          const veh = vehicles.find((v) => v.id === vId)
          submitApprovalRequest(
            'RENEW_PERMIT',
            `Permit & Regulatory Renewal for ${veh?.registrationNumber || vId}`,
            `Requested renewal of municipal route permits and insurance validities.`,
            { vehicleId: vId, dates },
            { targetVehicleId: vId, targetVehicleReg: veh?.registrationNumber }
          )
          setToastMsg(`Permit renewal approval request submitted for ${veh?.registrationNumber || vId}.`)
        }}
      />

      <VehicleDetailDrawer
        vehicle={activeInspectorVehicle}
        onClose={() => setActiveInspectorVehicle(null)}
        onOpenPutInMaintenance={(v) => {
          setActiveInspectorVehicle(null)
          setSelectedVehicleForMaintenance(v)
        }}
        onOpenDispatch={(v) => {
          setActiveInspectorVehicle(null)
          setSelectedVehicleForDispatch(v)
        }}
        onOpenAssignDriver={(v) => {
          setActiveInspectorVehicle(null)
          setSelectedVehicleForDriver(v)
        }}
        onOpenRenewPermit={(v) => {
          setActiveInspectorVehicle(null)
          setSelectedVehicleForPermit(v)
        }}
        onCompleteMaintenance={(vId) => {
          const veh = vehicles.find((v) => v.id === vId)
          submitApprovalRequest(
            'COMPLETE_MAINTENANCE',
            `Sign-Off Repair Completion for ${veh?.registrationNumber || vId}`,
            `Workshop completion inspection and return to active depot availability.`,
            { vehicleId: vId },
            { targetVehicleId: vId, targetVehicleReg: veh?.registrationNumber }
          )
          setToastMsg(`Repair completion request submitted for ${veh?.registrationNumber || vId}.`)
          setActiveInspectorVehicle(null)
        }}
        onReturnFromMission={(vId) => {
          const veh = vehicles.find((v) => v.id === vId)
          submitApprovalRequest(
            'RETURN_MISSION',
            `Log Field Mission Return for ${veh?.registrationNumber || vId}`,
            `Confirming vehicle return from field assignment back to municipal depot.`,
            { vehicleId: vId },
            { targetVehicleId: vId, targetVehicleReg: veh?.registrationNumber }
          )
          setToastMsg(`Mission return request submitted for ${veh?.registrationNumber || vId}.`)
          setActiveInspectorVehicle(null)
        }}
      />

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] text-white px-5 py-3.5 rounded-xl shadow-2xl border border-gray-700 flex items-center gap-3 animate-slide-up">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="text-gray-400 hover:text-white font-bold ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

