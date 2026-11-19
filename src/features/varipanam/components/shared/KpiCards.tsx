import React from 'react'
import { formatLKRCompact } from '../../utils/formatters'
import type { Property, FieldCollection } from '../../types/varipanam'
import { ArrowUpRight } from 'lucide-react'

interface KpiCardsProps {
  properties: Property[]
  fieldCollections: FieldCollection[]
  onFilterUnpaidTwoQuarters?: () => void
  onFilterWarrants?: () => void
  onFilterOverdue?: () => void
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  properties,
  fieldCollections,
  onFilterUnpaidTwoQuarters,
  onFilterWarrants,
  onFilterOverdue,
}) => {
  const currentYear = 2026

  // 1. Billed this year (currentYear dues sum)
  let billedThisYear = 0
  let collectedThisYear = 0
  let totalOutstandingArrears = 0
  let propertiesWithTwoPlusUnpaidNoWarrant = 0
  let warrantsIssuedCount = 0

  properties.forEach((prop) => {
    let unpaidPriorQuartersCount = 0

    prop.dues.forEach((due) => {
      const unpaid = due.amount - due.paidAmount
      if (due.year === currentYear) {
        billedThisYear += due.amount
        collectedThisYear += due.paidAmount
      }
      if (unpaid > 0) {
        totalOutstandingArrears += unpaid
        if (due.year < currentYear || (due.year === currentYear && due.quarter < 1)) {
          unpaidPriorQuartersCount++
        }
      }
    })

    if (prop.activeWarrant && prop.activeWarrant.status === 'ISSUED') {
      warrantsIssuedCount++
    } else if (unpaidPriorQuartersCount >= 2) {
      propertiesWithTwoPlusUnpaidNoWarrant++
    }
  })

  // 6. Field collections awaiting reconciliation
  const pendingFieldCollections = fieldCollections.filter((fc) => fc.status === 'Pending')
  const pendingFieldAmount = pendingFieldCollections.reduce((sum, fc) => sum + fc.totalAmount, 0)
  const pendingFieldReceiptsCount = pendingFieldCollections.reduce(
    (sum, fc) => sum + fc.receiptIds.length,
    0
  )

  const collectionRate = billedThisYear > 0 ? ((collectedThisYear / billedThisYear) * 100).toFixed(1) : '0.0'

  const cards = [
    {
      id: 'billed',
      label: 'BILLED THIS YEAR',
      value: formatLKRCompact(billedThisYear),
      badge: '2026 YEAR',
      subtext: `${properties.length} active assessment units`,
      bottomNote: 'Council Assessed',
      isPositive: true,
      iconBg: 'bg-blue-50 border-blue-100 text-blue-600',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-blue-600">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      id: 'collected',
      label: 'COLLECTED TO DATE',
      value: formatLKRCompact(collectedThisYear),
      badge: `${collectionRate}% RATE`,
      subtext: `Target: ${formatLKRCompact(billedThisYear)}`,
      bottomNote: 'On Schedule',
      isPositive: true,
      iconBg: 'bg-emerald-50 border-emerald-100 text-emerald-600',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-emerald-600">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      id: 'arrears',
      label: 'OUTSTANDING ARREARS',
      value: formatLKRCompact(totalOutstandingArrears),
      badge: 'OVERDUE',
      subtext: 'Historical + current unpaid dues',
      bottomNote: 'Needs Collection',
      isPositive: false,
      onClick: onFilterOverdue,
      clickable: !!onFilterOverdue,
      iconBg: 'bg-rose-50 border-rose-100 text-rose-600',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-rose-600">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
    {
      id: 'unpaid-quarters',
      label: '2+ UNPAID QUARTERS',
      value: `${propertiesWithTwoPlusUnpaidNoWarrant}`,
      badge: 'ACTIONABLE',
      subtext: 'Eligible for warrant notice issue',
      bottomNote: 'Prior Notice',
      isPositive: false,
      onClick: onFilterUnpaidTwoQuarters,
      clickable: !!onFilterUnpaidTwoQuarters,
      iconBg: 'bg-amber-50 border-amber-100 text-amber-600',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-amber-600">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    {
      id: 'warrants',
      label: 'DISTRESS WARRANTS',
      value: `${warrantsIssuedCount}`,
      badge: 'ENFORCEMENT',
      subtext: 'Under field revenue seizure order',
      bottomNote: 'Active Warrants',
      isPositive: false,
      onClick: onFilterWarrants,
      clickable: !!onFilterWarrants,
      iconBg: 'bg-purple-50 border-purple-100 text-purple-600',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-purple-600">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      id: 'reconciliation',
      label: 'FIELD COUNTER REC.',
      value: formatLKRCompact(pendingFieldAmount),
      badge: 'PENDING',
      subtext: `${pendingFieldReceiptsCount} field temp receipts`,
      bottomNote: 'Shroff Handover',
      isPositive: true,
      iconBg: 'bg-teal-50 border-teal-100 text-teal-600',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-teal-600">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((c) => (
        <div
          key={c.id}
          onClick={c.onClick}
          className={`bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-[#A31736] transition-all flex flex-col justify-between group ${
            c.clickable ? 'cursor-pointer' : 'cursor-default'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 truncate">
              {c.label}
            </span>
            <div className={`p-1.5 rounded shrink-0 border ${c.iconBg} group-hover:scale-105 transition-transform`}>
              {c.icon}
            </div>
          </div>

          <div className="mt-2.5">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {c.value}
              </p>
              {c.badge && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                  {c.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1 truncate">
              {c.subtext}
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className={`font-semibold ${c.isPositive ? 'text-emerald-700' : 'text-[#A31736]'}`}>
              {c.bottomNote}
            </span>
            <span className="text-[11px] font-bold text-[#A31736] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5 uppercase tracking-wider">
              {c.clickable ? 'FILTER' : 'DESK'} <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default KpiCards
