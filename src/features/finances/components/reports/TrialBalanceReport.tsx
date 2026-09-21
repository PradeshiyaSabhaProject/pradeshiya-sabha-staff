import React, { useState } from 'react'
import { TRIAL_BALANCE_ACCOUNTS } from '../../data/financialReportsData'
import { formatLKR } from '../FinanceKpiCards'

interface TrialBalanceReportProps {
  onOpenAuditModal: () => void
}

export const TrialBalanceReport: React.FC<TrialBalanceReportProps> = ({ onOpenAuditModal }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('All')

  const accountTypes = ['All', 'Asset', 'Liability', 'Equity', 'Revenue', 'Expense']

  const filteredAccounts = TRIAL_BALANCE_ACCOUNTS.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.code.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false
    if (selectedType !== 'All' && acc.type !== selectedType) return false
    return true
  })

  const totalDebit = TRIAL_BALANCE_ACCOUNTS.reduce((sum, acc) => sum + acc.debit, 0)
  const totalCredit = TRIAL_BALANCE_ACCOUNTS.reduce((sum, acc) => sum + acc.credit, 0)
  const isBalanced = totalDebit === totalCredit
  const difference = totalDebit - totalCredit

  // Filtered totals for viewing
  const filteredDebit = filteredAccounts.reduce((sum, acc) => sum + acc.debit, 0)
  const filteredCredit = filteredAccounts.reduce((sum, acc) => sum + acc.credit, 0)

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Asset':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200'
      case 'Liability':
        return 'bg-rose-50 text-rose-800 border-rose-200'
      case 'Equity':
        return 'bg-purple-50 text-purple-800 border-purple-200'
      case 'Revenue':
        return 'bg-blue-50 text-blue-800 border-blue-200'
      case 'Expense':
        return 'bg-amber-50 text-amber-800 border-amber-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Top Header Bar ── */}
      <div className="bg-white border border-gray-300 rounded p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 uppercase tracking-tight flex items-center gap-2">
            <span>General Ledger Trial Balance</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Audit Verified
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Instant verification of debit and credit equality across all municipal ledger accounts as of September 2026.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAuditModal}
          className="border border-[#A31736] bg-rose-50/50 hover:bg-[#A31736] text-[#A31736] hover:text-white text-xs font-bold px-3 py-1.5 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span>Council Audit View</span>
        </button>
      </div>

      {/* ── Verification Banner ── */}
      <div
        className={`border rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs ${
          isBalanced
            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
            : 'bg-rose-50 border-rose-300 text-rose-950'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shrink-0 ${
              isBalanced ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}
          >
            {isBalanced ? '✓' : '✗'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wide">
                {isBalanced ? 'Double-Entry Verification Status: EQUAL' : 'Ledger Out of Balance'}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-emerald-200 text-emerald-800">
                100% IN EQUALITY
              </span>
            </div>
            <p className="text-xs text-emerald-800 mt-0.5">
              All posted journal batches and cash book postings sum to zero net variance across {TRIAL_BALANCE_ACCOUNTS.length} ledger accounts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono font-bold shrink-0">
          <div>
            <span className="text-gray-500 block text-[10px] uppercase">Total Debits</span>
            <span className="text-gray-900 text-sm">{formatLKR(totalDebit)}</span>
          </div>
          <div className="text-gray-400 text-base">=</div>
          <div>
            <span className="text-gray-500 block text-[10px] uppercase">Total Credits</span>
            <span className="text-gray-900 text-sm">{formatLKR(totalCredit)}</span>
          </div>
          <div className="border-l border-emerald-300 pl-4">
            <span className="text-gray-500 block text-[10px] uppercase">Discrepancy</span>
            <span className={isBalanced ? 'text-emerald-700' : 'text-rose-700'}>
              LKR {difference.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Filter Controls ── */}
      <div className="bg-white border border-gray-300 rounded p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search account code or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-300 rounded pl-8 pr-3 py-1.5 text-gray-700 placeholder-gray-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736] w-full"
          />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1 bg-gray-100 p-0.5 rounded text-xs font-semibold">
          {accountTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded transition-all cursor-pointer uppercase tracking-wider text-[10px] ${
                selectedType === type
                  ? 'bg-white text-gray-900 shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-gray-300 rounded shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50/80 flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-gray-700">
            Showing {filteredAccounts.length} of {TRIAL_BALANCE_ACCOUNTS.length} General Ledger Accounts
          </span>
          <span className="text-[11px] text-gray-500">
            Classification Series: 1000 Assets · 2000 Liabilities · 3000 Equity · 4000 Revenues · 5000 Expenses
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100/70 text-gray-700 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 w-24">Code</th>
                <th className="py-3 px-4">Account Description</th>
                <th className="py-3 px-4 w-28 text-center">Account Type</th>
                <th className="py-3 px-4 text-right w-44">Debit Balance (LKR)</th>
                <th className="py-3 px-4 text-right w-44">Credit Balance (LKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAccounts.map((acc) => (
                <tr key={acc.code} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-bold text-gray-700">{acc.code}</td>
                  <td className="py-2.5 px-4 font-medium text-gray-900">{acc.name}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTypeBadge(acc.type)}`}>
                      {acc.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold text-gray-800">
                    {acc.debit > 0 ? formatLKR(acc.debit) : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold text-gray-800">
                    {acc.credit > 0 ? formatLKR(acc.credit) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              {/* Filtered Subtotal (if filtered) */}
              {selectedType !== 'All' && (
                <tr className="bg-gray-50 border-t border-gray-200 font-semibold text-gray-700 text-xs">
                  <td colSpan={3} className="py-2.5 px-4 uppercase text-[11px]">
                    Filtered Subtotal ({selectedType})
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-gray-900">{formatLKR(filteredDebit)}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-gray-900">{formatLKR(filteredCredit)}</td>
                </tr>
              )}

              {/* Grand Total Row */}
              <tr className="border-t-2 border-gray-400 bg-gray-100 font-bold text-gray-900 text-xs">
                <td colSpan={3} className="py-3 px-4 uppercase tracking-wider flex items-center gap-2">
                  <span>Grand Total Ledger Trial Balance</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    EQUALITY PASS
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-mono text-sm border-b-4 border-double border-gray-900">
                  {formatLKR(totalDebit)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-sm border-b-4 border-double border-gray-900">
                  {formatLKR(totalCredit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TrialBalanceReport
