import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import type { Property, VaripanamSettings, Road } from '../../types/varipanam'
import { formatLKR } from '../../utils/formatters'

interface VaripanamMapProps {
  properties: Property[]
  settings: VaripanamSettings
  roads: Road[]
  selectedProperty: Property | null
  onSelectProperty: (property: Property) => void
  onOpenProperty: (propertyId: string) => void
  isPickMode: boolean
  pickedCoords: { latitude: number; longitude: number } | null
  onMapClickCoord: (coords: { latitude: number; longitude: number }) => void
  heightClass?: string
}

export const VaripanamMap: React.FC<VaripanamMapProps> = ({
  properties,
  settings,
  selectedProperty,
  onSelectProperty,
  onOpenProperty,
  isPickMode,
  pickedCoords,
  onMapClickCoord,
  heightClass = 'h-[580px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null)
  const boundaryLayerRef = useRef<L.Polygon | null>(null)
  const pickMarkerRef = useRef<L.Marker | null>(null)

  // Status counts for legend
  const counts = {
    paid: properties.filter((p) => p.status === 'Paid').length,
    dueSoon: properties.filter((p) => p.status === 'Due soon').length,
    overdue: properties.filter((p) => p.status === 'Overdue').length,
    warrant: properties.filter((p) => p.status === 'Warrant issued').length,
  }

  // Helper to create colored custom SVG pins
  const createMarkerIcon = (status: Property['status'], isSelected = false) => {
    let pinColor = '#10B981' // Green (Paid)
    let ringColor = 'rgba(16, 185, 129, 0.3)'

    if (status === 'Due soon') {
      pinColor = '#F59E0B' // Amber
      ringColor = 'rgba(245, 158, 11, 0.35)'
    } else if (status === 'Overdue') {
      pinColor = '#EF4444' // Red
      ringColor = 'rgba(239, 68, 68, 0.35)'
    } else if (status === 'Warrant issued') {
      pinColor = '#7C3AED' // Purple
      ringColor = 'rgba(124, 58, 237, 0.45)'
    }

    const scale = isSelected ? 'scale(1.25)' : 'scale(1)'
    const shadow = isSelected ? 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'

    const svgHtml = `
      <div style="position: relative; width: 34px; height: 42px; transform: ${scale}; transform-origin: bottom center; transition: all 0.2s ease;">
        ${
          isSelected
            ? `<div style="position: absolute; bottom: 2px; left: 5px; width: 24px; height: 24px; border-radius: 50%; background: ${ringColor}; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
            : ''
        }
        <svg viewBox="0 0 36 46" width="34" height="42" style="filter: ${shadow};">
          <path d="M18 0C8.06 0 0 8.06 0 18C0 31.5 18 46 18 46S36 31.5 36 18C36 8.06 27.94 0 18 0Z" fill="${pinColor}" />
          <circle cx="18" cy="18" r="8" fill="#FFFFFF" />
          <circle cx="18" cy="18" r="4.5" fill="${pinColor}" />
        </svg>
      </div>
    `

    return L.divIcon({
      html: svgHtml,
      className: 'custom-property-pin',
      iconSize: [34, 42],
      iconAnchor: [17, 42],
      popupAnchor: [0, -38],
    })
  }

  // 1. Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const initialCenter = settings.mapCentre || [6.8415, 80.0035]
    const initialZoom = settings.defaultZoom || 14

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
    })

    // OpenStreetMap standard tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | Homagama Pradeshiya Sabha GIS',
      maxZoom: 19,
    }).addTo(map)

    // Zoom controls at top right
    L.control.zoom({ position: 'topright' }).addTo(map)

    // Markers layer group
    const markersGroup = L.layerGroup().addTo(map)
    markersLayerGroupRef.current = markersGroup

    // Sabha boundary polygon
    if (settings.sabhaBoundaryGeoJson?.coordinates?.[0]) {
      const boundaryLatLngs = settings.sabhaBoundaryGeoJson.coordinates[0].map(
        (coord: number[]) => [coord[1], coord[0]] as [number, number]
      )
      const boundaryPoly = L.polygon(boundaryLatLngs, {
        color: '#A31736',
        weight: 2.5,
        dashArray: '5, 8',
        fillColor: '#A31736',
        fillOpacity: 0.04,
      }).addTo(map)
      boundaryLayerRef.current = boundaryPoly
    }

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [settings])

  // 2. Handle Map Click in Pick Mode
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!isPickMode) return
      onMapClickCoord({ latitude: e.latlng.lat, longitude: e.latlng.lng })
    }

    map.on('click', handleMapClick)
    return () => {
      map.off('click', handleMapClick)
    }
  }, [isPickMode, onMapClickCoord])

  // 3. Render Pick Pin in Pick Mode
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (pickMarkerRef.current) {
      map.removeLayer(pickMarkerRef.current)
      pickMarkerRef.current = null
    }

    if (isPickMode && pickedCoords) {
      const pickIcon = L.divIcon({
        html: `
          <div style="position: relative; width: 38px; height: 46px; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.5)); cursor: grab;">
            <svg viewBox="0 0 36 46" width="38" height="46">
              <path d="M18 0C8.06 0 0 8.06 0 18C0 31.5 18 46 18 46S36 31.5 36 18C36 8.06 27.94 0 18 0Z" fill="#1E293B" />
              <circle cx="18" cy="18" r="8" fill="#FACC15" />
              <path d="M18 13v10M13 18h10" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" />
            </svg>
            <div style="position: absolute; -top: 22px; left: 50%; transform: translateX(-50%); background: #1E293B; color: #fff; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; white-space: nowrap;">
              Drag pin to adjust
            </div>
          </div>
        `,
        className: 'custom-pick-pin',
        iconSize: [38, 46],
        iconAnchor: [19, 46],
      })

      const marker = L.marker([pickedCoords.latitude, pickedCoords.longitude], {
        icon: pickIcon,
        draggable: true,
      }).addTo(map)

      marker.on('dragend', (event) => {
        const marker = event.target as L.Marker
        const position = marker.getLatLng()
        onMapClickCoord({ latitude: position.lat, longitude: position.lng })
      })

      pickMarkerRef.current = marker
    }
  }, [isPickMode, pickedCoords, onMapClickCoord])

  // 4. Update Property Markers on Filter or Selection Changes
  useEffect(() => {
    const map = mapInstanceRef.current
    const markersGroup = markersLayerGroupRef.current
    if (!map || !markersGroup) return

    markersGroup.clearLayers()

    properties.forEach((prop) => {
      const isSelected = selectedProperty?.id === prop.id
      const icon = createMarkerIcon(prop.status, isSelected)

      const marker = L.marker([prop.latitude, prop.longitude], {
        icon,
        zIndexOffset: isSelected ? 1000 : 100,
      })

      // Calculate outstanding amount due
      const amountDue = prop.dues.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0)

      const popupContent = document.createElement('div')
      popupContent.className = 'p-1 text-xs text-gray-800'
      popupContent.innerHTML = `
        <div style="min-width: 200px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-weight: 800; font-size: 14px; color: #111827;">${prop.assessmentNumber}</span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 9999px; background: ${
              prop.status === 'Paid'
                ? '#ECFDF5; color: #065F46;'
                : prop.status === 'Due soon'
                ? '#FFFBEB; color: #92400E;'
                : prop.status === 'Overdue'
                ? '#FEF2F2; color: #991B1B;'
                : '#FAF5FF; color: #6B21A8;'
            }">${prop.status}</span>
          </div>
          <p style="margin: 0 0 2px 0; color: #4B5563; font-weight: 600;">${prop.currentOwner.name}</p>
          <p style="margin: 0 0 6px 0; color: #9CA3AF; font-size: 11px;">${prop.propertyNumber} • ${prop.description}</p>
          <div style="border-top: 1px solid #E5E7EB; padding-top: 6px; margin-top: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #6B7280; font-size: 11px;">Amount Due:</span>
            <strong style="color: ${amountDue > 0 ? '#DC2626' : '#059669'}; font-size: 13px;">${formatLKR(
        amountDue
      )}</strong>
          </div>
          <button id="btn-open-prop-${prop.id}" style="width: 100%; margin-top: 10px; padding: 6px 12px; background: #A31736; color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
            <span>Open Property 360</span>
            <span>→</span>
          </button>
        </div>
      `

      // Hook up button in popup
      marker.bindPopup(popupContent, { maxWidth: 280 })
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-open-prop-${prop.id}`)
        if (btn) {
          btn.onclick = (e) => {
            e.stopPropagation()
            onOpenProperty(prop.id)
          }
        }
      })

      marker.on('click', () => {
        onSelectProperty(prop)
      })

      marker.addTo(markersGroup)
    })
  }, [properties, selectedProperty, onSelectProperty, onOpenProperty])

  // 5. Pan smoothly to selected property when selected from list
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !selectedProperty) return

    map.flyTo([selectedProperty.latitude, selectedProperty.longitude], 16, {
      duration: 1.2,
      easeLinearity: 0.25,
    })
  }, [selectedProperty])

  return (
    <div className="relative rounded-2xl border border-gray-200 shadow-xs overflow-hidden bg-white">
      {/* Map Container */}
      <div ref={mapContainerRef} className={`w-full ${heightClass} z-10`} />

      {/* Floating Status Legend Bar */}
      <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-xl px-3.5 py-2 shadow-lg flex flex-wrap items-center gap-3 text-xs select-none">
        <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Tax Status:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
          <span className="text-gray-700 font-medium">Paid ({counts.paid})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
          <span className="text-gray-700 font-medium">Due soon ({counts.dueSoon})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
          <span className="text-gray-700 font-medium">Overdue ({counts.overdue})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shadow-xs" />
          <span className="text-purple-900 font-bold">Warrant ({counts.warrant})</span>
        </div>
      </div>

      {/* Pick Mode Active Banner */}
      {isPickMode && (
        <div className="absolute top-3 right-14 z-20 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Click on map to drop pin, or drag yellow pin</span>
        </div>
      )}
    </div>
  )
}

export default VaripanamMap
