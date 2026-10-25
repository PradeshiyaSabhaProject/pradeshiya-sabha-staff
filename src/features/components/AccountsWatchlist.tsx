import React, { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import type { WatchlistAccount } from '../data/financeMockData'
import { formatLKR } from './FinanceKpiCards'

export const AccountsWatchlist: React.FC = () => {
  const { watchlistAccounts } = useFinance()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedAccount, setSelectedAccount] = useState<WatchlistAccount | null>(null)

  const categories = ['All', 'Receivable', 'Expense', 'Capital Fund', 'Revenue']

  const filteredAccounts = watchlistAccounts.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.voteHead.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false
    if (selectedCategory !== 'All' && acc.category !== selectedCategory) return false
    return true
  })

  const getStatusBadge = (status: WatchlistAccount['status']) => {
    switch (status) {
      case 'On Track':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Over Budget':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'Collection Lag':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'Surplus Ahead':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getProgressBarColor = (acc: WatchlistAccount) => {
    if (acc.category === 'Expense') {
      if (acc.percentage > 80) return 'bg-rose-500'
      if (acc.percentage > 70) return 'bg-amber-500'
      return 'bg-emerald-500'
    }
    // Revenue or Receivable or Capital
    if (acc.percentage >= 75) return 'bg-emerald-500'
    if (acc.percentage >= 60) return 'bg-blue-500'
    return 'bg-amber-500'
  }

  return (
    <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
      {/* ── Header & Filter Bar ── */}
      <div className="p-4 sm:p-5 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight uppercase">
            Priority Accounts Watchlist
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time monitoring of sensitive municipal ledger votes, receivable collections, and expenditure caps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search code or vote..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-300 rounded pl-8 pr-3 py-1.5 text-gray-700 placeholder-gray-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736] w-44 sm:w-56"
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

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded text-xs font-semibold">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer uppercase tracking-wider text-[10px] ${
                  selectedCategory === cat
                    ? 'bg-white text-gray-900 shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Watchlist Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-gray-700 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Account Code & Title</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-right">Annual Target / Budget</th>
              <th className="py-3 px-4 text-right">Actual YTD</th>
              <th className="py-3 px-4">Progress / Burn Rate</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAccounts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  No ledger accounts matching filters.
                </td>
              </tr>
            ) : (
              filteredAccounts.map((acc) => {
                const isExpense = acc.category === 'Expense'
                const progressColor = getProgressBarColor(acc)

                return (
                  <tr key={acc.id} className="hover:bg-gray-50 transition-colors group">
                    {/* Code & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-2">
                        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded text-[11px] border border-gray-200">
                          {acc.code}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900 text-xs">{acc.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{acc.voteHead}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                        {acc.category}
                      </span>
                    </td>

                    {/* Budget / Target */}
                    <td className="py-3 px-4 text-right font-mono font-medium text-gray-600">
                      {formatLKR(acc.allocatedBudget)}
                    </td>

                    {/* Actual YTD */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                      {formatLKR(acc.actualYTD)}
                    </td>

                    {/* Progress */}
                    <td className="py-3 px-4 min-w-[140px]">
                      <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                        <span className="text-gray-600">
                          {isExpense ? 'Spent' : 'Collected'}:
                        </span>
                        <span className="font-mono text-gray-900">{acc.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${progressColor}`}
                          style={{ width: `${Math.min(acc.percentage, 100)}%` }}
                        />
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(
                          acc.status
                        )}`}
                      >
                        {acc.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedAccount(acc)}
                        className="text-[#A31736] hover:text-[#801028] bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer uppercase tracking-wider text-[10px]"
                        title="View Ledger Audit & Recent Entries"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Ledger Detail Modal ── */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-gray-300 animate-fade-in text-gray-800">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#A31736] text-white text-xs font-mono font-bold px-2 py-0.5 rounded">
                    {selectedAccount.code}
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    {selectedAccount.name}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 font-mono">{selectedAccount.voteHead}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAccount(null)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Account Metrics Strip */}
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-3 gap-3 text-xs bg-gray-50 p-3.5 rounded border border-gray-200">
                <div>
                  <span className="text-gray-500">Allocated Benchmark</span>
                  <p className="text-sm font-bold text-gray-900 font-mono">
                    {formatLKR(selectedAccount.allocatedBudget)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Actual YTD Activity</span>
                  <p className="text-sm font-bold text-emerald-800 font-mono">
                    {formatLKR(selectedAccount.actualYTD)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Net Variance</span>
                  <p
                    className={`text-sm font-bold font-mono ${
                      selectedAccount.variance >= 0 ? 'text-blue-800' : 'text-rose-800'
                    }`}
                  >
                    {selectedAccount.variance >= 0 ? '+' : ''}
                    {formatLKR(selectedAccount.variance)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-gray-600 tracking-wider mb-1">
                  Account Description & Purpose
                </h4>
                <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
                  {selectedAccount.description}
                </p>
              </div>

              {/* Recent Ledger Postings */}
              <div>
                <h4 className="text-xs font-bold uppercase text-gray-600 tracking-wider mb-2">
                  Recent Ledger Entries (Audit Trail)
                </h4>
                <div className="border border-gray-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 font-bold text-[10px] uppercase">
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Reference</th>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedAccount.recentEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="py-2 px-3 text-gray-600 font-mono text-[11px]">
                            {entry.date}
                          </td>
                          <td className="py-2 px-3 font-mono font-semibold text-[#A31736]">
                            {entry.refNo}
                          </td>
                          <td className="py-2 px-3 text-gray-800">{entry.description}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                entry.type === 'Credit'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}
                            >
                              {entry.type}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-gray-900">
                            {formatLKR(entry.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-[11px] text-gray-500">
                Last updated on {selectedAccount.lastUpdated}
              </span>
              <button
                type="button"
                onClick={() => setSelectedAccount(null)}
                className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold px-4 py-1.5 rounded uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountsWatchlist
