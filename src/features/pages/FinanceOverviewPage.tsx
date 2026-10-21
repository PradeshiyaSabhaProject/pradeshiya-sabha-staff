import React, { useState } from 'react'
import FinanceKpiCards, { formatLKR } from '../components/FinanceKpiCards'
import CashFlowVisualizer from '../components/CashFlowVisualizer'
import AccountsWatchlist from '../components/AccountsWatchlist'
import QuickActionHub from '../components/QuickActionHub'
import { useFinance } from '../context/FinanceContext'

export const FinanceOverviewPage: React.FC = () => {
  const { invoices, paymentVouchers } = useFinance()
  const [isExporting, setIsExporting] = useState(false)

  const recentInvoices = invoices.slice(0, 4)
  const recentVouchers = paymentVouchers.slice(0, 4)

  const handleExportSummary = () => {
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
      alert('Finance Summary report exported: HOMAGAMA_PS_FINANCES_2026.csv')
    }, 600)
  }

  return (
    <div className="space-y-6 text-left pb-8 animate-fade-in">
      {/* ── 1. Page Header (Matching Portal Standard) ────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Finance & Treasury Overview
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Homagama Pradeshiya Sabha municipal cash flows, assessment tax collections, expenditure votes, and ledger oversight.
          </p>
        </div>

        {/* Action Buttons Top-Right */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/finances/invoices"
            className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold px-3.5 py-2 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span>Invoices & Revenues Module</span>
          </a>

          <button
            type="button"
            onClick={handleExportSummary}
            disabled={isExporting}
            className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>{isExporting ? 'Exporting...' : 'Export Fiscal CSV'}</span>
          </button>
        </div>
      </div>

      {/* ── 2. Key Financial KPI Cards ──────────────────────────────── */}
      <FinanceKpiCards />

      {/* ── 3. Quick Action Hub (1-Click Operational Modals) ────────── */}
      <QuickActionHub />

      {/* ── 4. Monthly Cash Flow Visualizer Chart ───────────────────── */}
      <CashFlowVisualizer />

      {/* ── 5. Priority Accounts Watchlist Table ─────────────────────── */}
      <AccountsWatchlist />

      {/* ── 6. Live Activity & Recent Transactions Double-Pane ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Recent Revenue Invoices */}
        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
              Recent Revenue Invoices
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
              {invoices.length} Registered
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {recentInvoices.map((inv) => (
              <div key={inv.id} className="p-3.5 hover:bg-gray-50 transition-colors flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded text-[11px] border border-gray-200">
                      {inv.invoiceNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded border ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-800 mt-1">{inv.customerName}</p>
                  <p className="text-[11px] text-gray-500">{inv.category} • {inv.wardNumber}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-800 text-sm">
                    {formatLKR(inv.amount)}
                  </span>
                  <p className="text-[11px] text-gray-400">Due: {inv.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Payment Vouchers */}
        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
              Recent Payment Disbursals
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-mono">
              {paymentVouchers.length} Disbursed
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {recentVouchers.map((v) => (
              <div key={v.id} className="p-3.5 hover:bg-gray-50 transition-colors flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded text-[11px] border border-gray-200">
                      {v.voucherNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {v.status}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-800 mt-1">{v.payeeName}</p>
                  <p className="text-[11px] text-gray-500">{v.category} • {v.voteNumber}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-rose-800 text-sm">
                    {formatLKR(v.amount)}
                  </span>
                  <p className="text-[11px] text-gray-400">{v.paymentDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinanceOverviewPage
