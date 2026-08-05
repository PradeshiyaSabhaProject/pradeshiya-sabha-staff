import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface TimecardRow {
  isWeekendWork?: boolean
  otHours?: string
  status: string
}

function getStatusBadgeStyle(row: TimecardRow): string {
  if (row.isWeekendWork) {
    return 'bg-indigo-100 text-indigo-900 border border-indigo-300'
  }
  if (row.otHours && row.otHours !== '0h 00m' && row.otHours !== '--' && row.otHours.includes('OT')) {
    return 'bg-orange-100 text-orange-900 border border-orange-300'
  }
  if (row.status.includes('Late')) {
    return 'bg-amber-100 text-amber-900 border border-amber-300'
  }
  if (row.status.includes('Leave')) {
    return 'bg-blue-100 text-blue-900 border border-blue-300'
  }
  return 'bg-green-100 text-green-900 border border-green-300'
}

export const TimecardsPage: React.FC = () => {
  const navigate = useNavigate()
  const [selectedEmp, setSelectedEmp] = useState('PS-EMP-0012')
  const [selectedMonth, setSelectedMonth] = useState('2026-07')

  const employeesList = [
    { id: 'PS-EMP-0012', name: 'Kasun Perera', title: 'Senior Revenue Inspector', department: 'Revenue & Finance Department' },
    { id: 'PS-EMP-0019', name: 'Nimali Fernando', title: 'Subject Clerk', department: 'Administration' },
    { id: 'PS-EMP-0034', name: 'Eng. Samantha Bandara', title: 'Technical Officer', department: 'Engineering Division' },
    { id: 'PS-EMP-0041', name: 'Chaminda Rathnayake', title: 'Public Health Inspector', department: 'Health & Sanitation' }
  ]

  const selectedEmpData = employeesList.find(e => e.id === selectedEmp) || employeesList[0]

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

  const timecardEntriesByEmp: Record<string, Array<{
    date: string
    shift: string
    checkIn: string
    checkOut: string
    workedHours: string
    otHours: string
    status: string
    device: string
    isWeekendWork?: boolean
  }>> = {
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

  const timecardEntries = timecardEntriesByEmp[selectedEmp] || timecardEntriesByEmp['PS-EMP-0012']

  const totalOtHoursCalc = timecardEntries.reduce((acc, row) => {
    const match = row.otHours.match(/^(\d+)h\s*(\d+)m/)
    if (match) {
      return acc + parseInt(match[1]) * 60 + parseInt(match[2])
    }
    return acc
  }, 0)
  const totalOtFormatted = `${Math.floor(totalOtHoursCalc / 60)}h ${totalOtHoursCalc % 60}m`
  const weekendDaysWorked = timecardEntries.filter((row) => row.isWeekendWork).length

  return (
    <div className="space-y-6 text-left pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Employee Monthly Timecards</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Audit daily biometric scan pairs, shift punctuality, half-day calculations, and regularization events.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-[320px]" ref={searchRef}>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                placeholder="Search by name or employee no..."
                className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm font-semibold text-gray-800 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            
            {isSearchOpen && (
              <div className="absolute z-10 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto py-1">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map(emp => (
                    <div
                      key={emp.id}
                      onClick={() => {
                        setSelectedEmp(emp.id)
                        setSearchQuery('')
                        setIsSearchOpen(false)
                      }}
                      className={`px-4 py-2.5 cursor-pointer transition-colors ${selectedEmp === emp.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className={`font-bold text-sm ${selectedEmp === emp.id ? 'text-blue-700' : 'text-gray-900'}`}>{emp.name}</div>
                          <div className="text-xs text-gray-500">{emp.title}</div>
                        </div>
                        <div className={`text-[10px] font-mono px-2 py-0.5 rounded ${selectedEmp === emp.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {emp.id}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No employees found
                  </div>
                )}
              </div>
            )}
          </div>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-semibold text-gray-800 w-full sm:w-auto"
          />
        </div>
      </div>

      {/* Employee KPI Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-lg sm:text-xl font-bold border border-blue-100 shrink-0 uppercase">
              {selectedEmpData.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">{selectedEmpData.name}</h2>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                  Active Officer
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                {selectedEmpData.id} • {selectedEmpData.department} • Shift: Council Standard (08:30 AM - 04:30 PM)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 text-center lg:text-right pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100">
            <div>
              <div className="text-[11px] text-gray-500 uppercase font-semibold">Working Days</div>
              <div className="text-lg sm:text-xl font-extrabold text-gray-900 mt-0.5">22</div>
            </div>
            <div>
              <div className="text-[11px] text-gray-500 uppercase font-semibold">Present</div>
              <div className="text-lg sm:text-xl font-extrabold text-emerald-600 mt-0.5">19</div>
            </div>
            <div>
              <div className="text-[11px] text-gray-500 uppercase font-semibold">Overtime (OT)</div>
              <div className="text-lg sm:text-xl font-extrabold text-orange-600 mt-0.5">{totalOtFormatted}</div>
            </div>
            <div>
              <div className="text-[11px] text-gray-500 uppercase font-semibold">Weekend Duties</div>
              <div className="text-lg sm:text-xl font-extrabold text-indigo-600 mt-0.5">{weekendDaysWorked} Days</div>
            </div>
            <div>
              <div className="text-[11px] text-gray-500 uppercase font-semibold">Late Entries</div>
              <div className="text-lg sm:text-xl font-extrabold text-amber-600 mt-0.5">1</div>
            </div>
            <div>
              <div className="text-[11px] text-gray-500 uppercase font-semibold">Approved Leave</div>
              <div className="text-lg sm:text-xl font-extrabold text-blue-600 mt-0.5">2 Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Timecard Log Table - Excel Spreadsheet UI (Brand Colors) */}
      <div className="bg-white rounded-2xl border border-gray-300 shadow-md overflow-hidden font-sans">
        {/* Workbook Top Title & Ribbon Bar */}
        <div className="bg-gradient-to-r from-[#801028] to-[#5c0b1c] px-5 py-3 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#4a0816]">
          <div className="flex items-center space-x-3">

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold tracking-wide">TIMECARD_JULY2026_EMP_{selectedEmp.replace('PS-EMP-', '')}.xlsx</h3>

              </div>
              <p className="text-[11px] text-red-200 mt-0.5">
                Daily Biometric Punch Grid
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
            <button
              type="button"
              onClick={() => alert('Exporting TIMECARD_JULY2026.xlsx spreadsheet...')}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-[#6a0d21] hover:bg-[#5c0b1c] text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 border border-[#941934] shadow-2xs cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5 shrink-0">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download .XLSX Workbook</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 border border-white/20 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5 shrink-0">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>Print Sheet</span>
            </button>
          </div>
        </div>


        {/* Excel Spreadsheet Grid */}
        <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch]">
          <table className="w-full text-left border-collapse font-mono text-xs min-w-[850px]">
            {/* Column Letter Headers (A, B, C...) */}
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-300 select-none">
                <th className="py-2 px-2 border-r border-gray-300 w-10 text-center bg-gray-200/80 text-gray-600">#</th>
                <th className="py-2 px-3 border-r border-gray-300 min-w-[140px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-sans font-extrabold mr-1">A</span>
                    <span className="font-sans uppercase text-[11px]">Date &amp; Day</span>
                  </div>
                </th>
                <th className="py-2 px-3 border-r border-gray-300 min-w-[180px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-sans font-extrabold mr-1">B</span>
                    <span className="font-sans uppercase text-[11px]">Shift Schedule</span>
                  </div>
                </th>
                <th className="py-2 px-3 border-r border-gray-300 text-right min-w-[110px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-sans font-extrabold mr-1">C</span>
                    <span className="font-sans uppercase text-[11px]">First In</span>
                  </div>
                </th>
                <th className="py-2 px-3 border-r border-gray-300 text-right min-w-[110px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-sans font-extrabold mr-1">D</span>
                    <span className="font-sans uppercase text-[11px]">Last Out</span>
                  </div>
                </th>
                <th className="py-2 px-3 border-r border-gray-300 text-right min-w-[110px] bg-red-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#801028] font-sans font-extrabold mr-1">E</span>
                    <span className="font-sans uppercase text-[11px] text-[#801028]">Worked Hrs</span>
                  </div>
                </th>
                <th className="py-2 px-3 border-r border-gray-300 text-right min-w-[130px] bg-orange-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-orange-600 font-sans font-extrabold mr-1">F</span>
                    <span className="font-sans uppercase text-[11px] text-orange-900">Overtime (OT)</span>
                  </div>
                </th>
                <th className="py-2 px-3 border-r border-gray-300 min-w-[160px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-sans font-extrabold mr-1">G</span>
                    <span className="font-sans uppercase text-[11px]">Status / Class</span>
                  </div>
                </th>
                <th className="py-2 px-3 border-r border-gray-300 min-w-[150px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-sans font-extrabold mr-1">H</span>
                    <span className="font-sans uppercase text-[11px]">Scanner Source</span>
                  </div>
                </th>
                <th className="py-2 px-3 text-center min-w-[100px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-sans font-extrabold mr-1">I</span>
                    <span className="font-sans uppercase text-[11px]">Action</span>
                  </div>
                </th>
              </tr>
            </thead>

            {/* Grid Body */}
            <tbody className="divide-y divide-gray-300">
              {timecardEntries.map((row, i) => (
                <tr
                  key={i}
                  className={`group hover:bg-red-50/30 transition cursor-pointer ${row.isWeekendWork ? 'bg-indigo-50/40' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                    }`}
                >
                  {/* Row Index Number (1, 2, 3...) */}
                  <td className="py-2.5 px-2 border-r border-gray-300 bg-gray-100 text-gray-600 text-center font-bold font-mono text-[11px] select-none group-hover:bg-[#801028]/15 group-hover:text-[#801028] transition">
                    {i + 1}
                  </td>

                  {/* Col A: Date */}
                  <td className="py-2.5 px-3 border-r border-gray-300 font-bold text-gray-900">
                    <div className="flex items-center justify-between">
                      <span>{row.date}</span>
                      {row.isWeekendWork && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-indigo-600 text-white font-sans">
                          SAT/SUN
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Col B: Shift */}
                  <td className="py-2.5 px-3 border-r border-gray-300 text-gray-700 truncate max-w-[200px]">
                    {row.shift}
                  </td>

                  {/* Col C: First In */}
                  <td className="py-2.5 px-3 border-r border-gray-300 text-right font-bold text-gray-900">
                    {row.checkIn}
                  </td>

                  {/* Col D: Last Out */}
                  <td className="py-2.5 px-3 border-r border-gray-300 text-right font-bold text-gray-900">
                    {row.checkOut}
                  </td>

                  {/* Col E: Worked Hours */}
                  <td className="py-2.5 px-3 border-r border-gray-300 text-right font-extrabold text-[#801028] bg-red-50/20 group-hover:bg-red-50/50">
                    {row.workedHours}
                  </td>

                  {/* Col F: Overtime */}
                  <td className="py-2.5 px-3 border-r border-gray-300 text-right font-extrabold bg-orange-50/30 group-hover:bg-orange-100/50">
                    {row.otHours && row.otHours !== '0h 00m' && row.otHours !== '--' ? (
                      <span className="text-orange-700 font-black">{row.otHours}</span>
                    ) : (
                      <span className="text-gray-400 font-normal">{row.otHours}</span>
                    )}
                  </td>

                  {/* Col G: Status */}
                  <td className="py-2.5 px-3 border-r border-gray-300 font-sans">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${getStatusBadgeStyle(row)}`}>
                      {row.status}
                    </span>
                  </td>

                  {/* Col H: Device */}
                  <td className="py-2.5 px-3 border-r border-gray-300 text-[11px] text-gray-600 truncate max-w-[180px]">
                    {row.device}
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

              {/* Bottom Formula / Summary Evaluation Row */}

            </tbody>
          </table>
        </div>


      </div>
    </div>
  )
}

