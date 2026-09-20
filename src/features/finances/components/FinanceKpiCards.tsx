import React, { useState } from 'react'
import { useFinance } from '../context/FinanceContext'

export const formatLKR = (amount: number, compact: boolean = false): string => {
  if (compact) {
    if (Math.abs(amount) >= 1_000_000_000) {
      return `Rs. ${(amount / 1_000_000_000).toFixed(2)}B`
    }
    if (Math.abs(amount) >= 1_000_000) {
      return `Rs. ${(amount / 1_000_000).toFixed(2)}M`
    }
    if (Math.abs(amount) >= 1_000) {
      return `Rs. ${(amount / 1_000).toFixed(1)}k`
    }
  }
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('LKR', 'Rs.')
}

export const FinanceKpiCards: React.FC = () => {
  const { kpiSummary, bankAccounts } = useFinance()
  const [showBankBreakdown, setShowBankBreakdown] = useState(false)

  const revenuePercentOfTarget = Math.round((kpiSummary.totalRevenueYTD / kpiSummary.revenueTarget) * 1000) / 10
  const expenditurePercentOfBudget = Math.round((kpiSummary.totalExpendituresYTD / kpiSummary.expenditureBudget) * 1000) / 10
  const isSurplus = kpiSummary.netOperatingSurplus >= 0

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ── CARD 1: Total Revenue YTD ── */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Total Revenue YTD
              </span>
              <div className="p-1.5 bg-emerald-50 rounded text-emerald-800 shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {formatLKR(kpiSummary.totalRevenueYTD, true)}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                +{kpiSummary.revenueGrowthYoY}% YoY
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-1 font-mono">
              {formatLKR(kpiSummary.totalRevenueYTD)}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-600 mb-1.5 font-medium">
              <span>Target: {formatLKR(kpiSummary.revenueTarget, true)}</span>
              <span className="font-bold text-emerald-700">{revenuePercentOfTarget}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(revenuePercentOfTarget, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5">
              Rates, trade licenses, property rents & grants
            </p>
          </div>
        </div>

        {/* ── CARD 2: Total Expenditures YTD ── */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Total Expenditures YTD
              </span>
              <div className="p-1.5 bg-rose-50 rounded text-rose-800 shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {formatLKR(kpiSummary.totalExpendituresYTD, true)}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                +{kpiSummary.expenditureGrowthYoY}% YoY
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-1 font-mono">
              {formatLKR(kpiSummary.totalExpendituresYTD)}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-600 mb-1.5 font-medium">
              <span>Budget: {formatLKR(kpiSummary.expenditureBudget, true)}</span>
              <span className="font-bold text-rose-700">{expenditurePercentOfBudget}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(expenditurePercentOfBudget, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5">
              Salaries, capital works, fuel & utilities
            </p>
          </div>
        </div>

        {/* ── CARD 3: Net Operating Result ── */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Net Operating Result
              </span>
              <div className="p-1.5 bg-blue-50 rounded text-blue-800 shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {isSurplus ? '+' : ''}
                {formatLKR(kpiSummary.netOperatingSurplus, true)}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                  isSurplus
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {isSurplus ? 'Operating Surplus' : 'Deficit'}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-1 font-mono">
              {formatLKR(kpiSummary.netOperatingSurplus)}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
              <span>Operating Margin:</span>
              <span className="font-bold text-gray-900">
                {((kpiSummary.netOperatingSurplus / kpiSummary.totalRevenueYTD) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="mt-2 text-[11px] text-gray-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Fiscal reserve generation is stable</span>
            </div>
          </div>
        </div>

        {/* ── CARD 4: Bank Cash Balance ── */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Bank Cash Balance
              </span>
              <div className="p-1.5 bg-purple-50 rounded text-purple-800 shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {formatLKR(kpiSummary.bankCashBalance, true)}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                {bankAccounts.length} Accounts
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-1 font-mono">
              {formatLKR(kpiSummary.bankCashBalance)}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-600 font-medium">
              <span>Primary: Bank of Ceylon</span>
              <span className="font-bold text-gray-900">{formatLKR(bankAccounts[0]?.balance || 0, true)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
              <span>People's Bank + Commercial</span>
              <button
                type="button"
                onClick={() => setShowBankBreakdown((prev) => !prev)}
                className="text-[#A31736] font-bold hover:underline cursor-pointer"
              >
                {showBankBreakdown ? 'Hide accounts' : 'View all accounts'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── EXPANDABLE BANK ACCOUNTS PANEL ── */}
      {showBankBreakdown && (
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <h4 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-gray-900">
                Council Bank Accounts Ledger & Reconciliation Status
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setShowBankBreakdown(false)}
              className="text-gray-500 hover:text-gray-900 text-xs px-2.5 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {bankAccounts.map((account) => (
              <div
                key={account.id}
                className="bg-gray-50/70 border border-gray-200 rounded p-3.5 hover:border-gray-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-gray-900">{account.bankName}</h5>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{account.accountNumber}</p>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700">
                    {account.accountType}
                  </span>
                </div>

                <div className="mt-3">
                  <span className="text-base font-bold text-gray-900 font-mono">
                    {formatLKR(account.balance)}
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Reconciled: {account.lastReconciledDate}</span>
                  {account.unreconciledCount > 0 ? (
                    <span className="text-amber-700 font-bold">
                      {account.unreconciledCount} pending items
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold">✓ Reconciled</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default FinanceKpiCards
