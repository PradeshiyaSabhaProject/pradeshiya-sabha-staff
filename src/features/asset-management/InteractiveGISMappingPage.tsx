import React, { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import { useAssetData, type AssetRecord } from './hooks/useAssetData'
import { useFleetData } from '../fleet-management/hooks/useFleetData'
import type { VehicleRecord } from '../fleet-management/data/initialFleetData'

// ─────────────────────────────────────────────────────────────────────────────
// Icons
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

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[#A31736]">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

// ─────────────────────────────────────────────────────────────────────────────
// Layer Definitions
// ─────────────────────────────────────────────────────────────────────────────
interface LayerOption {
  id: string
  label: string
  colorClass: string
  categories: string[]
}

const LAYER_OPTIONS: LayerOption[] = [
  { id: 'streetlamps', label: 'Smart Streetlamps Grid', colorClass: 'bg-amber-400', categories: ['Streetlamp'] },
  { id: 'grounds', label: 'Public Grounds & Play Parks', colorClass: 'bg-purple-600', categories: ['Grounds'] },
  { id: 'lands', label: 'Lands & Reserves', colorClass: 'bg-emerald-600', categories: ['Land'] },
  { id: 'roads', label: 'Road Networks & Canals', colorClass: 'bg-gray-600', categories: ['Road'] },
  { id: 'buildings', label: 'Civic Buildings', colorClass: 'bg-[#A31736]', categories: ['Building'] },
  { id: 'water', label: 'Water & Power Utilities', colorClass: 'bg-blue-600', categories: ['Utility / Infrastructure'] },
  { id: 'vehicles_gps', label: 'Garbage Tractors (Live GPS)', colorClass: 'bg-orange-600 animate-pulse', categories: ['Vehicle', 'Machinery & Equipment'] },
]

export const InteractiveGISMappingPage: React.FC = () => {
  const { assets } = useAssetData()
  const { vehicles } = useFleetData()

  // State for search & filters
  const [searchQuery, setSearchQuery] = useState('')
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    streetlamps: true,
    grounds: true,
    lands: true,
    roads: true,
    buildings: true,
    water: true,
    vehicles_gps: true,
  })
  const [priorityFilter, setPriorityFilter] = useState<string[]>(['High Priority', 'Maintenance', 'Operational'])
  const [selectedAsset, setSelectedAsset] = useState<AssetRecord | VehicleRecord | null>(null)

  // Leaflet references
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null)

  const toggleLayer = (layerId: string) => {
    setActiveLayers((prev) => ({ ...prev, [layerId]: !prev[layerId] }))
  }

  const togglePriority = (priority: string) => {
    setPriorityFilter((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    )
  }

  const getAssetPriorityGroup = (status: string) => {
    if (status === 'Disputed' || status === 'Audit Pending' || status === 'Permit Due') return 'High Priority'
    if (status === 'Under Maintenance' || status === 'In Maintenance') return 'Maintenance'
    return 'Operational'
  }

  // Filter assets based on active layers, priority, and search
  const visibleAssets = useMemo(() => {
    const allowedCategories = new Set<string>()
    LAYER_OPTIONS.forEach((layer) => {
      if (activeLayers[layer.id]) {
        layer.categories.forEach((cat) => allowedCategories.add(cat))
      }
    })

    return assets.filter((asset) => {
      if (!asset.coordinates) return false
      if (!allowedCategories.has(asset.category)) return false

      const priorityGroup = getAssetPriorityGroup(asset.status)
      if (!priorityFilter.includes(priorityGroup)) return false

      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()
        const matchesSearch =
          asset.name.toLowerCase().includes(query) ||
          asset.location.toLowerCase().includes(query) ||
          asset.id.toLowerCase().includes(query) ||
          asset.category.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      return true
    })
  }, [assets, activeLayers, priorityFilter, searchQuery])

  // Filter live vehicles for map
  const visibleVehicles = useMemo(() => {
    if (!activeLayers.vehicles_gps) return []
    return vehicles.filter((v) => {
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()
        return (
          v.name.toLowerCase().includes(query) ||
          v.registrationNumber.toLowerCase().includes(query) ||
          v.category.toLowerCase().includes(query) ||
          v.currentLocation.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [vehicles, activeLayers.vehicles_gps, searchQuery])

  // Stats
  const visibleAssetsCount = useMemo(() => {
    return visibleAssets.length + visibleVehicles.length
  }, [visibleAssets, visibleVehicles])

  const riskAlertsCount = useMemo(() => {
    return (
      assets.filter((a) => a.status === 'Disputed' || a.status === 'Under Maintenance' || a.status === 'Audit Pending').length +
      vehicles.filter((v) => v.status === 'In Maintenance' || v.status === 'Permit Due').length
    )
  }, [assets, vehicles])

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const initialCenter: [number, number] = [6.8432, 79.9968]
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

  // Render static assets & live moving vehicle markers on Leaflet map
  useEffect(() => {
    const map = mapInstanceRef.current
    const layerGroup = markersLayerGroupRef.current
    if (!map || !layerGroup) return

    layerGroup.clearLayers()

    // 1. Render Infrastructure Assets
    visibleAssets.forEach((asset) => {
      if (!asset.coordinates) return
      const lat = parseFloat(asset.coordinates.lat)
      const lng = parseFloat(asset.coordinates.lng)
      if (isNaN(lat) || isNaN(lng)) return

      let bgStyle = 'background: #A31736; border: 2px solid white;'
      let iconHtml = `<span style="color: white; font-weight: 900; font-size: 11px;">A</span>`

      if (asset.category === 'Streetlamp') {
        bgStyle = 'background: #f59e0b; border: 2px solid white;'
        iconHtml = `💡`
      } else if (asset.category === 'Grounds') {
        bgStyle = 'background: #9333ea; border: 2px solid white;'
        iconHtml = `🏟️`
      } else if (asset.category === 'Land') {
        bgStyle = 'background: #059669; border: 2px solid white;'
        iconHtml = `🏞️`
      } else if (asset.category === 'Road') {
        bgStyle = 'background: #4b5563; border: 2px solid white;'
        iconHtml = `🛣️`
      } else if (asset.category === 'Building') {
        bgStyle = 'background: #800000; border: 2px solid white;'
        iconHtml = `🏛️`
      } else if (asset.category === 'Utility / Infrastructure') {
        bgStyle = 'background: #2563eb; border: 2px solid white;'
        iconHtml = `💧`
      }

      const priorityGroup = getAssetPriorityGroup(asset.status)
      const pulseHtml =
        priorityGroup === 'High Priority'
          ? `<span style="position: absolute; top: -2px; right: -2px; width: 10px; height: 10px; background: #dc2626; border-radius: 50%; border: 1.5px solid white;"></span>`
          : ''

      const customIcon = L.divIcon({
        className: 'custom-gis-pin',
        html: `
          <div style="position: relative; width: 32px; height: 32px; border-radius: 50%; ${bgStyle} box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <span style="font-size: 13px;">${iconHtml}</span>
            ${pulseHtml}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      })

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(layerGroup)

      const extraInfo = asset.wattage
        ? `<div><strong>Wattage / Pole:</strong> ${asset.wattage} (${asset.poleId})</div>`
        : asset.acreage
        ? `<div><strong>Area Size:</strong> ${asset.acreage}</div>`
        : asset.roadKm
        ? `<div><strong>Distance:</strong> ${asset.roadKm} KM</div>`
        : ''

      marker.bindPopup(`
        <div style="min-width: 220px; font-family: sans-serif; padding: 4px 0;">
          <div style="font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase;">${asset.id}</div>
          <div style="font-size: 14px; font-weight: 800; color: #111827; margin-bottom: 6px;">${asset.name}</div>
          <div style="font-size: 12px; color: #4b5563; margin-bottom: 4px;"><strong>Category:</strong> ${asset.category}</div>
          <div style="font-size: 12px; color: #4b5563; margin-bottom: 4px;"><strong>Location:</strong> ${asset.location}</div>
          ${extraInfo}
          <div style="font-size: 12px; color: #111827; font-weight: 700; border-top: 1px solid #e5e7eb; margin-top: 6px; padding-top: 4px;">
            Valuation: ${asset.value} ${asset.unit}
          </div>
        </div>
      `)

      marker.on('click', () => setSelectedAsset(asset))
    })

    // 2. Render Live GPS Vehicles (Garbage Tractors, Compactors, Bowsers)
    visibleVehicles.forEach((v, idx) => {
      const lat = v.gpsTracking?.lat || 6.8415 + (idx % 4) * 0.005
      const lng = v.gpsTracking?.lng || 79.9982 + (idx % 3) * 0.004

      // Draw route trail polyline if present
      if (v.gpsTracking?.routeTrail && v.gpsTracking.routeTrail.length > 1) {
        L.polyline(v.gpsTracking.routeTrail, {
          color: v.category.includes('Garbage') || v.category.includes('Tractor') ? '#ea580c' : '#2563eb',
          weight: 4,
          opacity: 0.7,
          dashArray: '6, 6',
        }).addTo(layerGroup)
      }

      const vehicleIcon = v.category.includes('Tractor') ? '🚜' : v.category.includes('Compactor') ? '🚛' : '🚚'

      const customIcon = L.divIcon({
        className: 'custom-vehicle-gps-pin',
        html: `
          <div style="position: relative; width: 38px; height: 38px; border-radius: 50%; background: #ea580c; border: 3px solid white; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <span style="font-size: 16px;">${vehicleIcon}</span>
            <span style="position: absolute; top: -3px; right: -3px; width: 11px; height: 11px; background: #22c55e; border-radius: 50%; border: 2px solid white;"></span>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -20],
      })

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(layerGroup)

      marker.bindPopup(`
        <div style="min-width: 230px; font-family: sans-serif; padding: 4px 0;">
          <div style="font-size: 10px; font-weight: 700; color: #ea580c; text-transform: uppercase;">🟢 LIVE GPS ONLINE • ${v.registrationNumber}</div>
          <div style="font-size: 14px; font-weight: 800; color: #111827; margin-bottom: 4px;">${v.name}</div>
          <div style="font-size: 12px; color: #4b5563; margin-bottom: 2px;"><strong>Driver:</strong> ${v.assignedDriverName || 'Assigned Duty'}</div>
          <div style="font-size: 12px; color: #4b5563; margin-bottom: 2px;"><strong>Current Speed:</strong> ${v.gpsTracking?.speedKmH || 18} km/h</div>
          <div style="font-size: 12px; color: #4b5563; margin-bottom: 6px;"><strong>Location:</strong> ${v.currentLocation}</div>
          <div style="font-size: 11px; color: #059669; font-weight: 700; background: #ecfdf5; padding: 4px 8px; border-radius: 6px;">
            Telemetry: ${v.gpsTracking?.lastPingTime || 'Just now'}
          </div>
        </div>
      `)

      marker.on('click', () => setSelectedAsset(v as any))
    })
  }, [visibleAssets, visibleVehicles])

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn()
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut()
  const handleCenterMap = () => mapInstanceRef.current?.setView([6.8432, 79.9968], 13, { animate: true })

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white overflow-hidden text-left">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0 gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#800000] tracking-tight">Interactive GIS Map & Live GPS Telemetry</h1>
          <p className="text-xs text-gray-500">Streetlamps, Lands, Roads, Grounds, and Garbage Tractors Live GPS Tracking</p>
        </div>
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search streetlamps, lands, roads, tractors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#A31736] focus:border-[#A31736] transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Main Body Layout */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-[650px] lg:min-h-0 relative overflow-auto lg:overflow-hidden">
        {/* Map Area */}
        <div className="h-[400px] lg:h-auto lg:flex-1 relative bg-blue-50/30 overflow-hidden shrink-0">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Map Controls */}
          <div className="absolute bottom-20 left-6 z-[400] flex items-center gap-2">
            <div className="bg-white rounded shadow-sm border border-gray-300 divide-y divide-gray-200 overflow-hidden">
              <button onClick={handleZoomIn} className="p-2.5 hover:bg-gray-50 text-gray-700 block w-full" title="Zoom In">
                <PlusIcon />
              </button>
              <button onClick={handleZoomOut} className="p-2.5 hover:bg-gray-50 text-gray-700 block w-full" title="Zoom Out">
                <MinusIcon />
              </button>
            </div>
            <button onClick={handleCenterMap} className="bg-white p-2.5 rounded shadow-sm border border-gray-300 hover:bg-gray-50 text-gray-700" title="Center Map">
              <LocateIcon />
            </button>
          </div>

          {/* Priority Legend Overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] bg-white/95 px-4 sm:px-6 py-2 rounded shadow-sm border border-gray-300 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] font-semibold text-gray-700 select-none uppercase tracking-wider">
            <button onClick={() => togglePriority('High Priority')} className={`flex items-center gap-2 ${priorityFilter.includes('High Priority') ? 'opacity-100 font-bold' : 'opacity-40'}`}>
              <span className="w-3.5 h-3.5 rounded bg-red-700 shadow-sm" />
              <span>High Priority</span>
            </button>
            <button onClick={() => togglePriority('Maintenance')} className={`flex items-center gap-2 ${priorityFilter.includes('Maintenance') ? 'opacity-100 font-bold' : 'opacity-40'}`}>
              <span className="w-3.5 h-3.5 rounded bg-amber-800 shadow-sm" />
              <span>Maintenance</span>
            </button>
            <button onClick={() => togglePriority('Operational')} className={`flex items-center gap-2 ${priorityFilter.includes('Operational') ? 'opacity-100 font-bold' : 'opacity-40'}`}>
              <span className="w-3.5 h-3.5 rounded bg-emerald-600 shadow-sm" />
              <span>Operational</span>
            </button>
          </div>
        </div>

        {/* Right Side Panel */}
        <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-300 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 z-10 shadow-sm">
          {/* Card 1: ASSET & GPS LAYERS */}
          <div className="bg-white rounded border border-gray-300 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-600 tracking-wider uppercase">
              <LayersIcon />
              <span>GIS MAP LAYERS</span>
            </div>
            <div className="space-y-3">
              {LAYER_OPTIONS.map((layer) => {
                const isChecked = activeLayers[layer.id]
                return (
                  <label key={layer.id} className="flex items-center justify-between cursor-pointer group py-0.5">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3 h-3 rounded-full ${layer.colorClass} shrink-0`} />
                      <span className="text-xs font-semibold text-gray-800 group-hover:text-black">
                        {layer.label}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleLayer(layer.id)}
                      className="w-4 h-4 rounded text-[#A31736] border-gray-300 accent-[#A31736] cursor-pointer"
                    />
                  </label>
                )
              })}
            </div>
          </div>

          {/* Card 2: ACTIVE VIEW STATS */}
          <div className="bg-white rounded border border-gray-300 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-600 tracking-wider uppercase">ACTIVE VIEW STATS</span>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded">
                Live GPS Active
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded p-3.5 border border-gray-200">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  TOTAL VISIBLE
                </div>
                <div className="text-2xl font-black text-gray-800">{visibleAssetsCount}</div>
              </div>
              <div className="bg-gray-50 rounded p-3.5 border border-gray-200">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  MAINTENANCE / RISKS
                </div>
                <div className="text-2xl font-black text-red-600">{riskAlertsCount}</div>
              </div>
            </div>
          </div>

          {/* Card 3: Selected Asset / Inspector */}
          <div className="bg-gray-50 rounded border border-gray-300 p-5">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-600 uppercase tracking-wider">
              <InfoIcon />
              <span>{selectedAsset ? 'Inspector & Telemetry' : 'Interactive GIS Guide'}</span>
            </div>
            {selectedAsset ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase block">{selectedAsset.id || (selectedAsset as any).registrationNumber}</span>
                  <h4 className="text-base font-bold text-gray-900 leading-snug">{selectedAsset.name}</h4>
                </div>
                <div className="text-gray-700 space-y-1">
                  <div><strong>Location:</strong> {(selectedAsset as any).location || (selectedAsset as any).currentLocation}</div>
                  {(selectedAsset as any).category && <div><strong>Category:</strong> {(selectedAsset as any).category}</div>}
                  {(selectedAsset as any).wattage && <div><strong>Wattage:</strong> {(selectedAsset as any).wattage}</div>}
                  {(selectedAsset as any).acreage && <div><strong>Acreage:</strong> {(selectedAsset as any).acreage}</div>}
                  {(selectedAsset as any).roadKm && <div><strong>Length:</strong> {(selectedAsset as any).roadKm} KM</div>}
                  {(selectedAsset as any).assignedDriverName && (
                    <div className="text-emerald-700 font-semibold pt-1">
                      🟢 Driver: {(selectedAsset as any).assignedDriverName}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="w-full mt-2 py-1.5 px-3 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Clear Inspector
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-500 leading-relaxed">
                Click any Streetlamp, Land plot, Road, Ground, or live moving Garbage Tractor pin on the Leaflet map to inspect real-time GPS telemetry, wattage, pole IDs, and acreage.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InteractiveGISMappingPage
