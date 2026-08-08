import React, { useState } from 'react'
import { useKpi } from '../../context/KpiContext'
import { Link } from 'react-router-dom'

const getGradeBadgeClass = (grade: string) => {
  if (grade === 'Outstanding') return 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold'
  if (grade === 'Exceeds Expectations') return 'bg-blue-100 text-blue-800 border border-blue-200 font-bold'
  if (grade === 'Meets Expectations') return 'bg-amber-100 text-amber-800 border border-amber-200 font-bold'
  return 'bg-rose-100 text-rose-800 border border-rose-200 font-bold animate-pulse'
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
    <div className="space-y-6 text-left pb-12 animate-fade-in">
      {/* Top Banner / Header area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Council KPI Performance Benchmarks</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Homagama Pradeshiya Sabha municipal performance benchmarks, department averages, and staff ratings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <Link
            to="/kpi/my-kpi"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition text-center"
          >
            My KPI
          </Link>
          <Link
            to="/kpi/team-kpi"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition text-center"
          >
            Manager Team KPIs
          </Link>
        </div>
      </div>

      {/* KPI Stats Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Average Council KPI</p>
            <p className="text-xl sm:text-2xl font-black text-blue-700 mt-1">{avgCouncilScore}%</p>
            <p className="text-xs text-blue-600 font-medium mt-1">2026 Q3 Aggregate</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 sm:w-6 sm:h-6">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Top Performing Staff</p>
            <p className="text-base font-bold text-gray-900 mt-1 truncate max-w-[150px]">{topStaff?.employeeName}</p>
            <p className="text-xs text-emerald-600 font-extrabold mt-1">{topStaff?.overallScore}% Overall Score</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 sm:w-6 sm:h-6">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Team Cascading Weight</p>
            <p className="text-xl sm:text-2xl font-black text-indigo-700 mt-1">35%</p>
            <p className="text-xs text-indigo-600 font-medium mt-1">Applied to division managers</p>
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

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Evaluated Profiles</p>
            <p className="text-xl sm:text-2xl font-extrabold text-purple-600 mt-1">{kpiProfiles.length}</p>
            <p className="text-xs text-purple-700 font-medium mt-1">Active staff profiles</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 sm:w-6 sm:h-6">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filtering Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff name, ID, designation, or department..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-semibold text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 outline-none transition"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 outline-none"
          >
            <option value="All">All Departments</option>
            <option value="Revenue & Finance Department">Revenue & Finance Dept</option>
            <option value="Works & Engineering Department">Works & Engineering Dept</option>
            <option value="Works & Civil Engineering Department">Works & Civil Eng Dept</option>
            <option value="Public Health & Environment">Public Health Dept</option>
            <option value="Roads & Infrastructure">Roads & Infrastructure</option>
          </select>

          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 outline-none"
          >
            <option value="All">All Evaluation Grades</option>
            <option value="Outstanding">Outstanding (90%+)</option>
            <option value="Exceeds Expectations">Exceeds Expectations (85%-89%)</option>
            <option value="Meets Expectations">Meets Expectations (70%-84%)</option>
            <option value="Needs Improvement">Needs Improvement (&lt;70%)</option>
          </select>
        </div>
      </div>

      {/* Staff KPI Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">Staff Performance Ratings & Metric Status</h3>
            <p className="text-xs text-gray-500">Comprehensive municipal staff KPI ratings computed by automated engine.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                <th className="py-3.5 px-5">Staff Member</th>
                <th className="py-3.5 px-4">Department & Role</th>
                <th className="py-3.5 px-4 text-center">Configured Metrics</th>
                <th className="py-3.5 px-4 text-center">Overall Rating</th>
                <th className="py-3.5 px-4 text-center">Grade Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {sortedProfiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 text-sm">
                    No staff profiles match your search criteria.
                  </td>
                </tr>
              ) : (
                sortedProfiles.map((prof) => (
                  <tr key={prof.employeeId} className="hover:bg-gray-50/60 transition">
                    <td className="py-4 px-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                          {prof.avatarInitials}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{prof.employeeName}</div>
                          <div className="text-xs text-gray-500">{prof.employeeId}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">{prof.designation}</div>
                      <div className="text-xs text-gray-500">{prof.department}</div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="bg-blue-50 text-blue-800 font-bold px-2.5 py-1 rounded-lg border border-blue-200 text-xs">
                        {prof.metrics.length} Key Targets
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="font-black text-base text-gray-900">{prof.overallScore}%</span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${getGradeBadgeClass(prof.performanceGrade)}`}>
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
