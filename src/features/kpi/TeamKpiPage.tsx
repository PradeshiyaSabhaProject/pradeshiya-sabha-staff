import React, { useState } from 'react'
import { useKpi } from '../../context/KpiContext'
import type { EmployeeKpiProfile, KpiMetric } from './data/mockKpiData'

// ── Icons matching Overview style ───────────────────────────────────────────
const UserShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-[#1e3a8a]">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const AwardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-[#1e3a8a]">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
)

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-[#1e3a8a]">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const SparklesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-[#1e3a8a]">
    <path d="M12 3l1.912 5.885L20 10l-5.088 3.885L16.824 20 12 16.18 7.176 20l1.912-6.115L4 10l6.088-1.115z" />
  </svg>
)

const TrendUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-[#c2410c] shrink-0">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)

const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-[#ea580c] shrink-0">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

const getGradeBadgeClass = (grade: string) => {
  if (grade === 'Outstanding') return 'bg-emerald-100 text-emerald-800 border-emerald-300'
  if (grade === 'Exceeds Expectations') return 'bg-blue-100 text-blue-800 border-blue-300'
  if (grade === 'Meets Expectations') return 'bg-amber-100 text-amber-800 border-amber-300'
  return 'bg-red-100 text-red-700 border-red-300'
}

export const TeamKpiPage: React.FC = () => {
  const { getProfile, getSubordinates, updateMetricValue, setTargetGoal, recalculateAllScores } = useKpi()

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
    <div className="space-y-6 text-left pb-8 animate-fade-in">
      {/* ── 1. Top Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Subordinates &amp; Team KPIs
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Managerial performance overview, subordinate target compliance, and cascading score contributions.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-gray-700 bg-white px-3 py-1.5 rounded border border-gray-300 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Cascading Engine: <strong className="text-emerald-700 uppercase font-bold">Active (35% Weight)</strong></span>
        </div>
      </div>

      {/* ── 2. Top Summary KPI Cards (Overview Style) ─────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Manager Profile */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 truncate mr-2">
              Manager Profile
            </span>
            <div className="p-1.5 bg-blue-50/60 rounded shrink-0">
              <UserShieldIcon />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight truncate">
              {managerProfile.employeeName}
            </p>
          </div>
          <div className="mt-2 text-xs text-gray-500 font-mono">
            <span>{managerProfile.employeeId} • {managerProfile.department}</span>
          </div>
        </div>

        {/* Card 2: Manager Overall Score */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 truncate mr-2">
              Manager Rating
            </span>
            <div className="p-1.5 bg-blue-50/60 rounded shrink-0">
              <AwardIcon />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {managerProfile.overallScore}%
            </p>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#c2410c]">
            <TrendUpIcon />
            <span>Includes 35% Team Weight</span>
          </div>
        </div>

        {/* Card 3: Team Weighted Average */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 truncate mr-2">
              Team Average
            </span>
            <div className="p-1.5 bg-blue-50/60 rounded shrink-0">
              <UsersIcon />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-[#1e3a8a] tracking-tight">
              {managerProfile.subordinatesAvgScore}%
            </p>
          </div>
          <div className="mt-2 text-xs font-medium text-[#1d4ed8]">
            <span>From {subordinates.length} Direct Subordinates</span>
          </div>
        </div>

        {/* Card 4: Cascading Impact */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 truncate mr-2">
              Cascading Impact
            </span>
            <div className="p-1.5 bg-blue-50/60 rounded shrink-0">
              <SparklesIcon />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">
              +{managerProfile.cascadingImpactPoints} pts
            </p>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-[#ea580c]">
            <TargetIcon />
            <span>Added to Manager Rating</span>
          </div>
        </div>
      </div>

      {/* ── 3. Subordinate Cascading Policy Info Card ─────────────────── */}
      <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Subordinate KPI Cascading Policy
            </h3>
            <span className="text-xs font-semibold text-gray-500">
              ({subordinates.length} Direct Reports)
            </span>
          </div>
          <span className="text-xs font-bold text-[#1e3a8a] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 uppercase tracking-wider self-start sm:self-auto">
            Weightage: 35%
          </span>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          In accordance with Pradeshiya Sabha municipal regulations, <strong>35%</strong> of the Division Manager's overall KPI evaluation score is directly derived from the weighted performance average of assigned team members ({subordinates.map((s) => s.employeeName).join(', ')}).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="bg-gray-50 p-3 rounded border border-gray-200 text-xs">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Subordinates Average</div>
            <div className="text-base font-bold text-gray-900 mt-0.5">{managerProfile.subordinatesAvgScore}%</div>
            <div className="text-[10px] text-[#1e3a8a] font-medium">From {subordinates.length} reports</div>
          </div>

          <div className="bg-gray-50 p-3 rounded border border-gray-200 text-xs">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Manager Team Weight</div>
            <div className="text-base font-bold text-[#1e3a8a] mt-0.5">{managerProfile.subordinateCascadingWeight || 35}%</div>
            <div className="text-[10px] text-gray-500 font-medium">Applied to manager score</div>
          </div>

          <div className="bg-gray-50 p-3 rounded border border-gray-200 text-xs">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cascading Impact</div>
            <div className="text-base font-bold text-emerald-700 mt-0.5">+{managerProfile.cascadingImpactPoints} points</div>
            <div className="text-[10px] text-emerald-700 font-semibold">Contributed to manager overall</div>
          </div>
        </div>
      </div>

      {/* ── 4. Subordinates Performance Roster (Overview Style) ──────── */}
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide">
            Direct Subordinates Performance Roster
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Review individual team members' metric target compliance and adjust target goals
          </p>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {subordinates.map((sub) => (
            <div
              key={sub.employeeId}
              className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-xs space-y-3.5"
            >
              {/* Subordinate Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-3">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded bg-blue-50 text-[#1e3a8a] font-bold flex items-center justify-center text-xs border border-blue-200 shrink-0 font-mono uppercase">
                    {sub.avatarInitials}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-gray-900 uppercase">{sub.employeeName}</h4>
                      <span className="text-xs bg-gray-100 text-gray-700 font-mono px-2 py-0.5 rounded border border-gray-200">
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
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Overall KPI Score</div>
                    <div className="text-lg font-extrabold text-gray-900">{sub.overallScore}%</div>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded uppercase tracking-wide border ${getGradeBadgeClass(sub.performanceGrade)}`}>
                    {sub.performanceGrade}
                  </span>
                </div>
              </div>

              {/* Subordinate Metrics List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {sub.metrics.map((met) => (
                  <div
                    key={met.id}
                    className="bg-gray-50/70 p-3.5 rounded border border-gray-200 text-xs space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 truncate max-w-[170px]" title={met.title}>
                          {met.title}
                        </span>
                        <span className="text-xs font-bold text-[#1e3a8a] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {met.score}%
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-600 mt-1">
                        Target: <strong className="text-gray-900">{met.targetValue} {met.unit}</strong> | Actual:{' '}
                        <strong className="text-gray-900">{met.actualValue} {met.unit}</strong>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(sub, met)}
                        className="border border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white transition-all text-[11px] font-semibold px-2.5 py-1 rounded bg-white shadow-xs cursor-pointer uppercase tracking-wider"
                      >
                        Adjust Target / Actual
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white border border-gray-300 rounded shadow-xl max-w-md w-full overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                  Adjust Target &amp; Actual Goal
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editingSubordinate.profile.employeeName} • {editingSubordinate.metric.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSubordinate(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded border border-gray-200 text-xs text-gray-800 space-y-1">
                <div>Metric Category: <strong>{editingSubordinate.metric.category}</strong></div>
                <div>Weightage: <strong>{editingSubordinate.metric.weightage}%</strong></div>
                <div className="text-[#1e3a8a] font-medium pt-1">
                  Adjusting these values automatically recalculates this subordinate's score and updates the manager's cascading team score.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="adjust-target-input" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Target Goal ({editingSubordinate.metric.unit})
                  </label>
                  <input
                    type="number"
                    id="adjust-target-input"
                    step={0.1}
                    required
                    value={newTargetInput}
                    onChange={(e) => setNewTargetInput(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                  />
                </div>
                <div>
                  <label htmlFor="adjust-actual-input" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Actual Achieved ({editingSubordinate.metric.unit})
                  </label>
                  <input
                    type="number"
                    id="adjust-actual-input"
                    step={0.1}
                    required
                    value={newActualInput}
                    onChange={(e) => setNewActualInput(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingSubordinate(null)}
                  className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold px-3.5 py-1.5 rounded border border-gray-300 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer"
                >
                  Save &amp; Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamKpiPage
