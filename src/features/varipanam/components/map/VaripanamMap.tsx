import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import type { Property, VaripanamSettings, Road } from '../../types/varipanam'
import { formatLKR } from '../../utils/formatters'

import 'leaflet/dist/leaflet.css'

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
  roads = [],
  selectedProperty,
  onSelectProperty,
  onOpenProperty,
  isPickMode,
  pickedCoords,
  onMapClickCoord,
  heightClass = 'h-[520px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null)
  const boundaryLayerRef = useRef<L.Polygon | null>(null)
  const pickMarkerRef = useRef<L.Marker | null>(null)
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map())

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
    if (!mapContainerRef.current) return
    if (mapInstanceRef.current) return

    // Clean up any lingering leaflet id
    const containerEl = mapContainerRef.current as HTMLDivElement & { _leaflet_id?: number | null }
    if (containerEl._leaflet_id) {
      containerEl._leaflet_id = null
    }

    const initialCenter = settings.mapCentre || [6.8415, 80.0035]
    const initialZoom = settings.defaultZoom || 14

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
    })

    // High clarity Street Map tiles (reliable, unblocked, no API key required)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri &mdash; Homagama PS GIS Cadastre',
      maxZoom: 19,
    }).addTo(map)

    // Zoom controls at top right
    L.control.zoom({ position: 'topright' }).addTo(map)

    // Scale bar at bottom right
    L.control.scale({ position: 'bottomright', imperial: false }).addTo(map)

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
        fillOpacity: 0.05,
      }).addTo(map)
      boundaryLayerRef.current = boundaryPoly
    }

    mapInstanceRef.current = map

    // Ensure map tiles calculate correct pixel bounds
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize()
    })
    resizeObserver.observe(mapContainerRef.current)

    const timer1 = setTimeout(() => map.invalidateSize(), 100)
    const timer2 = setTimeout(() => map.invalidateSize(), 300)
    const timer3 = setTimeout(() => map.invalidateSize(), 600)

    return () => {
      resizeObserver.disconnect()
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      map.remove()
      mapInstanceRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  // 4. Update Property Markers on Filter Changes
  useEffect(() => {
    const map = mapInstanceRef.current
    const markersGroup = markersLayerGroupRef.current
    if (!map || !markersGroup) return

    markersGroup.clearLayers()
    markersMapRef.current.clear()

    properties.forEach((prop) => {
      const icon = createMarkerIcon(prop.status, false)

      const marker = L.marker([prop.latitude, prop.longitude], {
        icon,
        zIndexOffset: 100,
      })

      // Calculate outstanding amount due & arrears
      const amountDue = prop.dues.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0)
      const arrearsAmount = prop.dues
        .filter((d) => d.status === 'Overdue' || d.status === 'Warrant')
        .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0)

      const road = roads.find((r) => r.id === prop.roadId)

      let badgeBg = '#ECFDF5'
      let badgeColor = '#065F46'
      let badgeBorder = '#A7F3D0'

      if (prop.status === 'Due soon') {
        badgeBg = '#FFFBEB'
        badgeColor = '#92400E'
        badgeBorder = '#FDE68A'
      } else if (prop.status === 'Overdue') {
        badgeBg = '#FEF2F2'
        badgeColor = '#991B1B'
        badgeBorder = '#FECACA'
      } else if (prop.status === 'Warrant issued') {
        badgeBg = '#FAF5FF'
        badgeColor = '#6B21A8'
        badgeBorder = '#E9D5FF'
      }

      const popupContent = document.createElement('div')
      popupContent.className = 'p-1 text-xs text-gray-800'
      popupContent.innerHTML = `
        <div style="min-width: 250px; font-family: inherit;">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; margin-bottom: 8px;">
            <div>
              <span style="font-weight: 900; font-size: 15px; color: #111827; letter-spacing: -0.02em;">${prop.assessmentNumber}</span>
              <div style="font-size: 11px; font-weight: 600; color: #4B5563;">${prop.propertyNumber}</div>
            </div>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em; background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder};">${prop.status}</span>
          </div>

          <div style="margin-bottom: 8px; font-size: 11.5px; line-height: 1.45;">
            <div style="font-weight: 700; color: #1F2937;">👤 ${prop.currentOwner.name}</div>
            <div style="color: #4B5563;">NIC: <span style="font-family: monospace; font-weight: 600;">${prop.currentOwner.nic}</span> | 📞 ${prop.currentOwner.mobile}</div>
            <div style="color: #6B7280; margin-top: 2px;">📍 ${road?.name || 'Assigned Road'} • <span style="color: #374151; font-weight: 600;">${prop.propertyType}</span></div>
          </div>

          <div style="background: #F9FAFB; border: 1px solid #D1D5DB; border-radius: 4px; padding: 6px 10px; margin-bottom: 10px; font-size: 11px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #6B7280;">Annual Assessed Value:</span>
              <span style="font-weight: 700; color: #1F2937;">${formatLKR(prop.annualAssessedValue)}</span>
            </div>
            ${
              arrearsAmount > 0
                ? `<div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                     <span style="color: #DC2626; font-weight: 600;">Arrears Debt:</span>
                     <span style="font-weight: 800; color: #DC2626;">${formatLKR(arrearsAmount)}</span>
                   </div>`
                : ''
            }
            <div style="display: flex; justify-content: space-between; border-top: 1px dashed #D1D5DB; padding-top: 4px; margin-top: 3px;">
              <span style="color: #111827; font-weight: 700;">Total Outstanding:</span>
              <span style="font-weight: 900; color: ${amountDue > 0 ? '#DC2626' : '#059669'}; font-size: 12px;">${formatLKR(amountDue)}</span>
            </div>
          </div>

          <button id="btn-open-prop-${prop.id}" style="width: 100%; padding: 8px 12px; background: #A31736; color: white; border: none; border-radius: 4px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.08);">
            <span>Open Property 360 Dossier</span>
            <span>↗</span>
          </button>
        </div>
      `

      // Hook up button in popup
      marker.bindPopup(popupContent, { maxWidth: 320, minWidth: 240 })
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
        setTimeout(() => {
          marker.openPopup()
        }, 50)
      })

      marker.addTo(markersGroup)
      markersMapRef.current.set(prop.id, marker)
    })
  }, [properties, roads, onOpenProperty, onSelectProperty])

  // 5. When selected property changes: highlight marker, pan map, and open its popup
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Update marker icon states (selected vs unselected)
    markersMapRef.current.forEach((marker, id) => {
      const prop = properties.find((p) => p.id === id)
      if (prop) {
        const isSelected = selectedProperty?.id === id
        marker.setIcon(createMarkerIcon(prop.status, isSelected))
        marker.setZIndexOffset(isSelected ? 1000 : 100)
      }
    })

    if (!selectedProperty) return

    const selectedMarker = markersMapRef.current.get(selectedProperty.id)
    if (selectedMarker) {
      map.flyTo([selectedProperty.latitude, selectedProperty.longitude], 16, {
        duration: 0.8,
        easeLinearity: 0.25,
      })
      setTimeout(() => {
        selectedMarker.openPopup()
      }, 350)
    }
  }, [selectedProperty, properties])

  return (
    <div className={`relative w-full ${heightClass} min-h-[500px] overflow-hidden bg-slate-100`}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px] z-10" />

      {/* Floating Status Legend Bar */}
      <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md border border-gray-300 rounded px-3 py-1.5 shadow-xs flex flex-wrap items-center gap-2.5 text-xs select-none">
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
        <button
          type="button"
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo(settings.mapCentre || [6.8415, 80.0035], settings.defaultZoom || 14)
            }
          }}
          className="ml-2 px-2.5 py-1 text-[10px] font-bold text-gray-700 bg-white hover:bg-gray-50 rounded border border-gray-300 transition-colors cursor-pointer uppercase tracking-wider shadow-2xs"
        >
          Reset View
        </button>
      </div>

      {/* Pick Mode Active Banner */}
      {isPickMode && (
        <div className="absolute top-3 right-14 z-20 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded shadow-lg flex items-center gap-2 border border-slate-700 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Click on map to drop pin, or drag yellow pin</span>
        </div>
      )}
    </div>
  )
}

export default VaripanamMap
