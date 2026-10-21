import React from 'react'
import { formatLKRCompact } from '../../utils/formatters'
import type { Property, FieldCollection } from '../../types/varipanam'

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

  const cards = [
    {
      id: 'billed',
      label: 'Billed This Year (2026)',
      value: formatLKRCompact(billedThisYear),
      subtext: `${properties.length} Active Assessment Units`,
      colorClass: 'text-blue-700 bg-blue-50 border-blue-200',
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
      label: 'Collected to Date',
      value: formatLKRCompact(collectedThisYear),
      subtext: `${billedThisYear > 0 ? ((collectedThisYear / billedThisYear) * 100).toFixed(1) : 0}% Collection Efficiency`,
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-emerald-600">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      id: 'arrears',
      label: 'Outstanding Arrears',
      value: formatLKRCompact(totalOutstandingArrears),
      subtext: 'Historical + Current Unpaid',
      onClick: onFilterOverdue,
      clickable: !!onFilterOverdue,
      colorClass: 'text-rose-700 bg-rose-50 border-rose-200',
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
      label: '2+ Unpaid Qtrs (No Warrant)',
      value: `${propertiesWithTwoPlusUnpaidNoWarrant}`,
      subtext: 'Actionable for Warrant Review',
      onClick: onFilterUnpaidTwoQuarters,
      clickable: !!onFilterUnpaidTwoQuarters,
      colorClass: 'text-amber-800 bg-amber-50 border-amber-200',
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
      label: 'Distress Warrants Issued',
      value: `${warrantsIssuedCount}`,
      subtext: 'Enforcement in Field / Pending Payment',
      onClick: onFilterWarrants,
      clickable: !!onFilterWarrants,
      colorClass: 'text-purple-800 bg-purple-50 border-purple-200',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-purple-600">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      id: 'reconciliation',
      label: 'Awaiting Counter Rec.',
      value: formatLKRCompact(pendingFieldAmount),
      subtext: `${pendingFieldReceiptsCount} Temporary Receipts Pending`,
      colorClass: 'text-teal-800 bg-teal-50 border-teal-200',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-teal-600">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((c) => (
        <div
          key={c.id}
          onClick={c.onClick}
          className={`p-4 rounded-2xl border transition-all duration-200 ${
            c.clickable ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : 'cursor-default'
          } ${c.colorClass}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-white/70 shadow-xs">{c.icon}</span>
            {c.clickable && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-700">
                Filter ↗
              </span>
            )}
          </div>
          <p className="text-[11px] font-semibold text-gray-600 leading-tight truncate" title={c.label}>
            {c.label}
          </p>
          <p className="text-xl font-black text-gray-900 mt-1 tracking-tight truncate">{c.value}</p>
          <p className="text-[10px] text-gray-500 mt-0.5 truncate">{c.subtext}</p>
        </div>
      ))}
    </div>
  )
}

export default KpiCards
