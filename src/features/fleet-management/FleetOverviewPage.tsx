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

// Icons matching other pages
const AddIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
)

const MapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
)

export const FleetOverviewPage: React.FC = () => {
  const {
    vehicles,
    filteredVehicles,
    drivers,
    stats,
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

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

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
      {/* ── Page Header matching Letter/Asset Management ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold text-[#0f172a] tracking-tight">
            Fleet Management Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1 max-w-2xl leading-relaxed">
            Real-time monitoring of municipal transport vehicles, active field dispatches, workshop maintenance orders, and regulatory route permit compliance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-4 py-2.5 rounded shadow-sm transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <AddIcon />
            <span>Add New Vehicle</span>
          </button>

          <Link
            to="/fleet/dispatch"
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2.5 rounded transition-all flex items-center gap-2 cursor-pointer shadow-sm uppercase tracking-wider"
          >
            <MapIcon />
            <span>Live Dispatch Map</span>
          </Link>
        </div>
      </div>

      {/* ── KPI Cards Bar matching Asset/Letter Overview ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Fleet */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter('All')
            setShowOnlyPermitAlerts(false)
          }}
          className="bg-white border border-gray-300 rounded p-5 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow transition-all w-full text-left font-normal"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Total Fleet
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              All Units
            </span>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{stats.total}</p>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-5 overflow-hidden">
            <div className="bg-[#1e3a8a] h-1.5 rounded-sm transition-all duration-1000" style={{ width: '100%' }} />
          </div>
        </button>

        {/* Available at Depot */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter('Available')
            setShowOnlyPermitAlerts(false)
          }}
          className={`bg-white border rounded p-5 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow transition-all w-full text-left font-normal ${statusFilter === 'Available' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-300'
            }`}
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Available at Depot
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Ready
            </span>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-emerald-600 tracking-tight">{stats.available}</p>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-5 overflow-hidden">
            <div className="bg-emerald-600 h-1.5 rounded-sm transition-all duration-1000" style={{ width: `${stats.total ? (stats.available / stats.total) * 100 : 0}%` }} />
          </div>
        </button>

        {/* Active On Mission */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter('On Mission')
            setShowOnlyPermitAlerts(false)
          }}
          className={`bg-white border rounded p-5 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow transition-all w-full text-left font-normal ${statusFilter === 'On Mission' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'
            }`}
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              On Mission / Field
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Dispatched
            </span>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-blue-600 tracking-tight">{stats.onMission}</p>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-5 overflow-hidden">
            <div className="bg-blue-600 h-1.5 rounded-sm transition-all duration-1000" style={{ width: `${stats.total ? (stats.onMission / stats.total) * 100 : 0}%` }} />
          </div>
        </button>

        {/* In Maintenance */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter('In Maintenance')
            setShowOnlyPermitAlerts(false)
          }}
          className={`bg-white border rounded p-5 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow transition-all w-full text-left font-normal ${statusFilter === 'In Maintenance' ? 'border-orange-500 ring-1 ring-orange-500' : 'border-gray-300'
            }`}
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              In Workshop
            </span>
            <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
              Maintenance
            </span>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-orange-600 tracking-tight">{stats.inMaintenance}</p>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-5 overflow-hidden">
            <div className="bg-orange-500 h-1.5 rounded-sm transition-all duration-1000" style={{ width: `${stats.total ? (stats.inMaintenance / stats.total) * 100 : 0}%` }} />
          </div>
        </button>

        {/* Permits / Legal Alerts */}
        <button
          type="button"
          onClick={() => setShowOnlyPermitAlerts(!showOnlyPermitAlerts)}
          className={`bg-white border rounded p-5 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow transition-all w-full text-left font-normal ${showOnlyPermitAlerts
              ? 'border-[#A31736] ring-1 ring-[#A31736] bg-red-50/30'
              : 'border-gray-300'
            }`}
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A31736]">
              Permits Due
            </span>
            <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              Attention
            </span>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-[#A31736] tracking-tight">{stats.permitAlerts}</p>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-5 overflow-hidden">
            <div className="bg-[#A31736] h-1.5 rounded-sm transition-all duration-1000" style={{ width: `${stats.total ? (stats.permitAlerts / stats.total) * 100 : 0}%` }} />
          </div>
        </button>
      </div>

      {/* ── Interactive Legal Compliance Banner ── */}
      {stats.permitAlerts > 0 && (
        <div className="p-4 bg-red-50 border border-red-300 rounded shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#A31736] text-white flex items-center justify-center shrink-0 font-bold text-sm">
              !
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#A31736]">
                Regulatory Compliance Notice ({stats.permitAlerts} vehicle{stats.permitAlerts > 1 ? 's' : ''} requiring renewal)
              </h3>
              <p className="text-xs text-gray-700">
                Route permit, revenue license, or insurance policies are due for renewal. Please inspect and update to prevent penalties.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowOnlyPermitAlerts(!showOnlyPermitAlerts)}
            className="px-4 py-2 bg-[#A31736] text-white font-semibold text-xs rounded hover:bg-[#801028] transition-colors shadow-sm uppercase tracking-wider shrink-0 cursor-pointer"
          >
            {showOnlyPermitAlerts ? 'Show All Vehicles' : 'Filter Due Vehicles'}
          </button>
        </div>
      )}

      {/* ── Navigation Tabs Matching Module Structure ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/fleet/overview"
            className="px-4 py-2 rounded bg-[#1e3a8a] text-white font-bold text-xs uppercase tracking-wider shadow-xs"
          >
            Dashboard
          </Link>
          <Link
            to="/fleet/vehicles"
            className="px-4 py-2 rounded bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold text-xs uppercase tracking-wider transition-all"
          >
            Vehicle Registry
          </Link>
          <Link
            to="/fleet/dispatch"
            className="px-4 py-2 rounded bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold text-xs uppercase tracking-wider transition-all"
          >
            Live Dispatch Map
          </Link>
          <Link
            to="/fleet/maintenance"
            className="px-4 py-2 rounded bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold text-xs uppercase tracking-wider transition-all"
          >
            Workshop Hub ({stats.inMaintenance})
          </Link>
          <Link
            to="/fleet/drivers"
            className="px-4 py-2 rounded bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold text-xs uppercase tracking-wider transition-all"
          >
            Driver Roster ({drivers.length})
          </Link>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded border border-gray-200">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Cards
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${viewMode === 'table' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Table
          </button>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <div className="bg-white p-4 border border-gray-300 rounded shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search registration, make, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-72 bg-white border border-gray-300 rounded px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#A31736]"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 rounded border border-gray-300 text-sm font-medium text-gray-700 bg-white"
          >
            <option value="All">All Categories</option>
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
        </div>

        <div className="text-xs text-gray-500 font-semibold w-full md:w-auto text-left md:text-right">
          Showing <span className="text-gray-900 font-bold">{filteredVehicles.length}</span> of{' '}
          {vehicles.length} vehicles
        </div>
      </div>

      {/* ── Main Content Area ── */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-white rounded border border-gray-300 p-12 text-center space-y-3">
          <p className="text-sm font-bold text-gray-700">No Municipal Vehicles Found</p>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            No council vehicles match your search keywords or active filter criteria.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setCategoryFilter('All')
              setStatusFilter('All')
              setShowOnlyPermitAlerts(false)
            }}
            className="px-4 py-2 rounded bg-[#1e3a8a] text-white text-xs font-semibold uppercase tracking-wider shadow-sm cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((v) => {
            const compliance = getVehicleComplianceInfo(v)

            return (
              <div
                key={v.id}
                className="bg-white rounded border border-gray-300 shadow-sm hover:shadow transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono text-xs font-bold text-[#1e3a8a] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          {v.registrationNumber}
                        </span>
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded border uppercase tracking-wider ${getStatusBadgeStyle(
                            v.status
                          )}`}
                        >
                          {v.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900">
                        <button
                          type="button"
                          onClick={() => setActiveInspectorVehicle(v)}
                          className="hover:text-[#1e3a8a] transition-colors cursor-pointer text-left font-bold"
                        >
                          {v.name}
                        </button>
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">{v.category} • {v.department}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveInspectorVehicle(v)}
                      className="text-xs text-[#1e3a8a] font-semibold hover:underline cursor-pointer shrink-0"
                    >
                      Inspect
                    </button>
                  </div>

                  {/* Real-time Location Box */}
                  <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center justify-between text-[11px] text-gray-500 uppercase tracking-wider font-bold mb-1">
                      <span>Where It Is At The Moment</span>
                      {v.status === 'On Mission' && (
                        <span className="text-blue-700 font-bold">Field Duty</span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-gray-800 truncate">
                      {v.currentLocation}
                    </div>

                    {v.activeMission && (
                      <p className="text-[11px] text-gray-600 mt-1 italic truncate">
                        Mission: {v.activeMission.purpose} ({v.activeMission.estimatedReturn})
                      </p>
                    )}

                    {v.activeMaintenance && (
                      <p className="text-[11px] text-orange-700 mt-1 italic truncate">
                        Workshop: {v.activeMaintenance.workshopName} ({v.activeMaintenance.maintenanceType})
                      </p>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Assigned Driver:</span>
                      <span className="font-semibold text-gray-800">
                        {v.assignedDriverName || 'Unassigned'}
                      </span>
                    </div>

                    {compliance.hasAnyAlert ? (
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded flex items-center justify-between text-xs">
                        <span className="font-bold text-red-800">{compliance.alertMessage}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedVehicleForPermit(v)}
                          className="px-2.5 py-1 bg-[#A31736] text-white rounded text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Renew
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Permit Expiry:</span>
                        <span className="font-semibold text-gray-700">{v.permitExpiryDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons matching Letter/Asset cards */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-1.5">
                  {v.status !== 'In Maintenance' ? (
                    <button
                      type="button"
                      onClick={() => setSelectedVehicleForMaintenance(v)}
                      className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-semibold text-xs transition-all uppercase tracking-wider cursor-pointer"
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
                      className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-all uppercase tracking-wider cursor-pointer"
                    >
                      Complete Service
                    </button>
                  )}

                  {v.status !== 'On Mission' ? (
                    <button
                      type="button"
                      onClick={() => setSelectedVehicleForDispatch(v)}
                      className="px-3 py-1.5 rounded border border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white font-semibold text-xs transition-all uppercase tracking-wider cursor-pointer"
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
                      className="px-3 py-1.5 rounded bg-[#1e3a8a] text-white hover:bg-blue-900 font-semibold text-xs transition-all uppercase tracking-wider cursor-pointer"
                    >
                      Return Depot
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedVehicleForDriver(v)}
                    className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-semibold text-xs transition-all uppercase tracking-wider cursor-pointer"
                  >
                    Driver
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Table View Matching Asset/Letter Management Tables */
        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch]">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6">REG NUMBER</th>
                  <th className="py-4 px-6">VEHICLE & CATEGORY</th>
                  <th className="py-4 px-6">WHERE IT IS AT THE MOMENT</th>
                  <th className="py-4 px-6">DRIVER</th>
                  <th className="py-4 px-6">STATUS</th>
                  <th className="py-4 px-6">PERMIT EXPIRY</th>
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
                          className="font-bold text-gray-900 hover:text-[#1e3a8a] cursor-pointer text-left"
                        >
                          {v.name}
                        </button>
                        <div className="text-xs text-gray-500">{v.category} • {v.department}</div>
                      </td>
                      <td className="py-3.5 px-6 font-medium text-gray-800 max-w-xs truncate">
                        {v.currentLocation}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-gray-800">
                        {v.assignedDriverName || 'Unassigned'}
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
                      <td className="py-3.5 px-6">
                        <span
                          className={`font-semibold text-xs ${compliance.isPermitOverdue ? 'text-[#A31736] font-bold' : 'text-gray-700'
                            }`}
                        >
                          {v.permitExpiryDate}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedVehicleForMaintenance(v)}
                            className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                          >
                            Maintenance
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedVehicleForDispatch(v)}
                            className="px-2.5 py-1 rounded border border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
                          >
                            Dispatch
                          </button>
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
      )}

      {/* Modals & Inspector Drawer */}
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

