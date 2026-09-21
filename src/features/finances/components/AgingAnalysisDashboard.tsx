import React, { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import type { InvoiceItem } from '../data/financeMockData'
import { formatLKR } from './FinanceKpiCards'
import InvoiceLifecycleBadge from './InvoiceLifecycleBadge'

export const AgingAnalysisDashboard: React.FC = () => {
  const { invoices, sendInvoiceReminder, batchSendReminders } = useFinance()

  const [activeBucket, setActiveBucket] = useState<'All' | 'Current' | '30 Days' | '60 Days' | '90+ Days'>('All')
  const [selectedChannel, setSelectedChannel] = useState<'SMS' | 'Email'>('SMS')
  const [previewReminderModal, setPreviewReminderModal] = useState<{
    isOpen: boolean
    targetInvoice?: InvoiceItem
    isBatch?: boolean
  }>({ isOpen: false })

  const today = new Date('2026-09-21')

  const getDaysOverdue = (dueDateStr: string) => {
    const due = new Date(dueDateStr)
    const diffTime = today.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getAgingBucket = (inv: InvoiceItem) => {
    if (inv.status === 'Paid') return 'Paid'
    const days = getDaysOverdue(inv.dueDate)
    if (days <= 0) return 'Current'
    if (days <= 30) return '30 Days'
    if (days <= 60) return '60 Days'
    return '90+ Days'
  }

  // Receivables metrics
  const unpaidInvoices = invoices.filter((i) => i.status !== 'Paid')
  const totalReceivables = unpaidInvoices.reduce((sum, i) => sum + (i.amount - (i.paidAmount || 0)), 0)

  const bucketCurrent = unpaidInvoices.filter((i) => getAgingBucket(i) === 'Current')
  const bucket30 = unpaidInvoices.filter((i) => getAgingBucket(i) === '30 Days')
  const bucket60 = unpaidInvoices.filter((i) => getAgingBucket(i) === '60 Days')
  const bucket90 = unpaidInvoices.filter((i) => getAgingBucket(i) === '90+ Days')

  const sumCurrent = bucketCurrent.reduce((sum, i) => sum + (i.amount - (i.paidAmount || 0)), 0)
  const sum30 = bucket30.reduce((sum, i) => sum + (i.amount - (i.paidAmount || 0)), 0)
  const sum60 = bucket60.reduce((sum, i) => sum + (i.amount - (i.paidAmount || 0)), 0)
  const sum90 = bucket90.reduce((sum, i) => sum + (i.amount - (i.paidAmount || 0)), 0)

  const totalOverdueSum = sum30 + sum60 + sum90

  const filteredInvoices = unpaidInvoices.filter((inv) => {
    if (activeBucket === 'All') return true
    return getAgingBucket(inv) === activeBucket
  })

  const handleSendSingleReminder = (inv: InvoiceItem) => {
    setPreviewReminderModal({
      isOpen: true,
      targetInvoice: inv,
      isBatch: false,
    })
  }

  const handleBatchReminder = () => {
    setPreviewReminderModal({
      isOpen: true,
      isBatch: true,
    })
  }

  const confirmDispatchReminder = () => {
    if (previewReminderModal.isBatch) {
      const targetIds = filteredInvoices.map((i) => i.id)
      batchSendReminders(targetIds, selectedChannel)
      alert(`Automated ${selectedChannel} reminders successfully queued & dispatched to ${targetIds.length} overdue citizens!`)
    } else if (previewReminderModal.targetInvoice) {
      sendInvoiceReminder(previewReminderModal.targetInvoice.id, selectedChannel)
      alert(`Automated ${selectedChannel} reminder dispatched to ${previewReminderModal.targetInvoice.customerName}!`)
    }
    setPreviewReminderModal({ isOpen: false })
  }

  return (
    <div className="space-y-5 text-left">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-slate-900 via-gray-900 to-[#801028] p-5 rounded-xl text-white shadow-md">
        <div>
          <span className="text-[10px] font-bold text-red-300 uppercase tracking-widest">
            Pradeshiya Sabha Treasury Management
          </span>
          <h2 className="text-xl font-bold tracking-tight">Receivables Aging & Automated Reminders</h2>
          <p className="text-xs text-gray-300 mt-0.5">
            Overdue assessment rates, shop rentals, JCB equipment hire, and building permit receivables analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBatchReminder}
            disabled={filteredInvoices.length === 0}
            className="bg-[#A31736] hover:bg-[#801028] disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>Batch Dispatch Reminders ({filteredInvoices.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Outstanding */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold uppercase tracking-wider">
            <span>Total Receivables</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <p className="text-xl font-bold font-mono text-gray-900 mt-2">{formatLKR(totalReceivables)}</p>
          <p className="text-[11px] text-gray-400 mt-1">{unpaidInvoices.length} Unpaid Council Invoices</p>
        </div>

        {/* Card 2: 30 Days Overdue */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-700 font-semibold uppercase tracking-wider">
            <span>30 Days Overdue</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <p className="text-xl font-bold font-mono text-amber-800 mt-2">{formatLKR(sum30)}</p>
          <p className="text-[11px] text-gray-400 mt-1">{bucket30.length} Invoices Past 1-30 Days</p>
        </div>

        {/* Card 3: 60 Days Overdue */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-orange-700 font-semibold uppercase tracking-wider">
            <span>60 Days Overdue</span>
            <span className="w-2 h-2 rounded-full bg-orange-500" />
          </div>
          <p className="text-xl font-bold font-mono text-orange-800 mt-2">{formatLKR(sum60)}</p>
          <p className="text-[11px] text-gray-400 mt-1">{bucket60.length} Invoices Past 31-60 Days</p>
        </div>

        {/* Card 4: 90+ Days Critical Overdue */}
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <div className="flex items-center justify-between text-xs text-rose-700 font-bold uppercase tracking-wider">
            <span>90+ Days Critical</span>
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
          </div>
          <p className="text-xl font-bold font-mono text-rose-800 mt-2">{formatLKR(sum90)}</p>
          <p className="text-[11px] text-rose-600 font-semibold mt-1">{bucket90.length} High Risk Overdue Accounts</p>
        </div>
      </div>

      {/* 3. Receivables Aging Distribution Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-gray-800 uppercase tracking-wide">
          <span>Receivables Aging Distribution Matrix</span>
          <span className="text-gray-500 font-mono">Total Overdue: {formatLKR(totalOverdueSum)}</span>
        </div>

        {/* Multi-segmented Progress Bar */}
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
          <div
            title={`Current: ${formatLKR(sumCurrent)}`}
            className="bg-emerald-500 h-full transition-all"
            style={{ width: `${totalReceivables ? (sumCurrent / totalReceivables) * 100 : 0}%` }}
          />
          <div
            title={`30 Days: ${formatLKR(sum30)}`}
            className="bg-amber-400 h-full transition-all"
            style={{ width: `${totalReceivables ? (sum30 / totalReceivables) * 100 : 0}%` }}
          />
          <div
            title={`60 Days: ${formatLKR(sum60)}`}
            className="bg-orange-500 h-full transition-all"
            style={{ width: `${totalReceivables ? (sum60 / totalReceivables) * 100 : 0}%` }}
          />
          <div
            title={`90+ Days: ${formatLKR(sum90)}`}
            className="bg-rose-600 h-full transition-all"
            style={{ width: `${totalReceivables ? (sum90 / totalReceivables) * 100 : 0}%` }}
          />
        </div>

        {/* Distribution Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-500" />
            <div>
              <span className="font-semibold text-gray-700 block text-[11px]">Current (Not Due)</span>
              <span className="font-mono text-gray-900 font-bold">{formatLKR(sumCurrent)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-amber-400" />
            <div>
              <span className="font-semibold text-gray-700 block text-[11px]">1 - 30 Days Past</span>
              <span className="font-mono text-amber-800 font-bold">{formatLKR(sum30)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-orange-500" />
            <div>
              <span className="font-semibold text-gray-700 block text-[11px]">31 - 60 Days Past</span>
              <span className="font-mono text-orange-800 font-bold">{formatLKR(sum60)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-rose-600" />
            <div>
              <span className="font-semibold text-gray-700 block text-[11px]">60+ Days Critical</span>
              <span className="font-mono text-rose-800 font-bold">{formatLKR(sum90)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Filter Tabs & Overdue Ledger Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Filter Tab Row */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200">
            {(['All', 'Current', '30 Days', '60 Days', '90+ Days'] as const).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setActiveBucket(b)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeBucket === b
                    ? 'bg-[#A31736] text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Reminder Channel:</span>
            <div className="inline-flex rounded border border-gray-300 p-0.5 bg-white text-xs">
              <button
                type="button"
                onClick={() => setSelectedChannel('SMS')}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  selectedChannel === 'SMS' ? 'bg-[#A31736] text-white' : 'text-gray-600'
                }`}
              >
                SMS Notification
              </button>
              <button
                type="button"
                onClick={() => setSelectedChannel('Email')}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  selectedChannel === 'Email' ? 'bg-[#A31736] text-white' : 'text-gray-600'
                }`}
              >
                Email Notice
              </button>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-100 text-gray-700 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Invoice & Ref ID</th>
                <th className="px-4 py-3">Citizen / Customer</th>
                <th className="px-4 py-3">Revenue Category</th>
                <th className="px-4 py-3">Ward</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Aging Tier</th>
                <th className="px-4 py-3 text-right">Balance Due</th>
                <th className="px-4 py-3 text-center">Reminders Log</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map((inv) => {
                const daysOverdue = getDaysOverdue(inv.dueDate)
                const bucket = getAgingBucket(inv)
                const dueAmount = inv.amount - (inv.paidAmount || 0)

                return (
                  <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 block text-[11px] w-fit">
                        {inv.invoiceNumber}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">{inv.propertyOrRefId}</span>
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-900">{inv.customerName}</p>
                      <p className="text-[10px] text-gray-500">{inv.customerNICorBRN} • {inv.customerPhone || 'No Phone'}</p>
                    </td>

                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {inv.category}
                      {inv.rentalDetails?.machineryType && (
                        <span className="block text-[10px] text-amber-700 font-bold">
                          [{inv.rentalDetails.machineryType}]
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-gray-600">{inv.wardNumber}</td>

                    <td className="px-4 py-3 text-gray-700 font-medium">{inv.dueDate}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`font-bold text-[10px] px-2 py-0.5 rounded border ${
                          bucket === 'Current'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : bucket === '30 Days'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : bucket === '60 Days'
                            ? 'bg-orange-50 text-orange-800 border-orange-200'
                            : 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
                        }`}
                      >
                        {bucket === 'Current' ? 'Not Due' : `${daysOverdue} Days Overdue`}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <span className="font-mono font-bold text-gray-900 text-sm">{formatLKR(dueAmount)}</span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      {inv.remindersSent && inv.remindersSent.length > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {inv.remindersSent.length} Dispatched
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">None</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleSendSingleReminder(inv)}
                        className="bg-gray-100 hover:bg-[#A31736] hover:text-white text-gray-700 text-[11px] font-bold px-2.5 py-1.5 rounded transition-all flex items-center gap-1 ml-auto border border-gray-300 cursor-pointer"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                          <path d="M22 2L11 13" />
                          <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                        <span>Send {selectedChannel}</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Reminder Dispatch Preview Modal */}
      {previewReminderModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-300 w-full max-w-md overflow-hidden text-left p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Automated {selectedChannel} Reminder Dispatch Preview
              </h3>
              <button
                type="button"
                onClick={() => setPreviewReminderModal({ isOpen: false })}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900 space-y-2">
              <p className="font-bold">
                {previewReminderModal.isBatch
                  ? `Dispatching to ${filteredInvoices.length} citizens in "${activeBucket}" bucket.`
                  : `Dispatching to ${previewReminderModal.targetInvoice?.customerName}`}
              </p>
              <div className="bg-white p-2.5 rounded border border-amber-300 font-mono text-[11px] text-gray-800 space-y-1">
                <p className="font-bold text-[#A31736]">[OUTGOING {selectedChannel} TEMPLATE]:</p>
                <p>
                  "Homagama Pradeshiya Sabha Treasury: Notice regarding your overdue bill for Assessment Rates / JCB Rental. Please settle immediately at council cash counter or online portal to avoid legal surcharge."
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 text-xs">
              <button
                type="button"
                onClick={() => setPreviewReminderModal({ isOpen: false })}
                className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDispatchReminder}
                className="px-4 py-1.5 bg-[#A31736] text-white font-bold rounded hover:bg-[#801028] shadow-xs"
              >
                Confirm & Trigger {selectedChannel} Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgingAnalysisDashboard
