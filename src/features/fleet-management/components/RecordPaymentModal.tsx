import React, { useState } from 'react'
import {
  SERVICE_CONFIG,
  type BookingRecord,
  type EReceipt,
} from '../data/initialBookingData'
import { formatLKR, paymentTimeRemaining } from '../utils/bookingUtils'

interface RecordPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  booking: BookingRecord | null
  onRecordPayment: (bookingId: string, receipt: EReceipt, recordedBy?: string) => void
}

/**
 * Modal dialog to record a counter payment (cash/card) or simulate an online
 * citizen payment for an 'Awaiting Payment' bowser booking.
 * Upon recording payment, generates an e-receipt and transitions status to 'Confirmed'.
 */
export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  booking,
  onRecordPayment,
}) => {
  const [method, setMethod] = useState<'Counter Cash' | 'Counter Card' | 'Online Payment'>('Counter Cash')
  const [receiptNumber, setReceiptNumber] = useState('')
  const [cashierName, setCashierName] = useState('Staff Cashier (Desk 02)')
  const [error, setError] = useState<string | null>(null)
  const [timeRemainingDisplay, setTimeRemainingDisplay] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)

  const [prevBookingId, setPrevBookingId] = useState<string | null>(null)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  // Initialize receipt number and countdown when modal opens (no effect setState)
  if (isOpen !== prevIsOpen || (booking?.id ?? null) !== prevBookingId) {
    setPrevIsOpen(isOpen)
    setPrevBookingId(booking?.id || null)
    if (booking && isOpen) {
      const array = new Uint32Array(1)
      window.crypto.getRandomValues(array)
      const randomSuffix = 1000 + (array[0] % 9000)
      setReceiptNumber(`RCP-2026-${randomSuffix}`)
      setError(null)

      if (booking.paymentDueBy) {
        const r = paymentTimeRemaining(booking.paymentDueBy)
        if (r) {
          if (r.isExpired) {
            setTimeRemainingDisplay('Payment window expired')
            setIsUrgent(true)
          } else {
            setTimeRemainingDisplay(`${r.hours}h ${r.minutes}m remaining`)
            setIsUrgent(r.isUrgent)
          }
        }
      }
    }
  }

  if (!isOpen || !booking) return null

  const cfg = SERVICE_CONFIG[booking.serviceType]
  const amountLKR = booking.estimatedFee.totalLKR

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!receiptNumber.trim()) {
      setError('Please provide or confirm a receipt number.')
      return
    }

    const receipt: EReceipt = {
      receiptNumber: receiptNumber.trim(),
      method,
      paidAt: new Date().toISOString(),
      amountLKR,
    }

    onRecordPayment(booking.id, receipt, cashierName)
    onClose()
  }

  const handleSimulateOnline = () => {
    setMethod('Online Payment')
    const receipt: EReceipt = {
      receiptNumber: receiptNumber.trim() || `RCP-2026-ONLINE-${Date.now().toString().slice(-4)}`,
      method: 'Online Payment',
      paidAt: new Date().toISOString(),
      amountLKR,
    }

    onRecordPayment(booking.id, receipt, 'Citizen Online Portal (LankaPay Gateway)')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 cursor-default"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal Dialog */}
      <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-10 animate-scale-up flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-blue-600" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#A31736] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                  {booking.referenceNumber}
                </span>
                <span className="text-xs text-gray-500 font-medium">{cfg.label}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                Record Payment & Issue E-Receipt
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer font-bold text-xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Amount Due Card */}
          <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-blue-700 font-medium block">Approved Total Fee Due</span>
              <span className="text-2xl font-black text-blue-900 font-mono">
                {formatLKR(amountLKR)}
              </span>
              <span className="text-[11px] text-blue-600 block mt-0.5">
                {booking.estimatedFee.loads} load(s) • {booking.estimatedFee.distanceKm.toFixed(1)} km transit
              </span>
            </div>

            {timeRemainingDisplay && (
              <div className="text-right">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">24h Deadline</span>
                <span
                  className={`text-xs font-mono font-bold px-2 py-1 rounded border inline-block ${
                    isUrgent ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  ⏱️ {timeRemainingDisplay}
                </span>
              </div>
            )}
          </div>

          {/* Applicant & Location info */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
            <div>
              <span className="text-gray-400 block font-medium">Applicant</span>
              <span className="font-bold text-gray-800">{booking.applicant.name}</span>
              <span className="text-gray-500 block font-mono text-[11px]">{booking.applicant.phone}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Site Address</span>
              <span className="font-bold text-gray-800 line-clamp-1">{booking.location.label}</span>
              <span className="text-gray-500 block text-[11px]">{booking.applicant.ward}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <p className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              Payment Method
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setMethod('Counter Cash')}
                className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                  method === 'Counter Cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                }`}
              >
                💵 Counter Cash
              </button>

              <button
                type="button"
                onClick={() => setMethod('Counter Card')}
                className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                  method === 'Counter Card'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-xs'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                }`}
              >
                💳 POS Card (Counter)
              </button>

              <button
                type="button"
                onClick={() => setMethod('Online Payment')}
                className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                  method === 'Online Payment'
                    ? 'border-purple-600 bg-purple-50 text-purple-800 shadow-xs'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                }`}
              >
                🌐 Online Gateway
              </button>
            </div>
          </div>

          {/* Receipt Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="payment-receipt-number" className="block text-xs text-gray-500 mb-1 font-medium">E-Receipt Number *</label>
              <input
                id="payment-receipt-number"
                type="text"
                required
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label htmlFor="payment-cashier-name" className="block text-xs text-gray-500 mb-1 font-medium">Recorded By / Cashier</label>
              <input
                id="payment-cashier-name"
                type="text"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-medium"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSimulateOnline}
              className="px-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs transition-all cursor-pointer"
            >
              ⚡ Simulate Citizen Online Payment
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Confirm Payment & Issue Receipt
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
