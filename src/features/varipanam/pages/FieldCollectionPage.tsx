import React, { useState, useMemo } from 'react'
import {
  Tablet,
  Receipt,
  CheckCircle,
  Printer,
  DollarSign,
  Search,
  X,
  User,
  Filter,
  CreditCard,
  Banknote,
  Calendar,
  MapPin,
  Building,
} from 'lucide-react'
import { useVaripanam } from '../context/VaripanamContext'
import NeedsConfirmationBadge from '../components/shared/NeedsConfirmationBadge'
import { formatLKR } from '../utils/formatters'

interface TemporaryReceiptData {
  tempReceiptNumber: string
  assessmentNumber: string
  ownerName: string
  amount: number
  date: string
  officer: string
  status: string
}

export const FieldCollectionPage: React.FC = () => {
  const {
    properties,
    zones,
    wards,
    roads,
    fieldCollections,
    reconcileFieldCollection,
  } = useVaripanam()

  const [activeTab, setActiveTab] = useState<'collect' | 'reconcile'>('collect')

  // Location Hierarchy & Property Selection state for Mobile Field Collection
  const initialProp = properties[0]
  const [selectedZoneId, setSelectedZoneId] = useState<string>(initialProp?.zoneId || '')
  const [selectedWardId, setSelectedWardId] = useState<string>(initialProp?.wardId || '')
  const [selectedRoadId, setSelectedRoadId] = useState<string>(initialProp?.roadId || '')
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(initialProp?.id || '')
  const [propertyFilterQuery, setPropertyFilterQuery] = useState<string>('')

  const [collectedAmount, setCollectedAmount] = useState<string>('5000')
  const [fieldOfficerName, setFieldOfficerName] = useState<string>('H. L. Ratnayake (Distraining Officer)')
  const [temporaryReceipt, setTemporaryReceipt] = useState<TemporaryReceiptData | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Reconciliation tab search & filter state
  const [officerSearchQuery, setOfficerSearchQuery] = useState<string>('')
  const [officerStatusFilter, setOfficerStatusFilter] = useState<'ALL' | 'Pending' | 'Reconciled'>('ALL')

  // Available Wards based on selected Zone
  const availableWards = useMemo(() => {
    if (!selectedZoneId) return wards
    return wards.filter((w) => w.zoneId === selectedZoneId)
  }, [wards, selectedZoneId])

  // Available Roads based on selected Zone and Ward
  const availableRoads = useMemo(() => {
    return roads.filter((r) => {
      if (selectedZoneId && r.zoneId !== selectedZoneId) return false
      if (selectedWardId && r.wardId && r.wardId !== selectedWardId) return false
      return true
    })
  }, [roads, selectedZoneId, selectedWardId])

  // Available Properties based on selected Zone, Ward, Road, and quick search query
  const availableProperties = useMemo(() => {
    return properties.filter((p) => {
      if (selectedZoneId && p.zoneId !== selectedZoneId) return false
      if (selectedWardId && p.wardId !== selectedWardId) return false
      if (selectedRoadId && p.roadId !== selectedRoadId) return false

      if (propertyFilterQuery.trim()) {
        const q = propertyFilterQuery.trim().toLowerCase()
        const matchAsm = p.assessmentNumber.toLowerCase().includes(q)
        const matchNum = p.propertyNumber.toLowerCase().includes(q)
        const matchOwner = p.currentOwner.name.toLowerCase().includes(q)
        const matchNic = p.currentOwner.nic.toLowerCase().includes(q)
        if (!matchAsm && !matchNum && !matchOwner && !matchNic) return false
      }

      return true
    })
  }, [properties, selectedZoneId, selectedWardId, selectedRoadId, propertyFilterQuery])

  const selectedProp = properties.find((p) => p.id === selectedPropertyId)

  // Handlers for Zone, Ward, Road changes
  const handleZoneChange = (newZoneId: string) => {
    setSelectedZoneId(newZoneId)

    // Reset ward if it doesn't belong to the newly selected zone
    if (newZoneId && selectedWardId) {
      const isWardValid = wards.some((w) => w.id === selectedWardId && w.zoneId === newZoneId)
      if (!isWardValid) setSelectedWardId('')
    }
    // Reset road if it doesn't belong to the newly selected zone
    if (newZoneId && selectedRoadId) {
      const isRoadValid = roads.some((r) => r.id === selectedRoadId && r.zoneId === newZoneId)
      if (!isRoadValid) setSelectedRoadId('')
    }

    // Auto-update selected property
    const matchingProps = properties.filter((p) => !newZoneId || p.zoneId === newZoneId)
    if (!matchingProps.some((p) => p.id === selectedPropertyId)) {
      const next = matchingProps[0]
      setSelectedPropertyId(next?.id || '')
      if (next) {
        const totalDue = next.dues.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0)
        if (totalDue > 0) setCollectedAmount(totalDue.toString())
      }
    }
  }

  const handleWardChange = (newWardId: string) => {
    setSelectedWardId(newWardId)

    // If ward selected, ensure zone is synced
    if (newWardId) {
      const w = wards.find((item) => item.id === newWardId)
      if (w && w.zoneId && w.zoneId !== selectedZoneId) {
        setSelectedZoneId(w.zoneId)
      }
      if (selectedRoadId) {
        const isRoadValid = roads.some((r) => r.id === selectedRoadId && (!r.wardId || r.wardId === newWardId))
        if (!isRoadValid) setSelectedRoadId('')
      }
    }

    // Auto-update selected property
    const matchingProps = properties.filter((p) => {
      if (selectedZoneId && p.zoneId !== selectedZoneId) return false
      if (newWardId && p.wardId !== newWardId) return false
      return true
    })
    if (!matchingProps.some((p) => p.id === selectedPropertyId)) {
      const next = matchingProps[0]
      setSelectedPropertyId(next?.id || '')
      if (next) {
        const totalDue = next.dues.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0)
        if (totalDue > 0) setCollectedAmount(totalDue.toString())
      }
    }
  }

  const handleRoadChange = (newRoadId: string) => {
    setSelectedRoadId(newRoadId)

    // If road selected, sync zone & ward
    if (newRoadId) {
      const r = roads.find((item) => item.id === newRoadId)
      if (r) {
        if (r.zoneId && r.zoneId !== selectedZoneId) setSelectedZoneId(r.zoneId)
        if (r.wardId && r.wardId !== selectedWardId) setSelectedWardId(r.wardId)
      }
    }

    // Auto-update selected property
    const matchingProps = properties.filter((p) => {
      if (selectedZoneId && p.zoneId !== selectedZoneId) return false
      if (selectedWardId && p.wardId !== selectedWardId) return false
      if (newRoadId && p.roadId !== newRoadId) return false
      return true
    })
    if (!matchingProps.some((p) => p.id === selectedPropertyId)) {
      const next = matchingProps[0]
      setSelectedPropertyId(next?.id || '')
      if (next) {
        const totalDue = next.dues.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0)
        if (totalDue > 0) setCollectedAmount(totalDue.toString())
      }
    }
  }

  const handlePropertyChange = (newPropId: string) => {
    setSelectedPropertyId(newPropId)
    const prop = properties.find((p) => p.id === newPropId)
    if (prop) {
      if (prop.zoneId) setSelectedZoneId(prop.zoneId)
      if (prop.wardId) setSelectedWardId(prop.wardId)
      if (prop.roadId) setSelectedRoadId(prop.roadId)
      const totalDue = prop.dues.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0)
      if (totalDue > 0) {
        setCollectedAmount(totalDue.toString())
      }
    }
  }

  const handleRecordFieldPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProp) return

    const tempRecNo = `TMP-FLD-${Math.floor(10000 + Math.random() * 90000)}`
    const receiptData = {
      tempReceiptNumber: tempRecNo,
      assessmentNumber: selectedProp.assessmentNumber,
      ownerName: selectedProp.currentOwner.name,
      amount: Number(collectedAmount),
      date: new Date().toLocaleDateString(),
      officer: fieldOfficerName,
      status: 'TEMPORARY (Awaiting Cashier Reconciliation)',
    }

    setTemporaryReceipt(receiptData)
    setSuccessMessage(`Temporary field receipt ${tempRecNo} issued! Payment logged under field officer ledger. Final balance will update upon cashier reconciliation.`)
  }

  const handleReconcile = async (collectionId: string) => {
    await reconcileFieldCollection(collectionId, 'Super Admin')
    setSuccessMessage('Field cash surrender verified and reconciled! Payments transitioned from TEMPORARY to OFFICIAL.')
  }

  // Filtered field collections based on officer search query and status
  const filteredCollections = useMemo(() => {
    return fieldCollections.filter((col) => {
      // Status filter
      if (officerStatusFilter !== 'ALL' && col.status !== officerStatusFilter) {
        return false
      }

      // Search query (officer name, officer ID, date, receipt numbers)
      if (!officerSearchQuery.trim()) return true
      const q = officerSearchQuery.trim().toLowerCase()

      const matchName = col.officerName.toLowerCase().includes(q)
      const matchId = col.officerId ? col.officerId.toLowerCase().includes(q) : false
      const matchDate = col.date ? col.date.toLowerCase().includes(q) : false
      const matchReceipts = col.receiptIds ? col.receiptIds.some((r) => r.toLowerCase().includes(q)) : false

      return matchName || matchId || matchDate || matchReceipts
    })
  }, [fieldCollections, officerSearchQuery, officerStatusFilter])

  const pendingCount = fieldCollections.filter((c) => c.status === 'Pending').length
  const reconciledCount = fieldCollections.filter((c) => c.status === 'Reconciled').length

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              Field Collection & Reconciliation
            </h1>
            <NeedsConfirmationBadge tooltip="Field payments remain TEMPORARY until reconciled with surrendered cash at the counter to prevent duplicate crediting." />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Tablet-optimized mobile collection desk for Distraining Officers & Revenue Inspectors.
          </p>
        </div>

        <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
          <button
            type="button"
            onClick={() => setActiveTab('collect')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'collect' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'
            }`}
          >
            Tablet Field Collection
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reconcile')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reconcile' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'
            }`}
          >
            <span>Office Reconciliation Desk</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#A31736]/10 text-[#A31736]">
              {fieldCollections.length}
            </span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── TAB 1: Tablet Field Collection ── */}
      {activeTab === 'collect' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Form (Col 6) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Tablet className="w-4 h-4 text-[#A31736]" />
              <span>Mobile Field Collection Form</span>
            </h2>

            <form onSubmit={handleRecordFieldPayment} className="space-y-4">
              {/* ── Location Hierarchy Selection: Zone *, Ward *, Road / Street * ── */}
              <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#A31736]" />
                    <span>Location Hierarchy</span>
                  </span>
                  {(selectedZoneId || selectedWardId || selectedRoadId) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedZoneId('')
                        setSelectedWardId('')
                        setSelectedRoadId('')
                        setSelectedPropertyId(properties[0]?.id || '')
                      }}
                      className="text-[10px] text-[#A31736] font-bold hover:underline cursor-pointer"
                    >
                      Reset Location
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Select Zone * */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Select Zone <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={selectedZoneId}
                      onChange={(e) => handleZoneChange(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 outline-none focus:border-[#A31736] transition-all cursor-pointer"
                      required
                    >
                      <option value="">-- Select Zone * --</option>
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name} ({z.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Ward * */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Select Ward <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={selectedWardId}
                      onChange={(e) => handleWardChange(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 outline-none focus:border-[#A31736] transition-all cursor-pointer"
                      required
                    >
                      <option value="">-- Select Ward * --</option>
                      {availableWards.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} (Ward {w.number})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Road / Street * */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Select Road / Street <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={selectedRoadId}
                      onChange={(e) => handleRoadChange(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 outline-none focus:border-[#A31736] transition-all cursor-pointer"
                      required
                    >
                      <option value="">-- Select Road / Street * --</option>
                      {availableRoads.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} {r.code ? `(${r.code})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Select Property on Field * ── */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 block flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#A31736]" />
                    <span>Select Property on Field <span className="text-rose-600">*</span></span>
                  </label>
                  <span className="text-[11px] font-bold text-[#A31736] bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                    {availableProperties.length} properties in list
                  </span>
                </div>

                {/* Quick search input to filter dropdown items if desired */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={propertyFilterQuery}
                    onChange={(e) => setPropertyFilterQuery(e.target.value)}
                    placeholder="Quick filter dropdown by assessment no, owner name, or NIC..."
                    className="w-full pl-8.5 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736] focus:bg-white transition-all font-medium placeholder:text-gray-400"
                  />
                  {propertyFilterQuery && (
                    <button
                      type="button"
                      onClick={() => setPropertyFilterQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Property Dropdown */}
                <select
                  value={selectedPropertyId}
                  onChange={(e) => handlePropertyChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-[#A31736] focus:bg-white transition-all cursor-pointer"
                  required
                >
                  {availableProperties.length === 0 ? (
                    <option value="">No registered properties found in this selected location</option>
                  ) : (
                    <>
                      <option value="">-- Choose Property from Dropdown * --</option>
                      {availableProperties.map((p) => {
                        const totalDue = p.dues.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0)
                        return (
                          <option key={p.id} value={p.id}>
                            {p.assessmentNumber} — {p.currentOwner.name} ({p.propertyNumber}) {totalDue > 0 ? `• Due: LKR ${totalDue.toLocaleString()}` : '• Fully Paid'}
                          </option>
                        )
                      })}
                    </>
                  )}
                </select>
              </div>

              {/* Selected Property Details Card */}
              {selectedProp && (
                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-black text-gray-900 text-sm">
                        {selectedProp.assessmentNumber}
                      </span>
                      <span className="text-gray-500 ml-1.5 font-semibold">({selectedProp.propertyNumber})</span>
                      <span className="ml-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-200 text-gray-700">
                        {selectedProp.propertyType}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedProp.status === 'Overdue' || selectedProp.status === 'Warrant issued'
                          ? 'bg-rose-100 text-rose-800'
                          : selectedProp.status === 'Due soon'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {selectedProp.status}
                    </span>
                  </div>

                  <div className="text-gray-700 text-xs space-y-0.5">
                    <p>
                      <strong className="text-gray-900">Owner:</strong> {selectedProp.currentOwner.name}{' '}
                      <span className="text-gray-400 font-mono">({selectedProp.currentOwner.nic})</span>
                    </p>
                    <p className="text-gray-500">
                      <strong className="text-gray-700">Address:</strong> {selectedProp.currentOwner.postalAddress}
                    </p>
                    <p className="text-gray-500">
                      <strong className="text-gray-700">Location:</strong>{' '}
                      {zones.find((z) => z.id === selectedProp.zoneId)?.name || 'Homagama'} •{' '}
                      {wards.find((w) => w.id === selectedProp.wardId)?.name || 'Ward'} •{' '}
                      {roads.find((r) => r.id === selectedProp.roadId)?.name || 'Road'}
                    </p>
                  </div>

                  {(() => {
                    const totalOutstanding = selectedProp.dues.reduce(
                      (sum, d) => sum + (d.amount - d.paidAmount),
                      0
                    )
                    return totalOutstanding > 0 ? (
                      <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-[11px] text-gray-600">
                          Total Arrears & Dues:{' '}
                          <strong className="text-rose-700 font-mono font-bold">
                            {formatLKR(totalOutstanding)}
                          </strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setCollectedAmount(totalOutstanding.toString())}
                          className="text-[11px] font-bold text-[#A31736] hover:underline cursor-pointer"
                        >
                          Auto-Fill Balance
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-gray-200 text-[11px] text-emerald-700 font-semibold">
                        ✓ No overdue property tax arrears for this assessment unit.
                      </div>
                    )
                  })()}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Cash Collected (LKR) *</label>
                <input
                  type="number"
                  value={collectedAmount}
                  onChange={(e) => setCollectedAmount(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-base font-mono font-black text-gray-900 outline-none focus:border-[#A31736]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Collecting Officer</label>
                <input
                  type="text"
                  value={fieldOfficerName}
                  onChange={(e) => setFieldOfficerName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 outline-none"
                  readOnly
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Issue & Print Temporary Mobile Receipt</span>
              </button>
            </form>
          </div>

          {/* Printable Temporary Receipt Preview (Col 6) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#A31736]" />
                <span>Temporary Receipt Customer Copy</span>
              </h2>

              {temporaryReceipt ? (
                <div className="p-5 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/60 font-mono text-xs space-y-2 text-gray-800">
                  <div className="text-center pb-2 border-b border-gray-300">
                    <p className="font-bold text-sm">HOMAGAMA PRADESHIYA SABHA</p>
                    <p className="text-[10px] text-gray-500 uppercase">Field Collection Temporary Receipt</p>
                  </div>
                  <div className="flex justify-between">
                    <span>Receipt No:</span>
                    <span className="font-bold">{temporaryReceipt.tempReceiptNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assessment No:</span>
                    <span className="font-bold">{temporaryReceipt.assessmentNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxpayer:</span>
                    <span>{temporaryReceipt.ownerName}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-[#A31736] pt-1 border-t border-gray-200">
                    <span>Amount Paid:</span>
                    <span>{formatLKR(temporaryReceipt.amount)}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 pt-2 border-t border-gray-200">
                    <p>Officer: {temporaryReceipt.officer}</p>
                    <p>Status: {temporaryReceipt.status}</p>
                    <p className="mt-1 text-gray-500">Official council receipt will be issued following cashier cash surrender reconciliation.</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl">
                  <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Issue a collection on the left to generate the mobile receipt preview.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: Office Cashier Reconciliation Desk ── */}
      {activeTab === 'reconcile' && (
        <div className="space-y-4">
          {/* Main Card with Search and Officer Records */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-5">
            {/* Header + Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <span>Field Officer Cash Surrender & Reconciliation</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Verify surrendered cash envelopes and counter-sign field collections before crediting property tax accounts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {pendingCount} Pending Surrender
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {reconciledCount} Reconciled
                </span>
              </div>
            </div>

            {/* ── Officer Search Bar & Status Filter Bar ── */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search Bar to Search the Officer */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={officerSearchQuery}
                  onChange={(e) => setOfficerSearchQuery(e.target.value)}
                  placeholder="Search officer by name, officer ID (e.g. DO-01, RI-01), date, or receipt..."
                  className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736] focus:bg-white transition-all font-medium placeholder:text-gray-400"
                />
                {officerSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setOfficerSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Dropdown */}
              <div className="flex items-center gap-2 min-w-[200px]">
                <div className="relative w-full">
                  <Filter className="w-3.5 h-3.5 text-[#A31736] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={officerStatusFilter}
                    onChange={(e) => setOfficerStatusFilter(e.target.value as any)}
                    className="w-full pl-8.5 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-[#A31736] focus:bg-white transition-all cursor-pointer appearance-none"
                  >
                    <option value="ALL">All Statuses ({fieldCollections.length})</option>
                    <option value="Pending">Pending Only ({pendingCount})</option>
                    <option value="Reconciled">Reconciled Only ({reconciledCount})</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Count Bar */}
            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
              <span>
                Showing <strong className="text-gray-800">{filteredCollections.length}</strong> of{' '}
                <strong className="text-gray-800">{fieldCollections.length}</strong> officer collection records
                {officerSearchQuery && (
                  <span className="text-[#A31736] font-semibold ml-1">
                    for &ldquo;{officerSearchQuery}&rdquo;
                  </span>
                )}
              </span>
              {(officerSearchQuery || officerStatusFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setOfficerSearchQuery('')
                    setOfficerStatusFilter('ALL')
                  }}
                  className="text-xs text-[#A31736] hover:underline font-semibold cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Officer Collections List */}
            <div className="space-y-3">
              {filteredCollections.length === 0 ? (
                <div className="p-10 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <User className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-bold text-gray-700">No matching field officers found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    No officer surrender records matched &ldquo;{officerSearchQuery}&rdquo;
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setOfficerSearchQuery('')
                      setOfficerStatusFilter('ALL')
                    }}
                    className="mt-3 px-3.5 py-1.5 text-xs font-bold text-[#A31736] bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg cursor-pointer transition-colors"
                  >
                    Reset Officer Search
                  </button>
                </div>
              ) : (
                filteredCollections.map((col) => (
                  <div
                    key={col.id}
                    className="p-4.5 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-2xl text-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Officer Avatar Icon */}
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 text-[#A31736] font-bold shadow-2xs">
                        <User className="w-5 h-5 text-[#A31736]" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-gray-900 text-sm">{col.officerName}</span>
                          {col.officerId && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-gray-200/70 text-gray-700 border border-gray-300">
                              {col.officerId}
                            </span>
                          )}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              col.status === 'Reconciled'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border-amber-200'
                            }`}
                          >
                            {col.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-gray-500 text-[11px]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>Surrender Date: <strong className="text-gray-700">{col.date}</strong></span>
                          </span>
                          <span>•</span>
                          <span>
                            <strong className="text-gray-700">{col.receiptIds?.length || col.paymentIds.length}</strong> Field Receipts
                          </span>
                          {col.receiptIds && col.receiptIds.length > 0 && (
                            <span className="text-gray-400 font-mono text-[10px]">
                              ({col.receiptIds.join(', ')})
                            </span>
                          )}
                        </div>

                        {/* Breakdown if cash and card both present */}
                        {(col.amountCash !== undefined || col.amountCard !== undefined) && (
                          <div className="flex items-center gap-3 pt-0.5 text-[11px] text-gray-600">
                            {col.amountCash !== undefined && (
                              <span className="flex items-center gap-1 font-mono">
                                <Banknote className="w-3 h-3 text-emerald-600" />
                                <span>Cash: {formatLKR(col.amountCash)}</span>
                              </span>
                            )}
                            {col.amountCard !== undefined && col.amountCard > 0 && (
                              <span className="flex items-center gap-1 font-mono">
                                <CreditCard className="w-3 h-3 text-blue-600" />
                                <span>Card/POS: {formatLKR(col.amountCard)}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-gray-200">
                      <div className="text-left md:text-right">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Total Surrendered</p>
                        <p className="font-mono font-black text-emerald-700 text-base">{formatLKR(col.totalAmount)}</p>
                      </div>

                      {col.status !== 'Reconciled' ? (
                        <button
                          type="button"
                          onClick={() => handleReconcile(col.id)}
                          className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Reconcile Cash & Finalize</span>
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Reconciled</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FieldCollectionPage
