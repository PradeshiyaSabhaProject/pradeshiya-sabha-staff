import React, { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import type { InvoiceItem, RevenueCategory, InvoiceStatus } from '../data/financeMockData'
import { formatLKR } from '../components/FinanceKpiCards'
import InvoiceLifecycleBadge from '../components/InvoiceLifecycleBadge'
import MultiChannelBillGeneratorModal from '../components/MultiChannelBillGeneratorModal'
import PaymentCollectionModal from '../components/PaymentCollectionModal'
import CounterfoilReceiptModal from '../components/CounterfoilReceiptModal'
import InvoiceDetailModal from '../components/InvoiceDetailModal'
import AgingAnalysisDashboard from '../components/AgingAnalysisDashboard'

export const InvoicesRevenuesPage: React.FC = () => {
  const { invoices } = useFinance()

  const [activeTab, setActiveTab] = useState<'bills' | 'aging' | 'receipts'>('bills')

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')

  // Modal States
  const [showBillGenerator, setShowBillGenerator] = useState(false)
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<InvoiceItem | null>(null)
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<InvoiceItem | null>(null)
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState<InvoiceItem | null>(null)

  // KPI Computations
  const totalInvoicedAmount = invoices.reduce((sum, i) => sum + i.amount, 0)
  const totalCollectedAmount = invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0)
  const totalOutstandingAmount = invoices.reduce(
    (sum, i) => sum + (i.status === 'Paid' ? 0 : i.amount - (i.paidAmount || 0)),
    0
  )
  const totalOverdueCount = invoices.filter((i) => i.status === 'Overdue').length

  // Filtered Invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerNICorBRN.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.propertyOrRefId.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      categoryFilter === 'All' || inv.category === categoryFilter

    const matchesStatus =
      statusFilter === 'All' ||
      inv.status === statusFilter ||
      (statusFilter === 'Approved & Issued' && inv.status === 'Pending')

    return matchesSearch && matchesCategory && matchesStatus
  })

  // All collected receipts list across invoices
  const allReceipts = invoices.flatMap((inv) =>
    (inv.paymentHistory || []).map((pmt) => ({
      ...pmt,
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customerName,
      category: inv.category,
      parentInvoice: inv,
    }))
  )

  return (
    <div className="space-y-6 text-left pb-10 animate-fade-in">
      {/* ── 1. Header & Quick Actions Banner ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <span className="text-[10px] font-bold text-[#A31736] tracking-widest uppercase">
            Finance & Treasury Division • Homagama PS
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Invoices & Revenue Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Multi-channel municipal billing, JCB equipment rentals, status lifecycle tracking, counterfoil receipts & aging analysis.
          </p>
        </div>

        {/* Action Buttons Top-Right */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            <span>Print Report</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBillGenerator(true)}
            className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold px-4 py-2 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>+ Generate Municipal Bill</span>
          </button>
        </div>
      </div>

      {/* ── 2. Fiscal Revenue KPI Summary Cards ──────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
            Total Invoiced Revenue (YTD)
          </span>
          <p className="text-xl font-bold font-mono text-gray-900 mt-1">{formatLKR(totalInvoicedAmount)}</p>
          <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">
            {invoices.length} Bills Issued Across All Channels
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
            Total Revenue Collected
          </span>
          <p className="text-xl font-bold font-mono text-emerald-800 mt-1">{formatLKR(totalCollectedAmount)}</p>
          <span className="text-[11px] text-gray-500 font-medium mt-0.5 block">
            {Math.round((totalCollectedAmount / (totalInvoicedAmount || 1)) * 100)}% Collection Efficiency Rate
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
            Outstanding Receivables
          </span>
          <p className="text-xl font-bold font-mono text-amber-800 mt-1">{formatLKR(totalOutstandingAmount)}</p>
          <span className="text-[11px] text-gray-500 font-medium mt-0.5 block">
            Pending / Partial Settlement
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
            Overdue Invoices Alert
          </span>
          <p className="text-xl font-bold font-mono text-rose-800 mt-1">{totalOverdueCount} Accounts</p>
          <span className="text-[11px] text-rose-600 font-semibold mt-0.5 block">
            Requires SMS / Email Reminders
          </span>
        </div>
      </div>

      {/* ── 3. Primary Feature Navigation Tabs ───────────────────────── */}
      <div className="border-b border-gray-200">
        <nav className="flex items-center gap-2 -mb-px">
          <button
            type="button"
            onClick={() => setActiveTab('bills')}
            className={`py-3 px-4 font-bold text-xs border-b-2 uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'bills'
                ? 'border-[#A31736] text-[#A31736] bg-[#A31736]/5'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>All Municipal Bills ({invoices.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('aging')}
            className={`py-3 px-4 font-bold text-xs border-b-2 uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'aging'
                ? 'border-[#A31736] text-[#A31736] bg-[#A31736]/5'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Aging Analysis & Reminders</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('receipts')}
            className={`py-3 px-4 font-bold text-xs border-b-2 uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'receipts'
                ? 'border-[#A31736] text-[#A31736] bg-[#A31736]/5'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Official Counterfoil Receipt Log ({allReceipts.length})</span>
          </button>
        </nav>
      </div>

      {/* ── TAB 1: ALL MUNICIPAL BILLS & INVOICES ────────────────────── */}
      {activeTab === 'bills' && (
        <div className="space-y-4">
          {/* Controls Bar: Search + Category Filters */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search invoice #, NIC, citizen name..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:ring-2 focus:ring-[#A31736] focus:outline-none"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200 text-xs w-full sm:w-auto overflow-x-auto">
                {(['All', 'Draft', 'Approved & Issued', 'Partially Paid', 'Paid', 'Overdue'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded font-bold transition-all whitespace-nowrap ${
                      statusFilter === st
                        ? 'bg-[#A31736] text-white shadow-xs'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {st === 'Paid' ? 'Fully Paid' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
              <span className="font-bold text-gray-500 uppercase tracking-wide text-[10px] mr-1">
                Channel Filter:
              </span>
              {[
                'All',
                'Vehicle & Machinery Hire',
                'Public Ground & Property Hire',
                'Assessment Rates',
                'Shop/Stall Rentals',
                'Building Approvals',
                'Trade Licenses',
              ].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-gray-900 text-white border-gray-900 font-bold'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Main Bills Data Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100 text-gray-700 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Invoice # & Ref</th>
                    <th className="px-4 py-3">Citizen / Customer</th>
                    <th className="px-4 py-3">Revenue Stream & Details</th>
                    <th className="px-4 py-3">Ward</th>
                    <th className="px-4 py-3 text-right">Bill Amount</th>
                    <th className="px-4 py-3 text-right">Paid Amount</th>
                    <th className="px-4 py-3 text-center">Status Lifecycle</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInvoices.map((inv) => {
                    const currentPaid = inv.paidAmount || 0
                    const isOverdue = inv.status === 'Overdue'

                    return (
                      <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                        {/* Invoice & Ref */}
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceForDetail(inv)}
                            className="font-mono font-bold text-[#A31736] hover:underline bg-[#A31736]/10 px-1.5 py-0.5 rounded border border-[#A31736]/20 block text-[11px] w-fit"
                          >
                            {inv.invoiceNumber}
                          </button>
                          <span className="text-[10px] text-gray-400 font-mono block mt-0.5">
                            {inv.propertyOrRefId}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3">
                          <p className="font-bold text-gray-900">{inv.customerName}</p>
                          <p className="text-[10px] text-gray-500">
                            NIC: {inv.customerNICorBRN} • {inv.customerPhone || 'N/A'}
                          </p>
                        </td>

                        {/* Revenue Category & Rental Details Tag */}
                        <td className="px-4 py-3">
                          <span className="font-semibold text-gray-900">{inv.category}</span>
                          {inv.rentalDetails?.machineryType && (
                            <span className="block text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded w-fit mt-0.5">
                              🚜 {inv.rentalDetails.machineryType} ({inv.rentalDetails.hireDurationDaysOrHours})
                            </span>
                          )}
                          {inv.rentalDetails?.venueName && (
                            <span className="block text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded w-fit mt-0.5">
                              🏛️ {inv.rentalDetails.venueName}
                            </span>
                          )}
                        </td>

                        {/* Ward */}
                        <td className="px-4 py-3 text-gray-600">{inv.wardNumber}</td>

                        {/* Bill Amount */}
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono font-bold text-gray-900 text-sm">
                            {formatLKR(inv.amount)}
                          </span>
                          <span className="block text-[10px] text-gray-400">Due: {inv.dueDate}</span>
                        </td>

                        {/* Paid Amount */}
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono font-bold text-emerald-800">
                            {formatLKR(currentPaid)}
                          </span>
                          {inv.amount - currentPaid > 0 && (
                            <span className="block text-[10px] text-[#A31736] font-semibold">
                              Rem: {formatLKR(inv.amount - currentPaid)}
                            </span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-3 text-center">
                          <InvoiceLifecycleBadge status={inv.status} />
                        </td>

                        {/* Action Buttons */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inv.status !== 'Paid' && (
                              <button
                                type="button"
                                onClick={() => setSelectedInvoiceForPayment(inv)}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold px-2.5 py-1 rounded transition-colors uppercase tracking-wider cursor-pointer shadow-2xs"
                              >
                                Collect
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceForDetail(inv)}
                              className="border border-gray-300 hover:bg-gray-100 text-gray-700 text-[11px] font-semibold px-2 py-1 rounded transition-colors cursor-pointer"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceForReceipt(inv)}
                              title="Print Official Counterfoil Receipt"
                              className="border border-gray-300 hover:bg-gray-100 text-gray-700 p-1 rounded transition-colors cursor-pointer"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                                <polyline points="6 9 6 2 18 2 18 9" />
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                <rect x="6" y="14" width="12" height="8" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: AGING ANALYSIS & AUTOMATED REMINDERS ─────────────── */}
      {activeTab === 'aging' && <AgingAnalysisDashboard />}

      {/* ── TAB 3: OFFICIAL COUNTERFOIL RECEIPTS LOG ────────────────── */}
      {activeTab === 'receipts' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Official Pradeshiya Sabha Revenue Counterfoil Receipts Log
            </h3>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
              {allReceipts.length} Official Receipts Issued
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Receipt No</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Citizen / Payer</th>
                  <th className="px-4 py-3">Revenue Category</th>
                  <th className="px-4 py-3">Invoice Ref</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3 text-right">Amount Paid</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allReceipts.map((rcp) => (
                  <tr key={rcp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold text-emerald-800">{rcp.receiptNumber}</td>
                    <td className="px-4 py-3 text-gray-700">{rcp.date}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{rcp.customerName}</td>
                    <td className="px-4 py-3 text-gray-800 font-semibold">{rcp.category}</td>
                    <td className="px-4 py-3 font-mono text-[#A31736]">{rcp.invoiceNumber}</td>
                    <td className="px-4 py-3 font-medium text-gray-700">{rcp.paymentMethod}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-800 text-sm">
                      {formatLKR(rcp.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceForReceipt(rcp.parentInvoice)}
                        className="bg-gray-100 hover:bg-[#A31736] hover:text-white text-gray-700 text-[11px] font-bold px-2.5 py-1 rounded border border-gray-300 transition-colors cursor-pointer"
                      >
                        Print Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODALS ─────────────────────────────────────────────────── */}
      {showBillGenerator && (
        <MultiChannelBillGeneratorModal
          isOpen={showBillGenerator}
          onClose={() => setShowBillGenerator(false)}
        />
      )}

      {selectedInvoiceForPayment && (
        <PaymentCollectionModal
          isOpen={!!selectedInvoiceForPayment}
          onClose={() => setSelectedInvoiceForPayment(null)}
          invoice={selectedInvoiceForPayment}
        />
      )}

      {selectedInvoiceForReceipt && (
        <CounterfoilReceiptModal
          isOpen={!!selectedInvoiceForReceipt}
          onClose={() => setSelectedInvoiceForReceipt(null)}
          invoice={selectedInvoiceForReceipt}
        />
      )}

      {selectedInvoiceForDetail && (
        <InvoiceDetailModal
          isOpen={!!selectedInvoiceForDetail}
          onClose={() => setSelectedInvoiceForDetail(null)}
          invoice={selectedInvoiceForDetail}
        />
      )}
    </div>
  )
}

export default InvoicesRevenuesPage
