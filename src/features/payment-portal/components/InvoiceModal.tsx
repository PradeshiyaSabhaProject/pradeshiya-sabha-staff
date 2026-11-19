import React from 'react'
import { Printer, X, CheckCircle, Clock } from 'lucide-react'
import type { PaymentRecord } from '../types/paymentPortal'
import { formatLKR, formatDate } from '../../varipanam/utils/formatters'
import PaymentStatusBadge from './PaymentStatusBadge'

interface InvoiceModalProps {
  payment: PaymentRecord | null
  isOpen: boolean
  onClose: () => void
  onMarkPaid?: (id: string) => void
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  payment,
  isOpen,
  onClose,
  onMarkPaid,
}) => {
  if (!isOpen || !payment) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      {/* Print-only CSS rules */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #printable-invoice, #printable-invoice * {
              visibility: visible !important;
            }
            #printable-invoice {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 20px !important;
              border: 1px solid #d1d5db !important;
              box-shadow: none !important;
              background-color: white !important;
              border-radius: 0 !important;
              z-index: 9999 !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden animate-fade-in my-8">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print bg-gray-50 border-b border-gray-200 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Document Preview
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs font-mono font-bold text-[#A31736]">
              {payment.invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onMarkPaid && payment.status === 'Pending Payment' && (
              <button
                type="button"
                onClick={() => onMarkPaid(payment.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all cursor-pointer shadow-2xs"
                title="Mark this invoice as Paid"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Mark as Paid</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-6 sm:p-8 bg-white text-gray-800 space-y-6">
          {/* Header */}
          <div className="border-b-2 border-gray-900 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#A31736] text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                  PS
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-tight leading-snug">
                    HOMAGAMA PRADESHIYA SABHA
                  </h2>
                  <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
                    Office of Municipal Revenue & Taxation • Western Province, Sri Lanka
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Tel: +94 11 285 5221 • Email: revenue@homagama.ps.gov.lk
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-block px-2.5 py-1 bg-[#A31736]/10 text-[#A31736] text-xs font-black uppercase tracking-wider rounded border border-[#A31736]/20">
                  Official Revenue Invoice
                </span>
                <p className="text-sm font-mono font-black text-gray-900 mt-1">
                  {payment.invoiceNumber}
                </p>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                  Date: <span className="font-semibold text-gray-700">{formatDate(payment.date)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/70 p-4 rounded-xl border border-gray-200 text-xs">
            {/* Payer Information */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Billed To / Payer Information
              </p>
              <p className="text-sm font-bold text-gray-900">{payment.payerName}</p>
              {payment.payerNic && (
                <p className="text-gray-600">
                  <span className="font-medium text-gray-400">NIC / Reg:</span> {payment.payerNic}
                </p>
              )}
              {payment.payerPhone && (
                <p className="text-gray-600">
                  <span className="font-medium text-gray-400">Phone:</span> {payment.payerPhone}
                </p>
              )}
              {payment.propertyDetails?.address && (
                <p className="text-gray-600">
                  <span className="font-medium text-gray-400">Address:</span>{' '}
                  {payment.propertyDetails.address}
                </p>
              )}
            </div>

            {/* Assessment & Service Details */}
            <div className="space-y-1 sm:text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Income Classification & Status
              </p>
              <p className="font-bold text-gray-900">{payment.categoryName}</p>
              <p className="text-gray-600">
                <span className="font-medium text-gray-400">Reference No:</span>{' '}
                <span className="font-mono font-bold text-gray-800">{payment.referenceId}</span>
              </p>
              <div className="flex items-center sm:justify-end gap-2 pt-0.5">
                <span className="text-gray-500 font-medium">Status:</span>
                <PaymentStatusBadge status={payment.status} />
              </div>
              <p className="text-[11px] text-gray-500 pt-0.5">
                Authorized Officer: <span className="font-semibold text-gray-700">{payment.officer}</span>
              </p>
            </div>
          </div>

          {/* Property Specific Snapshot (if Varipanam) */}
          {payment.propertyDetails && (
            <div className="bg-rose-50/40 p-3.5 rounded-xl border border-rose-100/80 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-extrabold text-[#A31736] uppercase tracking-wider">
                  Assessment Cadastre Record
                </p>
                <span className="text-[11px] font-semibold text-gray-600">
                  Annual Assessed Value: <strong className="text-gray-900">{formatLKR(payment.propertyDetails.annualValue)}</strong>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-gray-600">
                <div>
                  <span className="text-gray-400 block">Assessment No:</span>
                  <span className="font-mono font-bold text-gray-900">{payment.propertyDetails.assessmentNumber}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Type:</span>
                  <span className="font-semibold text-gray-900">{payment.propertyDetails.propertyType}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Ward:</span>
                  <span className="font-semibold text-gray-900">{payment.propertyDetails.ward}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Road / Street:</span>
                  <span className="font-semibold text-gray-900">{payment.propertyDetails.road}</span>
                </div>
              </div>
            </div>
          )}

          {/* Line Items Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Service Description</th>
                  <th className="py-2.5 px-4">Billing Period</th>
                  <th className="py-2.5 px-4 text-right">Amount (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payment.lineItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="py-2.5 px-4 text-gray-400 font-mono text-[11px]">{index + 1}</td>
                    <td className="py-2.5 px-4 font-semibold text-gray-900">{item.description}</td>
                    <td className="py-2.5 px-4 text-gray-600">{item.period}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-gray-900">
                      {formatLKR(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50/80 border-t-2 border-gray-300 font-bold">
                  <td colSpan={3} className="py-3 px-4 text-right text-gray-700 uppercase tracking-wider text-xs">
                    Total Amount Due / Paid:
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-base font-black text-[#A31736]">
                    {formatLKR(payment.amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Terms & Footer Note */}
          <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-[11px] text-gray-500 border-t border-gray-200">
            <div>
              <p className="font-bold text-gray-700">Payment Method: {payment.paymentMethod}</p>
              {payment.notes && <p className="mt-0.5 text-gray-600 italic">Notes: {payment.notes}</p>}
              <p className="mt-1 text-[10px] text-gray-400">
                Official computer-generated receipt from the Homagama Pradeshiya Sabha Central Treasury.
              </p>
            </div>

            <div className="text-right sm:text-right shrink-0">
              <div className="h-10 border-b border-gray-400 w-44 inline-block mb-1"></div>
              <p className="font-bold text-gray-700 uppercase text-[10px] tracking-wider">
                Authorized Signatory / Cashier
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Modal Actions (Hidden on print) */}
        <div className="no-print bg-gray-50 border-t border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>Generated: {formatDate(payment.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceModal
