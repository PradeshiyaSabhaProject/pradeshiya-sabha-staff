import React, { useState } from 'react'
import type { QuarterlyBillingRun } from '../../data/financeMockData'

interface QuarterlyRateGeneratorProps {
  billingRuns: QuarterlyBillingRun[]
}

const QuarterlyRateGenerator: React.FC<QuarterlyRateGeneratorProps> = ({ billingRuns }) => {
  const [sortBy, setSortBy] = useState<'date' | 'quarter' | 'amount'>('date')
  const [filterYear, setFilterYear] = useState('')

  const sortedRuns = [...billingRuns]
    .sort((a, b) => {
      switch (sortBy) {
        case 'quarter':
          return a.quarter.localeCompare(b.quarter)
        case 'amount':
          return b.totalBilledAmount - a.totalBilledAmount
        default:
          return new Date(b.runDate).getTime() - new Date(a.runDate).getTime()
      }
    })
    .filter((run) => !filterYear || run.fiscalYear === filterYear)

  const years = Array.from(new Set(billingRuns.map((r) => r.fiscalYear)))

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      Generated: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '📋' },
      'In Progress': { bg: 'bg-amber-100', text: 'text-amber-800', icon: '⏳' },
      Completed: { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: '✅' },
      Locked: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '🔒' },
    }
    return colors[status] || colors.Generated
  }

  return (
    <div className="space-y-4">
      {/* Filter & Sort */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                Fiscal Year {year}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort: Most Recent</option>
            <option value="quarter">Sort: By Quarter</option>
            <option value="amount">Sort: By Amount</option>
          </select>
        </div>
      </div>

      {/* Billing Runs Grid */}
      <div className="space-y-3">
        {sortedRuns.length > 0 ? (
          sortedRuns.map((run) => {
            const statusColor = getStatusColor(run.status)
            const collectionPercentage = (23400000 / run.totalBilledAmount) * 100

            return (
              <div
                key={run.id}
                className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{run.billingRunNumber}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {run.quarter} {run.fiscalYear} • Generated: {new Date(run.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusColor.bg} ${statusColor.text}`}
                  >
                    {statusColor.icon} {run.status}
                  </span>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <MetricBox
                    label="Total Billed Amount"
                    value={`₨ ${(run.totalBilledAmount / 1000000).toFixed(1)}M`}
                    icon="💰"
                  />
                  <MetricBox label="Properties Included" value={run.totalPropertiesIncluded.toString()} icon="🏘️" />
                  <MetricBox
                    label="Early Payment Discount"
                    value={`${run.earlyPaymentDiscountPercent}%`}
                    icon="🎉"
                  />
                  <MetricBox
                    label="Late Payment Surcharge"
                    value={`${run.latePaymentSurchargePercent}%`}
                    icon="⚠️"
                  />
                </div>

                {/* Collection Progress */}
                {run.status === 'Completed' || run.status === 'In Progress' ? (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-700">Collection Status</p>
                      <p className="text-sm font-bold text-gray-900">{collectionPercentage.toFixed(1)}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(collectionPercentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      ₨ 23.4M collected of ₨ {(run.totalBilledAmount / 1000000).toFixed(1)}M billed
                    </p>
                  </div>
                ) : null}

                {/* Payment Terms Info */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-base">📅</span>
                    <div>
                      <p className="font-semibold text-gray-900">Due Date: {run.dueDate}</p>
                      <p className="text-xs text-gray-600">
                        Early payment by {run.earlyPaymentDeadline} for {run.earlyPaymentDiscountPercent}% discount
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-base">⏰</span>
                    <div>
                      <p className="font-semibold text-gray-900">Late Payment Penalty</p>
                      <p className="text-xs text-gray-600">
                        {run.latePaymentSurchargePercent}% surcharge applied after {run.latePenaltyAppliedAfter} days overdue
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-base">👤</span>
                    <div>
                      <p className="font-semibold text-gray-900">Generated By</p>
                      <p className="text-xs text-gray-600">{run.generatedBy}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {run.status === 'Generated' ? (
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors">
                      Launch Billing Run
                    </button>
                    <button className="flex-1 px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg transition-colors">
                      Edit Terms
                    </button>
                  </div>
                ) : run.status === 'In Progress' ? (
                  <div className="mt-4">
                    <button className="w-full px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg transition-colors">
                      View Payment Receipts
                    </button>
                  </div>
                ) : null}
              </div>
            )
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No billing runs found for the selected filters.</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {sortedRuns.length > 0 && (
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg border border-sky-200 p-4 space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm">Quarterly Billing Summary</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600 text-xs uppercase tracking-wide">Total Billing Runs</p>
              <p className="text-xl font-bold text-gray-900">{sortedRuns.length}</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs uppercase tracking-wide">Total Annual Billing</p>
              <p className="text-xl font-bold text-gray-900">
                ₨ {(sortedRuns.reduce((sum, run) => sum + run.totalBilledAmount, 0) / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface MetricBoxProps {
  label: string
  value: string
  icon: string
}

const MetricBox: React.FC<MetricBoxProps> = ({ label, value, icon }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-xs text-gray-600 uppercase tracking-tight">{label}</p>
      <p className="text-base font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}

export default QuarterlyRateGenerator
