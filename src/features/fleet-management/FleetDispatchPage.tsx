import React, { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import { useFleetData } from './hooks/useFleetData'
import type { VehicleRecord, VehicleStatus } from './data/initialFleetData'
import { DispatchVehicleModal } from './components/DispatchVehicleModal'

// ─────────────────────────────────────────────────────────────────────────────
// Icons matching Interactive GIS Mapping
// ─────────────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const LayersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-500">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
)

const LocateIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-700">
    <circle cx="12" cy="12" r="3" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
)

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-gray-700">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const MinusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-gray-700">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

// Helper to determine realistic GPS coordinates in Homagama / Pradeshiya Sabha area
function getVehicleCoordinates(v: VehicleRecord, index: number): [number, number] {
  if (v.gpsTracking) {
    return [v.gpsTracking.lat, v.gpsTracking.lng]
  }
  const loc = (v.currentLocation || '').toLowerCase()
  if (loc.includes('ward 01') || loc.includes('town')) {
    return [6.8415 + (index % 3) * 0.003, 79.9982 + (index % 4) * 0.003]
  }
  if (loc.includes('ward 03') || loc.includes('piliyandala')) {
    return [6.8120 + (index % 3) * 0.004, 79.9240 + (index % 4) * 0.004]
  }
  if (loc.includes('ward 04') || loc.includes('waste')) {
    return [6.8525 + (index % 3) * 0.003, 79.9650 + (index % 4) * 0.003]
  }
  if (loc.includes('ward 07') || loc.includes('grading')) {
    return [6.8640 + (index % 3) * 0.003, 79.9890 + (index % 4) * 0.003]
  }
  if (loc.includes('ward 08') || loc.includes('rural')) {
    return [6.8280 + (index % 3) * 0.004, 80.0120 + (index % 4) * 0.003]
  }
  if (v.status === 'In Maintenance') {
    return [6.8350 + index * 0.0015, 79.9880 + index * 0.0015]
  }
  // Central Depot default
  return [6.8440 + index * 0.002, 79.9960 + index * 0.002]
}

function getStatusBadgeStyle(status: VehicleStatus): string {
  switch (status) {
    case 'On Mission':
      return 'bg-blue-50 text-blue-700'
    case 'Available':
      return 'bg-emerald-50 text-emerald-700'
    default:
      return 'bg-orange-50 text-orange-700'
  }
}

function getMarkerBgStyle(status: VehicleStatus): string {
  switch (status) {
    case 'On Mission':
      return 'background: #ea580c; border: 2.5px solid white;'
    case 'Available':
      return 'background: #059669; border: 2.5px solid white;'
    case 'In Maintenance':
      return 'background: #d97706; border: 2.5px solid white;'
    default:
      return 'background: #A31736; border: 2.5px solid white;'
  }
}

function getMarkerBadgeColor(status: VehicleStatus): string {
  switch (status) {
    case 'On Mission':
      return 'color: #ea580c; background: #fff7ed;'
    case 'Available':
      return 'color: #059669; background: #ecfdf5;'
    case 'In Maintenance':
      return 'color: #d97706; background: #fef3c7;'
    default:
      return 'color: #A31736; background: #fef2f2;'
  }
}

