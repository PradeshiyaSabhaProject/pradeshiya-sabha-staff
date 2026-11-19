import React, { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  Receipt,
  CheckCircle,
  Clock,
  Wallet,
} from 'lucide-react'
import { usePaymentPortal } from '../context/PaymentPortalContext'
import PaymentStatusBadge from '../components/PaymentStatusBadge'
import InvoiceModal from '../components/InvoiceModal'
import { formatLKR, formatDate } from '../../varipanam/utils/formatters'
import type { PaymentRecord, PaymentStatus } from '../types/paymentPortal'

export const TotalPaymentsPage: React.FC = () => {
  const { payments, updatePaymentStatus } = usePaymentPortal()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | 'All'>('All')
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentRecord | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const pageSize = 8

  // Unique categories list
  const availableCategories = useMemo(() => {
    const set = new Set<string>()
    payments.forEach((p) => set.add(p.categoryName))
    return ['All', ...Array.from(set).sort()]
  }, [payments])

  // Filtered & Sorted Payments
  const filteredPayments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()

    const list = payments.filter((item) => {
      const matchSearch =
        !q ||
        item.invoiceNumber.toLowerCase().includes(q) ||
        item.payerName.toLowerCase().includes(q) ||
        item.referenceId.toLowerCase().includes(q) ||
        item.officer.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q)

      const matchCategory =
        selectedCategory === 'All' || item.categoryName === selectedCategory

      const matchStatus =
        selectedStatus === 'All' || item.status === selectedStatus

      return matchSearch && matchCategory && matchStatus
    })

    list.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB
    })

    return list
  }, [payments, searchTerm, selectedCategory, selectedStatus, sortDirection])

  // Summary Metrics for filtered set
  const filteredSummary = useMemo(() => {
    const count = filteredPayments.length
    const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0)
    const paidAmount = filteredPayments
      .filter((p) => p.status === 'Paid')
      .reduce((sum, p) => sum + p.amount, 0)
    const pendingAmount = filteredPayments
      .filter((p) => p.status === 'Pending Payment')
      .reduce((sum, p) => sum + p.amount, 0)

    return { count, totalAmount, paidAmount, pendingAmount }
  }, [filteredPayments])

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize))
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredPayments.slice(start, start + pageSize)
  }, [filteredPayments, currentPage, pageSize])

  const handleExportCsv = () => {
    setIsExporting(true)
    try {
      const headers = [
        'Invoice / Receipt No',
        'Date',
        'Income Category',
        'Payer Name',
        'NIC / Registration',
        'Reference No',
        'Amount (LKR)',
        'Payment Method',
        'Status',
        'Authorizing Officer',
      ]
      const rows = filteredPayments.map((p) => [
        `"${p.invoiceNumber}"`,
        `"${p.date}"`,
        `"${p.categoryName}"`,
        `"${p.payerName}"`,
        `"${p.payerNic || ''}"`,
        `"${p.referenceId}"`,
        p.amount,
        `"${p.paymentMethod}"`,
        `"${p.status}"`,
        `"${p.officer}"`,
      ])
      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute(
        'download',
        `total-payments-${new Date().toISOString().slice(0, 10)}.csv`
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } finally {
      setIsExporting(false)
    }
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('All')
    setSelectedStatus('All')
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-[#A31736] border border-rose-200">
                Treasury Ledger
              </span>
              <span className="text-xs text-gray-400 font-medium">
                Live Audit Trail
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight uppercase">
              TOTAL PAYMENTS & INVOICES REPOSITORY
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Comprehensive transaction history of counter payments, assessment tax bills, and municipal receipts.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={isExporting || filteredPayments.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl transition-all cursor-pointer shadow-2xs uppercase tracking-wider"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'EXPORTING...' : 'EXPORT CSV'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary Revenue Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Matching Records
            </span>
            <p className="text-xl font-black text-gray-900 mt-0.5 font-mono">
              {filteredSummary.count}
            </p>
          </div>
          <div className="p-2 bg-gray-50 text-gray-600 rounded-lg">
            <Receipt className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Gross Volume
            </span>
            <p className="text-xl font-black text-gray-900 mt-0.5 font-mono">
              {formatLKR(filteredSummary.totalAmount)}
            </p>
          </div>
          <div className="p-2 bg-rose-50 text-[#A31736] rounded-lg">
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Total Settled (Paid)
            </span>
            <p className="text-xl font-black text-emerald-700 mt-0.5 font-mono">
              {formatLKR(filteredSummary.paidAmount)}
            </p>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Pending Invoices
            </span>
            <p className="text-xl font-black text-amber-700 mt-0.5 font-mono">
              {formatLKR(filteredSummary.pendingAmount)}
            </p>
          </div>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ── Main Container: Filters & Table ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col">
        {/* Filters Toolbar */}
        <div className="p-4 sm:p-5 bg-gray-50/70 border-b border-gray-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Filter & Sort Criteria
              </h2>
            </div>
            {(searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All') && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#A31736] hover:text-[#801028] transition-colors uppercase tracking-wider self-start sm:self-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div>
              <label htmlFor="totalPaySearch" className="block text-[11px] font-semibold text-gray-600 mb-1">
                Search Invoice / Payer / Ref
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  id="totalPaySearch"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder="Invoice, payer, ref no..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#A31736] focus:border-[#A31736] outline-none text-gray-800 h-9 font-medium"
                />
              </div>
            </div>

            {/* Income Category Filter */}
            <div>
              <label htmlFor="totalPayCat" className="block text-[11px] font-semibold text-gray-600 mb-1">
                Income Category
              </label>
              <select
                id="totalPayCat"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9 font-medium cursor-pointer"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Income Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="totalPayStatus" className="block text-[11px] font-semibold text-gray-600 mb-1">
                Payment Status
              </label>
              <select
                id="totalPayStatus"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value as PaymentStatus | 'All')
                  setCurrentPage(1)
                }}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9 font-medium cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid Only</option>
                <option value="Pending Payment">Pending Payment Only</option>
              </select>
            </div>

            {/* Sort Toggle */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Sort by Date
              </label>
              <button
                type="button"
                onClick={() => setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9 font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>{sortDirection === 'desc' ? 'Newest First' : 'Oldest First'}</span>
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px] text-xs">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4">Invoice / Receipt No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Income Category</th>
                <th className="py-3 px-4">Payer Name</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4 text-right">Amount (LKR)</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Officer</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-500 font-medium">
                    <div className="max-w-sm mx-auto space-y-2">
                      <Receipt className="w-8 h-8 mx-auto text-gray-300" />
                      <p className="text-sm font-bold text-gray-700">No payment records found</p>
                      <p className="text-xs text-gray-400">
                        No transactions match your current search and filter settings.
                      </p>
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="px-3 py-1 text-xs font-bold text-[#A31736] hover:underline uppercase tracking-wider"
                      >
                        Reset filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedInvoice(p)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-gray-900 group-hover:text-[#A31736] transition-colors whitespace-nowrap">
                      {p.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {formatDate(p.date)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-800">
                      {p.categoryName}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {p.payerName}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-600 whitespace-nowrap">
                      {p.referenceId}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-900 whitespace-nowrap">
                      {formatLKR(p.amount)}
                    </td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {p.paymentMethod}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <PaymentStatusBadge status={p.status} />
                    </td>
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      {p.officer}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedInvoice(p)
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#A31736] hover:text-white hover:bg-[#A31736] border border-[#A31736] rounded-lg transition-all cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        {filteredPayments.length > 0 && (
          <div className="p-4 bg-gray-50/70 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500">
            <div>
              Showing{' '}
              <strong className="text-gray-900 font-bold">
                {Math.min(filteredPayments.length, (currentPage - 1) * pageSize + 1)}
              </strong>{' '}
              to{' '}
              <strong className="text-gray-900 font-bold">
                {Math.min(filteredPayments.length, currentPage * pageSize)}
              </strong>{' '}
              of{' '}
              <strong className="text-gray-900 font-bold">
                {filteredPayments.length}
              </strong>{' '}
              records
            </div>

            <div className="flex items-center gap-1.5 self-center sm:self-auto">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-bold text-gray-700 bg-white border border-gray-300 rounded-lg">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Modal Preview */}
      <InvoiceModal
        payment={selectedInvoice}
        isOpen={selectedInvoice !== null}
        onClose={() => setSelectedInvoice(null)}
        onMarkPaid={(id) => {
          updatePaymentStatus(id, 'Paid')
          if (selectedInvoice && selectedInvoice.id === id) {
            setSelectedInvoice({ ...selectedInvoice, status: 'Paid' })
          }
        }}
      />
    </div>
  )
}

export default TotalPaymentsPage
