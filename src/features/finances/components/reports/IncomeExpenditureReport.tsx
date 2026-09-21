import React, { useState } from 'react'
import {
  REVENUE_ITEMS,
  EXPENDITURE_ITEMS,
  type RevenueLineItem,
  type ExpenditureLineItem,
} from '../../data/financialReportsData'
import { formatLKR } from '../FinanceKpiCards'

interface IncomeExpenditureReportProps {
  period: 'YTD' | 'Q1' | 'Q2' | 'Q3' | 'FY2025'
  onPeriodChange: (p: 'YTD' | 'Q1' | 'Q2' | 'Q3' | 'FY2025') => void
  onOpenAuditModal: () => void
}

export const IncomeExpenditureReport: React.FC<IncomeExpenditureReportProps> = ({
  period,
  onPeriodChange,
  onOpenAuditModal,
}) => {
  const [expandedRevenueCat, setExpandedRevenueCat] = useState<string | null>(null)
  const [expandedExpenseCat, setExpandedExpenseCat] = useState<string | null>(null)
  const [filterQuery, setFilterQuery] = useState('')

  // Helper to extract actual based on selected period
  const getRevenueActual = (item: RevenueLineItem) => {
    switch (period) {
      case 'Q1':
        return item.q1Actual
      case 'Q2':
        return item.q2Actual
      case 'Q3':
        return item.q3Actual
      case 'FY2025':
        return item.priorYearAudited
      case 'YTD':
      default:
        return item.actualYTD
    }
  }

  const getExpenseActual = (item: ExpenditureLineItem) => {
    switch (period) {
      case 'Q1':
        return item.q1Actual
      case 'Q2':
        return item.q2Actual
      case 'Q3':
        return item.q3Actual
      case 'FY2025':
        return item.priorYearAudited
      case 'YTD':
      default:
        return item.actualYTD
    }
  }

  // Filtered lists
  const filteredRevenues = REVENUE_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(filterQuery.toLowerCase())
  )

  const filteredExpenses = EXPENDITURE_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(filterQuery.toLowerCase())
  )

  // Aggregates
  const totalBudgetRevenue = REVENUE_ITEMS.reduce((sum, item) => sum + item.budgetAnnual, 0)
  const totalActualRevenue = REVENUE_ITEMS.reduce((sum, item) => sum + getRevenueActual(item), 0)

  const totalBudgetExpense = EXPENDITURE_ITEMS.reduce((sum, item) => sum + item.budgetAnnual, 0)
  const totalActualExpense = EXPENDITURE_ITEMS.reduce((sum, item) => sum + getExpenseActual(item), 0)

  const netOperatingSurplus = totalActualRevenue - totalActualExpense
  const budgetedOperatingSurplus = totalBudgetRevenue - totalBudgetExpense
  const isSurplus = netOperatingSurplus >= 0

  const revenueRealizationRate = totalBudgetRevenue > 0 ? ((totalActualRevenue / totalBudgetRevenue) * 100).toFixed(1) : '0'
  const expenseUtilizationRate = totalBudgetExpense > 0 ? ((totalActualExpense / totalBudgetExpense) * 100).toFixed(1) : '0'
  const operatingMargin = totalActualRevenue > 0 ? ((netOperatingSurplus / totalActualRevenue) * 100).toFixed(1) : '0'

  // Categories grouping
  const revenueCategories = Array.from(new Set(REVENUE_ITEMS.map((item) => item.category)))
  const expenseCategories = Array.from(new Set(EXPENDITURE_ITEMS.map((item) => item.category)))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Filter & Period Selector Bar ── */}
      <div className="bg-white border border-gray-300 rounded p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 uppercase tracking-tight flex items-center gap-2">
            <span>Statement of Income &amp; Expenditure</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              Act No. 15 of 1987 §171
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Detailed municipal revenue collections minus recurrent and capital operating expenses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period selector buttons */}
          <div className="bg-gray-100 p-0.5 rounded flex items-center text-xs font-semibold">
            {[
              { id: 'YTD', label: '2026 YTD' },
              { id: 'Q1', label: 'Q1 (Jan-Mar)' },
              { id: 'Q2', label: 'Q2 (Apr-Jun)' },
              { id: 'Q3', label: 'Q3 (Jul-Sep)' },
              { id: 'FY2025', label: 'FY2025 Audited' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onPeriodChange(tab.id as any)}
                className={`px-3 py-1.5 rounded transition-all cursor-pointer text-[10px] font-bold uppercase tracking-wider ${
                  period === tab.id
                    ? 'bg-white text-gray-900 shadow-xs border border-gray-200'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <input
            type="text"
            placeholder="Search code or description..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-gray-700 placeholder-gray-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736] w-48 sm:w-56"
          />

          <button
            type="button"
            onClick={onOpenAuditModal}
            className="border border-[#A31736] bg-rose-50/50 hover:bg-[#A31736] text-[#A31736] hover:text-white text-xs font-bold px-3 py-1.5 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Inspect formatted audit certificate"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>Council Audit View</span>
          </button>
        </div>
      </div>

      {/* ── Summary Key Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-300 rounded p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Operating Revenue</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              {revenueRealizationRate}% Realized
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 font-mono mt-2">{formatLKR(totalActualRevenue)}</p>
          <div className="mt-2 text-[11px] text-gray-500 flex justify-between border-t border-gray-100 pt-1.5">
            <span>Budget Target:</span>
            <span className="font-semibold text-gray-700">{formatLKR(totalBudgetRevenue, true)}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Operating Expenses</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
              {expenseUtilizationRate}% Utilized
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 font-mono mt-2">{formatLKR(totalActualExpense)}</p>
          <div className="mt-2 text-[11px] text-gray-500 flex justify-between border-t border-gray-100 pt-1.5">
            <span>Approved Budget:</span>
            <span className="font-semibold text-gray-700">{formatLKR(totalBudgetExpense, true)}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Net Operating Result</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                isSurplus
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {isSurplus ? 'Net Surplus' : 'Operating Deficit'}
            </span>
          </div>
          <p className={`text-xl sm:text-2xl font-bold font-mono mt-2 ${isSurplus ? 'text-blue-900' : 'text-amber-800'}`}>
            {isSurplus ? '+' : ''}{formatLKR(netOperatingSurplus)}
          </p>
          <div className="mt-2 text-[11px] text-gray-500 flex justify-between border-t border-gray-100 pt-1.5">
            <span>Budgeted Net:</span>
            <span className="font-semibold text-gray-700">+{formatLKR(budgetedOperatingSurplus, true)}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Fiscal Reserve Margin</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
              Reserve Ratio
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-purple-900 font-mono mt-2">{operatingMargin}%</p>
          <div className="mt-2 text-[11px] text-gray-500 flex justify-between border-t border-gray-100 pt-1.5">
            <span>Council Liquidity:</span>
            <span className="font-semibold text-emerald-700">Healthy</span>
          </div>
        </div>
      </div>

      {/* ── TABLE 1: REVENUE LINE ITEMS ── */}
      <div className="bg-white border border-gray-300 rounded shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Part I: Municipal Operating Revenues (Vote Heads 4000)
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Property rates, trade permits, stall leases, planning fees, and provincial grants
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded border border-emerald-200">
            Total Revenue: {formatLKR(totalActualRevenue)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100/70 text-gray-700 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 w-20">Vote Code</th>
                <th className="py-3 px-4">Revenue Description</th>
                <th className="py-3 px-4 text-right">Annual Target</th>
                <th className="py-3 px-4 text-right">{period} Realized</th>
                <th className="py-3 px-4 text-right">Realization %</th>
                <th className="py-3 px-4 text-right">Variance</th>
                <th className="py-3 px-4">Statutory Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {revenueCategories.map((cat) => {
                const catItems = filteredRevenues.filter((item) => item.category === cat)
                if (catItems.length === 0) return null
                const catBudget = catItems.reduce((sum, i) => sum + i.budgetAnnual, 0)
                const catActual = catItems.reduce((sum, i) => sum + getRevenueActual(i), 0)
                const isExpanded = expandedRevenueCat === cat

                return (
                  <React.Fragment key={cat}>
                    {/* Category Header Row */}
                    <tr
                      onClick={() => setExpandedRevenueCat(isExpanded ? null : cat)}
                      className="bg-gray-50/90 font-bold text-gray-800 hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <td colSpan={2} className="py-2.5 px-4 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 font-mono text-[10px]">{isExpanded ? '▼' : '►'}</span>
                          <span className="text-[#A31736]">{cat}</span>
                          <span className="text-[10px] font-normal text-gray-500">({catItems.length} accounts)</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono">{formatLKR(catBudget)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-emerald-800">{formatLKR(catActual)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-gray-600">
                        {catBudget > 0 ? `${((catActual / catBudget) * 100).toFixed(1)}%` : '—'}
                      </td>
                      <td className={`py-2.5 px-4 text-right font-mono ${catActual >= catBudget ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {catActual - catBudget >= 0 ? '+' : ''}{formatLKR(catActual - catBudget)}
                      </td>
                      <td className="py-2.5 px-4 text-[11px] text-gray-500">Click to {isExpanded ? 'collapse' : 'expand'}</td>
                    </tr>

                    {/* Line Items */}
                    {catItems.map((item) => {
                      const actual = getRevenueActual(item)
                      const variance = actual - item.budgetAnnual
                      const pct = item.budgetAnnual > 0 ? (actual / item.budgetAnnual) * 100 : 0

                      return (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-2 px-4 font-mono font-semibold text-gray-600 text-[11px]">{item.code}</td>
                          <td className="py-2 px-4 font-medium text-gray-900 pl-6">{item.title}</td>
                          <td className="py-2 px-4 text-right font-mono text-gray-600">{formatLKR(item.budgetAnnual)}</td>
                          <td className="py-2 px-4 text-right font-mono font-bold text-emerald-800">{formatLKR(actual)}</td>
                          <td className="py-2 px-4 text-right font-mono">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                pct >= 75
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : pct >= 50
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {pct.toFixed(1)}%
                            </span>
                          </td>
                          <td className={`py-2 px-4 text-right font-mono text-[11px] ${variance >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {variance >= 0 ? '+' : ''}{formatLKR(variance)}
                          </td>
                          <td className="py-2 px-4 text-[11px] text-gray-500 max-w-xs truncate" title={item.notes}>
                            {item.notes}
                          </td>
                        </tr>
                      )
                    })}
                  </React.Fragment>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-400 bg-gray-100 font-bold text-gray-900 text-xs">
                <td colSpan={2} className="py-3 px-4 uppercase tracking-wider">
                  Total Municipal Operating Revenues (A)
                </td>
                <td className="py-3 px-4 text-right font-mono">{formatLKR(totalBudgetRevenue)}</td>
                <td className="py-3 px-4 text-right font-mono text-emerald-800 text-sm">{formatLKR(totalActualRevenue)}</td>
                <td className="py-3 px-4 text-right font-mono">{revenueRealizationRate}%</td>
                <td className="py-3 px-4 text-right font-mono text-emerald-800">
                  {totalActualRevenue - totalBudgetRevenue >= 0 ? '+' : ''}{formatLKR(totalActualRevenue - totalBudgetRevenue)}
                </td>
                <td className="py-3 px-4 text-[11px] text-gray-500">Statutory Recurrent Fund</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── TABLE 2: EXPENDITURE LINE ITEMS ── */}
      <div className="bg-white border border-gray-300 rounded shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Part II: Municipal Operating Expenditures (Vote Heads 5000)
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Staff personal emoluments, roads & infrastructure, waste disposal, CEB streetlights, and governance
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-rose-800 bg-rose-50 px-3 py-1 rounded border border-rose-200">
            Total Expenditure: {formatLKR(totalActualExpense)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100/70 text-gray-700 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 w-20">Vote Code</th>
                <th className="py-3 px-4">Expenditure Head</th>
                <th className="py-3 px-4 text-right">Annual Budget</th>
                <th className="py-3 px-4 text-right">{period} Disbursed</th>
                <th className="py-3 px-4 text-right">Utilization %</th>
                <th className="py-3 px-4 text-right">Remaining Cushion</th>
                <th className="py-3 px-4">Statutory Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenseCategories.map((cat) => {
                const catItems = filteredExpenses.filter((item) => item.category === cat)
                if (catItems.length === 0) return null
                const catBudget = catItems.reduce((sum, i) => sum + i.budgetAnnual, 0)
                const catActual = catItems.reduce((sum, i) => sum + getExpenseActual(i), 0)
                const isExpanded = expandedExpenseCat === cat

                return (
                  <React.Fragment key={cat}>
                    {/* Category Header Row */}
                    <tr
                      onClick={() => setExpandedExpenseCat(isExpanded ? null : cat)}
                      className="bg-gray-50/90 font-bold text-gray-800 hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <td colSpan={2} className="py-2.5 px-4 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 font-mono text-[10px]">{isExpanded ? '▼' : '►'}</span>
                          <span className="text-[#A31736]">{cat}</span>
                          <span className="text-[10px] font-normal text-gray-500">({catItems.length} heads)</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono">{formatLKR(catBudget)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-rose-800">{formatLKR(catActual)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-gray-600">
                        {catBudget > 0 ? `${((catActual / catBudget) * 100).toFixed(1)}%` : '—'}
                      </td>
                      <td className={`py-2.5 px-4 text-right font-mono ${catBudget - catActual >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {formatLKR(catBudget - catActual)}
                      </td>
                      <td className="py-2.5 px-4 text-[11px] text-gray-500">Click to {isExpanded ? 'collapse' : 'expand'}</td>
                    </tr>

                    {/* Line Items */}
                    {catItems.map((item) => {
                      const actual = getExpenseActual(item)
                      const remaining = item.budgetAnnual - actual
                      const pct = item.budgetAnnual > 0 ? (actual / item.budgetAnnual) * 100 : 0

                      return (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-2 px-4 font-mono font-semibold text-gray-600 text-[11px]">{item.code}</td>
                          <td className="py-2 px-4 font-medium text-gray-900 pl-6">{item.title}</td>
                          <td className="py-2 px-4 text-right font-mono text-gray-600">{formatLKR(item.budgetAnnual)}</td>
                          <td className="py-2 px-4 text-right font-mono font-bold text-rose-800">{formatLKR(actual)}</td>
                          <td className="py-2 px-4 text-right font-mono">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                pct > 85
                                  ? 'bg-rose-50 text-rose-700'
                                  : pct > 70
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {pct.toFixed(1)}%
                            </span>
                          </td>
                          <td className={`py-2 px-4 text-right font-mono text-[11px] ${remaining >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {formatLKR(remaining)}
                          </td>
                          <td className="py-2 px-4 text-[11px] text-gray-500 max-w-xs truncate" title={item.notes}>
                            {item.notes}
                          </td>
                        </tr>
                      )
                    })}
                  </React.Fragment>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-400 bg-gray-100 font-bold text-gray-900 text-xs">
                <td colSpan={2} className="py-3 px-4 uppercase tracking-wider">
                  Total Municipal Operating Expenditures (B)
                </td>
                <td className="py-3 px-4 text-right font-mono">{formatLKR(totalBudgetExpense)}</td>
                <td className="py-3 px-4 text-right font-mono text-rose-800 text-sm">{formatLKR(totalActualExpense)}</td>
                <td className="py-3 px-4 text-right font-mono">{expenseUtilizationRate}%</td>
                <td className="py-3 px-4 text-right font-mono text-emerald-800">{formatLKR(totalBudgetExpense - totalActualExpense)}</td>
                <td className="py-3 px-4 text-[11px] text-gray-500">Committed &amp; Disbursed</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── STATUTORY NET RESULT (DOUBLE UNDERLINE ACCOUNTING PRESENTATION) ── */}
      <div className="bg-white border-2 border-gray-800 rounded p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-gray-300 pb-3">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900">
              Net Municipal Operating Result for the Period (A - B)
            </h4>
            <p className="text-xs text-gray-500">
              Transferred to Municipal General Accumulated Fund (Statement of Financial Position)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold uppercase px-3 py-1 rounded border ${
                isSurplus
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {isSurplus ? 'Operating Surplus' : 'Operating Deficit'}
            </span>
            <span className="text-xl sm:text-2xl font-mono font-bold text-gray-900 border-b-4 border-double border-gray-800 pb-1">
              {isSurplus ? '+' : ''}{formatLKR(netOperatingSurplus)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs text-gray-600">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Budget Benchmark Net</span>
            <span className="font-mono font-bold text-gray-800">+{formatLKR(budgetedOperatingSurplus)}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Variance from Budget</span>
            <span className={`font-mono font-bold ${netOperatingSurplus >= budgetedOperatingSurplus ? 'text-emerald-700' : 'text-amber-700'}`}>
              {netOperatingSurplus - budgetedOperatingSurplus >= 0 ? '+' : ''}{formatLKR(netOperatingSurplus - budgetedOperatingSurplus)}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Statutory Treatment</span>
            <span className="font-semibold text-gray-800">Capital Reserve &amp; General Fund Allocation</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IncomeExpenditureReport
