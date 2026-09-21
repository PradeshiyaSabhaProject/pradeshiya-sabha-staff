import React, { useState } from 'react'
import { WARD_ASSESSMENT_RECORDS, type WardAssessmentRecord } from '../../data/financialReportsData'
import { formatLKR } from '../FinanceKpiCards'

interface AssessmentEfficiencyReportProps {
  onOpenAuditModal: () => void
}

export const AssessmentEfficiencyReport: React.FC<AssessmentEfficiencyReportProps> = ({ onOpenAuditModal }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'efficiency' | 'demand' | 'arrears'>('efficiency')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

  // High-level aggregates
  const totalProperties = WARD_ASSESSMENT_RECORDS.reduce((sum, w) => sum + w.totalRateableProperties, 0)
  const totalAnnualDemand = WARD_ASSESSMENT_RECORDS.reduce((sum, w) => sum + w.annualWarrantDemand, 0)
  const totalCollected = WARD_ASSESSMENT_RECORDS.reduce((sum, w) => sum + w.collectedYTD, 0)
  const totalArrears = WARD_ASSESSMENT_RECORDS.reduce((sum, w) => sum + w.arrearsOutstanding, 0)
  const overallEfficiency = totalAnnualDemand > 0 ? (totalCollected / totalAnnualDemand) * 100 : 0

  const sortedWards = [...WARD_ASSESSMENT_RECORDS].sort((a, b) => {
    let diff = 0
    if (sortBy === 'efficiency') diff = a.efficiencyPercentage - b.efficiencyPercentage
    if (sortBy === 'demand') diff = a.annualWarrantDemand - b.annualWarrantDemand
    if (sortBy === 'arrears') diff = a.arrearsOutstanding - b.arrearsOutstanding
    return sortOrder === 'desc' ? -diff : diff
  })

  const filteredWards = sortedWards.filter((ward) => {
    const matchesSearch =
      ward.wardName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ward.wardNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ward.inspectorOfficer.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false
    if (selectedStatus !== 'All' && ward.status !== selectedStatus) return false
    return true
  })

  const topWard = [...WARD_ASSESSMENT_RECORDS].sort((a, b) => b.efficiencyPercentage - a.efficiencyPercentage)[0]
  const lagWard = [...WARD_ASSESSMENT_RECORDS].sort((a, b) => a.efficiencyPercentage - b.efficiencyPercentage)[0]

  const getStatusBadge = (status: WardAssessmentRecord['status']) => {
    switch (status) {
      case 'High Efficiency':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200'
      case 'Satisfactory':
        return 'bg-blue-50 text-blue-800 border-blue-200'
      case 'Collection Lag':
        return 'bg-amber-50 text-amber-800 border-amber-200'
      case 'Critical Attention':
        return 'bg-rose-50 text-rose-800 border-rose-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getProgressColor = (pct: number) => {
    if (pct >= 80) return 'bg-emerald-600'
    if (pct >= 70) return 'bg-blue-600'
    if (pct >= 65) return 'bg-amber-500'
    return 'bg-rose-500'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Top Header ── */}
      <div className="bg-white border border-gray-300 rounded p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 uppercase tracking-tight flex items-center gap-2">
            <span>Assessment Rate Collection Efficiency Report</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              Ward-by-Ward Ledger
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Quarterly municipal property tax realization benchmarks, collection percentages, and officer accountability.
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

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Warrant Demand */}
        <div className="bg-white border border-gray-300 rounded p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Annual Council Demand</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
              12 Wards
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 font-mono mt-2">{formatLKR(totalAnnualDemand)}</p>
          <div className="mt-2 text-[11px] text-gray-500 flex justify-between border-t border-gray-100 pt-1.5">
            <span>Rateable Properties:</span>
            <span className="font-semibold text-gray-800">{totalProperties.toLocaleString()} units</span>
          </div>
        </div>

        {/* Collected YTD & Efficiency */}
        <div className="bg-white border border-gray-300 rounded p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Total Collected YTD</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              {overallEfficiency.toFixed(1)}% Realized
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-800 font-mono mt-2">{formatLKR(totalCollected)}</p>
          <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${overallEfficiency}%` }}
            />
          </div>
        </div>

        {/* Arrears Outstanding */}
        <div className="bg-white border border-gray-300 rounded p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Arrears Outstanding</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              Warrant Stage
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-900 font-mono mt-2">{formatLKR(totalArrears)}</p>
          <div className="mt-2 text-[11px] text-gray-500 flex justify-between border-t border-gray-100 pt-1.5">
            <span>Recovery Rate:</span>
            <span className="font-semibold text-gray-800">{(100 - overallEfficiency).toFixed(1)}% remaining</span>
          </div>
        </div>

        {/* High & Low Wards */}
        <div className="bg-white border border-gray-300 rounded p-4 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-600 block">Performance Highlights</span>
          <div className="mt-2 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Top Ward:</span>
              <span className="font-bold text-emerald-800">
                {topWard.wardNumber} ({topWard.efficiencyPercentage}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Lagging Ward:</span>
              <span className="font-bold text-rose-700">
                {lagWard.wardNumber} ({lagWard.efficiencyPercentage}%)
              </span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-gray-400 border-t border-gray-100 pt-1">
            Ward 08 Pitipana leads collection rate
          </div>
        </div>
      </div>

      {/* ── Filters and Sorting Bar ── */}
      <div className="bg-white border border-gray-300 rounded p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search ward name or officer..."
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

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1 bg-gray-100 p-0.5 rounded text-xs font-semibold">
          {['All', 'High Efficiency', 'Satisfactory', 'Collection Lag', 'Critical Attention'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setSelectedStatus(status)}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer uppercase tracking-wider text-[10px] ${
                selectedStatus === status
                  ? 'bg-white text-gray-900 shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 text-[11px] uppercase font-semibold">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs bg-gray-50 border border-gray-300 rounded px-2.5 py-1 text-gray-700 focus:outline-hidden cursor-pointer"
          >
            <option value="efficiency">Efficiency %</option>
            <option value="demand">Total Demand</option>
            <option value="arrears">Arrears Balance</option>
          </select>
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="p-1 border border-gray-300 rounded hover:bg-gray-50 text-gray-600 cursor-pointer"
            title={`Toggle sort order (${sortOrder})`}
          >
            {sortOrder === 'desc' ? '↓' : '↑'}
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-gray-300 rounded shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50/80 flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-gray-700">
            Municipal Wards Performance Breakdown ({filteredWards.length} Wards)
          </span>
          <span className="text-[11px] text-gray-500">
            Thresholds: &ge;80% High · 70-80% Satisfactory · 65-70% Lag · &lt;65% Critical
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100/70 text-gray-700 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 w-28">Ward</th>
                <th className="py-3 px-4">Designated Revenue Officer</th>
                <th className="py-3 px-4 text-center w-24">Properties</th>
                <th className="py-3 px-4 text-right">Annual Warrant Demand</th>
                <th className="py-3 px-4 text-right">Collected YTD</th>
                <th className="py-3 px-4 text-right">Arrears Overdue</th>
                <th className="py-3 px-4 w-48 text-center">Efficiency %</th>
                <th className="py-3 px-4 text-center">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredWards.map((w) => (
                <tr key={w.wardNumber} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-gray-900">
                    <div className="font-bold text-gray-900">{w.wardNumber}</div>
                    <div className="text-[11px] text-gray-500">{w.wardName}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-800 font-medium">{w.inspectorOfficer}</div>
                    <div className="text-[10px] text-gray-400 font-mono">Last Audited: {w.lastAuditDate}</div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-medium text-gray-700">
                    {w.totalRateableProperties.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-gray-700">{formatLKR(w.annualWarrantDemand)}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">{formatLKR(w.collectedYTD)}</td>
                  <td className="py-3 px-4 text-right font-mono text-rose-800 font-medium">{formatLKR(w.arrearsOutstanding)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-xs text-gray-900">
                        {w.efficiencyPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(
                          w.efficiencyPercentage
                        )}`}
                        style={{ width: `${w.efficiencyPercentage}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(w.status)}`}>
                      {w.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-400 bg-gray-100 font-bold text-gray-900 text-xs">
                <td colSpan={2} className="py-3 px-4 uppercase tracking-wider">
                  Council Consolidated Total (12 Wards)
                </td>
                <td className="py-3 px-4 text-center font-mono">{totalProperties.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-mono">{formatLKR(totalAnnualDemand)}</td>
                <td className="py-3 px-4 text-right font-mono text-emerald-800 text-sm">{formatLKR(totalCollected)}</td>
                <td className="py-3 px-4 text-right font-mono text-rose-800">{formatLKR(totalArrears)}</td>
                <td className="py-3 px-4 text-center font-mono text-sm border-b-4 border-double border-gray-900">
                  {overallEfficiency.toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold">
                    Council Benchmark
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AssessmentEfficiencyReport
