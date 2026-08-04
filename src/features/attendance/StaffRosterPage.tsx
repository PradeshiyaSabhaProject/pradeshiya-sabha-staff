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
    timing: '08:30 AM - 04:30 PM',
    colorClass: 'border-blue-200 bg-blue-50/70 text-blue-800',
    badgeClass: 'bg-blue-600 text-white'
  },
  {
    id: 's-morn',
    code: 'MRN',
    name: 'Early Morning Sanitation',
    timing: '06:00 AM - 02:00 PM',
    colorClass: 'border-emerald-200 bg-emerald-50/70 text-emerald-800',
    badgeClass: 'bg-emerald-600 text-white'
  },
  {
    id: 's-eve',
    code: 'EVE',
    name: 'Evening Patrol / Works',
    timing: '02:00 PM - 10:00 PM',
    colorClass: 'border-amber-200 bg-amber-50/70 text-amber-800',
    badgeClass: 'bg-amber-600 text-white'
  },
  {
    id: 's-ngt',
    code: 'NGT',
    name: 'Night Security / Desk',
    timing: '10:00 PM - 06:00 AM',
    colorClass: 'border-purple-200 bg-purple-50/70 text-purple-800',
    badgeClass: 'bg-purple-600 text-white'
  },
  {
    id: 's-wkd',
    code: 'WKD',
    name: 'Weekend Special Duty',
    timing: '08:30 AM - 02:30 PM (Sat/Sun)',
    colorClass: 'border-indigo-200 bg-indigo-50/70 text-indigo-800',
    badgeClass: 'bg-indigo-600 text-white'
  },
  {
    id: 's-ot',
    code: 'OT+',
    name: 'Extended Overtime Shift',
    timing: '08:30 AM - 07:30 PM (+3h OT)',
    colorClass: 'border-orange-200 bg-orange-50/70 text-orange-800',
    badgeClass: 'bg-orange-600 text-white'
  },
  {
    id: 's-emg',
    code: 'EMG',
    name: 'Emergency Callout',
    timing: 'On-Call 2.0x Rate',
    colorClass: 'border-rose-200 bg-rose-50/70 text-rose-800',
    badgeClass: 'bg-rose-600 text-white'
  },
  {
    id: 's-off',
    code: 'OFF',
    name: 'Weekly / Rest Day Off',
    timing: 'Rest Day',
    colorClass: 'border-gray-200 bg-gray-100 text-gray-500',
    badgeClass: 'bg-gray-400 text-white'
  }
]

const UNASSIGNED_TEMPLATE: ShiftTemplate = {
  id: 's-null',
  code: '-',
  name: 'Unassigned (Null)',
  timing: 'Not Assigned',
  colorClass: 'border-dashed border-gray-300 bg-gray-50/60 text-gray-400 hover:border-gray-400 hover:text-gray-600',
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

const CURRENT_MONTH_INDEX = 6 // July 2026 is current active month (0-indexed: Jan=0...Jun=5, Jul=6)

const getMonthIndex = (monthStr: string) => {
  const name = monthStr.split(' ')[0]
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const idx = months.indexOf(name)
  return idx >= 0 ? idx : 6 // Default July
}

const isPastMonth = (monthStr: string) => {
  return getMonthIndex(monthStr) < CURRENT_MONTH_INDEX
}

const getDaysInMonth = (monthStr: string) => {
  const yearStr = monthStr.split(' ')[1] || '2026'
  const year = parseInt(yearStr, 10) || 2026
  const idx = getMonthIndex(monthStr)
  return new Date(year, idx + 1, 0).getDate()
}

const getDayOfWeekChar = (monthStr: string, dayNum: number) => {
  const yearStr = monthStr.split(' ')[1] || '2026'
  const year = parseInt(yearStr, 10) || 2026
  const idx = getMonthIndex(monthStr)
  const date = new Date(year, idx, dayNum)
  return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]
}