export const FleetDispatchPage: React.FC = () => {
  const { vehicles, drivers, submitApprovalRequest } = useFleetData()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeLayers, setActiveLayers] = useState<Record<VehicleStatus, boolean>>({
    'Available': true,
    'On Mission': true,
    'In Maintenance': true,
    'Permit Due': true,
  })
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRecord | null>(null)
  const [selectedVehicleForDispatch, setSelectedVehicleForDispatch] = useState<VehicleRecord | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Leaflet references
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null)

  // Toggle status layer checkbox
  const toggleLayer = (status: VehicleStatus) => {
    setActiveLayers((prev) => ({ ...prev, [status]: !prev[status] }))
  }

  // Filtered vehicles shown on map
  const visibleVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (!activeLayers[v.status]) return false

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        const matches =
          v.registrationNumber.toLowerCase().includes(q) ||
          v.name.toLowerCase().includes(q) ||
          (v.assignedDriverName || '').toLowerCase().includes(q) ||
          v.currentLocation.toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
  }, [vehicles, activeLayers, searchQuery])

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    // Center on Western Province / Homagama municipal region
    const initialCenter: [number, number] = [6.8435, 79.9750]
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    const layerGroup = L.layerGroup().addTo(map)
    markersLayerGroupRef.current = layerGroup
    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Render/Update Leaflet Markers whenever visibleVehicles change
  useEffect(() => {
    const map = mapInstanceRef.current
    const layerGroup = markersLayerGroupRef.current
    if (!map || !layerGroup) return

    layerGroup.clearLayers()

    visibleVehicles.forEach((veh, index) => {
      const [lat, lng] = getVehicleCoordinates(veh, index)

      // Draw polyline route trail
      if (veh.gpsTracking?.routeTrail && veh.gpsTracking.routeTrail.length > 1) {
        L.polyline(veh.gpsTracking.routeTrail, {
          color: veh.category.includes('Tractor') || veh.category.includes('Compactor') ? '#ea580c' : '#2563eb',
          weight: 4,
          opacity: 0.75,
          dashArray: '6, 6',
        }).addTo(layerGroup)
      }

      const bgStyle = getMarkerBgStyle(veh.status)
      const vehicleEmoji = veh.category.includes('Tractor') ? '🚜' : veh.category.includes('Compactor') ? '🚛' : '🚚'

      const customIcon = L.divIcon({
        className: 'custom-fleet-pin',
        html: `
          <div style="position: relative; width: 36px; height: 36px; border-radius: 50%; ${bgStyle} box-shadow: 0 4px 8px rgba(0, 0, 0, 0.35); display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <span style="font-size: 15px;">${vehicleEmoji}</span>
            <span style="position: absolute; top: -2px; right: -2px; width: 10px; height: 10px; background: #22c55e; border-radius: 50%; border: 1.5px solid white;"></span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -19],
      })

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(layerGroup)
      const badgeColor = getMarkerBadgeColor(veh.status)

      marker.bindPopup(`
        <div style="min-width: 230px; font-family: sans-serif; padding: 4px 0;">
          <div style="font-size: 10px; font-weight: 800; color: #ea580c; letter-spacing: 0.05em; margin-bottom: 2px;">🟢 LIVE GPS ACTIVE • ${veh.registrationNumber}</div>
          <div style="font-size: 15px; font-weight: 800; color: #111827; margin-bottom: 6px;">${veh.name}</div>
          <div style="display: inline-block; padding: 2.5px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; ${badgeColor} margin-bottom: 8px;">
            ${veh.status} (${veh.gpsTracking?.speedKmH || 18} km/h)
          </div>
          <div style="font-size: 12px; color: #4b5563; margin-bottom: 4px;"><strong>Location:</strong> ${veh.currentLocation}</div>
          <div style="font-size: 12px; color: #4b5563; margin-bottom: 6px;"><strong>Driver:</strong> ${veh.assignedDriverName || 'Unassigned'}</div>
          ${
            veh.activeMission
              ? `<div style="font-size: 12px; color: #ea580c; font-weight: 700; border-top: 1px solid #e5e7eb; padding-top: 6px;">Route / Mission: ${veh.activeMission.purpose}</div>`
              : ''
          }
        </div>
      `)

      marker.on('click', () => {
        setSelectedVehicle(veh)
      })
    })
  }, [visibleVehicles])

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn()
  }
  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut()
  }
  const handleCenterMap = () => {
    mapInstanceRef.current?.setView([6.8435, 79.9750], 13, { animate: true })
  }

  const activeMissionVehicles = vehicles.filter((v) => v.status === 'On Mission')

  const renderActionButtons = (vehicle: VehicleRecord) => {
    if (vehicle.status === 'Available') {
      return (
        <button
          type="button"
          onClick={() => setSelectedVehicleForDispatch(vehicle)}
          className="w-full py-2 bg-[#A31736] hover:bg-[#801028] text-white rounded text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm transition-colors"
        >
          Dispatch to Field
        </button>
      )
    }
    if (vehicle.status === 'On Mission') {
      return (
        <button
          type="button"
          onClick={() => {
            submitApprovalRequest(
              'RETURN_MISSION',
              `Log Field Mission Return for ${vehicle.registrationNumber}`,
              `Confirming vehicle return from field assignment back to municipal depot.`,
              { vehicleId: vehicle.id },
              { targetVehicleId: vehicle.id, targetVehicleReg: vehicle.registrationNumber }
            )
            setToastMsg(`Mission return request submitted for ${vehicle.registrationNumber}.`)
          }}
          className="w-full py-2 bg-[#1e3a8a] hover:bg-blue-900 text-white rounded text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm transition-colors"
        >
          Return to Depot
        </button>
      )
    }
    return (
      <span className="w-full py-2 bg-gray-100 text-gray-500 text-center rounded text-xs font-semibold block">
        Currently In Workshop
      </span>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white overflow-hidden animate-fade-in">
      {/* ── Top GIS Toolbar matching Interactive GIS Mapping ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Real-Time Vehicle Telemetry & Interactive GIS Tracking
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Live GPS telemetry, speed monitoring, and municipal route dispatch tracking for Homagama jurisdiction.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search registration, driver, ward..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-all shadow-sm"
            />
          </div>

          <span className="px-3.5 py-2 rounded bg-blue-50 border border-blue-200 text-[#1e3a8a] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{activeMissionVehicles.length} Dispatched</span>
          </span>
        </div>
      </div>

      {/* ── Main GIS Layout (Map Left/Center + Sidebar Right) ── */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-[650px] lg:min-h-0 relative overflow-auto lg:overflow-hidden">
        {/* Map Area */}
        <div className="h-[400px] lg:h-auto lg:flex-1 relative bg-blue-50/30 overflow-hidden shrink-0">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Custom Zoom & Center controls */}
          <div className="absolute bottom-20 left-6 z-[400] flex items-center gap-2">
            <div className="bg-white rounded shadow-sm border border-gray-300 divide-y divide-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-2.5 hover:bg-gray-50 text-gray-700 transition-colors block w-full flex items-center justify-center cursor-pointer"
                title="Zoom In"
              >
                <PlusIcon />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-2.5 hover:bg-gray-50 text-gray-700 transition-colors block w-full flex items-center justify-center cursor-pointer"
                title="Zoom Out"
              >
                <MinusIcon />
              </button>
            </div>
            <button
              type="button"
              onClick={handleCenterMap}
              className="bg-white p-2.5 rounded shadow-sm border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors flex items-center justify-center cursor-pointer"
              title="Center Map to Municipal Area"
            >
              <LocateIcon />
            </button>
          </div>

          {/* Bottom Center Status Legend Overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] bg-white/95 px-4 sm:px-6 py-2 sm:py-2.5 rounded shadow-sm border border-gray-300 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] sm:text-xs font-semibold text-gray-700 select-none uppercase tracking-wider w-[92%] sm:w-auto max-w-full">
            <button
              type="button"
              onClick={() => toggleLayer('Available')}
              className={`flex items-center gap-2 transition-opacity cursor-pointer ${
                activeLayers['Available'] ? 'opacity-100 font-bold' : 'opacity-40 hover:opacity-70'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded bg-emerald-600 inline-block shadow-sm" />
              <span>Available ({vehicles.filter((v) => v.status === 'Available').length})</span>
            </button>
            <button
              type="button"
              onClick={() => toggleLayer('On Mission')}
              className={`flex items-center gap-2 transition-opacity cursor-pointer ${
                activeLayers['On Mission'] ? 'opacity-100 font-bold' : 'opacity-40 hover:opacity-70'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded bg-blue-600 inline-block shadow-sm" />
              <span>On Mission ({activeMissionVehicles.length})</span>
            </button>
            <button
              type="button"
              onClick={() => toggleLayer('In Maintenance')}
              className={`flex items-center gap-2 transition-opacity cursor-pointer ${
                activeLayers['In Maintenance'] ? 'opacity-100 font-bold' : 'opacity-40 hover:opacity-70'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded bg-orange-600 inline-block shadow-sm" />
              <span>Workshop ({vehicles.filter((v) => v.status === 'In Maintenance').length})</span>
            </button>
          </div>
        </div>

        {/* Right Side Panel matching Interactive GIS Mapping */}
        <div className="w-full lg:w-88 bg-white border-t lg:border-t-0 lg:border-l border-gray-300 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 z-10 shadow-sm">
          {/* Card 1: SELECTED VEHICLE TELEMETRY */}
          {selectedVehicle ? (
            <div className="bg-white border border-gray-300 rounded p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-extrabold text-[#1e3a8a] bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
                  {selectedVehicle.registrationNumber}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusBadgeStyle(selectedVehicle.status)}`}
                >
                  {selectedVehicle.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900">{selectedVehicle.name}</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{selectedVehicle.category}</p>
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-2 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">Current GPS Area:</span>
                  <span className="font-semibold text-right">{selectedVehicle.currentLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Assigned Operator:</span>
                  <span className="font-semibold">{selectedVehicle.assignedDriverName || 'Unassigned'}</span>
                </div>
                {selectedVehicle.activeMission && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Destination:</span>
                      <span className="font-semibold">{selectedVehicle.activeMission.destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Est. Return:</span>
                      <span className="font-semibold text-[#1e3a8a]">{selectedVehicle.activeMission.estimatedReturn}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-3 flex items-center gap-2">
                {renderActionButtons(selectedVehicle)}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded p-5 text-center text-xs text-gray-500">
              Click any colored GIS marker on the map to inspect real-time vehicle telemetry, driver info, and mission status.
            </div>
          )}

          {/* Card 2: FLEET STATUS LAYERS */}
          <div className="bg-white border border-gray-300 rounded p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <LayersIcon />
              <h3 className="text-sm font-bold text-gray-900">Fleet Status Layers</h3>
            </div>
            <div className="space-y-2">
              {(['Available', 'On Mission', 'In Maintenance', 'Permit Due'] as VehicleStatus[]).map((st) => (
                <label
                  key={st}
                  className="flex items-center justify-between text-xs text-gray-700 cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={activeLayers[st]}
                      onChange={() => toggleLayer(st)}
                      className="rounded border-gray-300 text-[#1e3a8a] focus:ring-[#1e3a8a]"
                    />
                    <span className="font-semibold">{st}</span>
                  </div>
                  <span className="text-[11px] font-extrabold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {vehicles.filter((v) => v.status === st).length}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Card 3: QUICK DISPATCH QUEUE */}
          <div className="bg-white border border-gray-300 rounded p-4 shadow-sm space-y-3 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-gray-900">Active Field Missions</h3>
              <span className="text-xs font-extrabold bg-blue-50 text-[#1e3a8a] px-2 py-0.5 rounded">
                {activeMissionVehicles.length}
              </span>
            </div>

            <div className="space-y-2">
              {activeMissionVehicles.map((v) => (
                <button
                  type="button"
                  key={v.id}
                  onClick={() => setSelectedVehicle(v)}
                  className="p-3 rounded border border-gray-200 bg-gray-50 hover:bg-blue-50/50 transition-colors cursor-pointer w-full text-left font-normal"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#1e3a8a]">{v.registrationNumber}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 truncate mt-1">{v.name}</p>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5 mb-0 text-left">
                    Ward: {v.currentLocation}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dispatch Modal */}
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
          setSelectedVehicleForDispatch(null)
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

