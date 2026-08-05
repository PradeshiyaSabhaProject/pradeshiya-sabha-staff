import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MOCK_BIOMETRIC_LOGS, type BiometricLog } from './data/mockAttendanceData'
import { BiometricSyncModal } from './components/BiometricSyncModal'

function getRowBackgroundClass(isWeekend: boolean | undefined, i: number): string {
  if (isWeekend) {
    return 'bg-indigo-50/40'
  }
  return i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
}

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

    // Quick Pill Category Filter
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
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-800 text-white border border-emerald-950 shadow-2xs tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 mr-1.5" />
            <span>Present</span>
          </span>
        )
      case 'Late Entry':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-800 text-white border border-amber-950 shadow-2xs tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300 mr-1.5" />
            <span>Late Entry</span>
          </span>
        )
      case 'Approved Leave':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-800 text-white border border-blue-950 shadow-2xs tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-300 mr-1.5" />
            <span>Approved Leave</span>
          </span>
        )
      case 'Official Duty':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-800 text-white border border-purple-950 shadow-2xs tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-300 mr-1.5" />
            <span>Official Field Duty</span>
          </span>
        )
      case 'Weekend Duty':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-800 text-white border border-indigo-950 shadow-2xs tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 mr-1.5 animate-pulse" />
            <span>Weekend Duty (Sat/Sun)</span>
          </span>
        )
      case 'Overtime':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-800 text-white border border-orange-950 shadow-2xs tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-300 mr-1.5" />
            <span>Present + Overtime</span>
          </span>
        )
      case 'Missed Punch':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-800 text-white border border-rose-950 shadow-2xs tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-300 mr-1.5 animate-ping" />
            <span>Missed Out Punch</span>
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-800 text-white border border-gray-950 shadow-2xs tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5" />
            <span>Absent</span>
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 text-left pb-12 animate-fade-in">
      {/* Top Banner / Breadcrumb area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Staff Attendance & Biometric Tracking</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time daily attendance monitoring, fingerprint punch sync, timecards, and multi-level leave approval.
          </p>
        </div>

        <div className="flex items-center w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsSyncModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            <span>Sync Biometric Punches</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Council Staff</p>
            <p className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-1">{totalStaff}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">Expected today</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
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
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Present Today (Punched)</p>
            <p className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-1">{presentCount}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">90.1% attendance rate</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 sm:w-6 sm:h-6">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Late Arrivals (&gt;8:45 AM)</p>
            <p className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-1">{lateCount}</p>
            <p className="text-xs text-amber-700 font-medium mt-1">Flagged for shift grace rule</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 sm:w-6 sm:h-6">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">On Leave / Official Duty</p>
            <p className="text-xl sm:text-2xl font-extrabold text-purple-600 mt-1">{leaveCount}</p>
            <p className="text-xs text-purple-700 font-medium mt-1">Multi-level approved</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 sm:w-6 sm:h-6">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Roster & Filters Card - Excel Spreadsheet UI (Brand Colors) */}
      <div className="bg-white rounded-2xl border border-gray-300 shadow-md overflow-hidden font-sans">
        {/* Workbook Top Title & Ribbon Bar */}
        <div className="bg-gradient-to-r from-[#801028] to-[#5c0b1c] px-5 py-3 text-white flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#4a0816]">
          <div className="flex flex-wrap items-center gap-3">

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold tracking-wide">BIOMETRIC DAILY ROSTER {selectedDate}</h3>
              </div>
              <p className="text-[11px] text-red-200 mt-0.5">Last synced: {lastSyncText}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="flex items-center space-x-1.5 bg-[#4a0816]/60 px-3 py-1 rounded-lg border border-[#6a0d21] flex-1 sm:flex-initial">
              <span className="text-xs font-semibold text-red-200 shrink-0">Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer w-full sm:w-auto"
              />
            </div>
            <button
              type="button"
              onClick={() => alert(`Exporting BIOMETRIC_DAILY_ROSTER_${selectedDate}.xlsx spreadsheet...`)}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-[#6a0d21] hover:bg-[#5c0b1c] text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 border border-[#941934] shadow-2xs cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5 shrink-0">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download .XLSX</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSyncModalOpen(true)}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 border border-white/20 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5 shrink-0">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>Force Sync</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center justify-center space-x-1 border border-white/20 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5 shrink-0">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Ribbon Toolbar */}
        <div className="bg-gray-100/90 px-4 py-3 border-b border-gray-300 space-y-2.5">
          {/* Top Row: Department Dropdown, Status Dropdown, and Search */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Department Dropdown */}
              <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-lg border border-gray-300 shadow-2xs">
                <span className="text-xs font-bold text-gray-500 uppercase">Dept:</span>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="bg-transparent text-xs font-bold text-gray-800 focus:outline-none cursor-pointer pr-1"
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
              <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-lg border border-gray-300 shadow-2xs">
                <span className="text-xs font-bold text-gray-500 uppercase">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value)
                    if (e.target.value !== 'All') {
                      setActiveFilter('All') // reset category pills so dropdown status takes exact effect
                    }
                  }}
                  className="bg-transparent text-xs font-bold text-gray-800 focus:outline-none cursor-pointer pr-1"
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
                  className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 border border-red-200 hover:bg-red-200 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                >
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search staff, ID, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#801028] shadow-2xs"
              />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>

          {/* Bottom Row: Quick Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-gray-200/80">
            <span className="text-xs font-bold text-gray-500 uppercase mr-1">Quick Category:</span>
            {['All', 'Present', 'Late', 'Weekend', 'Overtime', 'Leave', 'Missed'].map((filter) => (
              <button
                type="button"
                key={filter}
                onClick={() => {
                  setActiveFilter(filter)
                  if (filter !== 'All') {
                    setSelectedStatus('All') // reset exact status dropdown when clicking quick pill
                  }
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${activeFilter === filter
                  ? 'bg-[#801028] text-white border-[#6a0d21] shadow-2xs'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Excel Spreadsheet Grid Structure */}
        <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch]">
          <table className="w-full text-left border-collapse font-mono text-xs min-w-[900px]">
            {/* Column Letter Headers (A, B, C...) */}
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-300 select-none">
                <th className="py-2 px-2 border-r border-gray-300 w-10 text-center bg-gray-200/80 text-gray-600">#</th>
                <th className="py-2 px-3 border-r border-gray-300 min-w-[210px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-sans font-extrabold mr-1">A</span>
                    <span className="font-sans uppercase text-[11px]">Employee Name &amp; ID</span>
                  </div>
                </th>
                <th className="py-2 px-3 border-r border-gray-300 min-w-[160px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-sans font-extrabold mr-1">B</span>
                    <span className="font-sans uppercase text-[11px]">Department</span>
                  </div>
                </th>
                <th className="py-2 px-3 border-r border-gray-300 min-w-[170px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-sans font-extrabold mr-1">C</span>
                    <span className="font-sans uppercase text-[11px]">Scheduled Shift</span>
                  </div>
                </th>
                <th className="py-2 px-3 border-r border-gray-300 text-right min-w-[130px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-sans font-extrabold mr-1">D</span>
                    <span className="font-sans uppercase text-[11px]">Check-In (Fingerprint)</span>
                  </div>
                </th>
                <th className="py-2 px-3 border-r border-gray-300 text-right min-w-[110px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-sans font-extrabold mr-1">E</span>
                    <span className="font-sans uppercase text-[11px]">Check-Out</span>
                  </div>
                </th>
                <th className="py-2 px-3 border-r border-gray-300 text-right min-w-[150px] bg-red-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#801028] font-sans font-extrabold mr-1">F</span>
                    <span className="font-sans uppercase text-[11px] text-[#801028]">Worked Hrs &amp; OT</span>
                  </div>
                </th>
                <th className="py-2 px-3 border-r border-gray-300 min-w-[160px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-sans font-extrabold mr-1">G</span>
                    <span className="font-sans uppercase text-[11px]">Scanner Source</span>
                  </div>
                </th>
                <th className="py-2 px-3 border-r border-gray-300 min-w-[160px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-sans font-extrabold mr-1">H</span>
                    <span className="font-sans uppercase text-[11px]">Status</span>
                  </div>
                </th>
                <th className="py-2 px-3 text-center min-w-[120px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-sans font-extrabold mr-1">I</span>
                    <span className="font-sans uppercase text-[11px]">Action</span>
                  </div>
                </th>
              </tr>
            </thead>

            {/* Grid Body */}
            <tbody className="divide-y divide-gray-300">
              {filteredLogs.map((log, i) => (
                <tr
                  key={log.id}
                  className={`group hover:bg-red-50/30 transition cursor-pointer ${getRowBackgroundClass(log.isWeekend, i)}`}
                >
                  {/* Row Index Number (1, 2, 3...) */}
                  <td className="py-2.5 px-2 border-r border-gray-300 bg-gray-100 text-gray-600 text-center font-bold font-mono text-[11px] select-none group-hover:bg-[#801028]/15 group-hover:text-[#801028] transition">
                    {i + 1}
                  </td>

                  {/* Col A: Employee */}
                  <td className="py-2.5 px-3 border-r border-gray-300 font-sans">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded bg-gradient-to-br from-[#801028] to-[#5c0b1c] text-white font-bold flex items-center justify-center text-[10px] shrink-0 font-mono shadow-2xs">
                        {log.employeeName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="truncate max-w-[160px]">
                        <div className="font-bold text-gray-900 text-xs leading-tight">{log.employeeName}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{log.employeeId} • {log.designation}</div>
                      </div>
                    </div>
                  </td>

                  {/* Col B: Department */}
                  <td className="py-2.5 px-3 border-r border-gray-300 font-sans text-gray-700 text-xs truncate max-w-[150px]">
                    {log.department}
                  </td>

                  {/* Col C: Scheduled Shift */}
                  <td className="py-2.5 px-3 border-r border-gray-300 font-sans">
                    {log.shiftCode ? (
                      <div className="flex items-center space-x-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-600 text-white font-mono">
                          {log.shiftCode}
                        </span>
                        <span className="text-[11px] font-bold text-gray-900">{log.shiftTiming}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400 font-medium">Standard (08:30-04:30)</span>
                    )}
                  </td>

                  {/* Col D: Check-In */}
                  <td className="py-2.5 px-3 border-r border-gray-300 text-right">
                    <div className="font-bold text-gray-900">{log.checkIn}</div>
                    {log.lateMinutes && (
                      <span className="text-[9px] font-bold text-white bg-amber-800 border border-amber-950 px-1 py-0.2 rounded font-sans inline-block mt-0.5 shadow-2xs">
                        +{log.lateMinutes}m Late
                      </span>
                    )}
                  </td>

                  {/* Col E: Check-Out */}
                  <td className="py-2.5 px-3 border-r border-gray-300 text-right font-bold text-gray-900">
                    {log.checkOut}
                  </td>

                  {/* Col F: Worked Hrs & OT */}
                  <td className="py-2.5 px-3 border-r border-gray-300 text-right bg-red-50/20 group-hover:bg-red-50/50">
                    <div className="flex items-center justify-end space-x-1 flex-wrap gap-y-1 font-sans">
                      <span className="font-extrabold text-[#801028] font-mono text-xs">{log.workingHours}</span>
                      {log.overtimeHours && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-orange-800 text-white border border-orange-950 shadow-2xs">
                          +{log.overtimeHours} OT
                        </span>
                      )}
                      {log.isWeekend && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-800 text-white border border-indigo-950 shadow-2xs">
                          Sat/Sun
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Col G: Scanner Source */}
                  <td className="py-2.5 px-3 border-r border-gray-300 text-[11px] text-gray-600 truncate max-w-[150px] font-sans">
                    {log.deviceLocation}
                  </td>

                  {/* Col H: Status */}
                  <td className="py-2.5 px-3 border-r border-gray-300 font-sans">
                    {getStatusBadge(log.status)}
                  </td>

                  {/* Col I: Action */}
                  <td className="py-2.5 px-3 text-center font-sans">
                    <button
                      type="button"
                      onClick={() => navigate('/attendance/request-regularization')}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded border border-blue-200 transition cursor-pointer"
                    >
                      Regularize
                    </button>
                  </td>
                </tr>
              ))}
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