const isWeekendDay = (monthStr: string, dayNum: number) => {
  const yearStr = monthStr.split(' ')[1] || '2026'
  const year = parseInt(yearStr, 10) || 2026
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
  days: Record<number, string> // day (1 to 31) -> shiftCode
}

// Generate default shifts for any given month
const generatePattern = (
  patternType: 'office' | 'morning' | 'night' | 'water',
  monthStr: string = 'July 2026'
) => {
  const totalDays = getDaysInMonth(monthStr)
  const days: Record<number, string> = {}
  for (let d = 1; d <= totalDays; d++) {
    const weekend = isWeekendDay(monthStr, d)
    if (patternType === 'office') {
      if (d === 4 || d === 11 || d === 18) {
        days[d] = 'WKD' // Saturday special work
      } else if (d === 9 || d === 23) {
        days[d] = 'OT+' // Overtime weekday
      } else {
        days[d] = weekend ? 'OFF' : 'GEN'
      }
    } else if (patternType === 'morning') {
      if (d === 5 || d === 12 || d === 26) {
        days[d] = 'EMG' // Sunday emergency callout
      } else if (d === 11 || d === 25) {
        days[d] = 'WKD' // Saturday duty
      } else {
        days[d] = (d % 7 === 5 || weekend) ? 'OFF' : 'MRN'
      }
    } else if (patternType === 'night') {
      const cycle = d % 6
      days[d] = cycle < 4 ? 'NGT' : 'OFF'
    } else {
      if (d === 11 || d === 19) {
        days[d] = 'OT+'
      } else {
        const cycle = d % 4
        let shiftCode = 'GEN'
        if (cycle === 0) {
          shiftCode = 'OFF'
        } else if (cycle === 1) {
          shiftCode = 'MRN'
        } else if (cycle === 2) {
          shiftCode = 'EVE'
        }
        days[d] = shiftCode
      }
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

  // Quick cell editor state
  const [editingCell, setEditingCell] = useState<{
    empId: string
    day: number
  } | null>(null)

  const isCurrentMonthLocked = isPastMonth(selectedMonth)

  const handleCellChange = (empId: string, dayNum: number, newCode: string) => {
    if (isCurrentMonthLocked) return // Prevent edit if past month
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

  // Check if month has any generated roster rows
  const monthHasAnyRoster = rosterData.some((r) => r.month === selectedMonth)

  return (
    <div className="space-y-6 text-left pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Monthly Duty Rosters & Scheduling</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Select a month to view all Council employees and edit their shifts individually.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm font-bold text-gray-800 shadow-xs cursor-pointer"
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
              className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md transition flex items-center space-x-2 cursor-pointer"
            >
              <span>+ Initialize All Staff Roster</span>
            </button>
          )}
        </div>
      </div>

      {/* Monthly Summary & Shift Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-3">
        {SHIFT_TEMPLATES.map((tpl) => (
          <div
            key={tpl.id}
            className={`rounded-xl border p-3 flex flex-col justify-between ${tpl.colorClass} transition`}
          >
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${tpl.badgeClass}`}>
                {tpl.code}
              </span>
              <span className="text-[11px] font-semibold opacity-80">{tpl.timing}</span>
            </div>
            <div className="text-xs font-bold mt-2 truncate">{tpl.name}</div>
          </div>
        ))}
        {/* Unassigned Legend Badge */}
        <div className={`rounded-xl border p-3 flex flex-col justify-between ${UNASSIGNED_TEMPLATE.colorClass} transition`}>
          <div className="flex items-center justify-between">
            <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${UNASSIGNED_TEMPLATE.badgeClass}`}>
              {UNASSIGNED_TEMPLATE.code}
            </span>
            <span className="text-[11px] font-semibold opacity-80">{UNASSIGNED_TEMPLATE.timing}</span>
          </div>
          <div className="text-xs font-bold mt-2 truncate">{UNASSIGNED_TEMPLATE.name}</div>
        </div>
      </div>

      {/* Filter & Toolbar with Department Dropdown */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-500 uppercase">Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-800 shadow-2xs cursor-pointer"
          >
            <option value="All">All Departments</option>
            <option value="Revenue">Revenue & Finance</option>
            <option value="Sanitation">Public Health & Sanitation</option>
            <option value="Security">Municipal Security Desk</option>
            <option value="Water Works">Water Works & Engineering</option>
            <option value="Administration">Administration</option>
          </select>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-start sm:justify-end">
          {isCurrentMonthLocked ? (
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center space-x-1.5 w-full sm:w-auto text-center justify-center">
              <span>🔒 Past Month - Read Only (Locked)</span>
            </span>
          ) : (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 w-full sm:w-auto text-center justify-center">
              {selectedMonth} Roster - Active & Editable
            </span>
          )}
          <span className="text-xs text-gray-500 font-medium hidden md:inline">
            {isCurrentMonthLocked
              ? 'Past months cannot be modified'
              : 'Click any day cell to assign or edit shift individually'}
          </span>
        </div>
      </div>

      {/* Monthly Roster Grid Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch]">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold uppercase text-gray-500">
                <th className="py-3.5 px-4 min-w-[230px] sticky left-0 bg-gray-50 z-10 border-r border-gray-200">
                  Officer & Department
                </th>
                {monthDays.map((d) => {
                  const weekend = isWeekendDay(selectedMonth, d)
                  const char = getDayOfWeekChar(selectedMonth, d)
                  return (
                    <th
                      key={d}
                      className={`py-3 px-1.5 text-center min-w-[42px] border-r border-gray-100 ${
                        weekend ? 'bg-amber-50/70 text-amber-800' : ''
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
                  <tr key={`${selectedMonth}-${emp.employeeId}`} className="hover:bg-gray-50/60 transition group">
                    {/* Sticky Officer Info Column */}
                    <td className="py-3.5 px-4 sticky left-0 bg-white z-10 border-r border-gray-200 shadow-xs">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs border border-blue-100 shrink-0">
                          {emp.avatarInitials}
                        </div>
                        <div className="truncate max-w-[145px]">
                          <div className="font-bold text-gray-900 truncate">{emp.employeeName}</div>
                          <div className="text-[10px] text-gray-500 truncate">
                            {emp.employeeId} • {emp.department}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Daily Shift Cells (Defaults to null '-' if roster not made) */}
                    {monthDays.map((d) => {
                      const shiftCode = existingRow && existingRow.days[d] !== undefined ? existingRow.days[d] : ''
                      const shiftTpl = getShiftDetails(shiftCode)
                      const isEditing = editingCell?.empId === emp.employeeId && editingCell?.day === d
                      const weekend = isWeekendDay(selectedMonth, d)

                      return (
                        <td
                          key={d}
                          className={`py-2 px-1 text-center relative border-r border-gray-100 ${
                            weekend ? 'bg-amber-50/30' : ''
                          }`}
                        >
                          {isEditing && !isCurrentMonthLocked ? (
                            <div className="absolute inset-0 z-20 bg-white border-2 border-blue-600 rounded-lg p-1 shadow-xl flex items-center justify-center">
                              <select
                                autoFocus
                                value={shiftCode}
                                onChange={(e) => handleCellChange(emp.employeeId, d, e.target.value)}
                                onBlur={() => setEditingCell(null)}
                                className="text-[10px] font-extrabold bg-blue-50 text-blue-800 rounded px-1 py-0.5 border border-blue-300 outline-none cursor-pointer"
                              >
                                <option value="">- (Null / Unassigned)</option>
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
                              className={`w-full py-1 px-1 rounded-lg border text-[10px] font-extrabold transition ${
                                isCurrentMonthLocked
                                  ? 'cursor-not-allowed opacity-80'
                                  : 'hover:scale-110 shadow-2xs cursor-pointer'
                              } ${shiftTpl.colorClass}`}
                              title={
                                isCurrentMonthLocked
                                  ? `Past Month Locked (${selectedMonth})`
                                  : `Day ${d}: ${shiftTpl.name} (Click to assign/edit)`
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



