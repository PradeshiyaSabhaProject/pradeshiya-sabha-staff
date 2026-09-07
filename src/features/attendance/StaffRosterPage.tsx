import React, { useState } from 'react'

interface ShiftTemplate {
  id: string
  code: string
  name: string
  timing: string
  colorClass: string
  badgeClass: string
}

const SHIFT_TEMPLATES: ShiftTemplate[] = [
  {
    id: 's-day',
    code: 'GEN',
    name: 'General Office Shift',
    timing: '08:30 - 04:30',
    colorClass: 'border-blue-300 bg-blue-50 text-blue-800',
    badgeClass: 'bg-[#1e3a8a] text-white'
  },
  {
    id: 's-morn',
    code: 'MRN',
    name: 'Morning Sanitation',
    timing: '06:00 - 02:00',
    colorClass: 'border-emerald-300 bg-emerald-50 text-emerald-800',
    badgeClass: 'bg-emerald-600 text-white'
  },
  {
    id: 's-eve',
    code: 'EVE',
    name: 'Evening Patrol',
    timing: '02:00 - 10:00',
    colorClass: 'border-amber-300 bg-amber-50 text-amber-800',
    badgeClass: 'bg-amber-600 text-white'
  },
  {
    id: 's-ngt',
    code: 'NGT',
    name: 'Night Security',
    timing: '10:00 - 06:00',
    colorClass: 'border-purple-300 bg-purple-50 text-purple-800',
    badgeClass: 'bg-purple-600 text-white'
  },
  {
    id: 's-wkd',
    code: 'WKD',
    name: 'Weekend Duty',
    timing: '08:30 - 02:30',
    colorClass: 'border-indigo-300 bg-indigo-50 text-indigo-800',
    badgeClass: 'bg-indigo-600 text-white'
  },
  {
    id: 's-ot',
    code: 'OT+',
    name: 'Extended Overtime',
    timing: '08:30 - 07:30',
    colorClass: 'border-orange-300 bg-orange-50 text-orange-800',
    badgeClass: 'bg-orange-600 text-white'
  },
  {
    id: 's-emg',
    code: 'EMG',
    name: 'Emergency Callout',
    timing: 'On-Call',
    colorClass: 'border-red-300 bg-red-50 text-red-800',
    badgeClass: 'bg-red-600 text-white'
  },
  {
    id: 's-off',
    code: 'OFF',
    name: 'Rest Day Off',
    timing: 'Rest Day',
    colorClass: 'border-gray-300 bg-gray-100 text-gray-600',
    badgeClass: 'bg-gray-400 text-white'
  }
]

const UNASSIGNED_TEMPLATE: ShiftTemplate = {
  id: 's-null',
  code: '-',
  name: 'Unassigned',
  timing: 'Not Set',
  colorClass: 'border-dashed border-gray-300 bg-gray-50 text-gray-400',
  badgeClass: 'bg-gray-300 text-gray-700'
}

const ALL_MONTHS = [
  'January 2026',
  'February 2026',
  'March 2026',
  'April 2026',
  'May 2026',
  'June 2026',
  'July 2026',
  'August 2026',
  'September 2026',
  'October 2026',
  'November 2026',
  'December 2026'
]

const CURRENT_MONTH_INDEX = 6 // July 2026 is current active month

const getMonthIndex = (monthStr: string) => {
  const name = monthStr.split(' ')[0]
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const idx = months.indexOf(name)
  return idx >= 0 ? idx : 6
}

const isPastMonth = (monthStr: string) => {
  return getMonthIndex(monthStr) < CURRENT_MONTH_INDEX
}

const getDaysInMonth = (monthStr: string) => {
  const yearStr = monthStr.split(' ')[1] || '2026'
  const year = Number.parseInt(yearStr, 10) || 2026
  const idx = getMonthIndex(monthStr)
  return new Date(year, idx + 1, 0).getDate()
}

const getDayOfWeekChar = (monthStr: string, dayNum: number) => {
  const yearStr = monthStr.split(' ')[1] || '2026'
  const year = Number.parseInt(yearStr, 10) || 2026
  const idx = getMonthIndex(monthStr)
  const date = new Date(year, idx, dayNum)
  return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]
}

const isWeekendDay = (monthStr: string, dayNum: number) => {
  const yearStr = monthStr.split(' ')[1] || '2026'
  const year = Number.parseInt(yearStr, 10) || 2026
  const idx = getMonthIndex(monthStr)
  const date = new Date(year, idx, dayNum)
  const day = date.getDay()
  return day === 0 || day === 6
}

interface CouncilEmployee {
  employeeId: string
  employeeName: string
  department: string
  avatarInitials: string
  defaultPattern: 'office' | 'morning' | 'night' | 'water'
}

const ALL_COUNCIL_EMPLOYEES: CouncilEmployee[] = [
  {
    employeeId: 'PS-EMP-0012',
    employeeName: 'Kasun Perera',
    department: 'Revenue & Finance',
    avatarInitials: 'KP',
    defaultPattern: 'office'
  },
  {
    employeeId: 'PS-EMP-0041',
    employeeName: 'Chaminda Rathnayake',
    department: 'Public Health & Sanitation',
    avatarInitials: 'CR',
    defaultPattern: 'morning'
  },
  {
    employeeId: 'PS-EMP-0063',
    employeeName: 'Sunil Ariyaratne',
    department: 'Municipal Security Desk',
    avatarInitials: 'SA',
    defaultPattern: 'night'
  },
  {
    employeeId: 'PS-EMP-0078',
    employeeName: 'W. D. Jayasinghe',
    department: 'Water Works & Engineering',
    avatarInitials: 'WJ',
    defaultPattern: 'water'
  },
  {
    employeeId: 'PS-EMP-0019',
    employeeName: 'Nimali Fernando',
    department: 'Administration',
    avatarInitials: 'NF',
    defaultPattern: 'office'
  },
  {
    employeeId: 'PS-EMP-0084',
    employeeName: 'Ajith Kumara',
    department: 'Public Health & Sanitation',
    avatarInitials: 'AK',
    defaultPattern: 'morning'
  },
  {
    employeeId: 'PS-EMP-0092',
    employeeName: 'Sanduni Silva',
    department: 'Revenue & Finance',
    avatarInitials: 'SS',
    defaultPattern: 'office'
  }
]

interface MonthlyRosterRow {
  employeeId: string
  employeeName: string
  department: string
  avatarInitials: string
  month: string
  days: Record<number, string>
}

function getOfficeShift(d: number, weekend: boolean): string {
  if (d === 4 || d === 11 || d === 18) return 'WKD'
  if (d === 9 || d === 23) return 'OT+'
  return weekend ? 'OFF' : 'GEN'
}

function getMorningShift(d: number, weekend: boolean): string {
  if (d === 5 || d === 12 || d === 26) return 'EMG'
  if (d === 11 || d === 25) return 'WKD'
  return (d % 7 === 5 || weekend) ? 'OFF' : 'MRN'
}

function getNightShift(d: number): string {
  const cycle = d % 6
  return cycle < 4 ? 'NGT' : 'OFF'
}

function getWaterShift(d: number): string {
  if (d === 11 || d === 19) return 'OT+'
  const cycle = d % 4
  if (cycle === 0) return 'OFF'
  if (cycle === 1) return 'MRN'
  if (cycle === 2) return 'EVE'
  return 'GEN'
}

const generatePattern = (
  patternType: 'office' | 'morning' | 'night' | 'water',
  monthStr: string = 'July 2026'
) => {
  const totalDays = getDaysInMonth(monthStr)
  const days: Record<number, string> = {}
  for (let d = 1; d <= totalDays; d++) {
    const weekend = isWeekendDay(monthStr, d)
    if (patternType === 'office') {
      days[d] = getOfficeShift(d, weekend)
    } else if (patternType === 'morning') {
      days[d] = getMorningShift(d, weekend)
    } else if (patternType === 'night') {
      days[d] = getNightShift(d)
    } else {
      days[d] = getWaterShift(d)
    }
  }
  return days
}

const createFullCouncilRosterForMonth = (monthStr: string): MonthlyRosterRow[] =>
  ALL_COUNCIL_EMPLOYEES.map((emp) => ({
    employeeId: emp.employeeId,
    employeeName: emp.employeeName,
    department: emp.department,
    avatarInitials: emp.avatarInitials,
    month: monthStr,
    days: generatePattern(emp.defaultPattern, monthStr)
  }))

const INITIAL_MONTHLY_ROSTER: MonthlyRosterRow[] = [
  ...createFullCouncilRosterForMonth('July 2026'),
  ...createFullCouncilRosterForMonth('August 2026'),
  ...createFullCouncilRosterForMonth('June 2026')
]

