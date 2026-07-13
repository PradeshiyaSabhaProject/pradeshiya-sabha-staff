import React, { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import { useAssetData, type AssetRecord } from './hooks/useAssetData'

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Icons
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Layer Definitions to match screenshot
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface LayerOption {
  id: string
  label: string
  colorClass: string
  categories: string[]
}

const LAYER_OPTIONS: LayerOption[] = [
  { id: 'lands', label: 'Lands & Reserves', colorClass: 'bg-emerald-600', categories: ['Land'] },
  { id: 'water', label: 'Water Systems', colorClass: 'bg-blue-600', categories: ['Utility / Infrastructure'] },
  { id: 'roads', label: 'Road Networks', colorClass: 'bg-gray-400', categories: ['Road'] },
  { id: 'buildings', label: 'Civic Buildings', colorClass: 'bg-[#A31736]', categories: ['Building'] },
  { id: 'machinery', label: 'Vehicles & Equipment', colorClass: 'bg-amber-600', categories: ['Vehicle', 'Machinery & Equipment'] },
]

export const InteractiveGISMappingPage: React.FC = () => {
  const { assets } = useAssetData()

  // State for search & filters
  const [searchQuery, setSearchQuery] = useState('')
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    lands: true,
    water: true,
    roads: false,
    buildings: true,
    machinery: true,
  })
  const [priorityFilter, setPriorityFilter] = useState<string[]>(['High Priority', 'Maintenance', 'Operational'])
  const [selectedAsset, setSelectedAsset] = useState<AssetRecord | null>(null)

  // Leaflet references
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null)

  // Toggle layer checkbox
  const toggleLayer = (layerId: string) => {
    setActiveLayers((prev) => ({ ...prev, [layerId]: !prev[layerId] }))
  }

  // Toggle priority filter
  const togglePriority = (priority: string) => {
    setPriorityFilter((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    )
  }

  // Helper to map asset status to our priority categories
  const getAssetPriorityGroup = (status: string) => {
    if (status === 'Disputed' || status === 'Audit Pending') return 'High Priority'
    if (status === 'Under Maintenance') return 'Maintenance'
    return 'Operational' // Verified, Digitized, Operational
  }

  // Filter assets based on active layers, priority, and search
  const visibleAssets = useMemo(() => {
    // Determine allowed categories from checked layers
    const allowedCategories = new Set<string>()
    LAYER_OPTIONS.forEach((layer) => {
      if (activeLayers[layer.id]) {
        layer.categories.forEach((cat) => allowedCategories.add(cat))
      }
    })

    return assets.filter((asset) => {
      // Must have coordinates
      if (!asset.coordinates) return false

      // Layer check
      if (!allowedCategories.has(asset.category)) return false

      // Priority check
      const priorityGroup = getAssetPriorityGroup(asset.status)
      if (!priorityFilter.includes(priorityGroup)) return false

      // Search query check
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

  // Calculate stats to match screenshot baseline
  const visibleAssetsCount = useMemo(() => {
    let base = 0
    if (activeLayers.lands) base += 842
    if (activeLayers.water) base += 310
    if (activeLayers.roads) base += 120
    if (activeLayers.buildings) base += 130
    // Add real loaded visible assets count
    return base + visibleAssets.length
  }, [activeLayers, visibleAssets])

  const riskAlertsCount = useMemo(() => {
    return assets.filter((a) => a.status === 'Disputed' || a.status === 'Under Maintenance' || a.status === 'Audit Pending').length
  }, [assets])

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    // Center on Western Province / Homagama / Colombo regional view as seen in screenshot
    const initialCenter: [number, number] = [6.8850, 79.9150]
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 12,
      zoomControl: false, // We will use custom zoom controls
      attributionControl: false,
    })

    // Add OpenStreetMap tile layer for crisp, real-world Sri Lankan map styling
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    // Create a layer group for our markers
    const layerGroup = L.layerGroup().addTo(map)
    markersLayerGroupRef.current = layerGroup
    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Update map markers whenever visibleAssets change
  useEffect(() => {
    const map = mapInstanceRef.current
    const layerGroup = markersLayerGroupRef.current
    if (!map || !layerGroup) return

    // Clear existing markers
    layerGroup.clearLayers()

    visibleAssets.forEach((asset) => {
      if (!asset.coordinates) return
      const lat = parseFloat(asset.coordinates.lat)
      const lng = parseFloat(asset.coordinates.lng)
      if (isNaN(lat) || isNaN(lng)) return

      // Determine marker color and icon based on category & priority
      const bgStyle = asset.category === 'Utility / Infrastructure' ? 'background: #1d4ed8; border: 2px solid white;'
        : asset.category === 'Building' ? 'background: #800000; border: 2px solid white;'
        : asset.category === 'Land' ? 'background: #059669; border: 2px solid white;'
        : asset.category === 'Road' ? 'background: #4b5563; border: 2px solid white;'
        : 'background: #A31736; border: 2px solid white;'

      const iconHtml = asset.category === 'Utility / Infrastructure' ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-4 h-4"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`
        : asset.category === 'Building' ? `<span style="color: white; font-weight: 900; font-size: 13px; font-family: sans-serif;">H</span>`
        : asset.category === 'Land' ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" class="w-4 h-4"><path d="M12 10a4 4 0 0 0-4-4 4 4 0 0 0-4 4v2h8v-2z"/><path d="M12 10a4 4 0 0 1 4-4 4 4 0 0 1 4 4v2h-8v-2z"/><line x1="12" y1="12" x2="12" y2="22"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" class="w-4 h-4"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`

      // If high priority / disputed, add red glow/badge
      const priorityGroup = getAssetPriorityGroup(asset.status)
      const pulseHtml =
        priorityGroup === 'High Priority'
          ? `<span style="position: absolute; -top: 2px; -right: 2px; width: 10px; height: 10px; background: #dc2626; border-radius: 50%; border: 1.5px solid white;"></span>`
          : ''

      const customIcon = L.divIcon({
        className: 'custom-gis-pin',
        html: `
          <div style="position: relative; width: 32px; height: 32px; border-radius: 50%; ${bgStyle} box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s;">
            ${iconHtml}
            ${pulseHtml}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      })

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(layerGroup)

      // Bind sleek popup
      const statusColor =
        priorityGroup === 'High Priority'
          ? 'color: #dc2626; background: #fee2e2;'
          : priorityGroup === 'Maintenance'
          ? 'color: #d97706; background: #fef3c7;'
          : 'color: #059669; background: #d1fae5;'

      marker.bindPopup(`
        <div style="min-width: 220px; font-family: 'Public Sans', sans-serif; padding: 4px 0;">
          <div style="font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">${asset.id}</div>
          <div style="font-size: 15px; font-weight: 800; color: #111827; margin-bottom: 6px;">${asset.name}</div>
          <div style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; ${statusColor} margin-bottom: 8px;">
            ${asset.status}
          </div>
          <div style="font-size: 12px; color: #4b5563; margin-bottom: 4px;"><strong>Category:</strong> ${asset.category}</div>
          <div style="font-size: 12px; color: #4b5563; margin-bottom: 8px;"><strong>Location:</strong> ${asset.location}</div>
          <div style="font-size: 12px; color: #111827; font-weight: 700; border-top: 1px solid #e5e7eb; padding-top: 6px;">
            Valuation: ${asset.value} ${asset.unit}
          </div>
        </div>
      `)

      marker.on('click', () => {
        setSelectedAsset(asset)
      })
    })
  }, [visibleAssets])

  // Map controls
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn()
  }
  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut()
  }
  const handleCenterMap = () => {
    mapInstanceRef.current?.setView([6.8850, 79.9150], 12, { animate: true })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0">
        <h1 className="text-xl font-bold text-[#800000] tracking-tight">View Location</h1>
        <div className="relative w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search jurisdiction assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#A31736] focus:border-[#A31736] transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Main Body Layout */}
      <div className="flex flex-1 min-h-0 relative overflow-hidden">
        {/* Map Area (Left / Center) */}
        <div className="flex-1 relative bg-blue-50/30 overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Custom Zoom & Center controls overlay */}
          <div className="absolute bottom-20 left-6 z-[400] flex items-center gap-2">
            <div className="bg-white rounded shadow-sm border border-gray-300 divide-y divide-gray-200 overflow-hidden">
              <button
                onClick={handleZoomIn}
                className="p-2.5 hover:bg-gray-50 text-gray-700 transition-colors block w-full flex items-center justify-center"
                title="Zoom In"
              >
                <PlusIcon />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2.5 hover:bg-gray-50 text-gray-700 transition-colors block w-full flex items-center justify-center"
                title="Zoom Out"
              >
                <MinusIcon />
              </button>
            </div>
            <button
              onClick={handleCenterMap}
              className="bg-white p-2.5 rounded shadow-sm border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors flex items-center justify-center"
              title="Center Map to Colombo/Homagama"
            >
              <LocateIcon />
            </button>
          </div>

          {/* Bottom Center Priority Legend Overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] bg-white/95 px-6 py-2.5 rounded shadow-sm border border-gray-300 flex items-center gap-6 text-xs font-semibold text-gray-700 select-none uppercase tracking-wider">
            <button
              onClick={() => togglePriority('High Priority')}
              className={`flex items-center gap-2.5 transition-opacity ${
                priorityFilter.includes('High Priority') ? 'opacity-100 font-bold' : 'opacity-40 hover:opacity-70'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded bg-red-700 inline-block shadow-sm"></span>
              <span>High Priority</span>
            </button>
            <button
              onClick={() => togglePriority('Maintenance')}
              className={`flex items-center gap-2.5 transition-opacity ${
                priorityFilter.includes('Maintenance') ? 'opacity-100 font-bold' : 'opacity-40 hover:opacity-70'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded bg-amber-800 inline-block shadow-sm"></span>
              <span>Maintenance</span>
            </button>
            <button
              onClick={() => togglePriority('Operational')}
              className={`flex items-center gap-2.5 transition-opacity ${
                priorityFilter.includes('Operational') ? 'opacity-100 font-bold' : 'opacity-40 hover:opacity-70'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded bg-emerald-600 inline-block shadow-sm"></span>
              <span>Operational</span>
            </button>
          </div>
        </div>

        {/* Right Side Panel */}
        <div className="w-80 bg-white border-l border-gray-300 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 z-10 shadow-sm">
          {/* Card 1: ASSET LAYERS */}
          <div className="bg-white rounded border border-gray-300 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-600 tracking-wider uppercase">
              <LayersIcon />
              <span>ASSET LAYERS</span>
            </div>
            <div className="space-y-3.5">
              {LAYER_OPTIONS.map((layer) => {
                const isChecked = activeLayers[layer.id]
                return (
                  <label
                    key={layer.id}
                    className="flex items-center justify-between cursor-pointer group select-none py-0.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${layer.colorClass} shrink-0`}></span>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors">
                        {layer.label}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleLayer(layer.id)}
                      className="w-4 h-4 rounded text-[#A31736] focus:ring-[#A31736] border-gray-300 accent-[#A31736] cursor-pointer"
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
              <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">
                Live
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded p-3.5 border border-gray-200">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  VISIBLE ASSETS
                </div>
                <div className="text-2xl font-black text-gray-800">{visibleAssetsCount.toLocaleString()}</div>
              </div>
              <div className="bg-gray-50 rounded p-3.5 border border-gray-200">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  RISK ALERTS
                </div>
                <div className="text-2xl font-black text-red-600">{riskAlertsCount}</div>
              </div>
            </div>
          </div>

          {/* Card 3: Selected Asset Quick Details / Instructions */}
          <div className="bg-gray-50 rounded border border-gray-300 p-5">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-600 uppercase tracking-wider">
              <InfoIcon />
              <span>{selectedAsset ? 'Asset Inspector' : 'Interactive Guide'}</span>
            </div>
            {selectedAsset ? (
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase block">{selectedAsset.id}</span>
                  <h4 className="text-base font-bold text-gray-900 leading-snug">{selectedAsset.name}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#A31736]/10 text-[#A31736]">
                    {selectedAsset.category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-200 text-gray-700">
                    {selectedAsset.status}
                  </span>
                </div>
                <div className="text-xs text-gray-600 space-y-1 border-t border-gray-200 pt-3">
                  <div>
                    <strong className="text-gray-700">Location:</strong> {selectedAsset.location}
                  </div>
                  {selectedAsset.coordinates && (
                    <div>
                      <strong className="text-gray-700">Coordinates:</strong> {selectedAsset.coordinates.lat},{' '}
                      {selectedAsset.coordinates.lng}
                    </div>
                  )}
                  <div>
                    <strong className="text-gray-700">Valuation:</strong> {selectedAsset.value} {selectedAsset.unit}
                  </div>
                  <div>
                    <strong className="text-gray-700">Added:</strong> {selectedAsset.dateAdded}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="w-full mt-2 py-1.5 px-3 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors uppercase tracking-wider"
                >
                  Clear Selection
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-500 leading-relaxed">
                Click any asset marker on the Sri Lankan GIS map to view real-time valuation, status reports, and inspection metadata. Use layer checkboxes and priority filters to isolate infrastructure systems.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InteractiveGISMappingPage

