import React, { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import {
  SERVICE_CONFIG,
  DEPOT_COORDS,
  type ServiceType,
  type GullyServiceDetails,
  type WaterServiceDetails,
  type ApplicantDetails,
  type LocationPin,
  type FeeBreakdown,
  type BookingRecord,
} from '../data/initialBookingData'
import { haversineDistanceKm, calculateFee, formatLKR } from '../utils/bookingUtils'

interface NewBookingModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateBooking: (data: {
    serviceType: ServiceType
    applicant: ApplicantDetails
    location: LocationPin
    scheduledDate: string
    scheduledTime: string
    serviceDetails: GullyServiceDetails | WaterServiceDetails
    estimatedFee: FeeBreakdown
    source: 'Staff Counter'
  }) => BookingRecord
}

const WARDS = [
  { name: 'Homagama Town (Ward 01)', lat: 6.8433, lng: 80.0014 },
  { name: 'Pitipana (Ward 02)', lat: 6.8282, lng: 80.0211 },
  { name: 'Godagama (Ward 03)', lat: 6.8524, lng: 80.0125 },
  { name: 'Meegoda (Ward 04)', lat: 6.8591, lng: 80.0382 },
  { name: 'Panagoda (Ward 05)', lat: 6.8624, lng: 79.9982 },
  { name: 'Mattegoda (Ward 06)', lat: 6.8219, lng: 79.9723 },
  { name: 'Diyagama (Ward 07)', lat: 6.8142, lng: 80.0185 },
  { name: 'Kahathuduwa (Ward 08)', lat: 6.7891, lng: 79.9984 },
  { name: 'Kiriwattuduwa (Ward 09)', lat: 6.7942, lng: 80.0271 },
]

/**
 * Modal dialog for staff to register a counter/walk-in or telephone bowser booking.
 * Features service selection, applicant details, interactive map pin drop,
 * service-specific specifications, and real-time fee estimation.
 */
export const NewBookingModal: React.FC<NewBookingModalProps> = ({
  isOpen,
  onClose,
  onCreateBooking,
}) => {
  const [serviceType, setServiceType] = useState<ServiceType>('GULLY_BOWSER')

  // Applicant
  const [name, setName] = useState('')
  const [nic, setNic] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [ward, setWard] = useState(WARDS[1].name)

  // Location Pin
  const [pinLat, setPinLat] = useState<number>(WARDS[1].lat)
  const [pinLng, setPinLng] = useState<number>(WARDS[1].lng)
  const [hasPin, setHasPin] = useState(false)
  const [locationLabel, setLocationLabel] = useState('')

  // Schedule
  const [todayDate] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
  })
  const [scheduledDate, setScheduledDate] = useState(todayDate)
  const [scheduledTime, setScheduledTime] = useState(() => {
    const nextHour = new Date()
    nextHour.setHours(nextHour.getHours() + 1)
    return `${nextHour.getHours().toString().padStart(2, '0')}:${nextHour.getMinutes().toString().padStart(2, '0')}`
  })

  // Gully details
  const [pitVolumeLitres, setPitVolumeLitres] = useState<number>(5000)
  const [wasteType, setWasteType] = useState<'Domestic Septage' | 'Commercial Septage' | 'Drain & Gully Silt'>('Domestic Septage')
  const [distanceFromGateM, setDistanceFromGateM] = useState<number>(15)
  const [hoseLengthRequiredM, setHoseLengthRequiredM] = useState<number>(20)
  const [roadWidthM, setRoadWidthM] = useState<number>(4.0)

  // Water details
  const [waterVolumeLitres, setWaterVolumeLitres] = useState<number>(8000)
  const [loadsRequired, setLoadsRequired] = useState<number>(1)
  const [waterPurpose, setWaterPurpose] = useState<'Drinking' | 'Domestic' | 'Festival' | 'Construction'>('Domestic')
  const [storageTankType, setStorageTankType] = useState<'Overhead Tank' | 'Ground Sump' | 'Barrel or Small Tank' | 'Reservoir'>('Overhead Tank')

  // Error state
  const [error, setError] = useState<string | null>(null)

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const pinMarkerRef = useRef<L.Marker | null>(null)

  /** Commits a site pin and keeps its draggable map marker synchronized. */
  const placePin = (lat: number, lng: number) => {
    setPinLat(lat)
    setPinLng(lng)
    setHasPin(true)
    const map = mapInstanceRef.current
    if (!map) return
    if (pinMarkerRef.current) {
      pinMarkerRef.current.setLatLng([lat, lng])
      return
    }
    const icon = L.divIcon({
      className: 'custom-job-pin',
      html: '<div style="background: #A31736; color: white; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-size: 14px;">📍</div>',
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    })
    const marker = L.marker([lat, lng], { icon, draggable: true }).addTo(map)
    marker.on('dragend', (event) => {
      const position = (event.target as L.Marker).getLatLng()
      placePin(Math.round(position.lat * 10000) / 10000, Math.round(position.lng * 10000) / 10000)
    })
    pinMarkerRef.current = marker
  }

  /** Confirms the currently selected ward or manually entered coordinates as the site pin. */
  const confirmCoordinates = () => {
    if (!Number.isFinite(pinLat) || !Number.isFinite(pinLng) || pinLat < -90 || pinLat > 90 || pinLng < -180 || pinLng > 180) {
      setError('Enter valid latitude and longitude coordinates before confirming.')
      return
    }
    placePin(pinLat, pinLng)
    setError(null)
  }

  // Distance & fee calculation
  const distanceKm = useMemo(() => {
    return haversineDistanceKm(DEPOT_COORDS.lat, DEPOT_COORDS.lng, pinLat, pinLng)
  }, [pinLat, pinLng])

  const effectiveLoads = serviceType === 'GULLY_BOWSER' ? Math.max(1, Math.ceil(pitVolumeLitres / 6000)) : loadsRequired

  const feeBreakdown: FeeBreakdown = useMemo(() => {
    return calculateFee(serviceType, effectiveLoads, distanceKm)
  }, [serviceType, effectiveLoads, distanceKm])

  // Initialize mini Leaflet map when modal is opened
  useEffect(() => {
    if (!isOpen) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        pinMarkerRef.current = null
      }
      return
    }

    const timer = setTimeout(() => {
      if (!mapContainerRef.current || mapInstanceRef.current) return

      const map = L.map(mapContainerRef.current, {
        center: [pinLat, pinLng],
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map)

      // Depot Marker
      const depotIcon = L.divIcon({
        className: 'custom-depot-pin',
        html: `
          <div style="background: #1e3a8a; color: white; padding: 4px 8px; border-radius: 8px; font-size: 10px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span>🏢</span> Depot
          </div>
        `,
        iconSize: [60, 24],
        iconAnchor: [30, 24],
      })
      L.marker([DEPOT_COORDS.lat, DEPOT_COORDS.lng], { icon: depotIcon })
        .addTo(map)
        .bindTooltip('Homagama Municipal Depot', { permanent: false })

      // Job Pin Marker
      const jobIcon = L.divIcon({
        className: 'custom-job-pin',
        html: `
          <div style="background: #A31736; color: white; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-size: 14px;">
            📍
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      })

      mapInstanceRef.current = map

      map.on('click', (e: L.LeafletMouseEvent) => {
        const roundedLat = Math.round(e.latlng.lat * 10000) / 10000
        const roundedLng = Math.round(e.latlng.lng * 10000) / 10000
        placePin(roundedLat, roundedLng)
      })

      if (hasPin) {
        const marker = L.marker([pinLat, pinLng], { icon: jobIcon, draggable: true }).addTo(map)
        marker.on('dragend', (event) => {
          const position = (event.target as L.Marker).getLatLng()
          placePin(Math.round(position.lat * 10000) / 10000, Math.round(position.lng * 10000) / 10000)
        })
        pinMarkerRef.current = marker
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // When ward select changes, pan map to ward center
  const handleWardChange = (wardName: string) => {
    setWard(wardName)
    const found = WARDS.find((w) => w.name === wardName)
    if (found) {
      setPinLat(found.lat)
      setPinLng(found.lng)
      setHasPin(false)
      pinMarkerRef.current?.remove()
      pinMarkerRef.current = null
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo([found.lat, found.lng])
      }
    }
  }

  /** Clears the site-pin confirmation before closing the booking form. */
  const handleClose = () => {
    setHasPin(false)
    pinMarkerRef.current?.remove()
    pinMarkerRef.current = null
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Please provide applicant full name.')
      return
    }
    if (!nic.trim()) {
      setError('Please provide applicant National Identity Card (NIC) number.')
      return
    }
    if (!phone.trim()) {
      setError('Please provide contact telephone number.')
      return
    }
    if (!address.trim()) {
      setError('Please provide destination service address.')
      return
    }
    if (!/^(?:0?7\d{8}|947\d{8})$/.test(phone.replace(/\D/g, ''))) {
      setError('Enter a valid Sri Lankan mobile number (for example, 077-1234567).')
      return
    }
    if (!/^(?:\d{9}[VvXx]|\d{12})$/.test(nic.trim())) {
      setError('Enter a valid NIC: 9 digits followed by V/X, or 12 digits.')
      return
    }
    if (!hasPin) {
      setError('Drop a site pin on the map, or confirm the selected ward coordinates before submitting.')
      return
    }
    if (!Number.isFinite(pinLat) || !Number.isFinite(pinLng) || pinLat < -90 || pinLat > 90 || pinLng < -180 || pinLng > 180) {
      setError('Enter valid latitude and longitude coordinates.')
      return
    }

    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`)
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) {
      setError('Choose a future date and time. A booking scheduled today must be later than the current time.')
      return
    }

    const numericValues = serviceType === 'GULLY_BOWSER'
      ? [pitVolumeLitres, distanceFromGateM, hoseLengthRequiredM, roadWidthM]
      : [waterVolumeLitres, loadsRequired]
    if (numericValues.some((value) => !Number.isFinite(value) || value <= 0)) {
      setError('All service-specific measurements, volumes, and load counts must be greater than zero.')
      return
    }
    if (distanceKm === 0) {
      setError('The site is 0.0 km from the depot. Move the pin to the actual service location before submitting.')
      return
    }

    const locLabel = locationLabel.trim() || `${address.trim()}, ${ward}`

    const location: LocationPin = {
      lat: pinLat,
      lng: pinLng,
      label: locLabel,
    }

    const applicant: ApplicantDetails = {
      name: name.trim(),
      nic: nic.trim(),
      phone: phone.trim(),
      address: address.trim(),
      ward,
    }

    const serviceDetails: GullyServiceDetails | WaterServiceDetails =
      serviceType === 'GULLY_BOWSER'
        ? {
            serviceType: 'GULLY_BOWSER',
            pitVolumeLitres,
            wasteType,
            distanceFromGateM,
            hoseLengthRequiredM,
            roadWidthM,
          }
        : {
            serviceType: 'WATER_BOWSER',
            waterVolumeLitres,
            loadsRequired,
            purpose: waterPurpose,
            storageTankType,
          }

    onCreateBooking({
      serviceType,
      applicant,
      location,
      scheduledDate,
      scheduledTime,
      serviceDetails,
      estimatedFee: feeBreakdown,
      source: 'Staff Counter',
    })

    handleClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 cursor-default"
        onClick={handleClose}
        aria-label="Close modal"
      />

      {/* Modal Dialog */}
      <div className="relative bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-10 animate-scale-up flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#A31736]" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">New Bowser Service Booking</h3>
              <p className="text-xs text-gray-500 font-medium">
                Pradeshiya Sabha Staff Counter / Telephone Application Intake
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            type="button"
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer font-bold text-xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-sm">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* 1. Service Type Selector */}
          <div>
            <p className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              1. Service Selection
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setServiceType('GULLY_BOWSER')}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  serviceType === 'GULLY_BOWSER'
                    ? 'border-[#A31736] bg-rose-50/60 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-xl">🚛</span>
                  <span className="font-bold text-gray-900">
                    {SERVICE_CONFIG.GULLY_BOWSER.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Septage, pit emptying & silt suction. Base LKR {SERVICE_CONFIG.GULLY_BOWSER.farePerLoad.toLocaleString()} / load + LKR {SERVICE_CONFIG.GULLY_BOWSER.transportFeePerKm} / km.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setServiceType('WATER_BOWSER')}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  serviceType === 'WATER_BOWSER'
                    ? 'border-[#1e3a8a] bg-blue-50/60 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-xl">💧</span>
                  <span className="font-bold text-gray-900">
                    {SERVICE_CONFIG.WATER_BOWSER.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Potable & domestic water supply. Base LKR {SERVICE_CONFIG.WATER_BOWSER.farePerLoad.toLocaleString()} / load + LKR {SERVICE_CONFIG.WATER_BOWSER.transportFeePerKm} / km.
                </p>
              </button>
            </div>
          </div>

          {/* 2. Applicant Details */}
          <div>
            <p className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              2. Applicant & Beneficiary
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="booking-applicant-name" className="block text-xs text-gray-500 mb-1 font-medium">Full Name *</label>
                <input
                  id="booking-applicant-name"
                  type="text"
                  required
                  placeholder="e.g. Priyantha Dissanayake"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#A31736]"
                />
              </div>

              <div>
                <label htmlFor="booking-applicant-nic" className="block text-xs text-gray-500 mb-1 font-medium">NIC Number *</label>
                <input
                  id="booking-applicant-nic"
                  type="text"
                  required
                  placeholder="e.g. 198214502391 / 821452391V"
                  value={nic}
                  onChange={(e) => setNic(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#A31736]"
                />
              </div>

              <div>
                <label htmlFor="booking-applicant-phone" className="block text-xs text-gray-500 mb-1 font-medium">Telephone (SMS Notice) *</label>
                <input
                  id="booking-applicant-phone"
                  type="text"
                  required
                  placeholder="e.g. 077-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#A31736]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <label htmlFor="booking-applicant-address" className="block text-xs text-gray-500 mb-1 font-medium">Street Address / Premises *</label>
                <input
                  id="booking-applicant-address"
                  type="text"
                  required
                  placeholder="e.g. 142/B, High Level Road, Homagama"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#A31736]"
                />
              </div>

              <div>
                <label htmlFor="booking-applicant-ward" className="block text-xs text-gray-500 mb-1 font-medium">Municipal Ward / Division *</label>
                <select
                  id="booking-applicant-ward"
                  value={ward}
                  onChange={(e) => handleWardChange(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#A31736]"
                >
                  {WARDS.map((w) => (
                    <option key={w.name} value={w.name}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 3. Interactive Map Pin & Distance */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                3. Service Site GPS Pin Drop
              </p>
              <span className="text-xs font-mono font-bold text-[#A31736] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Straight-line Distance: {distanceKm.toFixed(1)} km from Depot
              </span>
            </div>

            {/* Leaflet map container */}
            <div className="relative rounded-xl border border-gray-300 overflow-hidden h-52 bg-slate-100">
              <div ref={mapContainerRef} className="w-full h-full" />
              <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-700 shadow-xs border border-gray-200">
                💡 Click the map to drop a pin; choose a ward and confirm its coordinates below.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2.5">
              <div>
                <label htmlFor="booking-pin-latitude" className="block text-[11px] text-gray-500 mb-1">Latitude</label>
                <input
                  id="booking-pin-latitude"
                  type="number"
                  step="0.0001"
                  value={pinLat}
                  onChange={(e) => {
                    setPinLat(Number(e.target.value))
                    setHasPin(false)
                    pinMarkerRef.current?.remove()
                    pinMarkerRef.current = null
                  }}
                  className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                />
              </div>
              <div>
                <label htmlFor="booking-pin-longitude" className="block text-[11px] text-gray-500 mb-1">Longitude</label>
                <input
                  id="booking-pin-longitude"
                  type="number"
                  step="0.0001"
                  value={pinLng}
                  onChange={(e) => {
                    setPinLng(Number(e.target.value))
                    setHasPin(false)
                    pinMarkerRef.current?.remove()
                    pinMarkerRef.current = null
                  }}
                  className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                />
              </div>
              <div>
                <label htmlFor="booking-location-label" className="block text-[11px] text-gray-500 mb-1">Landmark / Access Note</label>
                <input
                  id="booking-location-label"
                  type="text"
                  placeholder="e.g. Near Temple junction, narrow lane"
                  value={locationLabel}
                  onChange={(e) => setLocationLabel(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs"
                />
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <button type="button" onClick={confirmCoordinates} className="px-3 py-1.5 rounded border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50">
                Confirm Ward / Coordinates
              </button>
              {distanceKm === 0 && (
                <p className="text-xs font-semibold text-amber-700" role="status">
                  Warning: distance is 0.0 km. Move the pin to the actual service site.
                </p>
              )}
            </div>
          </div>

          {/* 4. Service-Specific Specifications */}
          <div>
            <p className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              4. Technical & Service Specifications
            </p>

            {serviceType === 'GULLY_BOWSER' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <label htmlFor="booking-pit-volume" className="block text-xs text-gray-600 mb-1 font-medium">Pit Volume (L)</label>
                  <input
                    id="booking-pit-volume"
                    type="number"
                    min="1000"
                    step="500"
                    value={pitVolumeLitres}
                    onChange={(e) => setPitVolumeLitres(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-semibold"
                  />
                  <span className="text-[10px] text-gray-400">~{effectiveLoads} load(s)</span>
                </div>

                <div>
                  <label htmlFor="booking-waste-type" className="block text-xs text-gray-600 mb-1 font-medium">Waste Type</label>
                  <select
                    id="booking-waste-type"
                    value={wasteType}
                    onChange={(e) => setWasteType(e.target.value as typeof wasteType)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                  >
                    <option value="Domestic Septage">Domestic Septage</option>
                    <option value="Commercial Septage">Commercial Septage</option>
                    <option value="Drain & Gully Silt">Drain & Gully Silt</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="booking-distance-from-gate" className="block text-xs text-gray-600 mb-1 font-medium">Dist. from Gate (m)</label>
                  <input
                    id="booking-distance-from-gate"
                    type="number"
                    min="1"
                    value={distanceFromGateM}
                    onChange={(e) => setDistanceFromGateM(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="booking-hose-length" className="block text-xs text-gray-600 mb-1 font-medium">Hose Length (m)</label>
                  <input
                    id="booking-hose-length"
                    type="number"
                    min="5"
                    value={hoseLengthRequiredM}
                    onChange={(e) => setHoseLengthRequiredM(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="booking-road-width" className="block text-xs text-gray-600 mb-1 font-medium">Road Width (m)</label>
                  <input
                    id="booking-road-width"
                    type="number"
                    step="0.5"
                    min="2"
                    value={roadWidthM}
                    onChange={(e) => setRoadWidthM(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <label htmlFor="booking-water-volume" className="block text-xs text-gray-600 mb-1 font-medium">Water Volume (L)</label>
                  <input
                    id="booking-water-volume"
                    type="number"
                    min="1000"
                    step="1000"
                    value={waterVolumeLitres}
                    onChange={(e) => setWaterVolumeLitres(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label htmlFor="booking-loads-required" className="block text-xs text-gray-600 mb-1 font-medium">Loads Required</label>
                  <input
                    id="booking-loads-required"
                    type="number"
                    min="1"
                    max="10"
                    value={loadsRequired}
                    onChange={(e) => setLoadsRequired(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label htmlFor="booking-water-purpose" className="block text-xs text-gray-600 mb-1 font-medium">Purpose</label>
                  <select
                    id="booking-water-purpose"
                    value={waterPurpose}
                    onChange={(e) => setWaterPurpose(e.target.value as typeof waterPurpose)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                  >
                    <option value="Domestic">Domestic</option>
                    <option value="Drinking">Drinking</option>
                    <option value="Festival">Festival / Public Gathering</option>
                    <option value="Construction">Construction</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="booking-storage-tank-type" className="block text-xs text-gray-600 mb-1 font-medium">Storage Tank Type</label>
                  <select
                    id="booking-storage-tank-type"
                    value={storageTankType}
                    onChange={(e) => setStorageTankType(e.target.value as typeof storageTankType)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                  >
                    <option value="Overhead Tank">Overhead Tank</option>
                    <option value="Ground Sump">Ground Sump</option>
                    <option value="Barrel or Small Tank">Barrel or Small Tank</option>
                    <option value="Reservoir">Reservoir</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 5. Schedule & Estimated Fee Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                5. Requested Schedule
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="booking-scheduled-date" className="block text-xs text-gray-500 mb-1">Date</label>
                  <input
                    id="booking-scheduled-date"
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={todayDate}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#A31736]"
                  />
                </div>
                <div>
                  <label htmlFor="booking-scheduled-time" className="block text-xs text-gray-500 mb-1">Preferred Time</label>
                  <input
                    id="booking-scheduled-time"
                    type="time"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#A31736]"
                  />
                </div>
              </div>
            </div>

            {/* Fee Preview Card */}
            <div>
              <p className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                Fee Estimate Preview
              </p>
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Base Fare ({feeBreakdown.loads} load{feeBreakdown.loads > 1 ? 's' : ''} × {formatLKR(feeBreakdown.farePerLoad)}):</span>
                  <span className="font-semibold">{formatLKR(feeBreakdown.loads * feeBreakdown.farePerLoad)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Transport ({feeBreakdown.distanceKm.toFixed(1)} km × {formatLKR(feeBreakdown.transportFeePerKm)}/km):</span>
                  <span className="font-semibold">{formatLKR(feeBreakdown.distanceKm * feeBreakdown.transportFeePerKm)}</span>
                </div>
                <div className="border-t border-amber-200 pt-1.5 flex justify-between items-center text-sm font-bold text-gray-900">
                  <span>Estimated Total Fee:</span>
                  <span className="text-base text-[#A31736]">{formatLKR(feeBreakdown.totalLKR)}</span>
                </div>
                <p className="text-[10px] text-gray-500 italic mt-1">
                  * Final fee subject to Technical Officer review & checklist confirmation.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#A31736] hover:bg-[#85122b] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Submit & Route to Technical Officer</span>
              <span>→</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
