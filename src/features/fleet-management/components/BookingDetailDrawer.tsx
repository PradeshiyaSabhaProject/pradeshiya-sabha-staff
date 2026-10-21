import React, { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import {
  SERVICE_CONFIG,
  DEPOT_COORDS,
  type BookingRecord,
} from '../data/initialBookingData'
import { BookingStatusBadge, BookingSourceBadge } from './BookingStatusBadge'
import {
  formatLKR,
  formatTimestamp,
  paymentTimeRemaining,
  nextActionLabel,
} from '../utils/bookingUtils'

interface BookingDetailDrawerProps {
  booking: BookingRecord | null
  onClose: () => void
  onOpenAction: (booking: BookingRecord) => void
}

/**
 * Full-featured inspection and workflow drawer for bowser bookings.
 * Includes dossier specs, fee breakdown, e-receipt, live tracking map with
 * simulated GPS telemetry, audit timeline, and simulated notification log.
 */
export const BookingDetailDrawer: React.FC<BookingDetailDrawerProps> = ({
  booking,
  onClose,
  onOpenAction,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'fee' | 'tracking' | 'timeline' | 'notifications'>('details')
  const [clockNow, setClockNow] = useState(() => Date.now())

  // Live GPS simulation state (drawer-local interval)
  const [gpsProgress, setGpsProgress] = useState<number>(0.35) // 0 to 1 between depot and site
  const [simulatedSpeed, setSimulatedSpeed] = useState<number>(24)

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const vehicleMarkerRef = useRef<L.Marker | null>(null)

  const isGully = booking?.serviceType === 'GULLY_BOWSER'
  const cfg = booking ? SERVICE_CONFIG[booking.serviceType] : null

  const [prevBookingId, setPrevBookingId] = useState<string | null>(null)

  if ((booking?.id ?? null) !== prevBookingId) {
    setPrevBookingId(booking?.id ?? null)
    if (booking) {
      setActiveTab(
        booking.status === 'Vehicle Assigned' ||
        booking.status === 'En Route' ||
        booking.status === 'Service In Progress' ||
        booking.status === 'In Transit to Plant'
          ? 'tracking'
          : 'details'
      )
      setGpsProgress(0.35)
    }
  }

  // GPS simulation interval while drawer is open on tracking tab
  useEffect(() => {
    if (!booking || activeTab !== 'tracking') return

    const interval = setInterval(() => {
      setGpsProgress((prev) => {
        const next = prev >= 0.95 ? 0.2 : prev + 0.04
        return Math.round(next * 100) / 100
      })
      setSimulatedSpeed(Math.floor(18 + Math.random() * 14))
    }, 2500)

    return () => clearInterval(interval)
  }, [booking, activeTab])

  useEffect(() => {
    if (!booking?.paymentDueBy) return

    const interval = setInterval(() => setClockNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [booking?.id, booking?.paymentDueBy])

  // Interpolated GPS position between depot and job site
  const vehicleGpsPosition = useMemo((): [number, number] => {
    if (!booking) return [DEPOT_COORDS.lat, DEPOT_COORDS.lng]
    const destLat = booking.location.lat
    const destLng = booking.location.lng
    const lat = DEPOT_COORDS.lat + (destLat - DEPOT_COORDS.lat) * gpsProgress
    const lng = DEPOT_COORDS.lng + (destLng - DEPOT_COORDS.lng) * gpsProgress
    return [Math.round(lat * 10000) / 10000, Math.round(lng * 10000) / 10000]
  }, [booking, gpsProgress])

  // Initialize Leaflet map when tracking tab is active
  useEffect(() => {
    if (!booking || activeTab !== 'tracking') {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        vehicleMarkerRef.current = null
      }
      return
    }

    const timer = setTimeout(() => {
      if (!mapContainerRef.current || mapInstanceRef.current) return

      const depotLatLng: [number, number] = [DEPOT_COORDS.lat, DEPOT_COORDS.lng]
      const destLatLng: [number, number] = [booking.location.lat, booking.location.lng]

      const bounds = L.latLngBounds([depotLatLng, destLatLng])
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      })

      map.fitBounds(bounds, { padding: [40, 40] })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map)

      // Polyline route
      L.polyline([depotLatLng, destLatLng], {
        color: '#A31736',
        weight: 4,
        opacity: 0.7,
        dashArray: '8, 8',
      }).addTo(map)

      // Depot Marker
      const depotIcon = L.divIcon({
        className: 'custom-depot-pin',
        html: `
          <div style="background: #1e3a8a; color: white; padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span>🏢</span> Municipal Depot
          </div>
        `,
        iconSize: [120, 26],
        iconAnchor: [60, 26],
      })
      L.marker(depotLatLng, { icon: depotIcon }).addTo(map)

      // Destination Job Marker
      const jobIcon = L.divIcon({
        className: 'custom-job-pin',
        html: `
          <div style="background: #059669; color: white; padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span>📍</span> Service Site
          </div>
        `,
        iconSize: [95, 26],
        iconAnchor: [48, 26],
      })
      L.marker(destLatLng, { icon: jobIcon }).addTo(map)

      // Vehicle Live Pin Marker
      const vehEmoji = isGully ? '🚛' : '💧'
      const vehicleIcon = L.divIcon({
        className: 'custom-vehicle-gps-marker',
        html: `
          <div style="position: relative; width: 38px; height: 38px; border-radius: 50%; background: #A31736; border: 3px solid white; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <span style="font-size: 16px;">${vehEmoji}</span>
            <span style="position: absolute; top: -2px; right: -2px; width: 10px; height: 10px; background: #22c55e; border-radius: 50%; border: 2px solid white;"></span>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      })

      const marker = L.marker(vehicleGpsPosition, { icon: vehicleIcon }).addTo(map)
      vehicleMarkerRef.current = marker

      mapInstanceRef.current = map
    }, 150)

    return () => clearTimeout(timer)
  }, [activeTab, booking?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update vehicle position on map
  useEffect(() => {
    if (vehicleMarkerRef.current && activeTab === 'tracking') {
      vehicleMarkerRef.current.setLatLng(vehicleGpsPosition)
    }
  }, [vehicleGpsPosition, activeTab])

  if (!booking || !cfg) return null

  // 24h countdown info
  const paymentCountdown = booking.paymentDueBy
    ? paymentTimeRemaining(booking.paymentDueBy, clockNow)
    : null
  const actionText = nextActionLabel(booking)

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300 cursor-default"
        onClick={onClose}
        aria-label="Close drawer"
      />

      {/* Sliding Drawer Container */}
      <div className="relative bg-white w-full max-w-2xl h-full shadow-2xl border-l border-gray-200 z-10 flex flex-col animate-slide-left">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/70 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-[#A31736] bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-md">
                {booking.referenceNumber}
              </span>
              <BookingSourceBadge source={booking.source} />
              <BookingStatusBadge status={booking.status} />
            </div>

            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer font-bold text-lg"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <h3 className="text-lg font-extrabold text-gray-900 mt-2">
            {cfg.label} Booking Dossier
          </h3>

          {/* Payment countdown banner if awaiting payment */}
          {booking.status === 'Awaiting Payment' && paymentCountdown && (
            <div
              className={`mt-2 p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                paymentCountdown.isUrgent
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <span className="font-medium">
                {paymentCountdown.isExpired
                  ? '⚠️ 24-Hour Payment Window Expired'
                  : '⏱️ 24-Hour Payment Countdown Active:'}
              </span>
              <span className="font-mono font-bold">
                {paymentCountdown.isExpired
                  ? 'Expired'
                  : `${paymentCountdown.hours}h ${paymentCountdown.minutes}m remaining`}
              </span>
            </div>
          )}

          {/* Tab navigation */}
          <div className="flex gap-1 mt-3 border-b border-gray-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`px-3 py-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'details'
                  ? 'border-[#A31736] text-[#A31736]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Dossier Specs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('fee')}
              className={`px-3 py-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'fee'
                  ? 'border-[#A31736] text-[#A31736]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Fee & E-Receipt
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tracking')}
              className={`px-3 py-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tracking'
                  ? 'border-[#A31736] text-[#A31736]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>Live Tracking</span>
              {(booking.status === 'Vehicle Assigned' ||
                booking.status === 'En Route' ||
                booking.status === 'Service In Progress' ||
                booking.status === 'In Transit to Plant') && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'timeline'
                  ? 'border-[#A31736] text-[#A31736]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Timeline ({booking.timeline.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className={`px-3 py-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'notifications'
                  ? 'border-[#A31736] text-[#A31736]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Notices ({booking.notifications.length})
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {/* TAB 1: DETAILS & SPECS */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              {/* Applicant Info Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Applicant & Beneficiary Details
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block font-medium">Full Name</span>
                    <span className="font-bold text-gray-900">{booking.applicant.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium">NIC Number</span>
                    <span className="font-mono font-bold text-gray-900">{booking.applicant.nic}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium">Telephone</span>
                    <span className="font-mono font-bold text-gray-900">{booking.applicant.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium">Ward</span>
                    <span className="font-bold text-gray-900">{booking.applicant.ward}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 block font-medium">Address</span>
                    <span className="font-medium text-gray-900">{booking.applicant.address}</span>
                  </div>
                </div>
              </div>

              {/* Service Specifications Card */}
              <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Technical Specifications ({cfg.label})
                </h4>

                {isGully && 'pitVolumeLitres' in booking.serviceDetails ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 block">Pit Volume</span>
                      <span className="font-bold text-gray-900 font-mono">
                        {booking.serviceDetails.pitVolumeLitres.toLocaleString()} Litres
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Waste Type</span>
                      <span className="font-bold text-gray-900">{booking.serviceDetails.wasteType}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Dist. From Gate</span>
                      <span className="font-bold text-gray-900">{booking.serviceDetails.distanceFromGateM} m</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Hose Required</span>
                      <span className="font-bold text-gray-900">{booking.serviceDetails.hoseLengthRequiredM} m</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Road Width</span>
                      <span className="font-bold text-gray-900">{booking.serviceDetails.roadWidthM} m</span>
                    </div>
                  </div>
                ) : !isGully && 'waterVolumeLitres' in booking.serviceDetails ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 block">Volume</span>
                      <span className="font-bold text-gray-900 font-mono">
                        {booking.serviceDetails.waterVolumeLitres.toLocaleString()} L
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Loads</span>
                      <span className="font-bold text-gray-900">{booking.serviceDetails.loadsRequired} load(s)</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Purpose</span>
                      <span className="font-bold text-gray-900">{booking.serviceDetails.purpose}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Storage</span>
                      <span className="font-bold text-gray-900">{booking.serviceDetails.storageTankType}</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Assigned Vehicle & Driver Info (if assigned) */}
              {booking.assignedVehicleReg && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Assigned Fleet & Crew
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-emerald-700 block font-medium">Bowser Registration</span>
                      <span className="font-mono font-bold text-emerald-950">
                        {booking.assignedVehicleReg}
                      </span>
                    </div>
                    <div>
                      <span className="text-emerald-700 block font-medium">Assigned Driver</span>
                      <span className="font-bold text-emerald-950">{booking.assignedDriverName}</span>
                    </div>
                    <div>
                      <span className="text-emerald-700 block font-medium">Dispatched At</span>
                      <span className="font-bold text-emerald-950">
                        {booking.dispatchedAt ? formatTimestamp(booking.dispatchedAt) : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Field Closeout Logs (if present) */}
              {booking.disposalLog && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Disposal Record ({booking.disposalLog.plantName})
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400 block">Ticket No:</span>
                      <span className="font-mono font-bold">{booking.disposalLog.weighbridgeTicketNo}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Volume:</span>
                      <span className="font-bold">{booking.disposalLog.volumeLitres.toLocaleString()} L</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Weight:</span>
                      <span className="font-bold">{booking.disposalLog.weightKg.toLocaleString()} kg</span>
                    </div>
                  </div>
                </div>
              )}

              {booking.deliveryLog && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Flowmeter Delivery Record
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400 block">Meter Start:</span>
                      <span className="font-mono font-bold">{booking.deliveryLog.flowmeterStart.toLocaleString()} L</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Meter End:</span>
                      <span className="font-mono font-bold">{booking.deliveryLog.flowmeterEnd.toLocaleString()} L</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Net Delivered:</span>
                      <span className="font-mono font-bold text-blue-700">
                        {booking.deliveryLog.litresDelivered.toLocaleString()} L
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Citizen Sign-Off (if completed) */}
              {booking.citizenSignOff && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Citizen Sign-Off:</span>
                  <span className="font-bold text-gray-900">{booking.citizenSignOff}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FEE BREAKDOWN & E-RECEIPT */}
          {activeTab === 'fee' && (
            <div className="space-y-5">
              {/* Itemized Fee Breakdown */}
              <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Itemized Tariff Calculation
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">
                      Base Fare ({booking.estimatedFee.loads} load(s) × {formatLKR(booking.estimatedFee.farePerLoad)}):
                    </span>
                    <span className="font-mono font-bold text-gray-900">
                      {formatLKR(booking.estimatedFee.loads * booking.estimatedFee.farePerLoad)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">
                      Transit Fee ({booking.estimatedFee.distanceKm.toFixed(1)} km × {formatLKR(booking.estimatedFee.transportFeePerKm)}/km):
                    </span>
                    <span className="font-mono font-bold text-gray-900">
                      {formatLKR(booking.estimatedFee.distanceKm * booking.estimatedFee.transportFeePerKm)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 text-sm font-extrabold">
                    <span className="text-gray-900">Total Fee:</span>
                    <span className="text-[#A31736] font-mono">{formatLKR(booking.estimatedFee.totalLKR)}</span>
                  </div>
                </div>
              </div>

              {/* E-Receipt Card if available */}
              {booking.receipt ? (
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🧾</span>
                      <span className="font-bold text-emerald-950 text-xs uppercase tracking-wider">
                        Official E-Receipt
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                      {booking.receipt.receiptNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-emerald-700 block font-medium">Payment Method</span>
                      <span className="font-bold text-emerald-950">{booking.receipt.method}</span>
                    </div>
                    <div>
                      <span className="text-emerald-700 block font-medium">Paid At</span>
                      <span className="font-bold text-emerald-950">{formatTimestamp(booking.receipt.paidAt)}</span>
                    </div>
                    <div>
                      <span className="text-emerald-700 block font-medium">Amount Paid</span>
                      <span className="font-mono text-base font-black text-emerald-800">
                        {formatLKR(booking.receipt.amountLKR)}
                      </span>
                    </div>
                    <div>
                      <span className="text-emerald-700 block font-medium">Status</span>
                      <span className="font-bold text-emerald-700">✓ Settled in Full</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-center text-xs text-gray-500">
                  No payment recorded yet. Receipt will be generated upon counter payment or citizen online settlement.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LIVE TRACKING (SIMULATED GPS) */}
          {activeTab === 'tracking' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Simulated GPS Telemetry & Site Navigation
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Live GPS tracker connecting driver bowser {booking.assignedVehicleReg || 'WP GB-5544'}
                  </p>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Simulated GPS Online
                </span>
              </div>

              {/* Leaflet Mini Map Container */}
              <div className="relative rounded-2xl border border-gray-300 overflow-hidden h-64 bg-slate-100 shadow-inner">
                <div ref={mapContainerRef} className="w-full h-full" />
                <div className="absolute top-2.5 right-2.5 z-10 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-gray-800 shadow-sm border border-gray-200">
                  Speed: {simulatedSpeed} km/h • Heading: 142°
                </div>
              </div>

              {/* Telemetry Status Bar */}
              <div className="grid grid-cols-4 gap-2.5 text-center text-xs">
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Trip Progress</span>
                  <span className="font-mono font-black text-gray-900 text-sm">
                    {Math.round(gpsProgress * 100)}%
                  </span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Distance Covered</span>
                  <span className="font-mono font-black text-gray-900 text-sm">
                    {(booking.estimatedFee.distanceKm * gpsProgress).toFixed(1)} km
                  </span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Estimated ETA</span>
                  <span className="font-mono font-black text-emerald-700 text-sm">
                    ~{Math.max(2, Math.round((1 - gpsProgress) * 20))} mins
                  </span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Vehicle Unit</span>
                  <span className="font-mono font-bold text-[#A31736] text-xs truncate block">
                    {booking.assignedVehicleReg || 'WP GB-5544'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WORKFLOW TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Full Workflow Audit Trail
              </h4>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {booking.timeline.map((entry, idx) => (
                  <div key={idx} className="relative text-xs space-y-1">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#A31736] border-2 border-white shadow-xs" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{entry.event}</span>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {formatTimestamp(entry.at)}
                      </span>
                    </div>
                    <p className="text-gray-500 text-[11px]">By: {entry.actor}</p>
                    {entry.note && (
                      <p className="text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-200 font-mono text-[11px]">
                        {entry.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SIMULATED NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Citizen Notifications (Simulated Dispatch Log)
              </h4>
              <div className="space-y-2.5">
                {booking.notifications.map((n, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{n.channel} to {n.recipient}</span>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {n.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-mono">{formatTimestamp(n.at)}</span>
                    </div>
                    <p className="text-gray-700 italic bg-white p-2 rounded border border-gray-200 text-[11px]">
                      &quot;{n.message}&quot;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/80 shrink-0 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Current Status:{' '}
            <strong className="text-gray-900">{booking.status}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs hover:bg-white transition-all cursor-pointer"
            >
              Close
            </button>

            {actionText && (
              <button
                type="button"
                onClick={() => onOpenAction(booking)}
                className="px-5 py-2 rounded-xl bg-[#A31736] hover:bg-[#85122b] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>{actionText}</span>
                <span>→</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
