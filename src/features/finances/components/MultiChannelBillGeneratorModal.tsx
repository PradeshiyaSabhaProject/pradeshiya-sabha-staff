import React, { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import type { RevenueCategory, InvoiceStatus } from '../data/financeMockData'

interface MultiChannelBillGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
}

const WARD_OPTIONS = [
  'Ward 01 - Town Center',
  'Ward 02 - Homagama Town',
  'Ward 03 - Magammana',
  'Ward 04 - Katuwawala',
  'Ward 05 - Godagama',
  'Ward 06 - Meegoda',
  'Ward 07 - Panagoda',
  'Ward 08 - Pitipana Techno City',
  'Ward 09 - Watareka',
  'Ward 10 - Padukka Border',
]

export const MultiChannelBillGeneratorModal: React.FC<MultiChannelBillGeneratorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createInvoice } = useFinance()

  const [category, setCategory] = useState<RevenueCategory>('Vehicle & Machinery Hire')
  const [customerName, setCustomerName] = useState('')
  const [customerNICorBRN, setCustomerNICorBRN] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [wardNumber, setWardNumber] = useState(WARD_OPTIONS[0])
  const [propertyOrRefId, setPropertyOrRefId] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString().split('T')[0]
  })
  const [status, setStatus] = useState<InvoiceStatus>('Approved & Issued')
  const [notes, setNotes] = useState('')

  // Vehicle / Heavy Equipment Hire state
  const [machineryType, setMachineryType] = useState<'JCB Backhoe Loader' | 'Gully Bowser' | 'Road Roller' | 'Water Tanker' | 'Tractor & Trailer' | 'Cesspool Emptier'>('JCB Backhoe Loader')
  const [hireDuration, setHireDuration] = useState('1 Day (8 Hours)')
  const [operatorFee, setOperatorFee] = useState('5000')
  const [securityDeposit, setSecurityDeposit] = useState('10000')

  // Public Ground / Property Hire state
  const [venueName, setVenueName] = useState<'Homagama Central Playground' | 'Town Hall Main Auditorium' | 'Multi-Purpose Exhibition Hall' | 'Meegoda Public Ground'>('Homagama Central Playground')
  const [eventDate, setEventDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return d.toISOString().split('T')[0]
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName || !amount) {
      alert('Please fill in Customer Name and Bill Amount')
      return
    }

    const numericAmount = parseFloat(amount) || 0
    const numericOpFee = parseFloat(operatorFee) || 0
    const numericDeposit = parseFloat(securityDeposit) || 0

    const todayStr = new Date().toISOString().split('T')[0]

    let generatedRef = propertyOrRefId
    if (!generatedRef) {
      if (category === 'Vehicle & Machinery Hire') generatedRef = `EQ-${machineryType.substring(0, 3).toUpperCase()}-2026-${Math.floor(10 + Math.random() * 89)}`
      else if (category === 'Public Ground & Property Hire') generatedRef = `GRD-HOM-${Math.floor(100 + Math.random() * 899)}`
      else if (category === 'Assessment Rates') generatedRef = `AST-HOM-${Math.floor(1000 + Math.random() * 8999)}`
      else if (category === 'Shop/Stall Rentals') generatedRef = `STL-HOM-${Math.floor(10 + Math.random() * 89)}`
      else if (category === 'Building Approvals') generatedRef = `BLD-2026-${Math.floor(100 + Math.random() * 899)}`
      else generatedRef = `TL-2026-HOM-${Math.floor(100 + Math.random() * 899)}`
    }

    let rentalDetailsObj = undefined
    if (category === 'Vehicle & Machinery Hire') {
      rentalDetailsObj = {
        machineryType,
        hireDurationDaysOrHours: hireDuration,
        operatorFee: numericOpFee,
        securityDeposit: numericDeposit,
      }
    } else if (category === 'Public Ground & Property Hire') {
      rentalDetailsObj = {
        venueName,
        eventDate,
        hireDurationDaysOrHours: hireDuration,
        securityDeposit: numericDeposit,
      }
    }

    createInvoice({
      customerName,
      customerNICorBRN: customerNICorBRN || 'NIC-NOT-PROVIDED',
      customerPhone,
      customerEmail,
      customerAddress,
      category,
      propertyOrRefId: generatedRef,
      amount: numericAmount,
      paidAmount: 0,
      issueDate: todayStr,
      dueDate,
      status,
      wardNumber,
      notes,
      rentalDetails: rentalDetailsObj,
      paymentHistory: [],
      remindersSent: [],
    })

    alert(`Success! Multi-channel Bill generated under ${category}. Status set to: ${status}`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-300 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-left">
        {/* Modal Header */}
        <div className="bg-[#A31736] text-white px-5 py-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-200">
              Pradeshiya Sabha Billing Desk
            </span>
            <h2 className="text-lg font-bold">Multi-Channel Municipal Bill Generator</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Revenue Category Picker Tabs */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              Select Revenue Stream / Channel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                [
                  'Vehicle & Machinery Hire',
                  'Public Ground & Property Hire',
                  'Assessment Rates',
                  'Shop/Stall Rentals',
                  'Building Approvals',
                  'Trade Licenses',
                ] as RevenueCategory[]
              ).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 rounded text-xs font-bold transition-all border text-left flex items-center gap-2 ${
                    category === cat
                      ? 'bg-[#A31736] text-white border-[#801028] shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${category === cat ? 'bg-white' : 'bg-gray-400'}`} />
                  <span className="truncate">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Category Specific Form Fields */}
          {category === 'Vehicle & Machinery Hire' && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3.5 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <rect x="1" y="3" width="22" height="13" rx="2" />
                  <circle cx="6" cy="20" r="2" />
                  <circle cx="18" cy="20" r="2" />
                </svg>
                <span>Council Vehicle & Heavy Equipment Rental Specification</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Vehicle / Machine Type</label>
                  <select
                    value={machineryType}
                    onChange={(e) => setMachineryType(e.target.value as any)}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-medium text-gray-800"
                  >
                    <option value="JCB Backhoe Loader">JCB 4CX Backhoe Loader</option>
                    <option value="Gully Bowser">Gully Bowser Cesspool Emptier</option>
                    <option value="Road Roller">Vibratory Road Roller (10 Ton)</option>
                    <option value="Water Tanker">6000L Drinking Water Tanker</option>
                    <option value="Tractor & Trailer">Council Tipper Tractor & Trailer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Hire Duration / Scope</label>
                  <input
                    type="text"
                    value={hireDuration}
                    onChange={(e) => setHireDuration(e.target.value)}
                    placeholder="e.g. 2 Days / 16 Hours / 3 Trips"
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-medium text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Operator Allowance (LKR)</label>
                  <input
                    type="number"
                    value={operatorFee}
                    onChange={(e) => setOperatorFee(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-medium text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Refundable Security Deposit (LKR)</label>
                  <input
                    type="number"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-medium text-gray-800"
                  />
                </div>
              </div>
            </div>
          )}

          {category === 'Public Ground & Property Hire' && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3.5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wide">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <path d="M3 21h18" />
                  <path d="M5 21V7l7-4 7 4v14" />
                </svg>
                <span>Council Property, Venue & Ground Hire Specification</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Public Ground / Venue</label>
                  <select
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value as any)}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-medium text-gray-800"
                  >
                    <option value="Homagama Central Playground">Homagama Central Playground & Pavilion</option>
                    <option value="Town Hall Main Auditorium">Town Hall Main Air-Conditioned Auditorium</option>
                    <option value="Multi-Purpose Exhibition Hall">Multi-Purpose Exhibition & Fair Center</option>
                    <option value="Meegoda Public Ground">Meegoda Public Play Park & Grounds</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Scheduled Event Date(s)</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-medium text-gray-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Citizen / Payer Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                Citizen / Company Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. K. D. Gunasekara / Apex Pvt Ltd"
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 font-medium focus:ring-2 focus:ring-[#A31736] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                NIC Number or Company BRN
              </label>
              <input
                type="text"
                value={customerNICorBRN}
                onChange={(e) => setCustomerNICorBRN(e.target.value)}
                placeholder="e.g. 198412903810 or PV009124"
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 font-medium focus:ring-2 focus:ring-[#A31736] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                Contact Mobile Number (for SMS)
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+94 77 123 4567"
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 font-medium focus:ring-2 focus:ring-[#A31736] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                Email Address (for Digital Bill)
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="citizen@domain.lk"
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 font-medium focus:ring-2 focus:ring-[#A31736] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                Postal / Premises Address
              </label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="No. 45, High Level Road, Homagama"
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 font-medium focus:ring-2 focus:ring-[#A31736] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                Pradeshiya Sabha Ward
              </label>
              <select
                value={wardNumber}
                onChange={(e) => setWardNumber(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 font-medium focus:ring-2 focus:ring-[#A31736] focus:outline-none"
              >
                {WARD_OPTIONS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                Property / Assessment / License Ref No
              </label>
              <input
                type="text"
                value={propertyOrRefId}
                onChange={(e) => setPropertyOrRefId(e.target.value)}
                placeholder="Auto-generated if empty"
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 font-medium focus:ring-2 focus:ring-[#A31736] focus:outline-none"
              />
            </div>
          </div>

          {/* Amount, Due Date & Initial Lifecycle State */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs border-t border-gray-200 pt-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                Total Bill Amount (LKR) *
              </label>
              <input
                type="number"
                required
                min="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 145000"
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 font-mono font-bold text-sm focus:ring-2 focus:ring-[#A31736] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                Payment Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 font-medium focus:ring-2 focus:ring-[#A31736] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 font-bold focus:ring-2 focus:ring-[#A31736] focus:outline-none"
              >
                <option value="Approved & Issued">Approved & Issued</option>
                <option value="Draft">Save as Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
              Assessment / Booking Notes & Terms
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Includes security deposit, fuel surcharge, and operator allowance..."
              className="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-[#A31736] focus:outline-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded hover:bg-gray-100 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#A31736] text-white text-xs font-bold rounded hover:bg-[#801028] transition-colors uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              <span>Generate Official Bill</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MultiChannelBillGeneratorModal
