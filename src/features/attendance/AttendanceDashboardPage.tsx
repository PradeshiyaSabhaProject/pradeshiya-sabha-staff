import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MOCK_BIOMETRIC_LOGS, type BiometricLog } from './data/mockAttendanceData'
import { BiometricSyncModal } from './components/BiometricSyncModal'

// ── Icons matching Overview style ───────────────────────────────────────────
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-[#1e3a8a]">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-[#1e3a8a]">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const ClockAlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-[#1e3a8a]">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const CalendarLeaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-[#1e3a8a]">
    <rect x="3" y="4" width="18" height="18" rx="1" ry="1" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
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

export const AttendanceDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState('2026-07-10')
  const [logs] = useState<BiometricLog[]>(MOCK_BIOMETRIC_LOGS)
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false)
  const [lastSyncText, setLastSyncText] = useState('Today at 08:45 AM')

  const uniqueDepartments = Array.from(new Set(logs.map((l) => l.department))).sort((a, b) => a.localeCompare(b))
  const uniqueStatuses = Array.from(new Set(logs.map((l) => l.status))).sort((a, b) => a.localeCompare(b))

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.status.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    // Department Dropdown Filter
    if (selectedDepartment !== 'All' && log.department !== selectedDepartment) {
      return false
    }

    // Status Dropdown Filter
    if (selectedStatus !== 'All' && log.status !== selectedStatus) {
      return false
    }

    // Quick Category Filter
    if (activeFilter === 'All') return true
    if (activeFilter === 'Present') return log.status === 'Present' || log.status === 'Overtime'
    if (activeFilter === 'Late') return log.status === 'Late Entry'
    if (activeFilter === 'Weekend') return log.status === 'Weekend Duty' || Boolean(log.isWeekend)
    if (activeFilter === 'Overtime') return log.status === 'Overtime' || Boolean(log.overtimeHours)
    if (activeFilter === 'Leave') return log.status === 'Approved Leave' || log.status === 'Official Duty'
    if (activeFilter === 'Missed') return log.status === 'Missed Punch' || log.status === 'Absent'
    return true
  })

  const totalStaff = 142
  const presentCount = logs.filter((l) => l.status === 'Present' || l.status === 'Late Entry' || l.status === 'Overtime' || l.status === 'Weekend Duty').length
  const lateCount = logs.filter((l) => l.status === 'Late Entry').length
  const leaveCount = logs.filter((l) => l.status === 'Approved Leave' || l.status === 'Official Duty').length

  const getStatusBadge = (status: BiometricLog['status']) => {
    switch (status) {
      case 'Present':
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide inline-block border bg-emerald-100 text-emerald-800 border-emerald-300">
            Present
          </span>
        )
      case 'Late Entry':
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide inline-block border bg-amber-100 text-amber-800 border-amber-300">
            Late Entry
          </span>
        )
      case 'Approved Leave':
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide inline-block border bg-blue-100 text-blue-800 border-blue-300">
            Approved Leave
          </span>
        )
      case 'Official Duty':
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide inline-block border bg-purple-100 text-purple-800 border-purple-300">
            Official Duty
          </span>
        )
      case 'Weekend Duty':
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide inline-block border bg-indigo-100 text-indigo-800 border-indigo-300">
            Weekend Duty
          </span>
        )
      case 'Overtime':
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide inline-block border bg-orange-100 text-orange-800 border-orange-300">
            Overtime
          </span>
        )
      case 'Missed Punch':
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide inline-block border bg-red-100 text-red-700 border-red-300">
            Missed Punch
          </span>
        )
      default:
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide inline-block border bg-gray-200 text-gray-700 border-gray-300">
            Absent
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 text-left pb-8 animate-fade-in">
      {/* ── 1. Top Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Staff Attendance & Biometric Tracking
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Real-time daily attendance monitoring, biometric punch sync, and punctuality audit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSyncModalOpen(true)}
            className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            <span>Sync Biometric Punches</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/attendance/approvals')}
            className="border border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white transition-all text-xs font-semibold px-3.5 py-1.5 rounded bg-white shadow-xs cursor-pointer uppercase tracking-wider"
          >
            Approvals Queue
          </button>
        </div>
      </div>

      {/* ── 2. Top KPI Cards (matching OverviewPage) ──────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Staff */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 truncate mr-2">
              Total Council Staff
            </span>
            <div className="p-1.5 bg-blue-50/60 rounded shrink-0">
              <UsersIcon />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{totalStaff}</p>
          </div>
          <div className="mt-2 text-xs font-medium text-[#1d4ed8]">
            <span>Expected roster staff today</span>
          </div>
        </div>

        {/* Card 2: Present Today */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 truncate mr-2">
              Present Today
            </span>
            <div className="p-1.5 bg-blue-50/60 rounded shrink-0">
              <CheckCircleIcon />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{presentCount}</p>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#c2410c]">
            <TrendUpIcon />
            <span>90.1% Attendance Rate</span>
          </div>
        </div>

        {/* Card 3: Late Arrivals */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 truncate mr-2">
              Late Arrivals (&gt;8:45 AM)
            </span>
            <div className="p-1.5 bg-blue-50/60 rounded shrink-0">
              <ClockAlertIcon />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{lateCount}</p>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-[#ea580c]">
            <TargetIcon />
            <span>Flagged for Shift Grace Rule</span>
          </div>
        </div>

        {/* Card 4: On Leave / Official Duty */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 truncate mr-2">
              On Leave / Official Duty
            </span>
            <div className="p-1.5 bg-blue-50/60 rounded shrink-0">
              <CalendarLeaveIcon />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{leaveCount}</p>
          </div>
          <div className="mt-2 text-xs font-medium text-gray-500">
            <span>Authorized by Section Head</span>
          </div>
        </div>
      </div>

      {/* ── 3. Main Roster Table Container (Matching Overview Page) ────── */}
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
        {/* Table Header Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide">
              Biometric Daily Roster — {selectedDate}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Last synced: {lastSyncText}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded border border-gray-300 text-xs">
              <span className="text-gray-500 font-bold uppercase tracking-wider text-[11px]">Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-semibold text-gray-800 focus:outline-none cursor-pointer"
              />
            </div>
            <button
              type="button"
              onClick={() => alert(`Exporting BIOMETRIC_DAILY_ROSTER_${selectedDate}.csv...`)}
              className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer text-center"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => setIsSyncModalOpen(true)}
              className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold px-3.5 py-1.5 rounded border border-gray-300 transition-colors uppercase tracking-wider cursor-pointer text-center"
            >
              Force Sync
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold px-3.5 py-1.5 rounded border border-gray-300 transition-colors uppercase tracking-wider cursor-pointer text-center"
            >
              Print
            </button>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/30 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Department Dropdown */}
              <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded border border-gray-300">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Dept:</span>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-gray-800 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="All">All Departments ({uniqueDepartments.length})</option>
                  {uniqueDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Dropdown */}
              <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded border border-gray-300">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value)
                    if (e.target.value !== 'All') {
                      setActiveFilter('All')
                    }
                  }}
                  className="bg-transparent text-xs font-semibold text-gray-800 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="All">All Statuses ({uniqueStatuses.length})</option>
                  {uniqueStatuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {(selectedDepartment !== 'All' || selectedStatus !== 'All' || activeFilter !== 'All' || searchQuery !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDepartment('All')
                    setSelectedStatus('All')
                    setActiveFilter('All')
                    setSearchQuery('')
                  }}
                  className="px-2.5 py-1 rounded bg-red-100 text-red-800 border border-red-200 hover:bg-red-200 text-xs font-bold transition flex items-center space-x-1 cursor-pointer uppercase tracking-wider"
                >
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search staff, ID, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
          </div>

          {/* Quick Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-200">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mr-1">Quick Filter:</span>
            {['All', 'Present', 'Late', 'Weekend', 'Overtime', 'Leave', 'Missed'].map((filter) => (
              <button
                type="button"
                key={filter}
                onClick={() => {
                  setActiveFilter(filter)
                  if (filter !== 'All') {
                    setSelectedStatus('All')
                  }
                }}
                className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
                  activeFilter === filter
                    ? 'bg-[#A31736] text-white border-[#A31736] shadow-xs'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto flex-1 relative [-webkit-overflow-scrolling:touch]">
          <table className="w-full text-left border-collapse min-w-[880px]">
            <thead>
              <tr className="bg-gray-100 border-y border-gray-300 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6 w-12 text-center">#</th>
                <th className="py-3 px-4 sm:px-6">EMPLOYEE NAME & ID</th>
                <th className="py-3 px-4 sm:px-6">DEPARTMENT</th>
                <th className="py-3 px-4 sm:px-6">SCHEDULED SHIFT</th>
                <th className="py-3 px-4 sm:px-6">CHECK-IN</th>
                <th className="py-3 px-4 sm:px-6">CHECK-OUT</th>
                <th className="py-3 px-4 sm:px-6">WORKED HRS & OT</th>
                <th className="py-3 px-4 sm:px-6">DEVICE SOURCE</th>
                <th className="py-3 px-4 sm:px-6">STATUS</th>
                <th className="py-3 px-4 sm:px-6 text-right">ACTION</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No biometric records found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, i) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-3 px-4 sm:px-6 font-mono text-xs font-semibold text-gray-500 text-center">
                      {i + 1}
                    </td>
                    <td className="py-3 px-4 sm:px-6">
                      <div className="font-bold text-gray-900 text-xs">{log.employeeName}</div>
                      <div className="text-[11px] text-gray-500 font-mono">
                        {log.employeeId} • {log.designation}
                      </div>
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-xs text-gray-800 font-medium whitespace-nowrap">
                      {log.department}
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-xs text-gray-700 whitespace-nowrap">
                      {log.shiftCode ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            {log.shiftCode}
                          </span>
                          <span className="font-semibold text-gray-800">{log.shiftTiming}</span>
                        </span>
                      ) : (
                        <span className="text-gray-500 font-medium">Standard (08:30-04:30)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-xs font-semibold text-gray-900 whitespace-nowrap">
                      <div>{log.checkIn}</div>
                      {log.lateMinutes && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1 rounded inline-block mt-0.5">
                          +{log.lateMinutes}m Late
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-xs font-semibold text-gray-900 whitespace-nowrap">
                      {log.checkOut}
                    </td>
                    <td className="py-3 px-4 sm:px-6 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-gray-900">{log.workingHours}</span>
                        {log.overtimeHours && (
                          <span className="text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-300 px-1.5 py-0.5 rounded">
                            +{log.overtimeHours} OT
                          </span>
                        )}
                        {log.isWeekend && (
                          <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 px-1.5 py-0.5 rounded">
                            Sat/Sun
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-xs text-gray-600 truncate max-w-[150px]">
                      {log.deviceLocation}
                    </td>
                    <td className="py-3 px-4 sm:px-6 whitespace-nowrap">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => navigate('/attendance/my-corrections')}
                        className="border border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white transition-all text-xs font-semibold px-3 py-1 rounded bg-white shadow-xs cursor-pointer uppercase tracking-wider"
                      >
                        Regularize
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Biometric Sync Modal */}
      <BiometricSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncComplete={() => setLastSyncText('Just now (142 records synced)')}
      />
    </div>
  )
}

export default AttendanceDashboardPage
