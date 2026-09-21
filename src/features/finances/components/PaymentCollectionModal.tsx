import React, { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import type { InvoiceItem, PaymentRecord } from '../data/financeMockData'
import { formatLKR } from './FinanceKpiCards'
import CounterfoilReceiptModal from './CounterfoilReceiptModal'

interface PaymentCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  invoice: InvoiceItem | null
}

export const PaymentCollectionModal: React.FC<PaymentCollectionModalProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  const { updateInvoicePayment } = useFinance()

  const [paymentMethod, setPaymentMethod] = useState<PaymentRecord['paymentMethod']>('Cash')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [referenceNo, setReferenceNo] = useState('')
  const [bankName, setBankName] = useState('Bank of Ceylon')
  const [cashierName, setCashierName] = useState('Gamini Perera (Senior Cashier)')
  const [notes, setNotes] = useState('')

  // Receipt popup state (we store the last payment record to pass to receipt modal)
  const [lastPayment, setLastPayment] = useState<PaymentRecord | null>(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)

  if (!isOpen || !invoice) return null

  const currentPaid = invoice.paidAmount || 0
  const remainingBalance = Math.max(0, invoice.amount - currentPaid)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amountToPay = parseFloat(paymentAmount) || remainingBalance

    if (amountToPay <= 0) {
      alert('Payment amount must be greater than zero')
      return
    }

    let fullRef = referenceNo
    if (paymentMethod === 'Cheque') {
      fullRef = `CHQ-${bankName}-${referenceNo || Math.floor(100000 + Math.random() * 899999)}`
    } else if (paymentMethod === 'Bank Transfer' && !fullRef) {
      fullRef = `SLIPS-${bankName.substring(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 89999)}`
    } else if (paymentMethod === 'Online Gateway' && !fullRef) {
      fullRef = `PAY-ONL-${Math.floor(10000 + Math.random() * 89999)}`
    }

    const receiptNumber = `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    const payment: PaymentRecord = {
      id: `pmt-${Date.now()}`,
      receiptNumber,
      date: new Date().toISOString().split('T')[0],
      amount: amountToPay,
      paymentMethod,
      collectedBy: cashierName,
      notes: notes || (fullRef ? `Ref: ${fullRef}` : undefined),
      customerName: invoice.customerName,
    }

    updateInvoicePayment(invoice.id, payment)
    setLastPayment(payment)
    setShowReceiptModal(true)
  }

  const handleReceiptClose = () => {
    setShowReceiptModal(false)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-300 w-full max-w-lg overflow-hidden text-left">
          {/* Header */}
          <div className="bg-[#A31736] text-white px-5 py-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-200">
                Payment Collection Desk
              </span>
              <h3 className="text-base font-bold">Process Revenue Collection</h3>
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {/* Invoice Summary Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#A31736] bg-[#A31736]/10 px-2 py-0.5 rounded border border-[#A31736]/20">
                  {invoice.invoiceNumber}
                </span>
                <span className="font-bold text-gray-700">{invoice.category}</span>
              </div>
              <p className="font-bold text-gray-900 text-sm mt-1">{invoice.customerName}</p>
              <p className="text-gray-500">{invoice.wardNumber} • Ref: {invoice.propertyOrRefId}</p>
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-xs">
                <div>
                  <span className="text-gray-500 block text-[10px]">Total Bill:</span>
                  <span className="font-mono font-bold text-gray-800">{formatLKR(invoice.amount)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">Already Paid:</span>
                  <span className="font-mono font-bold text-emerald-800">{formatLKR(currentPaid)}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 block text-[10px]">Remaining Due:</span>
                  <span className="font-mono font-bold text-[#A31736] text-sm">{formatLKR(remainingBalance)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Collection Channel / Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Cash', 'Cheque', 'Bank Transfer', 'Online Gateway'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-3 rounded font-bold border text-left flex items-center justify-between transition-all ${
                      paymentMethod === method
                        ? 'bg-[#A31736] text-white border-[#801028] shadow-xs'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span>{method}</span>
                    {paymentMethod === method && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-3.5 h-3.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Amount Input (Supports Full or Partial) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                  Payment Amount (LKR) *
                </label>
                <button
                  type="button"
                  onClick={() => setPaymentAmount(remainingBalance.toString())}
                  className="text-[10px] text-[#A31736] font-bold hover:underline cursor-pointer"
                >
                  Pay Full Balance ({formatLKR(remainingBalance)})
                </button>
              </div>
              <input
                type="number"
                required
                min="1"
                max={remainingBalance}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={`Enter amount up to ${remainingBalance}`}
                className="w-full border border-gray-300 rounded px-3 py-2 font-mono font-bold text-base text-gray-900 focus:ring-2 focus:ring-[#A31736] focus:outline-none"
              />
            </div>

            {/* Method Specific Fields */}
            {paymentMethod === 'Cheque' && (
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-700 mb-1">Cheque Number</label>
                  <input
                    type="text"
                    required
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    placeholder="e.g. CHQ-591024"
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-700 mb-1">Drawn Bank</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-gray-900"
                  >
                    <option value="Bank of Ceylon">Bank of Ceylon (BOC)</option>
                    <option value="People's Bank">People's Bank</option>
                    <option value="Commercial Bank">Commercial Bank</option>
                    <option value="Hatton National Bank">Hatton National Bank (HNB)</option>
                    <option value="Sampath Bank">Sampath Bank</option>
                  </select>
                </div>
              </div>
            )}

            {(paymentMethod === 'Bank Transfer' || paymentMethod === 'Online Gateway') && (
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Transaction / Transfer Reference Number
                </label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="e.g. SLIPS-BOC-99120 or Gateway Txn ID"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Collecting Officer / Cashier Desk
              </label>
              <input
                type="text"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Notes / Internal Remarks</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Advance installment payment for JCB machinery rental."
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded hover:bg-gray-100 transition-colors uppercase tracking-wider cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-700 text-white font-bold rounded hover:bg-emerald-800 transition-colors uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer text-xs"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Record Payment & Issue Receipt</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Auto-Open Official Counterfoil Receipt Modal upon payment */}
      {showReceiptModal && (
        <CounterfoilReceiptModal
          isOpen={showReceiptModal}
          onClose={handleReceiptClose}
          invoice={invoice}
          paymentRecord={lastPayment ?? undefined}
        />
      )}
    </>
  )
}

export default PaymentCollectionModal
