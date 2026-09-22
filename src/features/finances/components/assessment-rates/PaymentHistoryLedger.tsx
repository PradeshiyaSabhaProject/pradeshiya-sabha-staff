import React, { useState } from 'react'
import type { PropertyPaymentHistory } from '../../data/financeMockData'

interface PaymentHistoryLedgerProps {
  paymentHistories: PropertyPaymentHistory[]
}

const PaymentHistoryLedger: React.FC<PaymentHistoryLedgerProps> = ({ paymentHistories }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'owner' | 'amount'>('date')

  const filteredHistories = paymentHistories
    .filter((ph) => {
      const matchesSearch =
        ph.assessmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ph.propertyOwner.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = !filterStatus || ph.status === filterStatus
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'owner':
          return a.propertyOwner.localeCompare(b.propertyOwner)
        case 'amount':
          return b.netAmount - a.netAmount
        default:
          return new Date(b.paymentDate || '').getTime() - new Date(a.paymentDate || '').getTime()
      }
    })

  const statuses = Array.from(new Set(paymentHistories.map((ph) => ph.status)))

  const getStatusBadge = (status: string) => {
    const badges: Record<
      string,
      { bg: string; text: string; icon: string }
    > = {
      Pending: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '⏳' },
      'Partially Paid': { bg: 'bg-amber-100', text: 'text-amber-800', icon: '⚠️' },
      Paid: { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: '✅' },
      Overdue: { bg: 'bg-red-100', text: 'text-red-800', icon: '❌' },
      'Written Off': { bg: 'bg-gray-100', text: 'text-gray-800', icon: '📋' },
    }
    return badges[status] || badges.Pending
  }

  const getPaymentMethodIcon = (method?: string) => {
    const icons: Record<string, string> = {
      'Cash Counter': '💵',
      'Online Gateway': '💻',
      'Bank Transfer': '🏦',
      Cheque: '✓',
      Partial: '⚖️',
    }
    return icons[method || 'Unknown'] || '❓'
  }

  const totalGross = filteredHistories.reduce((sum, ph) => sum + ph.grossAmount, 0)
  const totalDiscounts = filteredHistories.reduce((sum, ph) => sum + ph.discountAmount, 0)
  const totalSurcharges = filteredHistories.reduce((sum, ph) => sum + ph.surchargeAmount, 0)
  const totalCollected = filteredHistories.reduce((sum, ph) => sum + ph.paidAmount, 0)
  const totalOutstanding = filteredHistories.reduce((sum, ph) => sum + ph.remainingBalance, 0)

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by assessment no or property owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Sort: Most Recent</option>
              <option value="owner">Sort: Owner Name</option>
              <option value="amount">Sort: Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <p className="text-sm text-gray-600">
        Showing <strong>{filteredHistories.length}</strong> of <strong>{paymentHistories.length}</strong> payment records
      </p>

      {/* Payment Timeline Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Assessment No</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Property Owner</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Quarter</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Gross Amount</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Discount/Surcharge</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Net Amount</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Paid / Balance</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistories.length > 0 ? (
              filteredHistories.map((history) => {
                const statusBadge = getStatusBadge(history.status)
                const paymentIcon = getPaymentMethodIcon(history.paymentMethod)

                return (
                  <tr key={history.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{history.assessmentNo}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 font-medium">{history.propertyOwner}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">
                      {history.quarter} {history.fiscalYear}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 font-semibold">
                      ₨ {(history.grossAmount / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}K
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-sm">
                        {history.discountAmount > 0 ? (
                          <span className="text-emerald-600 font-semibold">
                            -₨ {(history.discountAmount / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}K
                          </span>
                        ) : history.surchargeAmount > 0 ? (
                          <span className="text-orange-600 font-semibold">
                            +₨ {(history.surchargeAmount / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}K
                          </span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 font-bold">
                      ₨ {(history.netAmount / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}K
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="text-gray-900 font-semibold">
                        ₨ {(history.paidAmount / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}K
                      </div>
                      <div className="text-gray-600 text-xs">
                        {history.remainingBalance > 0
                          ? `₨ ${(history.remainingBalance / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}K due`
                          : 'Paid'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusBadge.bg} ${statusBadge.text}`}
                        >
                          {statusBadge.icon} {history.status}
                        </span>
                        {history.paymentDate && (
                          <div className="text-xs text-gray-500">
                            <p>{paymentIcon} {history.paymentDate}</p>
                            {history.paymentReference && <p className="text-gray-400">{history.paymentReference}</p>}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No payment records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Notes & Remarks */}
      <div className="space-y-3">
        {paymentHistories
          .filter((ph) => ph.notes)
          .slice(0, 3)
          .map((history) => (
            <div key={history.id} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-amber-900 mb-1">
                {history.assessmentNo} - {history.propertyOwner}
              </p>
              <p className="text-xs text-amber-800">📝 {history.notes}</p>
            </div>
          ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <SummaryStatBox
          label="Total Gross"
          value={`₨ ${(totalGross / 1000000).toFixed(1)}M`}
          icon="💰"
        />
        <SummaryStatBox
          label="Total Discounts"
          value={`-₨ ${(totalDiscounts / 1000000).toFixed(2)}M`}
          icon="🎉"
          color="text-emerald-600"
        />
        <SummaryStatBox
          label="Total Surcharges"
          value={`+₨ ${(totalSurcharges / 1000000).toFixed(2)}M`}
          icon="⚠️"
          color="text-orange-600"
        />
        <SummaryStatBox
          label="Amount Collected"
          value={`₨ ${(totalCollected / 1000000).toFixed(1)}M`}
          icon="✅"
          color="text-emerald-600"
        />
        <SummaryStatBox
          label="Outstanding"
          value={`₨ ${(totalOutstanding / 1000000).toFixed(1)}M`}
          icon="⏰"
          color={totalOutstanding > 5000000 ? 'text-red-600' : 'text-amber-600'}
        />
      </div>

      {/* Collection Efficiency */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg border border-sky-200 p-4">
        <h4 className="font-semibold text-gray-900 text-sm mb-3">Collection Efficiency</h4>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-700">Overall Collection Rate</p>
              <p className="text-sm font-bold text-gray-900">
                {((totalCollected / (totalGross - totalDiscounts + totalSurcharges)) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                style={{
                  width: `${Math.min((totalCollected / (totalGross - totalDiscounts + totalSurcharges)) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface SummaryStatBoxProps {
  label: string
  value: string
  icon: string
  color?: string
}

const SummaryStatBox: React.FC<SummaryStatBoxProps> = ({ label, value, icon, color = 'text-gray-600' }) => {
  return (
    <div className="text-center">
      <p className={`text-2xl mb-1 ${color}`}>{icon}</p>
      <p className="text-xs text-gray-600 uppercase tracking-tight">{label}</p>
      <p className={`text-sm font-bold ${color}`}>{value}</p>
    </div>
  )
}

export default PaymentHistoryLedger
