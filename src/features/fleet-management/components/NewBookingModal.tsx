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
import {
  filterMobileInput,
  filterCoordinateInput,
  filterNameInput,
  filterNicInput,
  filterNumericInput,
  validateFullName,
  validateFreeText,
  validateMobile,
  validateNic,
  validateNumber,
  validateStreetAddress,
  validateWard,
} from '../utils/validators'
import type { BookingActionResult } from '../utils/validators'

interface NewBookingModalProps {
  isOpen: boolean
  onClose: () => void
  onBookingCreated?: (booking: BookingRecord) => void
  onCreateBooking: (data: {
    serviceType: ServiceType
    applicant: ApplicantDetails
    location: LocationPin
    scheduledDate: string
    scheduledTime: string
    serviceDetails: GullyServiceDetails | WaterServiceDetails
    estimatedFee: FeeBreakdown
    source: 'Staff Counter'
  }) => BookingActionResult<BookingRecord>
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
  onBookingCreated,
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
  const [pitVolumeLitres, setPitVolumeLitres] = useState('5000')
  const [wasteType, setWasteType] = useState<'Domestic Septage' | 'Commercial Septage' | 'Drain & Gully Silt'>('Domestic Septage')
  const [distanceFromGateM, setDistanceFromGateM] = useState('15')
  const [hoseLengthRequiredM, setHoseLengthRequiredM] = useState('20')
  const [roadWidthM, setRoadWidthM] = useState('4.0')

  // Water details
  const [waterVolumeLitres, setWaterVolumeLitres] = useState('8000')
  const [loadsRequired, setLoadsRequired] = useState('1')
  const [waterPurpose, setWaterPurpose] = useState<'Drinking' | 'Domestic' | 'Festival' | 'Construction'>('Domestic')
  const [storageTankType, setStorageTankType] = useState<'Overhead Tank' | 'Ground Sump' | 'Barrel or Small Tank' | 'Reservoir'>('Overhead Tank')

  // Error state
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement | null>(null)

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const pinMarkerRef = useRef<L.Marker | null>(null)

