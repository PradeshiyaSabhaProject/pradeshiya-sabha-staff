import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface TimecardRow {
  date: string
  shift: string
  checkIn: string
  checkOut: string
  workedHours: string
  otHours: string
  status: string
  device: string
  isWeekendWork?: boolean
}

function getStatusBadgeClass(row: TimecardRow): string {
  if (row.isWeekendWork) {
    return 'bg-indigo-100 text-indigo-800 border-indigo-300'
  }
  if (row.status.includes('Unauthorized') || row.status.includes('No-Pay')) {
    return 'bg-red-100 text-red-700 border-red-300'
  }
  if (row.otHours && row.otHours !== '0h 00m' && row.otHours !== '--' && row.otHours.includes('OT')) {
    return 'bg-orange-100 text-orange-800 border-orange-300'
  }
  if (row.status.includes('Late')) {
    return 'bg-amber-100 text-amber-800 border-amber-300'
  }
  if (row.status.includes('Leave')) {
    return 'bg-blue-100 text-blue-800 border-blue-300'
  }
  return 'bg-emerald-100 text-emerald-800 border-emerald-300'
}

const employeesList = [
  { id: 'PS-EMP-0012', name: 'Kasun Perera', title: 'Senior Revenue Inspector', department: 'Revenue & Finance Department' },
  { id: 'PS-EMP-0019', name: 'Nimali Fernando', title: 'Subject Clerk', department: 'Administration' },
  { id: 'PS-EMP-0034', name: 'Eng. Samantha Bandara', title: 'Technical Officer', department: 'Engineering Division' },
  { id: 'PS-EMP-0041', name: 'Chaminda Rathnayake', title: 'Public Health Inspector', department: 'Health & Sanitation' }
]

const timecardEntriesByEmp: Record<string, TimecardRow[]> = {
  'PS-EMP-0012': [
    {
      date: '2026-07-12 (Sun)',
      shift: 'Weekend Off / Rest Day',
      checkIn: '--:--',
      checkOut: '--:--',
      workedHours: '0h 00m',
      otHours: '0h 00m',
      status: 'Weekend Rest Day',
      device: 'N/A'
    },
    {
      date: '2026-07-11 (Sat)',
      shift: '08:30 AM - 02:30 PM (Saturday Special)',
      checkIn: '08:25 AM',
      checkOut: '02:35 PM',
      workedHours: '6h 10m',
      otHours: '6h 10m (1.5x Sat Rate)',
      status: 'Weekend Duty (Budget Drive)',
      device: 'Main Gate ZKTeco F18 #1',
      isWeekendWork: true
    },
    {
      date: '2026-07-10 (Fri)',
      shift: '08:30 AM - 04:30 PM',
      checkIn: '08:22 AM',
      checkOut: '06:35 PM',
      workedHours: '10h 13m',
      otHours: '2h 00m (OT)',
      status: 'Present + Overtime',
      device: 'Main Gate ZKTeco F18 #1'
    },
    {
      date: '2026-07-09 (Thu)',
      shift: '08:30 AM - 04:30 PM',
      checkIn: '08:29 AM',
      checkOut: '04:40 PM',
      workedHours: '8h 11m',
      otHours: '0h 10m',
      status: 'Present - Full Day (Regularized)',
      device: 'Manual Correction (Approved)'
    },
    {
      date: '2026-07-08 (Wed)',
      shift: '08:30 AM - 04:30 PM',
      checkIn: '08:48 AM',
      checkOut: '04:32 PM',
      workedHours: '7h 44m',
      otHours: '0h 00m',
      status: 'Late Entry (18m)',
      device: 'ZKTeco F18 #2'
    },
    {
      date: '2026-07-07 (Tue)',
      shift: '08:30 AM - 04:30 PM',
      checkIn: '--:--',
      checkOut: '--:--',
      workedHours: '0h 00m',
      otHours: '0h 00m',
      status: 'Approved Leave (Annual)',
      device: 'Leave System'
    },
    {
      date: '2026-07-06 (Mon)',
      shift: '08:30 AM - 04:30 PM',
      checkIn: '08:18 AM',
      checkOut: '06:00 PM',
      workedHours: '9h 42m',
      otHours: '1h 30m (OT)',
      status: 'Present + Overtime',
      device: 'Main Gate ZKTeco F18 #1'
    },
    {
      date: '2026-07-05 (Sun)',
      shift: '08:30 AM - 04:30 PM (Special Sunday Callout)',
      checkIn: '08:40 AM',
      checkOut: '04:40 PM',
      workedHours: '8h 00m',
      otHours: '--',
      status: 'Sunday Emergency Duty (Regularized)',
      device: 'ZKTeco F18 #1',
      isWeekendWork: true
    },
    {
      date: '2026-07-04 (Sat)',
      shift: '08:30 AM - 02:30 PM (Saturday Shift)',
      checkIn: '08:28 AM',
      checkOut: '02:35 PM',
      workedHours: '6h 07m',
      otHours: '--',
      status: 'Saturday Weekend Duty',
      device: 'ZKTeco F18 #1',
      isWeekendWork: true
    }
  ],
  'PS-EMP-0041': [
    {
      date: '2026-07-12 (Sun)',
      shift: '06:00 AM - 01:00 PM (Emergency Sunday Drive)',
      checkIn: '06:05 AM',
      checkOut: '01:15 PM',
      workedHours: '7h 10m',
      otHours: '--',
      status: 'Sunday Emergency Weekend Duty',
      device: 'Sanitation Depot Bio #3',
      isWeekendWork: true
    },
    {
      date: '2026-07-11 (Sat)',
      shift: '06:00 AM - 02:00 PM',
      checkIn: '05:58 AM',
      checkOut: '02:05 PM',
      workedHours: '8h 07m',
      otHours: '--',
      status: 'Saturday Sanitation Duty',
      device: 'Sanitation Depot Bio #3',
      isWeekendWork: true
    },
    {
      date: '2026-07-10 (Fri)',
      shift: '06:00 AM - 02:00 PM',
      checkIn: '06:14 AM',
      checkOut: '02:05 PM',
      workedHours: '7h 51m',
      otHours: '0h 00m',
      status: 'Late Entry (14m)',
      device: 'Sanitation Depot Bio #3'
    }
  ]
}

export const TimecardsPage: React.FC = () => {
  const navigate = useNavigate()
  const [selectedEmp, setSelectedEmp] = useState('PS-EMP-0012')
  const [selectedMonth, setSelectedMonth] = useState('2026-07')

  const selectedEmpData = employeesList.find((e) => e.id === selectedEmp) || employeesList[0]

  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredEmployees = employeesList.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const timecardEntries = timecardEntriesByEmp[selectedEmp] || timecardEntriesByEmp['PS-EMP-0012']

  const totalOtHoursCalc = timecardEntries.reduce((acc, row) => {
    const match = /^(\d+)h\s*(\d+)m/.exec(row.otHours)
    if (match) {
      return acc + Number.parseInt(match[1], 10) * 60 + Number.parseInt(match[2], 10)
    }
    return acc
  }, 0)
  const totalOtFormatted = `${Math.floor(totalOtHoursCalc / 60)}h ${totalOtHoursCalc % 60}m`
  const weekendDaysWorked = timecardEntries.filter((row) => row.isWeekendWork).length

  return (
    <div className="space-y-6 text-left pb-8 animate-fade-in">
      {/* ── 1. Top Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Employee Monthly Timecards
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Audit daily biometric scan pairs, shift punctuality, overtime hours, and regularization history.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Employee Search / Selector */}
          <div className="relative w-full sm:w-[280px]" ref={searchRef}>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setIsSearchOpen(true)
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search employee..."
                className="w-full pl-8 pr-3 py-1.5 rounded border border-gray-300 bg-white text-xs font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
              />
            </div>

            {isSearchOpen && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded shadow-md max-h-60 overflow-auto py-1">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <button
                      type="button"
                      key={emp.id}
                      onClick={() => {
                        setSelectedEmp(emp.id)
                        setSearchQuery('')
                        setIsSearchOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 transition-colors border-b border-gray-100 last:border-0 ${
                        selectedEmp === emp.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className={`font-bold text-xs ${selectedEmp === emp.id ? 'text-[#1e3a8a]' : 'text-gray-900'}`}>
                            {emp.name}
                          </div>
                          <div className="text-[11px] text-gray-500">{emp.title}</div>
                        </div>
                        <div className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                          {emp.id}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-gray-500 text-center">No employees found</div>
                )}
              </div>
            )}
          </div>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 rounded border border-gray-300 bg-white text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#1e3a8a]"
          />

          <button
            type="button"
            onClick={() => alert(`Exporting TIMECARD_${selectedMonth}_${selectedEmp}.csv...`)}
            className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer text-center whitespace-nowrap"
          >
            Export Timecard
          </button>
        </div>
      </div>

      {/* ── 2. Officer Details & Monthly Summary Card (Overview Style) ─── */}
      <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded bg-blue-50 text-[#1e3a8a] flex items-center justify-center text-sm font-bold border border-blue-200 shrink-0 uppercase font-mono">
              {selectedEmpData.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900 uppercase">{selectedEmpData.name}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border bg-emerald-100 text-emerald-800 border-emerald-300">
                  Active Officer
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                <span className="font-mono font-bold text-gray-700">{selectedEmpData.id}</span> • {selectedEmpData.department} • Standard Shift (08:30 - 04:30)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center lg:text-right pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-200">
            <div>
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Working Days</div>
              <div className="text-lg font-extrabold text-gray-900 mt-0.5">22</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Present</div>
              <div className="text-lg font-extrabold text-emerald-700 mt-0.5">19</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Overtime (OT)</div>
              <div className="text-lg font-extrabold text-orange-700 mt-0.5">{totalOtFormatted}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Weekend Work</div>
              <div className="text-lg font-extrabold text-indigo-700 mt-0.5">{weekendDaysWorked} Days</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Late Entries</div>
              <div className="text-lg font-extrabold text-amber-700 mt-0.5">1</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Approved Leave</div>
              <div className="text-lg font-extrabold text-[#1e3a8a] mt-0.5">2 Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Timecard Entries Table (Overview Style) ────────────────── */}
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide">
              Timecard Punch Ledger — {selectedMonth}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Showing daily biometric scan pairs and attendance classification</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold px-3.5 py-1.5 rounded border border-gray-300 transition-colors uppercase tracking-wider cursor-pointer text-center"
            >
              Print Sheet
            </button>
            <button
              type="button"
              onClick={() => navigate('/attendance/my-corrections')}
              className="border border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white transition-all text-xs font-semibold px-3.5 py-1.5 rounded bg-white shadow-xs cursor-pointer uppercase tracking-wider"
            >
              Request Regularization
            </button>
          </div>
        </div>

        <div className="overflow-x-auto flex-1 relative [-webkit-overflow-scrolling:touch]">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-gray-100 border-y border-gray-300 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6 w-12 text-center">#</th>
                <th className="py-3 px-4 sm:px-6">DATE & DAY</th>
                <th className="py-3 px-4 sm:px-6">SHIFT SCHEDULE</th>
                <th className="py-3 px-4 sm:px-6">FIRST IN</th>
                <th className="py-3 px-4 sm:px-6">LAST OUT</th>
                <th className="py-3 px-4 sm:px-6">WORKED HRS</th>
                <th className="py-3 px-4 sm:px-6">OVERTIME (OT)</th>
                <th className="py-3 px-4 sm:px-6">STATUS / CLASS</th>
                <th className="py-3 px-4 sm:px-6">DEVICE SOURCE</th>
                <th className="py-3 px-4 sm:px-6 text-right">ACTION</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 text-sm">
              {timecardEntries.map((row, i) => (
                <tr key={row.date} className="hover:bg-gray-50 transition-colors group">
                  <td className="py-3 px-4 sm:px-6 font-mono text-xs font-semibold text-gray-500 text-center">
                    {i + 1}
                  </td>
                  <td className="py-3 px-4 sm:px-6 font-bold text-gray-900 text-xs whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span>{row.date}</span>
                      {row.isWeekendWork && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 uppercase">
                          SAT/SUN
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-xs text-gray-700 whitespace-nowrap">
                    {row.shift}
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-xs font-semibold text-gray-900 whitespace-nowrap">
                    {row.checkIn}
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-xs font-semibold text-gray-900 whitespace-nowrap">
                    {row.checkOut}
                  </td>
                  <td className="py-3 px-4 sm:px-6 font-mono text-xs font-bold text-gray-900 whitespace-nowrap">
                    {row.workedHours}
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-xs whitespace-nowrap">
                    {row.otHours && row.otHours !== '0h 00m' && row.otHours !== '--' ? (
                      <span className="font-bold text-orange-700">{row.otHours}</span>
                    ) : (
                      <span className="text-gray-400 font-normal">{row.otHours}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 sm:px-6 whitespace-nowrap">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide inline-block border ${getStatusBadgeClass(row)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-xs text-gray-600 truncate max-w-[160px]">
                    {row.device}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TimecardsPage
