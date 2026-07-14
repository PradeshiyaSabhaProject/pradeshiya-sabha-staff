import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MOCK_BIOMETRIC_LOGS, type BiometricLog } from './data/mockAttendanceData'
import { BiometricSyncModal } from './components/BiometricSyncModal'

export const AttendanceDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState('2026-07-10')
  const [logs] = useState<BiometricLog[]>(MOCK_BIOMETRIC_LOGS)
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false)
  const [lastSyncText, setLastSyncText] = useState('Today at 08:45 AM')

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.department.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false
    if (activeFilter === 'All') return true
    if (activeFilter === 'Present') return log.status === 'Present'
    if (activeFilter === 'Late') return log.status === 'Late Entry'
    if (activeFilter === 'Leave') return log.status === 'Approved Leave' || log.status === 'Official Duty'
    if (activeFilter === 'Missed') return log.status === 'Missed Punch' || log.status === 'Absent'
    return true
  })

  const totalStaff = 142
  const presentCount = logs.filter((l) => l.status === 'Present' || l.status === 'Late Entry').length
  const lateCount = logs.filter((l) => l.status === 'Late Entry').length
  const leaveCount = logs.filter((l) => l.status === 'Approved Leave' || l.status === 'Official Duty').length

  const getStatusBadge = (status: BiometricLog['status']) => {
    switch (status) {
      case 'Present':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>
            Present
          </span>
        )
      case 'Late Entry':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5"></span>
            Late Entry
          </span>
        )
      case 'Approved Leave':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5"></span>
            Approved Leave
          </span>
        )
      case 'Official Duty':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mr-1.5"></span>
            Official Field Duty
          </span>
        )
      case 'Missed Punch':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5 animate-ping"></span>
            Missed Out Punch
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
            Absent
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 text-left pb-12 animate-fade-in">
      {/* Top Banner & Hardware Connectivity Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Staff Attendance & Biometric Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time daily attendance monitoring, fingerprint punch sync, timecards, and multi-level leave approval.
          </p>
        </div>

        <div className="flex items-center">
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Council Staff</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{totalStaff}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">Expected today</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Present Today (Punched)</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{presentCount}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">90.1% attendance rate</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Late Arrivals (&gt;8:45 AM)</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{lateCount}</p>
            <p className="text-xs text-amber-700 font-medium mt-1">Flagged for shift grace rule</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">On Leave / Official Duty</p>
            <p className="text-2xl font-extrabold text-purple-600 mt-1">{leaveCount}</p>
            <p className="text-xs text-purple-700 font-medium mt-1">Multi-level approved</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Roster & Filters Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header Bar */}
        <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Daily Biometric Attendance Roster</h2>
              <p className="text-xs text-gray-500">
                Live fingerprint punch records â€¢ Last synced: {lastSyncText}
              </p>
            </div>
            <div className="flex items-center space-x-1.5 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">
              <span className="text-xs font-semibold text-gray-500">Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-gray-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search staff or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="w-4 h-4 text-gray-400 absolute left-3 top-2.5"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              {['All', 'Present', 'Late', 'Leave', 'Missed'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeFilter === filter
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                <th className="py-3.5 px-5">Employee</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Check-In (Fingerprint)</th>
                <th className="py-3.5 px-4">Check-Out</th>
                <th className="py-3.5 px-4">Working Hours</th>
                <th className="py-3.5 px-4">Scanner Device</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/60 transition">
                  <td className="py-4 px-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center text-xs">
                        {log.employeeName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{log.employeeName}</div>
                        <div className="text-xs text-gray-500">{log.employeeId} â€¢ {log.designation}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-gray-700 font-medium">{log.department}</td>

                  <td className="py-4 px-4">
                    <div className="font-bold text-gray-900">{log.checkIn}</div>
                    {log.lateMinutes && (
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                        +{log.lateMinutes}m Late
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4 font-bold text-gray-900">{log.checkOut}</td>

                  <td className="py-4 px-4 font-semibold text-gray-700">{log.workingHours}</td>

                  <td className="py-4 px-4 text-xs text-gray-500">{log.deviceLocation}</td>

                  <td className="py-4 px-4">{getStatusBadge(log.status)}</td>

                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => navigate('/attendance/request-regularization')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                    >
                      Regularize / Note
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

