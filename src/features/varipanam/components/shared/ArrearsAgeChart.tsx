import React from 'react'
import { formatLKR, formatLKRCompact } from '../../utils/formatters'
import type { Property } from '../../types/varipanam'

interface ArrearsAgeChartProps {
  properties: Property[]
}

interface AgeBand {
  label: string
  sublabel: string
  amount: number
  count: number
  color: string
}

export const ArrearsAgeChart: React.FC<ArrearsAgeChartProps> = ({ properties }) => {
  const currentYear = 2026 // Active council year

  // Group arrears into age bands
  const bands: Record<string, { amount: number; count: Set<string> }> = {
    lessThan1: { amount: 0, count: new Set() },
    oneToThree: { amount: 0, count: new Set() },
    threeToFive: { amount: 0, count: new Set() },
    fiveToTen: { amount: 0, count: new Set() },
    moreThanTen: { amount: 0, count: new Set() },
  }

  properties.forEach((prop) => {
    prop.dues.forEach((due) => {
      const unpaid = due.amount - due.paidAmount
      if (unpaid <= 0) return

      const ageYears = currentYear - due.year
      if (ageYears <= 1) {
        bands.lessThan1.amount += unpaid
        bands.lessThan1.count.add(prop.id)
      } else if (ageYears <= 3) {
        bands.oneToThree.amount += unpaid
        bands.oneToThree.count.add(prop.id)
      } else if (ageYears <= 5) {
        bands.threeToFive.amount += unpaid
        bands.threeToFive.count.add(prop.id)
      } else if (ageYears <= 10) {
        bands.fiveToTen.amount += unpaid
        bands.fiveToTen.count.add(prop.id)
      } else {
        bands.moreThanTen.amount += unpaid
        bands.moreThanTen.count.add(prop.id)
      }
    })
  })

  const totalArrears =
    bands.lessThan1.amount +
    bands.oneToThree.amount +
    bands.threeToFive.amount +
    bands.fiveToTen.amount +
    bands.moreThanTen.amount

  const ageBands: AgeBand[] = [
    {
      label: '< 1 Year',
      sublabel: '2025 - 2026 Dues',
      amount: bands.lessThan1.amount,
      count: bands.lessThan1.count.size,
      color: 'bg-emerald-500',
    },
    {
      label: '1 - 3 Years',
      sublabel: '2023 - 2024 Arrears',
      amount: bands.oneToThree.amount,
      count: bands.oneToThree.count.size,
      color: 'bg-blue-500',
    },
    {
      label: '3 - 5 Years',
      sublabel: '2021 - 2022 Arrears',
      amount: bands.threeToFive.amount,
      count: bands.threeToFive.count.size,
      color: 'bg-amber-500',
    },
    {
      label: '5 - 10 Years',
      sublabel: '2016 - 2020 Arrears',
      amount: bands.fiveToTen.amount,
      count: bands.fiveToTen.count.size,
      color: 'bg-orange-500',
    },
    {
      label: '> 10 Years',
      sublabel: 'Historical (>10y)',
      amount: bands.moreThanTen.amount,
      count: bands.moreThanTen.count.size,
      color: 'bg-rose-600',
    },
  ]

  return (
    <div className="bg-white border border-gray-300 rounded shadow-xs overflow-hidden flex flex-col">
      <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <span>Arrears Age-Analysis Breakdown</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Total Outstanding Council Receivables: <strong className="text-gray-900 font-mono">{formatLKR(totalArrears)}</strong>
          </p>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
          5 Age Bands Analysis
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Stacked Percentage Visual Bar */}
        <div>
          <div className="h-3 w-full bg-gray-100 rounded overflow-hidden flex shadow-inner">
            {totalArrears > 0 ? (
              ageBands.map((band) => {
                const pct = (band.amount / totalArrears) * 100
                if (pct <= 0) return null
                return (
                  <div
                    key={band.label}
                    style={{ width: `${pct}%` }}
                    className={`${band.color} transition-all duration-300 hover:opacity-90 relative group`}
                    title={`${band.label}: ${formatLKR(band.amount)} (${pct.toFixed(1)}%)`}
                  />
                )
              })
            ) : (
              <div className="w-full bg-emerald-500" title="Zero arrears outstanding" />
            )}
          </div>
        </div>

        {/* Grid of Bands */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {ageBands.map((band) => {
            const pct = totalArrears > 0 ? ((band.amount / totalArrears) * 100).toFixed(1) : '0'
            return (
              <div
                key={band.label}
                className="p-3 bg-white hover:bg-gray-50 rounded border border-gray-200 transition-colors"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${band.color}`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-800">{band.label}</span>
                </div>
                <p className="text-[10px] text-gray-400 mb-1.5 truncate">{band.sublabel}</p>
                <p className="text-sm font-bold font-mono text-gray-900 truncate" title={formatLKR(band.amount)}>
                  {formatLKRCompact(band.amount)}
                </p>
                <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1">
                  <span>{band.count} units</span>
                  <span className="font-bold text-gray-700">{pct}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ArrearsAgeChart