export const StaffRosterPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('July 2026')
  const [rosterData, setRosterData] = useState<MonthlyRosterRow[]>(INITIAL_MONTHLY_ROSTER)
  const [selectedDept, setSelectedDept] = useState('All')

  const [editingCell, setEditingCell] = useState<{
    empId: string
    day: number
  } | null>(null)

  const isCurrentMonthLocked = isPastMonth(selectedMonth)

  const handleCellChange = (empId: string, dayNum: number, newCode: string) => {
    if (isCurrentMonthLocked) return
    const hasRow = rosterData.some((r) => r.employeeId === empId && r.month === selectedMonth)
    if (hasRow) {
      setRosterData(
        rosterData.map((row) => {
          if (row.employeeId !== empId || row.month !== selectedMonth) return row
          return {
            ...row,
            days: {
              ...row.days,
              [dayNum]: newCode
            }
          }
        })
      )
    } else {
      const emp = ALL_COUNCIL_EMPLOYEES.find((e) => e.employeeId === empId)
      if (!emp) return
      const newRow: MonthlyRosterRow = {
        employeeId: emp.employeeId,
        employeeName: emp.employeeName,
        department: emp.department,
        avatarInitials: emp.avatarInitials,
        month: selectedMonth,
        days: {
          [dayNum]: newCode
        }
      }
      setRosterData([...rosterData, newRow])
    }
    setEditingCell(null)
  }

  const handleInitializeMonthRoster = (monthStr: string) => {
    if (isPastMonth(monthStr)) return
    const existingIds = new Set(
      rosterData.filter((r) => r.month === monthStr).map((r) => r.employeeId)
    )
    const newStaffRows = createFullCouncilRosterForMonth(monthStr).filter(
      (r) => !existingIds.has(r.employeeId)
    )
    setRosterData([...rosterData, ...newStaffRows])
  }

  const filteredEmployees = ALL_COUNCIL_EMPLOYEES.filter((emp) => {
    if (selectedDept === 'All') return true
    return emp.department.includes(selectedDept)
  })

  const daysInCurrentMonth = getDaysInMonth(selectedMonth)
  const monthDays = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1)

  const getShiftDetails = (code: string): ShiftTemplate => {
    if (!code || code === '-' || code === 'NULL') return UNASSIGNED_TEMPLATE
    return SHIFT_TEMPLATES.find((t) => t.code === code) || UNASSIGNED_TEMPLATE
  }

  const monthHasAnyRoster = rosterData.some((r) => r.month === selectedMonth)

  return (
    <div className="space-y-6 text-left pb-8 animate-fade-in">
      {/* ── 1. Top Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Monthly Duty Rosters &amp; Scheduling
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Select a month to audit shift assignments across all departments and edit daily schedules.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 rounded border border-gray-300 bg-white text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#1e3a8a] cursor-pointer"
          >
            {ALL_MONTHS.map((m) => {
              const past = isPastMonth(m)
              return (
                <option key={m} value={m}>
                  {m} ({getDaysInMonth(m)} Days) {past ? '🔒 Locked' : ''}
                </option>
              )
            })}
          </select>

          {!monthHasAnyRoster && !isCurrentMonthLocked && (
            <button
              type="button"
              onClick={() => handleInitializeMonthRoster(selectedMonth)}
              className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer"
            >
              + Initialize Roster
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Shift Templates Palette (Overview Style Card) ─────────── */}
      <div className="bg-white border border-gray-300 rounded p-4 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">Shift Codes &amp; Timing Reference</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {SHIFT_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className={`rounded border p-2 flex flex-col justify-between ${tpl.colorClass}`}
            >
              <div className="flex items-center justify-between">
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${tpl.badgeClass}`}>
                  {tpl.code}
                </span>
                <span className="text-[10px] font-semibold opacity-80">{tpl.timing}</span>
              </div>
              <div className="text-[11px] font-bold mt-1.5 truncate">{tpl.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Filters Toolbar ────────────────────────────────────────── */}
      <div className="bg-white border border-gray-300 rounded p-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-2.5 py-1 rounded border border-gray-300 bg-white text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#1e3a8a] cursor-pointer"
          >
            <option value="All">All Departments</option>
            <option value="Revenue">Revenue &amp; Finance</option>
            <option value="Sanitation">Public Health &amp; Sanitation</option>
            <option value="Security">Municipal Security</option>
            <option value="Water Works">Water Works &amp; Engineering</option>
            <option value="Administration">Administration</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {isCurrentMonthLocked ? (
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded uppercase tracking-wide">
              🔒 Past Month (Read-Only)
            </span>
          ) : (
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded uppercase tracking-wide">
              {selectedMonth} (Active &amp; Editable)
            </span>
          )}
        </div>
      </div>

      {/* ── 4. Main Roster Grid Table Container (Overview Table Style) ─── */}
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide">
              Staff Shift Calendar — {selectedMonth}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Click any cell to update or assign duty shift</p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold px-3.5 py-1.5 rounded border border-gray-300 transition-colors uppercase tracking-wider cursor-pointer"
          >
            Print Roster
          </button>
        </div>

        <div className="overflow-x-auto flex-1 relative [-webkit-overflow-scrolling:touch]">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-gray-100 border-y border-gray-300 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4 min-w-[210px] sticky left-0 bg-gray-100 z-10 border-r border-gray-300">
                  OFFICER &amp; DEPARTMENT
                </th>
                {monthDays.map((d) => {
                  const weekend = isWeekendDay(selectedMonth, d)
                  const char = getDayOfWeekChar(selectedMonth, d)
                  return (
                    <th
                      key={d}
                      className={`py-2 px-1 text-center min-w-[36px] border-r border-gray-200 ${
                        weekend ? 'bg-amber-100/70 text-amber-900' : ''
                      }`}
                    >
                      <div>{d}</div>
                      <div className="text-[9px] font-normal opacity-70">{char}</div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs">
              {filteredEmployees.map((emp) => {
                const existingRow = rosterData.find(
                  (r) => r.employeeId === emp.employeeId && r.month === selectedMonth
                )

                return (
                  <tr key={`${selectedMonth}-${emp.employeeId}`} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-2.5 px-4 sticky left-0 bg-white z-10 border-r border-gray-300 group-hover:bg-gray-50">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded bg-blue-50 text-[#1e3a8a] font-bold flex items-center justify-center text-[10px] border border-blue-200 shrink-0 font-mono uppercase">
                          {emp.avatarInitials}
                        </div>
                        <div className="truncate max-w-[145px]">
                          <div className="font-bold text-gray-900 truncate text-xs">{emp.employeeName}</div>
                          <div className="text-[10px] text-gray-500 truncate font-mono">
                            {emp.employeeId} • {emp.department}
                          </div>
                        </div>
                      </div>
                    </td>

                    {monthDays.map((d) => {
                      const shiftCode = existingRow?.days[d] ?? ''
                      const shiftTpl = getShiftDetails(shiftCode)
                      const isEditing = editingCell?.empId === emp.employeeId && editingCell?.day === d
                      const weekend = isWeekendDay(selectedMonth, d)

                      return (
                        <td
                          key={d}
                          className={`py-1.5 px-0.5 text-center relative border-r border-gray-200 ${
                            weekend ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          {isEditing && !isCurrentMonthLocked ? (
                            <div className="absolute inset-0 z-20 bg-white border border-[#1e3a8a] rounded p-0.5 shadow-md flex items-center justify-center">
                              <select
                                autoFocus
                                value={shiftCode}
                                onChange={(e) => handleCellChange(emp.employeeId, d, e.target.value)}
                                onBlur={() => setEditingCell(null)}
                                className="text-[10px] font-bold bg-blue-50 text-[#1e3a8a] rounded px-0.5 py-0.2 border border-blue-300 outline-none cursor-pointer"
                              >
                                <option value="">- (Null)</option>
                                {SHIFT_TEMPLATES.map((t) => (
                                  <option key={t.code} value={t.code}>
                                    {t.code}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={isCurrentMonthLocked}
                              onClick={() => {
                                if (!isCurrentMonthLocked) {
                                  setEditingCell({ empId: emp.employeeId, day: d })
                                }
                              }}
                              className={`w-full py-0.5 px-0.5 rounded border text-[10px] font-bold transition-all ${
                                isCurrentMonthLocked
                                  ? 'cursor-not-allowed opacity-80'
                                  : 'hover:scale-105 cursor-pointer shadow-2xs'
                              } ${shiftTpl.colorClass}`}
                              title={
                                isCurrentMonthLocked
                                  ? `Past Month Locked (${selectedMonth})`
                                  : `Day ${d}: ${shiftTpl.name}`
                              }
                            >
                              {shiftTpl.code}
                            </button>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default StaffRosterPage
