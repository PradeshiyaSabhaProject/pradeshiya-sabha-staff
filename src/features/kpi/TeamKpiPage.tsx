import React, { useState } from 'react'
import { useKpi } from '../../context/KpiContext'
import type { EmployeeKpiProfile, KpiMetric } from './data/mockKpiData'

const getGradeBadgeClass = (grade: string) => {
  if (grade === 'Outstanding') return 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold'
  if (grade === 'Exceeds Expectations') return 'bg-blue-100 text-blue-800 border border-blue-200 font-bold'
  if (grade === 'Meets Expectations') return 'bg-amber-100 text-amber-800 border border-amber-200 font-bold'
  return 'bg-rose-100 text-rose-800 border border-rose-200 font-bold animate-pulse'
}

export const TeamKpiPage: React.FC = () => {
  const { getProfile, getSubordinates, updateMetricValue, setTargetGoal, recalculateAllScores } = useKpi()

  // Manager Logged in: Eng. Samantha Bandara (PS-EMP-0034)
  const managerId = 'PS-EMP-0034'
  const managerProfile = getProfile(managerId) || {
    employeeId: 'PS-EMP-0034',
    employeeName: 'Eng. Samantha Bandara',
    designation: 'Technical Officer & Division Manager',
    department: 'Works & Civil Engineering Department',
    avatarInitials: 'SB',
    isManager: true,
    overallScore: 88.8,
    performanceGrade: 'Exceeds Expectations' as const,
    subordinatesAvgScore: 83.05,
    subordinateCascadingWeight: 35,
    cascadingImpactPoints: 29.07,
    lastCalculatedAt: 'Just now',
    metrics: []
  }

  const subordinates = getSubordinates(managerId)

  // Target Goal Adjustment Modal
  const [editingSubordinate, setEditingSubordinate] = useState<{
    profile: EmployeeKpiProfile
    metric: KpiMetric
  } | null>(null)
  const [newActualInput, setNewActualInput] = useState<number>(0)
  const [newTargetInput, setNewTargetInput] = useState<number>(0)

  const handleOpenEdit = (profile: EmployeeKpiProfile, metric: KpiMetric) => {
    setEditingSubordinate({ profile, metric })
    setNewActualInput(metric.actualValue)
    setNewTargetInput(metric.targetValue)
  }

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSubordinate) return
    const { profile, metric } = editingSubordinate
    updateMetricValue(profile.employeeId, metric.id, Number(newActualInput))
    setTargetGoal(profile.employeeId, metric.id, Number(newTargetInput))
    recalculateAllScores()
    setEditingSubordinate(null)
  }

  return (
    <div className="space-y-6 text-left pb-12 animate-fade-in">
      {/* Top Banner / Header area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Subordinates & Team KPIs</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Managerial performance overview, subordinate target achievements, and team cascading score contributions.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-gray-600 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-200">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-emerald-600">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
          <span>Cascading Engine: <strong className="text-emerald-700 font-extrabold">Active</strong></span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Manager Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Manager Profile</p>
            <p className="text-base font-extrabold text-gray-900 truncate">{managerProfile.employeeName}</p>
            <p className="text-xs text-gray-500 truncate">{managerProfile.employeeId} • {managerProfile.designation}</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 text-indigo-700 font-extrabold flex items-center justify-center text-base shrink-0 border border-indigo-100">
            {managerProfile.avatarInitials}
          </div>
        </div>

        {/* Manager Score */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Manager Overall Score</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">{managerProfile.overallScore}%</p>
            <p className="text-xs text-emerald-700 font-semibold mt-1">Includes 35% Team Weight</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5 sm:w-6 sm:h-6">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>

        {/* Subordinates Average */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Team Weighted Average</p>
            <p className="text-xl sm:text-2xl font-black text-indigo-700 mt-1">{managerProfile.subordinatesAvgScore}%</p>
            <p className="text-xs text-indigo-600 font-semibold mt-1">From {subordinates.length} Subordinates</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 sm:w-6 sm:h-6">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
        </div>

        {/* Cascading Contribution */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cascading Impact</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">+{managerProfile.cascadingImpactPoints} pts</p>
            <p className="text-xs text-emerald-700 font-semibold mt-1">Added to Manager Rating</p>
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

      {/* Subordinate Cascading Impact Info Box */}
      <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-6 space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
              Subordinate KPI Cascading Policy
            </span>
            <span className="text-xs font-semibold text-gray-500">
              {subordinates.length} Direct Subordinates Assigned
            </span>
          </div>
          <span className="text-xs font-extrabold text-indigo-700">Weightage: 35%</span>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          In accordance with Pradeshiya Sabha municipal regulations, <strong>35%</strong> of the Division Manager's overall KPI evaluation score is directly derived from the weighted performance average of assigned team members ({subordinates.map((s) => s.employeeName).join(', ')}).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs">
            <div className="text-[11px] text-gray-500 font-bold uppercase">Subordinates Average</div>
            <div className="text-lg font-black text-gray-900 mt-0.5">{managerProfile.subordinatesAvgScore}%</div>
            <div className="text-[10px] text-indigo-600 font-semibold">From {subordinates.length} direct reports</div>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs">
            <div className="text-[11px] text-gray-500 font-bold uppercase">Manager Team Weight</div>
            <div className="text-lg font-black text-indigo-700 mt-0.5">{managerProfile.subordinateCascadingWeight || 35}%</div>
            <div className="text-[10px] text-gray-500 font-medium">Applied to manager score</div>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs">
            <div className="text-[11px] text-gray-500 font-bold uppercase">Cascading Impact</div>
            <div className="text-lg font-black text-emerald-600 mt-0.5">+{managerProfile.cascadingImpactPoints} points</div>
            <div className="text-[10px] text-emerald-700 font-bold">Contributed to manager overall</div>
          </div>
        </div>
      </div>

      {/* Subordinates Performance Roster */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Direct Subordinates Performance Roster</h3>
            <p className="text-xs text-gray-500">
              Review individual team members' metric target compliance and adjust target goals.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {subordinates.map((sub) => (
            <div
              key={sub.employeeId}
              className="bg-gray-50/60 rounded-2xl border border-gray-200 p-5 hover:bg-gray-50 transition space-y-4"
            >
              {/* Subordinate Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200/80 pb-3">
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {sub.avatarInitials}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-base font-bold text-gray-900">{sub.employeeName}</h4>
                      <span className="text-xs bg-gray-200 text-gray-800 font-semibold px-2 py-0.5 rounded-md">
                        {sub.employeeId}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {sub.designation} • {sub.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-xs text-gray-500 font-semibold">Overall KPI Score</div>
                    <div className="text-xl font-black text-gray-900">{sub.overallScore}%</div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-extrabold rounded-full border ${getGradeBadgeClass(sub.performanceGrade)}`}>
                    {sub.performanceGrade}
                  </span>
                </div>
              </div>

              {/* Subordinate Metrics List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {sub.metrics.map((met) => (
                  <div
                    key={met.id}
                    className="bg-white p-3.5 rounded-xl border border-gray-200 text-xs space-y-2 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 truncate max-w-[170px]" title={met.title}>
                          {met.title}
                        </span>
                        <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          {met.score}%
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1">
                        Target: <strong className="text-gray-800">{met.targetValue} {met.unit}</strong> | Actual:{' '}
                        <strong className="text-gray-900">{met.actualValue} {met.unit}</strong>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(sub, met)}
                        className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 transition cursor-pointer"
                      >
                        ✏️ Adjust Target / Actual
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Target & Actual Adjustment Modal */}
      {editingSubordinate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xl max-w-md w-full text-left space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Adjust Target & Actual Goal</h3>
                <p className="text-xs text-gray-500">
                  {editingSubordinate.profile.employeeName} • {editingSubordinate.metric.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSubordinate(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200 text-xs text-indigo-900 space-y-1">
                <div>Metric Category: <strong>{editingSubordinate.metric.category}</strong></div>
                <div>Weightage: <strong>{editingSubordinate.metric.weightage}%</strong></div>
                <div className="text-indigo-700 font-semibold pt-1">
                  Adjusting these values will automatically recalculate this subordinate's score AND update Manager's cascading team score!
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="adjust-target-input" className="block text-xs font-semibold text-gray-700 mb-1">
                    Target Goal ({editingSubordinate.metric.unit})
                  </label>
                  <input
                    type="number"
                    id="adjust-target-input"
                    step={0.1}
                    required
                    value={newTargetInput}
                    onChange={(e) => setNewTargetInput(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="adjust-actual-input" className="block text-xs font-semibold text-gray-700 mb-1">
                    Actual Achieved ({editingSubordinate.metric.unit})
                  </label>
                  <input
                    type="number"
                    id="adjust-actual-input"
                    step={0.1}
                    required
                    value={newActualInput}
                    onChange={(e) => setNewActualInput(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSubordinate(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Save & Cascading Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
