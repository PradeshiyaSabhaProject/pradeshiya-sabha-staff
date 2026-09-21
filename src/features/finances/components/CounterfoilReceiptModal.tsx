import React from 'react'
import type { InvoiceItem, PaymentRecord } from '../data/financeMockData'
import { formatLKR } from './FinanceKpiCards'

interface CounterfoilReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  invoice: InvoiceItem | null
  paymentRecord?: PaymentRecord | null
}

export const CounterfoilReceiptModal: React.FC<CounterfoilReceiptModalProps> = ({
  isOpen,
  onClose,
  invoice,
  paymentRecord,
}) => {
  if (!isOpen || !invoice) return null

  // Latest payment record if not explicitly passed
  const activePayment: PaymentRecord = paymentRecord || (invoice.paymentHistory && invoice.paymentHistory[invoice.paymentHistory.length - 1]) || {
    id: 'pmt-demo',
    receiptNumber: `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    amount: invoice.paidAmount || invoice.amount,
    paymentMethod: 'Cash',
    collectedBy: 'Senior Cashier Desk 01 - Homagama PS Headquarters',
    notes: 'Payment settled at main treasury counter.',
    customerName: invoice.customerName,
  }

  const remainingBalance = Math.max(0, invoice.amount - (invoice.paidAmount || activePayment.amount))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-300 w-full max-w-3xl my-8 flex flex-col overflow-hidden text-left font-sans">
        {/* Modal Action Header (Screen only) */}
        <div className="bg-gray-900 text-white px-5 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Official Pradeshiya Sabha Counterfoil Receipt Generated
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold px-3.5 py-1.5 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>Print Official Receipt</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Printable Counterfoil Document */}
        <div className="p-6 bg-amber-50/20 border-b border-gray-200 space-y-6 text-gray-900">
          {/* Dual Counterfoil Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* Divider for 2-Part Counterfoil */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 border-r-2 border-dashed border-gray-300 -translate-x-1/2" />

            {/* PART 1: TAXPAYER / CITIZEN ORIGINAL COPY */}
            <div className="bg-white p-4 border border-gray-300 rounded shadow-xs relative overflow-hidden space-y-3">
              <div className="text-center border-b border-gray-200 pb-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  [TAXPAYER / CITIZEN COPY]
                </p>
                <h4 className="text-sm font-black text-[#A31736] tracking-tight uppercase">
                  HOMAGAMA PRADESHIYA SABHA
                </h4>
                <p className="text-[10px] text-gray-600">Western Province, Sri Lanka • Tel: 011-2855212</p>
                <div className="inline-block bg-[#A31736]/10 text-[#A31736] text-[11px] font-black px-2.5 py-0.5 rounded mt-1 border border-[#A31736]/20 uppercase tracking-wider">
                  Official Revenue Counterfoil Receipt
                </div>
              </div>

              {/* Receipt Meta Details */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-b border-gray-100 pb-2">
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase">Receipt No:</span>
                  <span className="font-bold text-gray-900">{activePayment.receiptNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 block text-[9px] uppercase">Date & Time:</span>
                  <span className="font-bold text-gray-900">{activePayment.date}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase">Invoice No:</span>
                  <span className="font-bold text-[#A31736]">{invoice.invoiceNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 block text-[9px] uppercase">Channel Method:</span>
                  <span className="font-bold text-gray-900">{activePayment.paymentMethod}</span>
                </div>
              </div>

              {/* Payer Details */}
              <div className="text-xs space-y-1 bg-gray-50 p-2.5 rounded border border-gray-200">
                <p><span className="font-semibold text-gray-600">Received From:</span> <strong className="text-gray-900">{invoice.customerName}</strong></p>
                <p><span className="font-semibold text-gray-600">NIC / BRN:</span> {invoice.customerNICorBRN}</p>
                <p><span className="font-semibold text-gray-600">Ward / Division:</span> {invoice.wardNumber}</p>
                <p><span className="font-semibold text-gray-600">Revenue Vote / Category:</span> <strong>{invoice.category}</strong></p>
                <p><span className="font-semibold text-gray-600">Ref ID:</span> <code className="font-bold">{invoice.propertyOrRefId}</code></p>
              </div>

              {/* Rental Details (if JCB or Ground Hire) */}
              {invoice.rentalDetails && (
                <div className="bg-amber-50 p-2 rounded border border-amber-200 text-[11px] text-amber-900">
                  <p className="font-bold uppercase tracking-wider text-[10px]">Rental Specification:</p>
                  {invoice.rentalDetails.machineryType && <p>• Equipment: <strong>{invoice.rentalDetails.machineryType}</strong> ({invoice.rentalDetails.hireDurationDaysOrHours})</p>}
                  {invoice.rentalDetails.venueName && <p>• Venue: <strong>{invoice.rentalDetails.venueName}</strong> ({invoice.rentalDetails.eventDate})</p>}
                  {invoice.rentalDetails.securityDeposit ? <p>• Security Deposit: LKR {invoice.rentalDetails.securityDeposit.toLocaleString()}</p> : null}
                </div>
              )}

              {/* Amount Breakdown Table */}
              <div className="border border-gray-200 rounded overflow-hidden text-xs">
                <div className="bg-gray-100 px-3 py-1 font-bold text-gray-700 flex justify-between border-b border-gray-200 text-[10px] uppercase">
                  <span>Particulars</span>
                  <span>Amount (LKR)</span>
                </div>
                <div className="p-2 space-y-1">
                  <div className="flex justify-between font-medium">
                    <span>{invoice.category} Base Fee</span>
                    <span>{formatLKR(invoice.amount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-800 pt-1 border-t border-gray-100">
                    <span>Amount Paid Now ({activePayment.paymentMethod})</span>
                    <span>{formatLKR(activePayment.amount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-500 text-[11px]">
                    <span>Remaining Balance</span>
                    <span>{formatLKR(remainingBalance)}</span>
                  </div>
                </div>
              </div>

              {/* Verification QR & Signature */}
              <div className="pt-2 flex items-center justify-between text-[9px] text-gray-500">
                <div className="flex items-center gap-2">
                  {/* Mock Security QR */}
                  <div className="w-12 h-12 bg-gray-900 text-white p-1 rounded font-mono text-[7px] flex items-center justify-center text-center font-bold">
                    [QR SEAL]
                  </div>
                  <div>
                    <p className="font-bold text-gray-700">Official Seal</p>
                    <p>Secured Treasury QR</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-24 border-b border-gray-400 mb-1" />
                  <p className="font-bold text-gray-800">Authorized Cashier</p>
                  <p className="text-[8px]">{activePayment.collectedBy}</p>
                </div>
              </div>
            </div>

            {/* PART 2: COUNCIL AUDIT COUNTERFOIL COPY */}
            <div className="bg-slate-50 p-4 border border-slate-300 rounded shadow-xs relative overflow-hidden space-y-3">
              <div className="text-center border-b border-slate-200 pb-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  [COUNCIL AUDIT COUNTERFOIL COPY]
                </p>
                <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase">
                  FINANCE & TREASURY DEPARTMENT
                </h4>
                <p className="text-[10px] text-slate-600">Homagama Pradeshiya Sabha Audit Voucher</p>
                <div className="inline-block bg-slate-200 text-slate-800 text-[11px] font-black px-2.5 py-0.5 rounded mt-1 border border-slate-300 uppercase tracking-wider">
                  Internal Ledger Counterfoil
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-b border-slate-200 pb-2">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Receipt No:</span>
                  <span className="font-bold text-slate-900">{activePayment.receiptNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[9px] uppercase">Transaction Date:</span>
                  <span className="font-bold text-slate-900">{activePayment.date}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Vote Code:</span>
                  <span className="font-bold text-[#A31736]">VOTE-1-04/REV</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[9px] uppercase">Notes:</span>
                  <span className="font-bold text-slate-900 text-[10px]">{activePayment.notes || 'Cash Counter Collection'}</span>
                </div>
              </div>

              <div className="text-xs space-y-1 bg-white p-2.5 rounded border border-slate-200">
                <p><span className="font-semibold text-slate-600">Payer Name:</span> <strong>{invoice.customerName}</strong></p>
                <p><span className="font-semibold text-slate-600">Invoice Ref:</span> {invoice.invoiceNumber}</p>
                <p><span className="font-semibold text-slate-600">Revenue Stream:</span> {invoice.category}</p>
                <p><span className="font-semibold text-slate-600">Ward:</span> {invoice.wardNumber}</p>
              </div>

              <div className="border border-slate-200 rounded overflow-hidden text-xs bg-white">
                <div className="p-2 space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Ledger Credit Amount</span>
                    <span>{formatLKR(activePayment.amount)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Payment Channel</span>
                    <span>{activePayment.paymentMethod}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-[9px] text-slate-500">
                <div>
                  <p className="font-bold text-slate-700">Internal Audit Verified</p>
                  <p>System Counterfoil Log</p>
                </div>
                <div className="text-right">
                  <div className="w-24 border-b border-slate-400 mb-1" />
                  <p className="font-bold text-slate-800">Accountant / Cashier Sign</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 flex items-center justify-between print:hidden">
          <p className="text-xs text-gray-500">
            Official counterfoil generated according to Financial Regulations (FR 185) of Local Authorities Sri Lanka.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-800 text-white text-xs font-bold rounded hover:bg-gray-900 transition-colors uppercase tracking-wider cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  )
}

export default CounterfoilReceiptModal
