import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import L from 'leaflet'
import { varipanamService } from '../services/varipanamService'
import type {
  Property,
  LocationHistory,
  PropertyIdentifier,
  Payment,
  AuditEntry,
  OwnershipRecord,
  Valuation,
} from '../types/varipanam'
import { formatLKR, formatDate } from '../utils/formatters'
import StatusBadge from '../components/shared/StatusBadge'
import NeedsConfirmationBadge from '../components/shared/NeedsConfirmationBadge'

type TabType =
  | 'overview'
  | 'dues'
  | 'payments'
  | 'owners'
  | 'valuations'
  | 'subdivisions'
  | 'documents'
  | 'history'

export const Property360Page: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [property, setProperty] = useState<Property | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [locationHistories, setLocationHistories] = useState<LocationHistory[]>([])
  const [identifierHistories, setIdentifierHistories] = useState<PropertyIdentifier[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // Edit Location Modal State
  const [showEditLocationModal, setShowEditLocationModal] = useState<boolean>(false)
  const [newLat, setNewLat] = useState<number>(0)
  const [newLng, setNewLng] = useState<number>(0)
  const [editReason, setEditReason] = useState<string>('')
  const [isSavingLocation, setIsSavingLocation] = useState<boolean>(false)

  // Timeline filters
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('All')

  // Mini Map ref
  const miniMapContainerRef = useRef<HTMLDivElement | null>(null)
  const miniMapInstanceRef = useRef<L.Map | null>(null)

  // Load property details
  useEffect(() => {
    let isMounted = true
    const loadDetails = async () => {
      if (!id) return
      setIsLoading(true)
      try {
        const prop = await varipanamService.getPropertyById(id)
        if (!isMounted) return
        setProperty(prop)

        if (prop) {
          setNewLat(prop.latitude)
          setNewLng(prop.longitude)

          const [pmts, locs, idents, audits] = await Promise.all([
            varipanamService.getPayments(prop.id),
            varipanamService.getLocationHistories(prop.id),
            varipanamService.getIdentifierHistories(prop.id),
            varipanamService.getAuditLogs(prop.id),
          ])
          if (!isMounted) return
          setPayments(pmts)
          setLocationHistories(locs)
          setIdentifierHistories(idents)
          setAuditLogs(audits)
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadDetails()
    return () => {
      isMounted = false
    }
  }, [id])

  // Mini Map Initialization for Overview Tab
  useEffect(() => {
    if (activeTab !== 'overview' || !property || !miniMapContainerRef.current) return

    if (miniMapInstanceRef.current) {
      miniMapInstanceRef.current.remove()
      miniMapInstanceRef.current = null
    }

    const map = L.map(miniMapContainerRef.current, {
      center: [property.latitude, property.longitude],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    const pinIcon = L.divIcon({
      html: `
        <div style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
          <svg viewBox="0 0 36 46" width="30" height="38">
            <path d="M18 0C8.06 0 0 8.06 0 18C0 31.5 18 46 18 46S36 31.5 36 18C36 8.06 27.94 0 18 0Z" fill="#A31736" />
            <circle cx="18" cy="18" r="8" fill="#FFFFFF" />
            <circle cx="18" cy="18" r="4.5" fill="#A31736" />
          </svg>
        </div>
      `,
      className: 'mini-map-pin',
      iconSize: [30, 38],
      iconAnchor: [15, 38],
    })

    L.marker([property.latitude, property.longitude], { icon: pinIcon }).addTo(map)
    miniMapInstanceRef.current = map

    return () => {
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove()
        miniMapInstanceRef.current = null
      }
    }
  }, [activeTab, property])

  // Handle Edit Location Save (Keeps Location History without overwriting)
  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!property || !editReason.trim()) return

    setIsSavingLocation(true)
    try {
      const res = await varipanamService.updatePropertyLocation(
        property.id,
        { latitude: newLat, longitude: newLng },
        editReason.trim()
      )
      setProperty(res.property)
      setLocationHistories((prev) => [res.locationHistory, ...prev])
      setShowEditLocationModal(false)
      setEditReason('')
    } finally {
      setIsSavingLocation(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-[#A31736]/20 border-t-[#A31736] rounded-full animate-spin" />
        <p className="text-xs font-semibold text-gray-500">Loading Property 360 Profile...</p>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center max-w-lg mx-auto my-12">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Property Not Found</h2>
        <p className="text-xs text-gray-500 mb-4">
          The requested assessment unit ref or ID "{id}" could not be located in the council registry.
        </p>
        <button
          type="button"
          onClick={() => navigate('/finances/varipanam')}
          className="px-4 py-2 bg-[#A31736] text-white text-xs font-bold rounded-xl"
        >
          Return to Varipanam Dashboard
        </button>
      </div>
    )
  }

  // Financial Metrics
  const totalArrears = property.dues
    .filter((d) => d.year < 2026)
    .reduce((s, d) => s + (d.amount - d.paidAmount), 0)
  const currentYearDue = property.dues
    .filter((d) => d.year === 2026)
    .reduce((s, d) => s + (d.amount - d.paidAmount), 0)
  const totalAmountDue = property.dues.reduce((s, d) => s + (d.amount - d.paidAmount), 0)
  const warrantCharge = property.activeWarrant?.warrantCost || 0
  const totalPayable = totalAmountDue + warrantCharge

  // Mock historical ownerships
  const ownershipHistory: OwnershipRecord[] = [
    {
      id: 'own-rec-1',
      propertyId: property.id,
      ownerId: property.currentOwner.id,
      ownerName: property.currentOwner.name,
      nic: property.currentOwner.nic,
      mobile: property.currentOwner.mobile,
      isCurrent: true,
      effectiveDate: '2023-01-15',
      deedNumber: 'Deed No. 4412/Notary P. Wickrama',
      approvedBy: 'Municipal Secretary (PS/HMG/2023/881)',
    },
    {
      id: 'own-rec-2',
      propertyId: property.id,
      ownerId: 'own-old-01',
      ownerName: 'L. M. Dharmadasa (Former Owner)',
      nic: '195512400987',
      mobile: '+94 71 222 3333',
      isCurrent: false,
      effectiveDate: '2010-06-12',
      endDate: '2023-01-15',
      deedNumber: 'Deed No. 1024',
      approvedBy: 'Secretary (Archives Reg. 2010/44)',
    },
  ]

  // Mock valuation history
  const valuationHistory: Valuation[] = [
    {
      id: 'val-2',
      propertyId: property.id,
      annualAssessedValue: property.annualAssessedValue,
      effectiveYear: 2024,
      approvedBy: 'Chief Valuation Officer (HMG/VAL/2024)',
      valuationDate: '2024-01-05',
      reportNumber: 'VAL-REP-2024-089',
    },
    {
      id: 'val-1',
      propertyId: property.id,
      annualAssessedValue: Math.round(property.annualAssessedValue * 0.8),
      effectiveYear: 2019,
      approvedBy: 'Revenue Inspector (General Quinquennial)',
      valuationDate: '2019-01-10',
      reportNumber: 'VAL-REP-2019-002',
    },
  ]

  // Combined History Timeline
  const timelineEvents = [
    ...auditLogs.map((a) => ({
      id: a.id,
      type: 'Audit',
      title: a.action,
      date: a.timestamp,
      actor: a.performedBy,
      details: typeof a.details === 'string' ? a.details : JSON.stringify(a.details),
    })),
    ...locationHistories.map((l) => ({
      id: l.id,
      type: 'Location',
      title: 'GPS Coordinates Updated',
      date: l.changedAt,
      actor: l.changedBy,
      details: `Coordinates shifted from (${l.oldLatitude.toFixed(4)}, ${l.oldLongitude.toFixed(4)}) to (${l.newLatitude.toFixed(4)}, ${l.newLongitude.toFixed(4)}). Reason: ${l.reason}`,
    })),
    ...payments.map((p) => ({
      id: p.id,
      type: 'Payment',
      title: `Payment Received (${p.status})`,
      date: p.date,
      actor: p.officerName,
      details: `Receipt ${p.receiptNumber} for ${formatLKR(p.amount)} via ${p.method}. ${p.notes || ''}`,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const filteredTimeline =
    historyTypeFilter === 'All'
      ? timelineEvents
      : timelineEvents.filter((ev) => ev.type === historyTypeFilter)

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* ── Breadcrumb & Top Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link to="/finances/varipanam" className="hover:text-[#A31736] font-semibold">
              ← Varipanam Dashboard
            </Link>
            <span>/</span>
            <span className="font-mono text-gray-700">Property 360</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight font-mono">
              {property.assessmentNumber}
            </h1>
            <StatusBadge status={property.status} size="md" />
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
              {property.propertyType}
            </span>
            <NeedsConfirmationBadge tooltip="Legal ownership disclaimer: This record is a municipal council tax assessment unit, not conclusive legal title." />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {property.propertyNumber} • {property.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEditLocationModal(true)}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-gray-500">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Edit Location</span>
          </button>
        </div>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-1 shadow-xs flex overflow-x-auto scrollbar-none">
        {(
          [
            { id: 'overview', label: 'Overview & GIS' },
            { id: 'dues', label: 'Dues & Rates' },
            { id: 'payments', label: 'Receipts & Payments' },
            { id: 'owners', label: 'Ownership History' },
            { id: 'valuations', label: 'Valuations & Old Refs' },
            { id: 'subdivisions', label: 'Subdivisions' },
            { id: 'documents', label: 'Documents' },
            { id: 'history', label: 'Audit Timeline' },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#A31736] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Tab Content ── */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Details Card */}
          <div className="lg:col-span-7 space-y-5">
            {/* Property Unit Details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">
                Assessment Unit Identifiers
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 font-medium">Assessment Number</span>
                  <p className="font-mono font-bold text-gray-900 text-sm">{property.assessmentNumber}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Property Number</span>
                  <p className="font-bold text-gray-900">{property.propertyNumber}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Property Category</span>
                  <p className="font-semibold text-gray-800">{property.propertyType}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Annual Assessed Value</span>
                  <p className="font-mono font-bold text-gray-900 text-sm">
                    {formatLKR(property.annualAssessedValue)}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 font-medium">Description</span>
                  <p className="text-gray-700 mt-0.5">{property.description}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Registered Since</span>
                  <p className="text-gray-800">{formatDate(property.createdAt)}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Last Assessed Date</span>
                  <p className="text-gray-800">{formatDate(property.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Current Ownership Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">
                Current Registered Owner
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-gray-400 font-medium">Full Legal Name</span>
                  <p className="font-bold text-gray-900 text-sm">{property.currentOwner.name}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">National Identity Card (NIC)</span>
                  <p className="font-mono font-bold text-gray-800">{property.currentOwner.nic}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Mobile Contact</span>
                  <p className="font-mono text-gray-800">{property.currentOwner.mobile}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Postal Address</span>
                  <p className="text-gray-800">{property.currentOwner.postalAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Mini Map Card */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  GIS Geo-Spatial Cadastre
                </h3>
                <span className="text-[10px] font-mono text-gray-500">
                  {property.latitude.toFixed(5)}, {property.longitude.toFixed(5)}
                </span>
              </div>

              {/* Leaflet Mini Map */}
              <div
                ref={miniMapContainerRef}
                className="w-full h-[260px] rounded-xl border border-gray-200 shadow-inner overflow-hidden"
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-500">Coordinates confirmed</span>
                <button
                  type="button"
                  onClick={() => setShowEditLocationModal(true)}
                  className="font-bold text-[#A31736] hover:underline"
                >
                  Adjust GPS Coordinates →
                </button>
              </div>
            </div>

            {/* Quick Dues Summary Card */}
            <div className="bg-rose-50/60 rounded-2xl border border-rose-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                  Outstanding Balance
                </span>
                <StatusBadge status={property.status} size="sm" />
              </div>
              <p className="text-2xl font-black text-rose-700 font-mono">{formatLKR(totalPayable)}</p>
              <div className="text-[11px] text-gray-600 space-y-1 pt-2 border-t border-rose-200/60">
                <div className="flex justify-between">
                  <span>Prior Years Arrears:</span>
                  <span className="font-bold text-gray-900">{formatLKR(totalArrears)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Year (2026) Dues:</span>
                  <span className="font-bold text-gray-900">{formatLKR(currentYearDue)}</span>
                </div>
                {warrantCharge > 0 && (
                  <div className="flex justify-between text-purple-800 font-semibold">
                    <span>Warrant Enforcement Penalty:</span>
                    <span className="font-bold">{formatLKR(warrantCharge)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DUES & RATES TAB */}
      {activeTab === 'dues' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Quarterly Dues & Statutory Rate Computations
              </h3>
              <p className="text-xs text-gray-500">
                Annual Tax: {formatLKR(property.annualAssessedValue * 0.1)} (Quarterly: {formatLKR((property.annualAssessedValue * 0.1) / 4)})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700">Total Payable:</span>
              <span className="text-base font-black text-rose-600 font-mono">{formatLKR(totalPayable)}</span>
            </div>
          </div>

          {/* Dues Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5">Period / Quarter</th>
                  <th className="px-4 py-2.5">Due Date</th>
                  <th className="px-4 py-2.5 text-right">Billed Amount</th>
                  <th className="px-4 py-2.5 text-right">Paid Amount</th>
                  <th className="px-4 py-2.5 text-right">Balance Outstanding</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {property.dues.map((due) => {
                  const bal = due.amount - due.paidAmount
                  return (
                    <tr key={due.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {due.year} Quarter {due.quarter}
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-600">{due.dueDate}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800">
                        {formatLKR(due.amount)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-600">
                        {formatLKR(due.paidAmount)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold font-mono">
                        <span className={bal > 0 ? 'text-rose-600' : 'text-gray-400'}>{formatLKR(bal)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            due.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : due.status === 'Overdue'
                              ? 'bg-rose-100 text-rose-800'
                              : due.status === 'Warrant'
                              ? 'bg-purple-100 text-purple-900'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {due.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PAYMENTS & RECEIPTS TAB */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Receipts & Payments Ledger
              </h3>
              <p className="text-xs text-gray-500">Official Council & Temporary Field Receipts</p>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              No payment transactions recorded for this assessment unit yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2.5">Receipt #</th>
                    <th className="px-4 py-2.5">Payment Date</th>
                    <th className="px-4 py-2.5">Method</th>
                    <th className="px-4 py-2.5">Issued Officer</th>
                    <th className="px-4 py-2.5 text-right">Amount</th>
                    <th className="px-4 py-2.5 text-center">Receipt Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((pmt) => (
                    <tr key={pmt.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-bold text-gray-900">{pmt.receiptNumber}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(pmt.date)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-700">{pmt.method}</td>
                      <td className="px-4 py-3 text-gray-700">{pmt.officerName}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600 font-mono">
                        {formatLKR(pmt.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {pmt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. OWNERSHIP HISTORY TAB */}
      {activeTab === 'owners' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Continuous Ownership Chain (Never Overwritten)
            </h3>
            <p className="text-xs text-gray-500">
              The assessment unit record belongs to the property; ownership transitions are immutably archived.
            </p>
          </div>

          <div className="space-y-3">
            {ownershipHistory.map((rec) => (
              <div
                key={rec.id}
                className={`p-4 rounded-xl border ${
                  rec.isCurrent
                    ? 'bg-emerald-50/50 border-emerald-300'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">{rec.ownerName}</span>
                    {rec.isCurrent ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded-full">
                        Current Owner
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-gray-200 text-gray-700 rounded-full">
                        Historical
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    Effective: {rec.effectiveDate} {rec.endDate ? `to ${rec.endDate}` : ''}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600">
                  <div>NIC: {rec.nic}</div>
                  <div>Contact: {rec.mobile}</div>
                  <div>Legal Authority: {rec.deedNumber}</div>
                </div>
                <p className="text-[11px] text-gray-400 mt-2">Authorised: {rec.approvedBy}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. VALUATIONS & OLD IDENTIFIERS TAB */}
      {activeTab === 'valuations' && (
        <div className="space-y-5">
          {/* Identifier History */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">
              Identifier History (Searchable Old Assessment Numbers)
            </h3>
            {identifierHistories.length === 0 ? (
              <p className="text-xs text-gray-400">No previous assessment numbers recorded. Original number remains active.</p>
            ) : (
              <div className="space-y-2">
                {identifierHistories.map((idEntry) => (
                  <div key={idEntry.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                    <span className="font-mono font-bold text-gray-900">{idEntry.oldAssessmentNumber}</span>
                    <span className="text-gray-500 ml-2">(Obsolete as of {idEntry.obsoleteDate})</span>
                    <p className="text-gray-600 mt-1">Reason: {idEntry.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Valuation History */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">
              Valuation Assessment Changes
            </h3>
            <div className="space-y-3">
              {valuationHistory.map((val) => (
                <div key={val.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-900 text-sm">{formatLKR(val.annualAssessedValue)}</span>
                    <span className="text-gray-500 ml-2">Effective Year {val.effectiveYear}</span>
                    <p className="text-gray-600 mt-1">{val.approvedBy} • Report {val.reportNumber}</p>
                  </div>
                  <span className="text-gray-400">{formatDate(val.valuationDate)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. SUBDIVISIONS TAB */}
      {activeTab === 'subdivisions' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Subdivision Lineage & Child Plots
            </h3>
            <p className="text-xs text-gray-500">Parent/Child parcel splits with arrears inheritance linkages</p>
          </div>
          {property.subdivisionParentId ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
              <span className="font-bold">Subdivided Child Plot:</span> This unit was carved out of parent assessment unit{' '}
              <strong className="font-mono">{property.subdivisionParentId}</strong>.
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600">
              No parent subdivision link. This unit is an original municipal parcel.
            </div>
          )}
        </div>
      )}

      {/* 7. DOCUMENTS TAB */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Archived Statutory Documents
            </h3>
            <p className="text-xs text-gray-500">Deed copies, Survey Plans, Notary Attestations & Building Approvals</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: 'Deed_4412_Certified_Copy.pdf', size: '2.4 MB', type: 'Deed Copy', date: '2023-01-15' },
              { name: 'Approved_Survey_Plan_908_Homagama.pdf', size: '3.1 MB', type: 'Survey Plan', date: '2023-01-15' },
              { name: 'Notary_Attestation_Report.pdf', size: '1.1 MB', type: 'Notary Report', date: '2023-01-15' },
            ].map((doc) => (
              <div key={doc.name} className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-gray-900 truncate max-w-[200px]">{doc.name}</p>
                  <p className="text-gray-500 text-[11px]">{doc.type} • {doc.size}</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Opening ${doc.name}`)}
                  className="px-2.5 py-1 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100"
                >
                  View PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. AUDIT TIMELINE TAB */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Audit Trail & History Timeline
              </h3>
              <p className="text-xs text-gray-500">Newest first event stream with filterable actions</p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 text-xs">
              {(['All', 'Audit', 'Location', 'Payment'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setHistoryTypeFilter(t)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    historyTypeFilter === t
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="relative border-l-2 border-gray-200 ml-3 pl-5 space-y-5">
            {filteredTimeline.map((item) => (
              <div key={item.id} className="relative group">
                <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-[#A31736] border-2 border-white shadow-xs" />
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-gray-900">{item.title}</span>
                  <span className="text-[11px] text-gray-400">{formatDate(item.date)}</span>
                </div>
                <p className="text-xs text-gray-600">{item.details}</p>
                <p className="text-[10px] text-gray-400 mt-1">Logged by: {item.actor}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Edit Location Modal ── */}
      {showEditLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900">Adjust Property GPS Coordinates</h3>
            <p className="text-xs text-gray-500">
              Editing coordinates writes an immutable LocationHistory record. Historical coordinates are permanently preserved.
            </p>

            <form onSubmit={handleSaveLocation} className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">New Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={newLat}
                    onChange={(e) => setNewLat(parseFloat(e.target.value))}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">New Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={newLng}
                    onChange={(e) => setNewLng(parseFloat(e.target.value))}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason for Location Amendment *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Boundary realignment verified via Cadastral Survey Plan 908/2026..."
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A31736]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditLocationModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingLocation}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#A31736] rounded-xl hover:bg-[#801028] disabled:opacity-50"
                >
                  {isSavingLocation ? 'Saving...' : 'Confirm Amendment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Property360Page
