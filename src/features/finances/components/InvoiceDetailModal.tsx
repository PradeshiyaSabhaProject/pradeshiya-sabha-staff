import React, { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import type { InvoiceItem, InvoiceStatus } from '../data/financeMockData'
import { formatLKR } from './FinanceKpiCards'
import InvoiceLifecycleBadge from './InvoiceLifecycleBadge'
import PaymentCollectionModal from './PaymentCollectionModal'
import CounterfoilReceiptModal from './CounterfoilReceiptModal'

interface InvoiceDetailModalProps {
  isOpen: boolean
  onClose: () => void
  invoice: InvoiceItem | null
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  const { updateInvoiceStatus, sendInvoiceReminder } = useFinance()

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)

  if (!isOpen || !invoice) return null

  const handleStatusChange = (newStatus: InvoiceStatus) => {
    updateInvoiceStatus(invoice.id, newStatus)
  }

  const handleSendReminder = (channel: 'SMS' | 'Email') => {
    sendInvoiceReminder(invoice.id, channel)
    alert(`Automated ${channel} reminder dispatched to ${invoice.customerName}!`)
  }

  const currentPaid = invoice.paidAmount || 0
  const remainingBalance = Math.max(0, invoice.amount - currentPaid)

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-300 w-full max-w-3xl my-8 overflow-hidden text-left flex flex-col">
          {/* Header */}
          <div className="bg-[#A31736] text-white px-6 py-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs bg-white/20 px-2 py-0.5 rounded">
                  {invoice.invoiceNumber}
                </span>
                <span className="text-xs uppercase tracking-wider text-red-200 font-semibold">
                  {invoice.category}
                </span>
              </div>
              <h2 className="text-lg font-bold mt-1">{invoice.customerName}</h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh] text-xs">
            {/* 1. Interactive Lifecycle Stepper */}
            <InvoiceLifecycleBadge
              status={invoice.status}
              showStepper={true}
              onStatusChange={handleStatusChange}
            />

            {/* 2. Primary Financial Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <span className="text-gray-500 font-semibold block text-[10px] uppercase">Total Bill Amount</span>
                <span className="text-lg font-bold font-mono text-gray-900">{formatLKR(invoice.amount)}</span>
              </div>
              <div>
                <span className="text-gray-500 font-semibold block text-[10px] uppercase">Amount Settled</span>
                <span className="text-lg font-bold font-mono text-emerald-800">{formatLKR(currentPaid)}</span>
              </div>
              <div>
                <span className="text-gray-500 font-semibold block text-[10px] uppercase">Balance Due</span>
                <span className="text-lg font-bold font-mono text-[#A31736]">{formatLKR(remainingBalance)}</span>
              </div>
            </div>

            {/* 3. Customer & Reference Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-3.5 rounded-lg border border-gray-200 space-y-1.5">
                <h4 className="font-bold text-gray-900 uppercase text-[11px] border-b border-gray-100 pb-1">
                  Citizen / Taxpayer Information
                </h4>
                <p><span className="text-gray-500">NIC / BRN:</span> <strong className="text-gray-900">{invoice.customerNICorBRN}</strong></p>
                <p><span className="text-gray-500">Phone:</span> {invoice.customerPhone || 'Not Provided'}</p>
                <p><span className="text-gray-500">Email:</span> {invoice.customerEmail || 'Not Provided'}</p>
                <p><span className="text-gray-500">Address:</span> {invoice.customerAddress || 'Homagama PS Limits'}</p>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-gray-200 space-y-1.5">
                <h4 className="font-bold text-gray-900 uppercase text-[11px] border-b border-gray-100 pb-1">
                  Invoice & Ward Metadata
                </h4>
                <p><span className="text-gray-500">Reference ID:</span> <code className="font-bold text-gray-900">{invoice.propertyOrRefId}</code></p>
                <p><span className="text-gray-500">Ward Division:</span> {invoice.wardNumber}</p>
                <p><span className="text-gray-500">Issue Date:</span> {invoice.issueDate}</p>
                <p><span className="text-gray-500">Due Date:</span> <strong className="text-[#A31736]">{invoice.dueDate}</strong></p>
              </div>
            </div>

            {/* 4. Equipment Rental / Property Ground Hire Specifications */}
            {invoice.rentalDetails && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                  <span>Vehicle, Machinery & Ground Rental Parameters</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-amber-950 font-medium">
                  {invoice.rentalDetails.machineryType && (
                    <div>
                      <span className="block text-[10px] text-amber-700 uppercase font-bold">Equipment</span>
                      <span>{invoice.rentalDetails.machineryType}</span>
                    </div>
                  )}
                  {invoice.rentalDetails.venueName && (
                    <div>
                      <span className="block text-[10px] text-amber-700 uppercase font-bold">Ground / Venue</span>
                      <span>{invoice.rentalDetails.venueName}</span>
                    </div>
                  )}
                  {invoice.rentalDetails.hireDurationDaysOrHours && (
                    <div>
                      <span className="block text-[10px] text-amber-700 uppercase font-bold">Duration / Scope</span>
                      <span>{invoice.rentalDetails.hireDurationDaysOrHours}</span>
                    </div>
                  )}
                  {invoice.rentalDetails.operatorFee ? (
                    <div>
                      <span className="block text-[10px] text-amber-700 uppercase font-bold">Operator Fee</span>
                      <span>{formatLKR(invoice.rentalDetails.operatorFee)}</span>
                    </div>
                  ) : null}
                  {invoice.rentalDetails.securityDeposit ? (
                    <div>
                      <span className="block text-[10px] text-amber-700 uppercase font-bold">Security Deposit</span>
                      <span>{formatLKR(invoice.rentalDetails.securityDeposit)}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* 5. Payment Audit Log */}
            <div>
              <h4 className="font-bold text-gray-900 uppercase text-[11px] mb-2">
                Payment Collections Log ({invoice.paymentHistory ? invoice.paymentHistory.length : 0})
              </h4>
              {invoice.paymentHistory && invoice.paymentHistory.length > 0 ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[9px]">
                      <tr>
                        <th className="p-2">Receipt No</th>
                        <th className="p-2">Date</th>
                        <th className="p-2">Method</th>
                        <th className="p-2">Ref / Cheque #</th>
                        <th className="p-2">Cashier</th>
                        <th className="p-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {invoice.paymentHistory.map((pmt) => (
                        <tr key={pmt.id} className="hover:bg-gray-50">
                          <td className="p-2 font-mono font-bold text-emerald-800">{pmt.receiptNumber}</td>
                          <td className="p-2">{pmt.date}</td>
                          <td className="p-2 font-medium">{pmt.paymentMethod}</td>
                          <td className="p-2 font-mono text-gray-600">{pmt.referenceNo || 'N/A'}</td>
                          <td className="p-2 text-gray-600">{pmt.cashier}</td>
                          <td className="p-2 text-right font-bold text-gray-900 font-mono">{formatLKR(pmt.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400 italic bg-gray-50 p-3 rounded border border-gray-200">
                  No payment collections recorded yet for this invoice.
                </p>
              )}
            </div>

            {/* 6. Dispatched Reminders Log */}
            <div>
              <h4 className="font-bold text-gray-900 uppercase text-[11px] mb-2">
                Automated Reminders History ({invoice.remindersSent ? invoice.remindersSent.length : 0})
              </h4>
              {invoice.remindersSent && invoice.remindersSent.length > 0 ? (
                <div className="space-y-1.5">
                  {invoice.remindersSent.map((rem) => (
                    <div key={rem.id} className="bg-slate-50 border border-slate-200 p-2.5 rounded flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#A31736]">{rem.channel} Sent</span>
                          <span className="text-[10px] text-gray-400">{rem.date}</span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 rounded border border-emerald-200">
                            {rem.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-0.5 text-[11px]">{rem.message}</p>
                      </div>
                      <span className="font-mono text-gray-500 text-[10px]">{rem.recipient}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic bg-gray-50 p-3 rounded border border-gray-200">
                  No automated SMS or Email reminders sent yet.
                </p>
              )}
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSendReminder('SMS')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold px-3 py-2 rounded transition-colors uppercase tracking-wider cursor-pointer"
              >
                Send SMS
              </button>
              <button
                type="button"
                onClick={() => handleSendReminder('Email')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold px-3 py-2 rounded transition-colors uppercase tracking-wider cursor-pointer"
              >
                Send Email
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowReceiptModal(true)}
                className="border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold px-3.5 py-2 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                <span>Print Counterfoil Receipt</span>
              </button>

              {invoice.status !== 'Paid' && (
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Record Payment</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Modals */}
      {showPaymentModal && (
        <PaymentCollectionModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          invoice={invoice}
        />
      )}

      {showReceiptModal && (
        <CounterfoilReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          invoice={invoice}
        />
      )}
    </>
  )
}

export default InvoiceDetailModal