  /** Commits a site pin and keeps its draggable map marker synchronized. */
  const placePin = (lat: number, lng: number) => {
    setPinLat(lat)
    setPinLng(lng)
    setHasPin(true)
    setFieldErrors((prev) => ({ ...prev, pin: '' }))
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
      setFieldErrors((prev) => ({ ...prev, pin: 'Enter valid latitude and longitude coordinates before confirming.' }))
      return
    }
    placePin(pinLat, pinLng)
    setError(null)
    setFieldErrors((prev) => ({ ...prev, pin: '' }))
  }

  // Distance & fee calculation
  const distanceKm = useMemo(() => {
    return haversineDistanceKm(DEPOT_COORDS.lat, DEPOT_COORDS.lng, pinLat, pinLng)
  }, [pinLat, pinLng])

  const numericPitVolume = Number(pitVolumeLitres)
  const numericDistanceFromGate = Number(distanceFromGateM)
  const numericHoseLength = Number(hoseLengthRequiredM)
  const numericRoadWidth = Number(roadWidthM)
  const numericWaterVolume = Number(waterVolumeLitres)
  const numericLoads = Number(loadsRequired)
  const effectiveLoads = serviceType === 'GULLY_BOWSER' ? Math.max(1, Math.ceil(numericPitVolume / 6000)) : numericLoads

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
    setFieldErrors({})
    setError(null)
    setSubmitting(false)
    pinMarkerRef.current?.remove()
    pinMarkerRef.current = null
    onClose()
  }

  /** Validates required applicant and service fields, returning field-addressable messages. */
  const validateFields = (): Record<string, string> => {
    const nextErrors: Record<string, string> = {}
    const nameResult = validateFullName(name)
    const nicResult = validateNic(nic)
    const phoneResult = validateMobile(phone)
    const addressResult = validateStreetAddress(address)
    const wardResult = validateWard(ward, WARDS.map((item) => item.name))
    if (!nameResult.valid) nextErrors.name = nameResult.error
    if (!nicResult.valid) nextErrors.nic = nicResult.error
    if (!phoneResult.valid) nextErrors.phone = phoneResult.error
    if (!addressResult.valid) nextErrors.address = addressResult.error
    if (!wardResult.valid) nextErrors.ward = wardResult.error
    const landmark = validateFreeText(locationLabel, { max: 300 })
    if (!landmark.valid) nextErrors.landmark = landmark.error

    const ranges = SERVICE_CONFIG[serviceType].bookingRanges
    if (serviceType === 'GULLY_BOWSER') {
      const pit = validateNumber(pitVolumeLitres, ranges.pitVolumeLitres.min, ranges.pitVolumeLitres.max, true)
      const gate = validateNumber(distanceFromGateM, ranges.distanceFromGateM.min, ranges.distanceFromGateM.max, true)
      const hose = validateNumber(hoseLengthRequiredM, ranges.hoseLengthRequiredM.min, ranges.hoseLengthRequiredM.max, true)
      const width = validateNumber(roadWidthM, ranges.roadWidthM.min, ranges.roadWidthM.max)
      if (!pit.valid) nextErrors.pitVolume = pit.error
      if (!gate.valid) nextErrors.gateDistance = gate.error
      if (!hose.valid) nextErrors.hoseLength = hose.error
      if (!width.valid || Math.round(width.value * 10) !== width.value * 10) {
        nextErrors.roadWidth = width.error || `Enter a value between ${ranges.roadWidthM.min} and ${ranges.roadWidthM.max} with at most one decimal place.`
      }
    } else {
      const volume = validateNumber(waterVolumeLitres, ranges.waterVolumeLitres.min, ranges.waterVolumeLitres.max, true)
      const loads = validateNumber(loadsRequired, ranges.loadsRequired.min, ranges.loadsRequired.max, true)
      if (!volume.valid) nextErrors.waterVolume = volume.error
      if (!loads.valid) nextErrors.loadsRequired = loads.error
    }
    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`)
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) {
      nextErrors.schedule = 'Choose a future date and time. A booking scheduled today must be later than now.'
    }
    if (!hasPin || !Number.isFinite(pinLat) || !Number.isFinite(pinLng) ||
      pinLat < -90 || pinLat > 90 || pinLng < -180 || pinLng > 180 ||
      distanceKm.toFixed(1) === '0.0') {
      nextErrors.pin = distanceKm.toFixed(1) === '0.0'
        ? 'Move the site pin so its distance is greater than 0.0 km.'
        : 'Drop a site pin or confirm valid ward coordinates.'
    }
    return nextErrors
  }

  /** Validates the form and focuses the first invalid field before returning. */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const nextErrors = validateFields()
    setFieldErrors(nextErrors)
    const firstInvalidId = Object.keys(nextErrors)[0]
    if (firstInvalidId) {
      const inputId: Record<string, string> = {
        name: 'booking-applicant-name',
        nic: 'booking-applicant-nic',
        phone: 'booking-applicant-phone',
        address: 'booking-applicant-address',
        ward: 'booking-applicant-ward',
        pitVolume: 'booking-pit-volume',
        gateDistance: 'booking-distance-from-gate',
        hoseLength: 'booking-hose-length',
        roadWidth: 'booking-road-width',
        waterVolume: 'booking-water-volume',
        loadsRequired: 'booking-loads-required',
        schedule: 'booking-scheduled-date',
        pin: 'booking-pin-latitude',
        landmark: 'booking-location-label',
      }
      const firstInvalid = formRef.current?.querySelector<HTMLElement>(`#${inputId[firstInvalidId]}`)
      firstInvalid?.focus()
      firstInvalid?.scrollIntoView({ block: 'center' })
      setSubmitting(false)
      return
    }
    const locLabel = validateFreeText(locationLabel, { max: 300 }).value || `${address.trim()}, ${ward}`

    const location: LocationPin = {
      lat: pinLat,
      lng: pinLng,
      label: locLabel,
    }

    const applicant: ApplicantDetails = {
      name: validateFullName(name).value,
      nic: validateNic(nic).value,
      phone: validateMobile(phone).value,
      address: validateStreetAddress(address).value,
      ward,
    }

    const serviceDetails: GullyServiceDetails | WaterServiceDetails =
      serviceType === 'GULLY_BOWSER'
        ? {
            serviceType: 'GULLY_BOWSER',
            pitVolumeLitres: numericPitVolume,
            wasteType,
            distanceFromGateM: numericDistanceFromGate,
            hoseLengthRequiredM: numericHoseLength,
            roadWidthM: numericRoadWidth,
          }
        : {
            serviceType: 'WATER_BOWSER',
            waterVolumeLitres: numericWaterVolume,
            loadsRequired: numericLoads,
            purpose: waterPurpose,
            storageTankType,
          }

    const result = onCreateBooking({
      serviceType,
      applicant,
      location,
      scheduledDate,
      scheduledTime,
      serviceDetails,
      estimatedFee: feeBreakdown,
      source: 'Staff Counter',
    })

    if (!result.ok) {
      setFieldErrors(result.errors)
      setError(Object.values(result.errors).join(' '))
      const firstErrorKey = Object.keys(result.errors)[0]
      const fieldIds: Record<string, string> = {
        name: 'booking-applicant-name',
        nic: 'booking-applicant-nic',
        phone: 'booking-applicant-phone',
        address: 'booking-applicant-address',
        ward: 'booking-applicant-ward',
        pitVolumeLitres: 'booking-pit-volume',
        distanceFromGateM: 'booking-distance-from-gate',
        hoseLengthRequiredM: 'booking-hose-length',
        roadWidthM: 'booking-road-width',
        waterVolumeLitres: 'booking-water-volume',
        loadsRequired: 'booking-loads-required',
      }
      const invalid = fieldIds[firstErrorKey]
        ? formRef.current?.querySelector<HTMLElement>(`#${fieldIds[firstErrorKey]}`)
        : undefined
      invalid?.focus()
      invalid?.scrollIntoView({ block: 'center' })
      setSubmitting(false)
      return
    }
    onBookingCreated?.(result.value)
    handleClose()
    setSubmitting(false)
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
        <form ref={formRef} onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-sm" noValidate>
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
                  maxLength={60}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? 'booking-applicant-name-error' : undefined}
                  placeholder="e.g. Priyantha Dissanayake"
                  value={name}
                  onChange={(e) => setName(filterNameInput(e.target.value))}
                  onBlur={() => {
                    const result = validateFullName(name)
                    setFieldErrors((prev) => ({ ...prev, name: result.valid ? '' : result.error }))
                  }}
                  className={`w-full bg-white border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#A31736] ${fieldErrors.name ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
                />
                {fieldErrors.name && <p id="booking-applicant-name-error" className="mt-1 text-xs text-red-700">{fieldErrors.name}</p>}
              </div>

              <div>
                <label htmlFor="booking-applicant-nic" className="block text-xs text-gray-500 mb-1 font-medium">NIC Number *</label>
                <input
                  id="booking-applicant-nic"
                  type="text"
                  maxLength={12}
                  placeholder="e.g. 198214502391 / 821452391V"
                  value={nic}
                  aria-invalid={Boolean(fieldErrors.nic)}
                  aria-describedby={fieldErrors.nic ? 'booking-applicant-nic-error' : undefined}
                  onChange={(e) => setNic(filterNicInput(e.target.value))}
                  onBlur={() => {
                    const result = validateNic(nic)
                    setFieldErrors((prev) => ({ ...prev, nic: result.valid ? '' : result.error }))
                  }}
                  className={`w-full bg-white border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#A31736] ${fieldErrors.nic ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
                />
                {fieldErrors.nic && <p id="booking-applicant-nic-error" className="mt-1 text-xs text-red-700">{fieldErrors.nic}</p>}
              </div>

              <div>
                <label htmlFor="booking-applicant-phone" className="block text-xs text-gray-500 mb-1 font-medium">Telephone (SMS Notice) *</label>
                <input
                  id="booking-applicant-phone"
                  type="text"
                  maxLength={15}
                  placeholder="e.g. 077-1234567"
                  value={phone}
                  aria-invalid={Boolean(fieldErrors.phone)}
                  aria-describedby={fieldErrors.phone ? 'booking-applicant-phone-error' : undefined}
                  onChange={(e) => setPhone(filterMobileInput(e.target.value))}
                  onBlur={() => {
                    const result = validateMobile(phone)
                    setFieldErrors((prev) => ({ ...prev, phone: result.valid ? '' : result.error }))
                  }}
                  className={`w-full bg-white border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#A31736] ${fieldErrors.phone ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
                />
                {fieldErrors.phone && <p id="booking-applicant-phone-error" className="mt-1 text-xs text-red-700">{fieldErrors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <label htmlFor="booking-applicant-address" className="block text-xs text-gray-500 mb-1 font-medium">Street Address / Premises *</label>
                <input
                  id="booking-applicant-address"
                  type="text"
                  maxLength={120}
                  placeholder="e.g. 142/B, High Level Road, Homagama"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  aria-invalid={Boolean(fieldErrors.address)}
                  aria-describedby={fieldErrors.address ? 'booking-applicant-address-error' : undefined}
                  onBlur={() => {
                    const result = validateStreetAddress(address)
                    setFieldErrors((prev) => ({ ...prev, address: result.valid ? '' : result.error }))
                  }}
                  className={`w-full bg-white border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#A31736] ${fieldErrors.address ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
                />
                {fieldErrors.address && <p id="booking-applicant-address-error" className="mt-1 text-xs text-red-700">{fieldErrors.address}</p>}
              </div>

              <div>
                <label htmlFor="booking-applicant-ward" className="block text-xs text-gray-500 mb-1 font-medium">Municipal Ward / Division *</label>
                <select
                  id="booking-applicant-ward"
                  value={ward}
                  onChange={(e) => handleWardChange(e.target.value)}
                  aria-invalid={Boolean(fieldErrors.ward)}
                  aria-describedby={fieldErrors.ward ? 'booking-applicant-ward-error' : undefined}
                  onBlur={() => {
                    const result = validateWard(ward, WARDS.map((item) => item.name))
                    setFieldErrors((prev) => ({ ...prev, ward: result.valid ? '' : result.error }))
                  }}
                  className={`w-full bg-white border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#A31736] ${fieldErrors.ward ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
                >
                  {WARDS.map((w) => (
                    <option key={w.name} value={w.name}>
                      {w.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.ward && <p id="booking-applicant-ward-error" className="mt-1 text-xs text-red-700">{fieldErrors.ward}</p>}
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
                  type="text"
                  inputMode="decimal"
                  value={Number.isFinite(pinLat) ? pinLat : ''}
                  aria-invalid={Boolean(fieldErrors.pin)}
                  aria-describedby={fieldErrors.pin ? 'booking-pin-error' : undefined}
                  onChange={(e) => {
                    const filtered = filterCoordinateInput(e.target.value)
                    setPinLat(filtered ? Number(filtered) : Number.NaN)
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
                  type="text"
                  inputMode="decimal"
                  value={Number.isFinite(pinLng) ? pinLng : ''}
                  aria-invalid={Boolean(fieldErrors.pin)}
                  aria-describedby={fieldErrors.pin ? 'booking-pin-error' : undefined}
                  onChange={(e) => {
                    const filtered = filterCoordinateInput(e.target.value)
                    setPinLng(filtered ? Number(filtered) : Number.NaN)
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
                  maxLength={300}
                  aria-invalid={Boolean(fieldErrors.landmark)}
                  aria-describedby={fieldErrors.landmark ? 'booking-location-label-error' : undefined}
                  onBlur={() => {
                    const result = validateFreeText(locationLabel, { max: 300 })
                    setFieldErrors((prev) => ({ ...prev, landmark: result.valid ? '' : result.error }))
                  }}
                  className={`w-full bg-white border rounded-lg px-2.5 py-1.5 text-xs ${fieldErrors.landmark ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
                />
                {fieldErrors.landmark && <p id="booking-location-label-error" className="mt-1 text-xs text-red-700">{fieldErrors.landmark}</p>}
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <button type="button" onClick={confirmCoordinates} className="px-3 py-1.5 rounded border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50">
                Confirm Ward / Coordinates
              </button>
              {fieldErrors.pin && <p id="booking-pin-error" className="text-xs text-red-700" role="alert">{fieldErrors.pin}</p>}
              {distanceKm.toFixed(1) === '0.0' && (
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
                    type="text"
                    inputMode="numeric"
                    aria-invalid={Boolean(fieldErrors.pitVolume)}
                    aria-describedby={fieldErrors.pitVolume ? 'booking-pit-volume-error' : undefined}
                    value={pitVolumeLitres}
                    onChange={(e) => setPitVolumeLitres(filterNumericInput(e.target.value, false))}
                    onBlur={() => {
                      const range = SERVICE_CONFIG.GULLY_BOWSER.bookingRanges.pitVolumeLitres
                      const result = validateNumber(pitVolumeLitres, range.min, range.max, true)
                      setFieldErrors((prev) => ({ ...prev, pitVolume: result.valid ? '' : result.error }))
                    }}
                    className={`w-full bg-white border rounded-lg px-3 py-1.5 text-xs font-semibold ${fieldErrors.pitVolume ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
                  />
                  {fieldErrors.pitVolume && <p id="booking-pit-volume-error" className="mt-1 text-xs text-red-700">{fieldErrors.pitVolume}</p>}
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
                    type="text"
                    inputMode="numeric"
                    aria-invalid={Boolean(fieldErrors.gateDistance)}
                    aria-describedby={fieldErrors.gateDistance ? 'booking-distance-from-gate-error' : undefined}
                    value={distanceFromGateM}
                    onChange={(e) => setDistanceFromGateM(filterNumericInput(e.target.value, false))}
                    onBlur={() => {
                      const range = SERVICE_CONFIG.GULLY_BOWSER.bookingRanges.distanceFromGateM
                      const result = validateNumber(distanceFromGateM, range.min, range.max, true)
                      setFieldErrors((prev) => ({ ...prev, gateDistance: result.valid ? '' : result.error }))
                    }}
                    className={`w-full bg-white border rounded-lg px-3 py-1.5 text-xs ${fieldErrors.gateDistance ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
                  />
                  {fieldErrors.gateDistance && <p id="booking-distance-from-gate-error" className="mt-1 text-xs text-red-700">{fieldErrors.gateDistance}</p>}
                </div>

                <div>
                  <label htmlFor="booking-hose-length" className="block text-xs text-gray-600 mb-1 font-medium">Hose Length (m)</label>
                  <input
                    id="booking-hose-length"
                    type="text"
                    inputMode="numeric"
                    aria-invalid={Boolean(fieldErrors.hoseLength)}
                    aria-describedby={fieldErrors.hoseLength ? 'booking-hose-length-error' : undefined}
                    value={hoseLengthRequiredM}
                    onChange={(e) => setHoseLengthRequiredM(filterNumericInput(e.target.value, false))}
                    onBlur={() => {
                      const range = SERVICE_CONFIG.GULLY_BOWSER.bookingRanges.hoseLengthRequiredM
                      const result = validateNumber(hoseLengthRequiredM, range.min, range.max, true)
                      setFieldErrors((prev) => ({ ...prev, hoseLength: result.valid ? '' : result.error }))
                    }}
                    className={`w-full bg-white border rounded-lg px-3 py-1.5 text-xs ${fieldErrors.hoseLength ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
                  />
                  {fieldErrors.hoseLength && <p id="booking-hose-length-error" className="mt-1 text-xs text-red-700">{fieldErrors.hoseLength}</p>}
                </div>

                <div>
                  <label htmlFor="booking-road-width" className="block text-xs text-gray-600 mb-1 font-medium">Road Width (m)</label>
                  <input
                    id="booking-road-width"
                    type="text"
                    inputMode="decimal"
                    aria-invalid={Boolean(fieldErrors.roadWidth)}
                    aria-describedby={fieldErrors.roadWidth ? 'booking-road-width-error' : undefined}
                    value={roadWidthM}
                    onChange={(e) => setRoadWidthM(filterNumericInput(e.target.value, true))}
                    onBlur={() => {
                      const range = SERVICE_CONFIG.GULLY_BOWSER.bookingRanges.roadWidthM
                      const result = validateNumber(roadWidthM, range.min, range.max)
                      const validPrecision = Number(roadWidthM) * 10 === Math.round(Number(roadWidthM) * 10)
                      setFieldErrors((prev) => ({
                        ...prev,
                        roadWidth: result.valid && validPrecision ? '' : result.error || `Enter a value between ${range.min} and ${range.max} with at most one decimal place.`,
                      }))
                    }}
                    className={`w-full bg-white border rounded-lg px-3 py-1.5 text-xs ${fieldErrors.roadWidth ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
                  />
                  {fieldErrors.roadWidth && <p id="booking-road-width-error" className="mt-1 text-xs text-red-700">{fieldErrors.roadWidth}</p>}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <label htmlFor="booking-water-volume" className="block text-xs text-gray-600 mb-1 font-medium">Water Volume (L)</label>
                  <input
                    id="booking-water-volume"
                    type="text"
                    inputMode="numeric"
                    aria-invalid={Boolean(fieldErrors.waterVolume)}
                    aria-describedby={fieldErrors.waterVolume ? 'booking-water-volume-error' : undefined}
                    value={waterVolumeLitres}
                    onChange={(e) => setWaterVolumeLitres(filterNumericInput(e.target.value, false))}
                    onBlur={() => {
                      const range = SERVICE_CONFIG.WATER_BOWSER.bookingRanges.waterVolumeLitres
                      const result = validateNumber(waterVolumeLitres, range.min, range.max, true)
                      setFieldErrors((prev) => ({ ...prev, waterVolume: result.valid ? '' : result.error }))
                    }}
                    className={`w-full bg-white border rounded-lg px-3 py-1.5 text-xs font-semibold ${fieldErrors.waterVolume ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
                  />
                  {fieldErrors.waterVolume && <p id="booking-water-volume-error" className="mt-1 text-xs text-red-700">{fieldErrors.waterVolume}</p>}
                </div>

                <div>
                  <label htmlFor="booking-loads-required" className="block text-xs text-gray-600 mb-1 font-medium">Loads Required</label>
                  <input
                    id="booking-loads-required"
                    type="text"
                    inputMode="numeric"
                    aria-invalid={Boolean(fieldErrors.loadsRequired)}
                    aria-describedby={fieldErrors.loadsRequired ? 'booking-loads-required-error' : undefined}
                    value={loadsRequired}
                    onChange={(e) => setLoadsRequired(filterNumericInput(e.target.value, false))}
                    onBlur={() => {
                      const range = SERVICE_CONFIG.WATER_BOWSER.bookingRanges.loadsRequired
                      const result = validateNumber(loadsRequired, range.min, range.max, true)
                      setFieldErrors((prev) => ({ ...prev, loadsRequired: result.valid ? '' : result.error }))
                    }}
                    className={`w-full bg-white border rounded-lg px-3 py-1.5 text-xs font-semibold ${fieldErrors.loadsRequired ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
                  />
                  {fieldErrors.loadsRequired && <p id="booking-loads-required-error" className="mt-1 text-xs text-red-700">{fieldErrors.loadsRequired}</p>}
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
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    aria-invalid={Boolean(fieldErrors.schedule)}
                    aria-describedby={fieldErrors.schedule ? 'booking-schedule-error' : undefined}
                    onBlur={() => {
                      const date = new Date(`${scheduledDate}T${scheduledTime}`)
                      const valid = !Number.isNaN(date.getTime()) && date.getTime() > Date.now()
                      setFieldErrors((prev) => ({ ...prev, schedule: valid ? '' : 'Choose a future date and time.' }))
                    }}
                    min={todayDate}
                    className={`w-full bg-white border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#A31736] ${fieldErrors.schedule ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
                  />
                  {fieldErrors.schedule && <p id="booking-schedule-error" className="mt-1 text-xs text-red-700">{fieldErrors.schedule}</p>}
                </div>
                <div>
                  <label htmlFor="booking-scheduled-time" className="block text-xs text-gray-500 mb-1">Preferred Time</label>
                  <input
                    id="booking-scheduled-time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    aria-invalid={Boolean(fieldErrors.schedule)}
                    aria-describedby={fieldErrors.schedule ? 'booking-schedule-error' : undefined}
                    onBlur={() => {
                      const date = new Date(`${scheduledDate}T${scheduledTime}`)
                      const valid = !Number.isNaN(date.getTime()) && date.getTime() > Date.now()
                      setFieldErrors((prev) => ({ ...prev, schedule: valid ? '' : 'Choose a future date and time.' }))
                    }}
                    className={`w-full bg-white border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#A31736] ${fieldErrors.schedule ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
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
              disabled={submitting}
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
