import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  RotateCw,
  Download,
  Wallet,
  FileCheck,
  Clock,
  CircleDollarSign,
  ArrowRight,
  PlusCircle,
  Receipt,
  Eye,
  TrendingUp,
} from 'lucide-react'
import { usePaymentPortal } from '../context/PaymentPortalContext'
import StatCard from '../components/StatCard'
import PaymentStatusBadge from '../components/PaymentStatusBadge'
import InvoiceModal from '../components/InvoiceModal'
import { formatLKR, formatDate } from '../../varipanam/utils/formatters'
import type { PaymentRecord } from '../types/paymentPortal'

export const PaymentOverviewPage: React.FC = () => {
  const navigate = useNavigate()
  const { payments, stats, lastRefreshed, refreshData, updatePaymentStatus } = usePaymentPortal()
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentRecord | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Calculate Collections by Category for CSS bar chart
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; amount: number; count: number }>()

    payments.forEach((p) => {
      const existing = map.get(p.categoryName) || { name: p.categoryName, amount: 0, count: 0 }
      if (p.status === 'Paid') {
        existing.amount += p.amount
      }
      existing.count += 1
      map.set(p.categoryName, existing)
    })

    const list = Array.from(map.values())
    list.sort((a, b) => b.amount - a.amount)

    const maxAmount = list.length > 0 && list[0].amount > 0 ? list[0].amount : 1
    const totalCollected = list.reduce((sum, item) => sum + item.amount, 0)

    return list.slice(0, 6).map((item) => ({
      ...item,
      percentageOfMax: Math.round((item.amount / maxAmount) * 100),
      percentageOfTotal: totalCollected > 0 ? Math.round((item.amount / totalCollected) * 100) : 0,
    }))
  }, [payments])

  // Top 5 recent transactions
  const recentPayments = useMemo(() => {
    return payments.slice(0, 5)
  }, [payments])

  const handleExportSummary = () => {
    setIsExporting(true)
    try {
      const headers = ['Invoice No', 'Date', 'Income Category', 'Payer Name', 'Reference', 'Amount', 'Payment Method', 'Status', 'Officer']
      const rows = payments.map((p) => [
        `"${p.invoiceNumber}"`,
        `"${p.date}"`,
        `"${p.categoryName}"`,
        `"${p.payerName}"`,
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
      link.setAttribute('download', `payment-portal-summary-${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── 1. Page Header matching Municipal Command Overview ── */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ACTIVE SHIFT: 08:00 - 16:30
              </span>
              <span className="text-xs text-gray-400 font-medium">
                Synced at {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight uppercase">
              HOMAGAMA PRADESHIYA SABHA • PAYMENT PORTAL OVERVIEW
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Central treasury & revenue administration hub: monitor collections, assessment billing, municipal fee receipts, and payment settlements.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={refreshData}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Refresh ledger state"
            >
              <RotateCw className="w-3.5 h-3.5 text-gray-500" />
              <span>REFRESH</span>
            </button>
            <button
              type="button"
              onClick={handleExportSummary}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'EXPORTING...' : 'EXPORT CSV'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Top KPI Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Payments Collected (This Month)"
          value={formatLKR(stats.totalCollectedThisMonth)}
          subValue="Consolidated municipal revenue"
          trendBadge="+12.4% vs last mo"
          icon={<Wallet className="w-5 h-5 text-[#A31736]" />}
          iconBgColor="bg-rose-50 border-rose-100 text-[#A31736]"
        />

        <StatCard
          label="Invoices Generated Today"
          value={String(stats.invoicesGeneratedToday)}
          subValue="Active counter & billing receipts"
          trendBadge="Today"
          icon={<FileCheck className="w-5 h-5 text-emerald-700" />}
          iconBgColor="bg-emerald-50 border-emerald-100 text-emerald-700"
        />

        <StatCard
          label="Pending Payments"
          value={String(stats.pendingPaymentsCount)}
          subValue={`Outstanding: ${formatLKR(stats.pendingPaymentsAmount)}`}
          trendBadge="Action Required"
          icon={<Clock className="w-5 h-5 text-amber-700" />}
          iconBgColor="bg-amber-50 border-amber-100 text-amber-700"
        />

        <StatCard
          label="Collections Today"
          value={formatLKR(stats.collectionsToday)}
          subValue="Settled cash, cards & bank transfers"
          trendBadge="Settled"
          icon={<CircleDollarSign className="w-5 h-5 text-blue-700" />}
          iconBgColor="bg-blue-50 border-blue-100 text-blue-700"
        />
      </div>

      {/* ── 3. Middle Section: Quick Actions + CSS Bar Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick Actions (1 col on desktop) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-rose-50 text-[#A31736] rounded-lg">
                <PlusCircle className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Quick Actions
              </h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Initiate counter revenue collections or inspect historical transaction ledgers.
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => navigate('/payment-portal/collection')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-[#A31736] hover:bg-rose-50/30 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-[#A31736] group-hover:text-white transition-colors text-gray-600">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 group-hover:text-[#A31736] transition-colors">
                      Collect Payment
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Select income category & process counter receipt
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#A31736] group-hover:translate-x-1 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/payment-portal/collection/varipanam')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-[#A31736] hover:bg-rose-50/30 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-[#A31736] group-hover:text-white transition-colors text-gray-600">
                    <CircleDollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 group-hover:text-[#A31736] transition-colors">
                      Varipanam Billing Desk
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Search property number & generate tax invoice
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#A31736] group-hover:translate-x-1 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/payment-portal/total-payments')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-[#A31736] hover:bg-rose-50/30 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-[#A31736] group-hover:text-white transition-colors text-gray-600">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 group-hover:text-[#A31736] transition-colors">
                      View Total Payments
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Browse all receipts, filter by officer & export
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#A31736] group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Logged Shift Officer: Staff</span>
            <span className="font-semibold text-emerald-600">Counter Online</span>
          </div>
        </div>

        {/* Collections by Income Category CSS Bar Chart (2 cols on desktop) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Collections by Income Category
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-gray-500">
                Top Revenue Streams
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Revenue distribution across municipal tax and service fee categories.
            </p>

            {/* CSS Horizontal Bar Chart */}
            <div className="space-y-3.5">
              {categoryBreakdown.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-800 truncate max-w-[240px] sm:max-w-none">
                      {cat.name}
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-gray-400 text-[11px]">({cat.count} tx)</span>
                      <span className="font-bold text-gray-900">{formatLKR(cat.amount)}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden flex">
                    <div
                      className="bg-[#A31736] h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.max(cat.percentageOfMax, 4)}%` }}
                      title={`${cat.name}: ${cat.percentageOfTotal}% of collected revenue`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <span>Chart computes settled collections only</span>
            <Link
              to="/payment-portal/collection"
              className="text-[#A31736] hover:text-[#801028] font-bold inline-flex items-center gap-1"
            >
              <span>Explore all 37 categories</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── 4. Recent Transactions Table ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-200 bg-gray-50/50">
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Recent Transactions
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Latest 5 payments processed through the municipal portal.
            </p>
          </div>
          <Link
            to="/payment-portal/total-payments"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A31736] hover:text-[#801028] transition-colors uppercase tracking-wider"
          >
            <span>View all payments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-100/70 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4">Invoice / Receipt No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Income Category</th>
                <th className="py-3 px-4">Payer & Reference</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs">
              {recentPayments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="py-3 px-4 font-mono font-bold text-gray-900">
                    {p.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {formatDate(p.date)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-800">
                    {p.categoryName}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">{p.payerName}</div>
                    <div className="text-[11px] text-gray-500 font-mono">Ref: {p.referenceId}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                    {formatLKR(p.amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <PaymentStatusBadge status={p.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(p)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#A31736] hover:text-white hover:bg-[#A31736] border border-[#A31736] rounded-lg transition-all cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

export default PaymentOverviewPage
