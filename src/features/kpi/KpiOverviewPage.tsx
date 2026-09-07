import React, { useState } from 'react'
import { useKpi } from '../../context/KpiContext'
import { Link } from 'react-router-dom'

// ── Icons matching Overview style ───────────────────────────────────────────
const GaugeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-[#1e3a8a]">
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-[#1e3a8a]">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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

const ClipboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-[#1e3a8a]">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <polyline points="9 14 11 16 15 12" />
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

export const KpiOverviewPage: React.FC = () => {
  const { kpiProfiles } = useKpi()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('All')
  const [selectedGrade, setSelectedGrade] = useState('All')

  const avgCouncilScore = Math.round(
    (kpiProfiles.reduce((acc, curr) => acc + curr.overallScore, 0) / kpiProfiles.length) * 10
  ) / 10

  const filteredProfiles = kpiProfiles.filter((prof) => {
    const matchesSearch =
      prof.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.designation.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false
    if (selectedDepartment !== 'All' && prof.department !== selectedDepartment) return false
    if (selectedGrade !== 'All' && prof.performanceGrade !== selectedGrade) return false
    return true
  })

  const sortedProfiles = [...filteredProfiles].sort((a, b) => b.overallScore - a.overallScore)
  const topStaff = sortedProfiles[0] || kpiProfiles[0]

  return (
    <div className="space-y-6 text-left pb-8 animate-fade-in">
      {/* ── 1. Top Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Council KPI Performance Benchmarks
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Homagama Pradeshiya Sabha municipal performance benchmarks, department averages, and staff ratings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/kpi/my-kpi"
            className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer"
          >
            My KPI Portal
          </Link>
          <Link
            to="/kpi/team-kpi"
            className="border border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white transition-all text-xs font-semibold px-3.5 py-1.5 rounded bg-white shadow-xs cursor-pointer uppercase tracking-wider"
          >
            Team Cascading
          </Link>
        </div>
      </div>

      {/* ── 2. KPI Summary Cards (Overview Style) ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Council Average */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 truncate mr-2">
              Average Council KPI
            </span>
            <div className="p-1.5 bg-blue-50/60 rounded shrink-0">
              <GaugeIcon />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{avgCouncilScore}%</p>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#c2410c]">
            <TrendUpIcon />
            <span>2026 Q3 Aggregate Index</span>
          </div>
        </div>

        {/* Card 2: Top Staff */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 truncate mr-2">
              Top Performing Officer
            </span>
            <div className="p-1.5 bg-blue-50/60 rounded shrink-0">
              <StarIcon />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight truncate">
              {topStaff?.employeeName}
            </p>
          </div>
          <div className="mt-2 text-xs font-bold text-emerald-700">
            <span>{topStaff?.overallScore}% Overall Score</span>
          </div>
        </div>

        {/* Card 3: Team Cascading Weight */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 truncate mr-2">
              Team Cascading Weight
            </span>
            <div className="p-1.5 bg-blue-50/60 rounded shrink-0">
              <UsersIcon />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">35%</p>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-[#ea580c]">
            <TargetIcon />
            <span>Applied to Division Managers</span>
          </div>
        </div>

        {/* Card 4: Evaluated Profiles */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 truncate mr-2">
              Evaluated Profiles
            </span>
            <div className="p-1.5 bg-blue-50/60 rounded shrink-0">
              <ClipboardIcon />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{kpiProfiles.length}</p>
          </div>
          <div className="mt-2 text-xs font-medium text-[#1d4ed8]">
            <span>Active Staff Evaluations</span>
          </div>
        </div>
      </div>

      {/* ── 3. Table Container & Filters (Overview Style) ─────────────── */}
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
        {/* Table Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide">
              Staff Performance Ratings &amp; Metric Status
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Municipal staff KPI ratings computed by automated engine</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert('Exporting KPI_BENCHMARKS.csv...')}
              className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff, ID, role, department..."
              className="w-full pl-8 pr-3 py-1.5 rounded border border-gray-300 bg-white text-xs font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
            />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded border border-gray-300">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Dept:</span>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="bg-transparent text-xs font-semibold text-gray-800 focus:outline-none cursor-pointer pr-1"
              >
                <option value="All">All Departments</option>
                <option value="Revenue & Finance Department">Revenue &amp; Finance</option>
                <option value="Works & Engineering Department">Works &amp; Engineering</option>
                <option value="Works & Civil Engineering Department">Works &amp; Civil Engineering</option>
                <option value="Public Health & Environment">Public Health</option>
                <option value="Roads & Infrastructure">Roads &amp; Infrastructure</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded border border-gray-300">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Grade:</span>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="bg-transparent text-xs font-semibold text-gray-800 focus:outline-none cursor-pointer pr-1"
              >
                <option value="All">All Grades</option>
                <option value="Outstanding">Outstanding (90%+)</option>
                <option value="Exceeds Expectations">Exceeds Expectations (85%-89%)</option>
                <option value="Meets Expectations">Meets Expectations (70%-84%)</option>
                <option value="Needs Improvement">Needs Improvement (&lt;70%)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto flex-1 relative [-webkit-overflow-scrolling:touch]">
          <table className="w-full text-left border-collapse min-w-[780px]">
            <thead>
              <tr className="bg-gray-100 border-y border-gray-300 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6">STAFF MEMBER</th>
                <th className="py-3 px-4 sm:px-6">DEPARTMENT &amp; ROLE</th>
                <th className="py-3 px-4 sm:px-6 text-center">CONFIGURED METRICS</th>
                <th className="py-3 px-4 sm:px-6 text-center">OVERALL RATING</th>
                <th className="py-3 px-4 sm:px-6 text-right">GRADE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {sortedProfiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No staff profiles match your search criteria.
                  </td>
                </tr>
              ) : (
                sortedProfiles.map((prof) => (
                  <tr key={prof.employeeId} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-3 px-4 sm:px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded bg-blue-50 text-[#1e3a8a] font-bold flex items-center justify-center text-xs border border-blue-200 shrink-0 font-mono uppercase">
                          {prof.avatarInitials}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-xs">{prof.employeeName}</div>
                          <div className="text-[11px] text-gray-500 font-mono">{prof.employeeId}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 sm:px-6">
                      <div className="font-semibold text-gray-900 text-xs">{prof.designation}</div>
                      <div className="text-[11px] text-gray-500">{prof.department}</div>
                    </td>

                    <td className="py-3 px-4 sm:px-6 text-center whitespace-nowrap">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border bg-blue-50 text-[#1e3a8a] border-blue-200">
                        {prof.metrics.length} Key Targets
                      </span>
                    </td>

                    <td className="py-3 px-4 sm:px-6 text-center whitespace-nowrap">
                      <span className="font-extrabold text-sm text-gray-900">{prof.overallScore}%</span>
                    </td>

                    <td className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide inline-block border ${getGradeBadgeClass(prof.performanceGrade)}`}>
                        {prof.performanceGrade}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default KpiOverviewPage
