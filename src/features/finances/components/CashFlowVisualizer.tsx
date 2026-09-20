import React, { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { formatLKR } from './FinanceKpiCards'
import type { MonthlyCashFlow } from '../data/financeMockData'

type ChartViewType = 'bar' | 'line' | 'net'
type TimeRangeFilter = 'ytd' | 'last6' | 'q1' | 'q2' | 'q3'

export const CashFlowVisualizer: React.FC = () => {
  const { monthlyCashFlow } = useFinance()
  const [chartType, setChartType] = useState<ChartViewType>('bar')
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('ytd')
  const [hoveredMonth, setHoveredMonth] = useState<MonthlyCashFlow | null>(null)
  const [showTableModal, setShowTableModal] = useState(false)

  // Filter data based on selection
  const filteredData = React.useMemo(() => {
    switch (timeRange) {
      case 'last6':
        return monthlyCashFlow.slice(Math.max(0, monthlyCashFlow.length - 6))
      case 'q1':
        return monthlyCashFlow.slice(0, 3)
      case 'q2':
        return monthlyCashFlow.slice(3, 6)
      case 'q3':
        return monthlyCashFlow.slice(6, 9)
      case 'ytd':
      default:
        return monthlyCashFlow
    }
  }, [monthlyCashFlow, timeRange])

  // Compute maximum value for scaling the chart
  const maxVal = Math.max(
    ...filteredData.map((d) => Math.max(d.inflows, d.outflows, Math.abs(d.net))),
    25_000_000
  )

  // Aggregates for the filtered slice
  const totalInflowsSlice = filteredData.reduce((sum, d) => sum + d.inflows, 0)
  const totalOutflowsSlice = filteredData.reduce((sum, d) => sum + d.outflows, 0)
  const netFlowSlice = totalInflowsSlice - totalOutflowsSlice
  const avgMonthlyInflow = Math.round(totalInflowsSlice / filteredData.length)
  const avgMonthlyOutflow = Math.round(totalOutflowsSlice / filteredData.length)

  // Find peak months
  const peakInflowMonth = [...filteredData].sort((a, b) => b.inflows - a.inflows)[0]
  const peakOutflowMonth = [...filteredData].sort((a, b) => b.outflows - a.outflows)[0]

  // Chart dimensions
  const chartHeight = 230
  const chartWidthPercent = 100

  return (
    <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm">
      {/* ── Top Header & Controls ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight uppercase">
            Monthly Cash Flow Visualizer
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Comparative analysis of municipal revenues collected (Inflows) vs. vouchers disbursed (Outflows).
          </p>
        </div>

        {/* Controls: Chart Type + Period Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart View Toggle */}
          <div className="bg-gray-100 p-0.5 rounded flex items-center text-xs font-semibold">
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 rounded transition-all cursor-pointer uppercase tracking-wider text-[10px] ${
                chartType === 'bar'
                  ? 'bg-white text-gray-900 shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Bar View
            </button>
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 rounded transition-all cursor-pointer uppercase tracking-wider text-[10px] ${
                chartType === 'line'
                  ? 'bg-white text-gray-900 shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Trend Curves
            </button>
            <button
              type="button"
              onClick={() => setChartType('net')}
              className={`px-3 py-1.5 rounded transition-all cursor-pointer uppercase tracking-wider text-[10px] ${
                chartType === 'net'
                  ? 'bg-white text-gray-900 shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Net Surplus Gap
            </button>
          </div>

          {/* Time Filter Select */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRangeFilter)}
            className="text-xs font-semibold bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-gray-700 hover:border-gray-400 focus:outline-hidden focus:ring-1 focus:ring-[#A31736] cursor-pointer"
          >
            <option value="ytd">2026 Year-to-Date (Jan - Sep)</option>
            <option value="last6">Past 6 Months (Apr - Sep)</option>
            <option value="q1">Q1 (Jan - Mar)</option>
            <option value="q2">Q2 (Apr - Jun)</option>
            <option value="q3">Q3 (Jul - Sep)</option>
          </select>

          {/* Table Data Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowTableModal(true)}
            className="text-xs font-semibold px-3 py-1.5 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-wider text-[10px]"
            title="Inspect Data Table"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18" />
            </svg>
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* ── Legend & Key Summary Strip ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" />
            <span className="font-semibold text-gray-700">Inflows (Revenue)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" />
            <span className="font-semibold text-gray-700">Outflows (Vouchers)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-blue-600 inline-block" />
            <span className="font-semibold text-gray-700">Net Surplus</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>
            Avg Inflow: <strong className="text-gray-900 font-mono">{formatLKR(avgMonthlyInflow, true)}</strong>
          </span>
          <span>
            Avg Outflow: <strong className="text-gray-900 font-mono">{formatLKR(avgMonthlyOutflow, true)}</strong>
          </span>
          <span>
            Period Net:{' '}
            <strong className={`font-mono ${netFlowSlice >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {netFlowSlice >= 0 ? '+' : ''}{formatLKR(netFlowSlice, true)}
            </strong>
          </span>
        </div>
      </div>

      {/* ── Chart Container ── */}
      <div className="relative mt-3 pt-4 pb-2">
        {/* Y-Axis Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-gray-400 font-mono">
          <div className="border-b border-gray-100 w-full flex justify-between">
            <span>{formatLKR(maxVal, true)}</span>
          </div>
          <div className="border-b border-gray-100 w-full flex justify-between">
            <span>{formatLKR(maxVal * 0.75, true)}</span>
          </div>
          <div className="border-b border-gray-100 w-full flex justify-between">
            <span>{formatLKR(maxVal * 0.5, true)}</span>
          </div>
          <div className="border-b border-gray-100 w-full flex justify-between">
            <span>{formatLKR(maxVal * 0.25, true)}</span>
          </div>
          <div className="border-b border-gray-200 w-full flex justify-between font-bold text-gray-500">
            <span>Rs. 0</span>
          </div>
        </div>

        {/* Visualizer Renderer based on Chart Type */}
        <div
          className="relative z-10 flex items-end justify-around gap-2 px-6"
          style={{ height: `${chartHeight}px`, width: `${chartWidthPercent}%` }}
        >
          {chartType === 'bar' && (
            // ── Grouped Side-by-Side Bar Chart ──
            filteredData.map((d) => {
              const inflowHeight = (d.inflows / maxVal) * (chartHeight - 30)
              const outflowHeight = (d.outflows / maxVal) * (chartHeight - 30)
              const isHovered = hoveredMonth?.shortMonth === d.shortMonth

              return (
                <div
                  key={d.month}
                  onMouseEnter={() => setHoveredMonth(d)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  className={`flex-1 flex flex-col items-center justify-end h-full group cursor-pointer transition-all duration-200 ${
                    isHovered ? 'scale-105' : 'opacity-95 hover:opacity-100'
                  }`}
                >
                  <div className="w-full max-w-[46px] flex items-end justify-center gap-1">
                    {/* Inflow Bar */}
                    <div
                      className="w-1/2 bg-emerald-600 hover:bg-emerald-700 rounded-t relative transition-all duration-300 shadow-2xs"
                      style={{ height: `${Math.max(inflowHeight, 4)}px` }}
                    >
                      {isHovered && (
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-20">
                          {formatLKR(d.inflows, true)}
                        </span>
                      )}
                    </div>

                    {/* Outflow Bar */}
                    <div
                      className="w-1/2 bg-rose-500 hover:bg-rose-600 rounded-t relative transition-all duration-300 shadow-2xs"
                      style={{ height: `${Math.max(outflowHeight, 4)}px` }}
                    >
                      {isHovered && (
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-20">
                          {formatLKR(d.outflows, true)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Month Label */}
                  <span
                    className={`text-[11px] font-semibold mt-2 transition-colors ${
                      isHovered ? 'text-[#A31736] font-bold' : 'text-gray-600'
                    }`}
                  >
                    {d.shortMonth}
                  </span>
                </div>
              )
            })
          )}

          {chartType === 'line' && (
            // ── SVG Line & Area Trend View ──
            <div className="w-full h-full relative">
              <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${filteredData.length * 100} ${chartHeight}`}>
                <defs>
                  <linearGradient id="inflowGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="outflowGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {(() => {
                  const pointsInflow = filteredData.map((d, i) => {
                    const x = (i / (filteredData.length - 1)) * (filteredData.length * 100 - 40) + 20
                    const y = chartHeight - 30 - (d.inflows / maxVal) * (chartHeight - 40)
                    return { x, y }
                  })
                  const pointsOutflow = filteredData.map((d, i) => {
                    const x = (i / (filteredData.length - 1)) * (filteredData.length * 100 - 40) + 20
                    const y = chartHeight - 30 - (d.outflows / maxVal) * (chartHeight - 40)
                    return { x, y }
                  })

                  const inflowPath = pointsInflow.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`, '')
                  const outflowPath = pointsOutflow.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`, '')

                  const inflowArea = `${inflowPath} L ${pointsInflow[pointsInflow.length - 1].x},${chartHeight - 30} L ${pointsInflow[0].x},${chartHeight - 30} Z`
                  const outflowArea = `${outflowPath} L ${pointsOutflow[pointsOutflow.length - 1].x},${chartHeight - 30} L ${pointsOutflow[0].x},${chartHeight - 30} Z`

                  return (
                    <>
                      <path d={inflowArea} fill="url(#inflowGrad2)" />
                      <path d={outflowArea} fill="url(#outflowGrad2)" />
                      <path d={inflowPath} fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
                      <path d={outflowPath} fill="none" stroke="#e11d48" strokeWidth="2.5" strokeDasharray="5,3" strokeLinecap="round" />

                      {filteredData.map((d, i) => {
                        const ptIn = pointsInflow[i]
                        const ptOut = pointsOutflow[i]
                        const isHovered = hoveredMonth?.shortMonth === d.shortMonth

                        return (
                          <g
                            key={d.month}
                            onMouseEnter={() => setHoveredMonth(d)}
                            onMouseLeave={() => setHoveredMonth(null)}
                            className="cursor-pointer"
                          >
                            <circle
                              cx={ptIn.x}
                              cy={ptIn.y}
                              r={isHovered ? 6 : 4}
                              fill="#059669"
                              stroke="#ffffff"
                              strokeWidth="2"
                              className="transition-all"
                            />
                            <circle
                              cx={ptOut.x}
                              cy={ptOut.y}
                              r={isHovered ? 6 : 4}
                              fill="#e11d48"
                              stroke="#ffffff"
                              strokeWidth="2"
                              className="transition-all"
                            />
                            <text
                              x={ptIn.x}
                              y={chartHeight - 10}
                              textAnchor="middle"
                              fontSize="11"
                              fontWeight={isHovered ? 'bold' : 'normal'}
                              fill={isHovered ? '#A31736' : '#4b5563'}
                            >
                              {d.shortMonth}
                            </text>
                          </g>
                        )
                      })}
                    </>
                  )
                })()}
              </svg>
            </div>
          )}

          {chartType === 'net' && (
            // ── Net Surplus / Deficit Gap Bars ──
            filteredData.map((d) => {
              const isPositive = d.net >= 0
              const height = (Math.abs(d.net) / (maxVal * 0.4)) * (chartHeight - 60)
              const isHovered = hoveredMonth?.shortMonth === d.shortMonth

              return (
                <div
                  key={d.month}
                  onMouseEnter={() => setHoveredMonth(d)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  className={`flex-1 flex flex-col items-center justify-end h-full group cursor-pointer transition-all duration-200 ${
                    isHovered ? 'scale-105' : 'opacity-90 hover:opacity-100'
                  }`}
                >
                  <div className="w-full max-w-[38px] flex flex-col items-center justify-end">
                    <div
                      className={`w-full rounded-t relative transition-all duration-300 shadow-2xs ${
                        isPositive ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'
                      }`}
                      style={{ height: `${Math.max(height, 8)}px` }}
                    >
                      {isHovered && (
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-20">
                          {isPositive ? '+' : ''}{formatLKR(d.net, true)}
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-semibold mt-2 transition-colors ${
                      isHovered ? 'text-[#A31736] font-bold' : 'text-gray-600'
                    }`}
                  >
                    {d.shortMonth}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── Granular Month Breakdown Card (Matching Portal Style) ── */}
      {hoveredMonth && (
        <div className="mt-4 p-4 rounded bg-gray-50 border border-gray-300 shadow-2xs animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-gray-200 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#A31736]" />
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                  {hoveredMonth.month} Detailed Breakdown
                </h4>
              </div>
              <p className="text-[11px] text-gray-500">Itemized revenue sources vs expenditure votes</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-emerald-700 font-mono">
                Inflow: <strong>{formatLKR(hoveredMonth.inflows)}</strong>
              </span>
              <span className="text-rose-700 font-mono">
                Outflow: <strong>{formatLKR(hoveredMonth.outflows)}</strong>
              </span>
              <span
                className={`font-bold font-mono px-2 py-0.5 rounded border text-[11px] ${
                  hoveredMonth.net >= 0
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                Net: {hoveredMonth.net >= 0 ? '+' : ''}{formatLKR(hoveredMonth.net)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
            {/* Inflow breakdown */}
            <div className="bg-white rounded border border-gray-200 p-3">
              <h5 className="font-bold text-emerald-800 uppercase text-[10px] mb-2 flex items-center justify-between border-b border-gray-100 pb-1">
                <span>Revenue Sources (Inflows)</span>
                <span>Amount (LKR)</span>
              </h5>
              <div className="space-y-1.5 text-gray-600">
                <div className="flex justify-between">
                  <span>Assessment Rates:</span>
                  <span className="font-mono font-semibold text-gray-900">{formatLKR(hoveredMonth.inflowBreakdown.assessmentRates)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Trade & Business Licenses:</span>
                  <span className="font-mono font-semibold text-gray-900">{formatLKR(hoveredMonth.inflowBreakdown.tradeLicenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Council Property Rents:</span>
                  <span className="font-mono font-semibold text-gray-900">{formatLKR(hoveredMonth.inflowBreakdown.propertyRents)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fees & Hall Rentals:</span>
                  <span className="font-mono font-semibold text-gray-900">{formatLKR(hoveredMonth.inflowBreakdown.serviceFees)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Government Grants:</span>
                  <span className="font-mono font-semibold text-gray-900">{formatLKR(hoveredMonth.inflowBreakdown.governmentGrants)}</span>
                </div>
              </div>
            </div>

            {/* Outflow breakdown */}
            <div className="bg-white rounded border border-gray-200 p-3">
              <h5 className="font-bold text-rose-800 uppercase text-[10px] mb-2 flex items-center justify-between border-b border-gray-100 pb-1">
                <span>Expenditure Heads (Outflows)</span>
                <span>Amount (LKR)</span>
              </h5>
              <div className="space-y-1.5 text-gray-600">
                <div className="flex justify-between">
                  <span>Personal Emoluments (Salaries):</span>
                  <span className="font-mono font-semibold text-gray-900">{formatLKR(hoveredMonth.outflowBreakdown.personalEmoluments)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Capital Development Works:</span>
                  <span className="font-mono font-semibold text-gray-900">{formatLKR(hoveredMonth.outflowBreakdown.capitalWorks)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vehicular Fuel & Transport:</span>
                  <span className="font-mono font-semibold text-gray-900">{formatLKR(hoveredMonth.outflowBreakdown.fuelAndTransport)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Solid Waste Management Ops:</span>
                  <span className="font-mono font-semibold text-gray-900">{formatLKR(hoveredMonth.outflowBreakdown.solidWasteManagement)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Street Lighting & Utilities (CEB):</span>
                  <span className="font-mono font-semibold text-gray-900">{formatLKR(hoveredMonth.outflowBreakdown.streetLightingUtilities)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Summary Badges ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-gray-100 text-xs">
        <div className="bg-emerald-50/60 border border-emerald-200 rounded p-2.5 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-[11px] uppercase font-semibold">Peak Inflow Month</p>
            <p className="font-bold text-gray-900">{peakInflowMonth?.month || 'N/A'}</p>
          </div>
          <span className="font-mono font-bold text-emerald-800 text-sm">
            {formatLKR(peakInflowMonth?.inflows || 0, true)}
          </span>
        </div>

        <div className="bg-rose-50/60 border border-rose-200 rounded p-2.5 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-[11px] uppercase font-semibold">Peak Outflow Month</p>
            <p className="font-bold text-gray-900">{peakOutflowMonth?.month || 'N/A'}</p>
          </div>
          <span className="font-mono font-bold text-rose-800 text-sm">
            {formatLKR(peakOutflowMonth?.outflows || 0, true)}
          </span>
        </div>

        <div className="bg-blue-50/60 border border-blue-200 rounded p-2.5 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-[11px] uppercase font-semibold">Monthly Net Generation</p>
            <p className="font-bold text-gray-900">Operating Cushion</p>
          </div>
          <span className="font-mono font-bold text-blue-800 text-sm">
            +{formatLKR(Math.round(netFlowSlice / filteredData.length), true)} / mo
          </span>
        </div>
      </div>

      {/* ── Table Modal ── */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-gray-300 animate-fade-in">
            <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Monthly Cash Flow Dataset (2026)
                </h3>
                <p className="text-xs text-gray-500">Homagama Pradeshiya Sabha Treasury Log</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-700 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Month</th>
                    <th className="py-2.5 px-3 text-right text-emerald-800">Inflows (Revenue)</th>
                    <th className="py-2.5 px-3 text-right text-rose-800">Outflows (Vouchers)</th>
                    <th className="py-2.5 px-3 text-right text-blue-800">Net Result</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {monthlyCashFlow.map((row) => (
                    <tr key={row.month} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-gray-900">{row.month}</td>
                      <td className="py-2.5 px-3 font-mono text-right text-emerald-800 font-medium">
                        {formatLKR(row.inflows)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-right text-rose-800 font-medium">
                        {formatLKR(row.outflows)}
                      </td>
                      <td className={`py-2.5 px-3 font-mono text-right font-bold ${row.net >= 0 ? 'text-blue-800' : 'text-amber-800'}`}>
                        {row.net >= 0 ? '+' : ''}{formatLKR(row.net)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            row.net >= 0
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {row.net >= 0 ? 'Surplus' : 'Deficit'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold px-4 py-1.5 rounded uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CashFlowVisualizer
