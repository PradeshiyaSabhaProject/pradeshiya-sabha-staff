import React, { useState } from 'react'
import { useKpi } from '../../context/KpiContext'
import type { KpiMetric } from './data/mockKpiData'

const getGradeBadgeClass = (grade: string) => {
  if (grade === 'Outstanding') return 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold'
  if (grade === 'Exceeds Expectations') return 'bg-blue-100 text-blue-800 border border-blue-200 font-bold'
  if (grade === 'Meets Expectations') return 'bg-amber-100 text-amber-800 border border-amber-200 font-bold'
  return 'bg-rose-100 text-rose-800 border border-rose-200 font-bold animate-pulse'
}

const getCategoryBadgeClass = (category: string) => {
  if (category.includes('Attendance')) return 'bg-purple-50 text-purple-700 border border-purple-200 font-bold'
  if (category.includes('Revenue') || category.includes('Field')) return 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
  if (category.includes('Work Execution')) return 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
  if (category.includes('Team')) return 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold'
  return 'bg-amber-50 text-amber-700 border border-amber-200 font-bold'
}

export const MyKpiPage: React.FC = () => {
  const { getProfile, updateMetricValue, recalculateAllScores } = useKpi()

  // Default logged-in employee: Kasun Perera (PS-EMP-0012)
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

  // Simulation modal for testing actual metric inputs
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
    <div className="space-y-6 text-left pb-12 animate-fade-in">
      {/* Top Banner / Header area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">My Individual KPI & Performance</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Personal performance rating, automated metric target compliance, and monthly evaluation trends.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-gray-600 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-200">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-500">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Last Calculated: <strong className="text-gray-900">{myProfile.lastCalculatedAt}</strong></span>
        </div>
      </div>

      {/* Profile & KPI Summary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Officer Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Staff Officer</p>
            <p className="text-base font-extrabold text-gray-900 truncate">{myProfile.employeeName}</p>
            <p className="text-xs text-gray-500 truncate">{myProfile.employeeId} • {myProfile.designation}</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-700 font-extrabold flex items-center justify-center text-base shrink-0 border border-blue-100">
            {myProfile.avatarInitials}
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overall KPI Rating</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">{myProfile.overallScore}%</p>
            <p className="text-xs text-emerald-700 font-semibold mt-1">Out of 100% Target</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5 sm:w-6 sm:h-6">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>

        {/* Performance Grade */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Evaluation Grade</p>
            <div className="mt-1">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${getGradeBadgeClass(myProfile.performanceGrade)}`}>
                {myProfile.performanceGrade}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1.5">Official Rating</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 sm:w-6 sm:h-6">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
        </div>

        {/* Metric Compliance */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Metrics Met</p>
            <p className="text-xl sm:text-2xl font-extrabold text-blue-700 mt-1">{metricsMet} / {totalMetrics}</p>
            <p className="text-xs text-blue-600 font-medium mt-1">Key targets on track</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 sm:w-6 sm:h-6">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
        </div>
      </div>

      {/* KPI Metrics Itemized Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Configured Key Performance Indicators</h3>
            <p className="text-xs text-gray-500">
              Individual target goals, live actual performance data, and automated source calculation formulas.
            </p>
          </div>
          <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 self-start sm:self-auto">
            Total Metric Weightage: 100%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myProfile.metrics.map((met) => {
            const isTurnaround = met.unit.includes('Hours') || met.unit.includes('turnaround')
            const isTargetMet = isTurnaround ? met.actualValue <= met.targetValue : met.actualValue >= met.targetValue

            return (
              <div
                key={met.id}
                className="bg-gray-50/60 rounded-2xl border border-gray-200 p-5 hover:bg-gray-50 transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${getCategoryBadgeClass(met.category)}`}>
                      {met.category}
                    </span>
                    <span className="text-xs font-extrabold bg-white text-gray-700 px-2.5 py-0.5 rounded-md border border-gray-200">
                      Weight: {met.weightage}%
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-gray-900">{met.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{met.description}</p>
                </div>

                {/* Target vs Actual Visual Meter */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2.5 shadow-2xs">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-bold text-gray-700">
                      Target Goal: <strong className="text-gray-900">{met.targetValue} {met.unit}</strong>
                    </span>
                    <span className="font-bold text-gray-700">
                      Actual Achieved:{' '}
                      <strong className={isTargetMet ? 'text-emerald-700 font-extrabold' : 'text-amber-700 font-extrabold'}>
                        {met.actualValue} {met.unit}
                      </strong>
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isTargetMet ? 'bg-emerald-600' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, met.score)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-gray-100">
                    <span className="text-[11px] text-gray-500">
                      Formula: <em className="text-gray-700 font-medium">{met.autoSourceFormula}</em>
                    </span>
                    <span className="font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                      Score: {met.score}%
                    </span>
                  </div>
                </div>

                {/* Historical monthly trend chart */}
                {met.historicalScores && (
                  <div className="flex items-center justify-between pt-1 text-[11px] text-gray-500">
                    <span>4-Month Performance Trend:</span>
                    <div className="flex items-center space-x-1.5">
                      {met.historicalScores.map((sc, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div className="w-5 bg-blue-100 rounded-t h-6 flex items-end justify-center relative group">
                            <div
                              className="w-full bg-blue-600 rounded-t transition-all"
                              style={{ height: `${(sc / 100) * 100}%` }}
                            />
                            <div className="absolute -top-7 hidden group-hover:block bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded font-bold z-10 whitespace-nowrap">
                              M{idx + 1}: {sc}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-1 border-t border-gray-200/60">
                  <button
                    type="button"
                    onClick={() => handleOpenSimulate(met)}
                    className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition flex items-center space-x-1 cursor-pointer"
                  >
                    <span>⚡ Simulate Metric Update</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Simulator Modal */}
      {simulatingMetric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xl max-w-md w-full text-left space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Simulate Metric Update</h3>
                <p className="text-xs text-gray-500">{simulatingMetric.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSimulatingMetric(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSimulatedValue} className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
                <div>Target Goal: <strong>{simulatingMetric.targetValue} {simulatingMetric.unit}</strong></div>
                <div>Current Actual: <strong>{simulatingMetric.actualValue} {simulatingMetric.unit}</strong></div>
                <div>Weightage: <strong>{simulatingMetric.weightage}%</strong></div>
              </div>

              <div>
                <label htmlFor="new-actual-input" className="block text-xs font-semibold text-gray-700 mb-1">
                  Enter New Actual Achieved ({simulatingMetric.unit})
                </label>
                <input
                  type="number"
                  id="new-actual-input"
                  step={0.1}
                  required
                  value={newValueInput}
                  onChange={(e) => setNewValueInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSimulatingMetric(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
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
