import React, { useState } from 'react'
import { useKpi } from '../../context/KpiContext'
import type { KpiMetric } from './data/mockKpiData'

// ── Icons matching Overview style ───────────────────────────────────────────
const UserCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-[#1e3a8a]">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <polyline points="17 11 19 13 23 9" />
  </svg>
)

const AwardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-[#1e3a8a]">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
)

const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-[#1e3a8a]">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-[#1e3a8a]">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const TrendUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-[#c2410c] shrink-0">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)

const getGradeBadgeClass = (grade: string) => {
  if (grade === 'Outstanding') return 'bg-emerald-100 text-emerald-800 border-emerald-300'
  if (grade === 'Exceeds Expectations') return 'bg-blue-100 text-blue-800 border-blue-300'
  if (grade === 'Meets Expectations') return 'bg-amber-100 text-amber-800 border-amber-300'
  return 'bg-red-100 text-red-700 border-red-300'
}

const getCategoryBadgeClass = (category: string) => {
  if (category.includes('Attendance')) return 'bg-purple-50 text-purple-800 border-purple-200'
  if (category.includes('Revenue') || category.includes('Field')) return 'bg-emerald-50 text-emerald-800 border-emerald-200'
  if (category.includes('Work Execution')) return 'bg-blue-50 text-[#1e3a8a] border-blue-200'
  if (category.includes('Team')) return 'bg-indigo-50 text-indigo-800 border-indigo-200'
  return 'bg-amber-50 text-amber-800 border-amber-200'
}

export const MyKpiPage: React.FC = () => {
  const { getProfile, updateMetricValue, recalculateAllScores } = useKpi()

  const myEmployeeId = 'PS-EMP-0012'
  const myProfile = getProfile(myEmployeeId) || {
    employeeId: 'PS-EMP-0012',
    employeeName: 'Kasun Perera',
    designation: 'Senior Revenue Inspector',
    department: 'Revenue & Finance Department',
    avatarInitials: 'KP',
    isManager: false,
    overallScore: 91.2,
    performanceGrade: 'Exceeds Expectations' as const,
    lastCalculatedAt: 'Just now',
    metrics: []
  }

  const [simulatingMetric, setSimulatingMetric] = useState<KpiMetric | null>(null)
  const [newValueInput, setNewValueInput] = useState<number>(0)

  const handleOpenSimulate = (met: KpiMetric) => {
    setSimulatingMetric(met)
    setNewValueInput(met.actualValue)
  }

  const handleSaveSimulatedValue = (e: React.FormEvent) => {
    e.preventDefault()
    if (!simulatingMetric) return
    updateMetricValue(myEmployeeId, simulatingMetric.id, Number(newValueInput))
    recalculateAllScores()
    setSimulatingMetric(null)
  }

  const totalMetrics = myProfile.metrics.length
  const metricsMet = myProfile.metrics.filter((m) => {
    const isTurnaround = m.unit.includes('Hours') || m.unit.includes('turnaround')
    return isTurnaround ? m.actualValue <= m.targetValue : m.actualValue >= m.targetValue
  }).length

  return (
    <div className="space-y-6 text-left pb-8 animate-fade-in">
      {/* ── 1. Top Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            My Individual KPI &amp; Performance
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Personal performance rating, automated metric target compliance, and monthly evaluation trends.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-gray-600 bg-white px-3 py-1.5 rounded border border-gray-300 shadow-xs">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-gray-500">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Last Calculated: <strong className="text-gray-900">{myProfile.lastCalculatedAt}</strong></span>
        </div>
      </div>

      {/* ── 2. Summary KPI Cards (Overview Style) ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Officer Profile */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 truncate mr-2">
              Staff Officer
            </span>
            <div className="p-1.5 bg-blue-50/60 rounded shrink-0">
              <UserCheckIcon />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight truncate">
              {myProfile.employeeName}
            </p>
          </div>
          <div className="mt-2 text-xs text-gray-500 font-mono">
            <span>{myProfile.employeeId} • {myProfile.designation}</span>
          </div>
        </div>

        {/* Card 2: Overall KPI Score */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 truncate mr-2">
              Overall KPI Rating
            </span>
            <div className="p-1.5 bg-blue-50/60 rounded shrink-0">
              <AwardIcon />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {myProfile.overallScore}%
            </p>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#c2410c]">
            <TrendUpIcon />
            <span>Out of 100% Target Standard</span>
          </div>
        </div>

        {/* Card 3: Performance Grade */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 truncate mr-2">
              Evaluation Grade
            </span>
            <div className="p-1.5 bg-blue-50/60 rounded shrink-0">
              <TargetIcon />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wide border ${getGradeBadgeClass(myProfile.performanceGrade)}`}>
              {myProfile.performanceGrade}
            </span>
          </div>
          <div className="mt-2 text-xs font-medium text-[#1d4ed8]">
            <span>Official Council Rating</span>
          </div>
        </div>

        {/* Card 4: Metrics Met */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 truncate mr-2">
              Metrics Met
            </span>
            <div className="p-1.5 bg-blue-50/60 rounded shrink-0">
              <CheckCircleIcon />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {metricsMet} / {totalMetrics}
            </p>
          </div>
          <div className="mt-2 text-xs font-medium text-emerald-700 font-semibold">
            <span>Key targets on track</span>
          </div>
        </div>
      </div>

      {/* ── 3. Configured KPI Metrics Grid (Overview Style) ───────────── */}
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide">
              Configured Key Performance Indicators
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Individual target goals, live actual performance data, and automated source formulas
            </p>
          </div>

          <span className="text-xs font-bold text-[#1e3a8a] bg-blue-50 px-3 py-1 rounded border border-blue-200 uppercase tracking-wider">
            Total Metric Weightage: 100%
          </span>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {myProfile.metrics.map((met) => {
            const isTurnaround = met.unit.includes('Hours') || met.unit.includes('turnaround')
            const isTargetMet = isTurnaround ? met.actualValue <= met.targetValue : met.actualValue >= met.targetValue

            return (
              <div
                key={met.id}
                className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-xs hover:border-[#1e3a8a] transition-all space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${getCategoryBadgeClass(met.category)}`}>
                      {met.category}
                    </span>
                    <span className="text-[11px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                      Weight: {met.weightage}%
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 uppercase pt-1">{met.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{met.description}</p>
                </div>

                {/* Target vs Actual Visual Meter */}
                <div className="bg-gray-50/80 p-3.5 rounded border border-gray-200 space-y-2">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-semibold text-gray-600">
                      Target: <strong className="text-gray-900">{met.targetValue} {met.unit}</strong>
                    </span>
                    <span className="font-semibold text-gray-600">
                      Actual:{' '}
                      <strong className={isTargetMet ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                        {met.actualValue} {met.unit}
                      </strong>
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 h-2 rounded-sm overflow-hidden">
                    <div
                      className={`h-full rounded-sm transition-all duration-700 ${isTargetMet ? 'bg-[#1e3a8a]' : 'bg-amber-600'}`}
                      style={{ width: `${Math.min(100, met.score)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200">
                    <span className="text-[11px] text-gray-500 truncate max-w-[200px]">
                      Formula: <em className="text-gray-700 font-medium">{met.autoSourceFormula}</em>
                    </span>
                    <span className="text-xs font-bold text-[#1e3a8a] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Score: {met.score}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                  {met.historicalScores ? (
                    <div className="flex items-center space-x-1.5 text-[11px] text-gray-500">
                      <span className="font-bold uppercase text-[10px]">Trend:</span>
                      {met.historicalScores.map((sc, idx) => (
                        <span key={idx} className="font-mono text-[10px] text-gray-700 bg-gray-100 px-1 rounded">
                          {sc}%
                        </span>
                      ))}
                    </div>
                  ) : <div />}

                  <button
                    type="button"
                    onClick={() => handleOpenSimulate(met)}
                    className="border border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white transition-all text-xs font-semibold px-3 py-1 rounded bg-white shadow-xs cursor-pointer uppercase tracking-wider"
                  >
                    Simulate Update
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Simulator Modal */}
      {simulatingMetric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white border border-gray-300 rounded shadow-xl max-w-md w-full overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                  Simulate Metric Update
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{simulatingMetric.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSimulatingMetric(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSimulatedValue} className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded border border-gray-200 text-xs text-gray-800 space-y-1">
                <div>Target Goal: <strong className="text-gray-900">{simulatingMetric.targetValue} {simulatingMetric.unit}</strong></div>
                <div>Current Actual: <strong className="text-gray-900">{simulatingMetric.actualValue} {simulatingMetric.unit}</strong></div>
                <div>Weightage: <strong className="text-[#1e3a8a]">{simulatingMetric.weightage}%</strong></div>
              </div>

              <div>
                <label htmlFor="new-actual-input" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Enter New Actual Value ({simulatingMetric.unit})
                </label>
                <input
                  type="number"
                  id="new-actual-input"
                  step={0.1}
                  required
                  value={newValueInput}
                  onChange={(e) => setNewValueInput(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setSimulatingMetric(null)}
                  className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold px-3.5 py-1.5 rounded border border-gray-300 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer"
                >
                  Recalculate Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyKpiPage
