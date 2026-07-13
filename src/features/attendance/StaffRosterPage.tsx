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
    timing: '08:30 AM â€“ 04:30 PM',
    colorClass: 'border-blue-200 bg-blue-50/70 text-blue-800',
    badgeClass: 'bg-blue-600 text-white'
  },
  {
    id: 's-morn',
    code: 'MRN',
    name: 'Early Morning Sanitation',
    timing: '06:00 AM â€“ 02:00 PM',
    colorClass: 'border-emerald-200 bg-emerald-50/70 text-emerald-800',
    badgeClass: 'bg-emerald-600 text-white'
  },
  {
    id: 's-eve',
    code: 'EVE',
    name: 'Evening Patrol / Works',
    timing: '02:00 PM â€“ 10:00 PM',
    colorClass: 'border-amber-200 bg-amber-50/70 text-amber-800',
    badgeClass: 'bg-amber-600 text-white'
  },
  {
    id: 's-ngt',
    code: 'NGT',
    name: 'Night Security / Desk',
    timing: '10:00 PM â€“ 06:00 AM',
    colorClass: 'border-purple-200 bg-purple-50/70 text-purple-800',
    badgeClass: 'bg-purple-600 text-white'
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

interface MonthlyRosterRow {
  employeeId: string
  employeeName: string
  department: string
  avatarInitials: string
  days: Record<number, string> // day (1 to 31) -> shiftCode
}

// Generate default 31-day shifts for initial rows
const generatePattern = (patternType: 'office' | 'morning' | 'night' | 'water') => {
  const days: Record<number, string> = {}
  for (let d = 1; d <= 31; d++) {
    // Let's assume July 2026: July 1 is Wed. Weekend dates: July 4,5, 11,12, 18,19, 25,26
    const isWeekend = (d % 7 === 4 || d % 7 === 5)
    if (patternType === 'office') {
      days[d] = isWeekend ? 'OFF' : 'GEN'
    } else if (patternType === 'morning') {
      days[d] = (d % 7 === 5) ? 'OFF' : 'MRN'
    } else if (patternType === 'night') {
      const cycle = d % 6
      days[d] = cycle < 4 ? 'NGT' : 'OFF'
    } else {
      const cycle = d % 4
      days[d] = cycle === 0 ? 'OFF' : cycle === 1 ? 'MRN' : cycle === 2 ? 'EVE' : 'GEN'
    }
  }
  return days
}

const INITIAL_MONTHLY_ROSTER: MonthlyRosterRow[] = [
  {
    employeeId: 'PS-EMP-0012',
    employeeName: 'Kasun Perera',
    department: 'Revenue & Finance',
    avatarInitials: 'KP',
    days: generatePattern('office')
  },
  {
    employeeId: 'PS-EMP-0041',
    employeeName: 'Chaminda Rathnayake',
    department: 'Public Health & Sanitation',
    avatarInitials: 'CR',
    days: generatePattern('morning')
  },
  {
    employeeId: 'PS-EMP-0063',
    employeeName: 'Sunil Ariyaratne',
    department: 'Municipal Security Desk',
    avatarInitials: 'SA',
    days: generatePattern('night')
  },
  {
    employeeId: 'PS-EMP-0078',
    employeeName: 'W. D. Jayasinghe',
    department: 'Water Works & Engineering',
    avatarInitials: 'WJ',
    days: generatePattern('water')
  }
]

export const StaffRosterPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('July 2026')
  const [rosterData, setRosterData] = useState<MonthlyRosterRow[]>(INITIAL_MONTHLY_ROSTER)
  const [selectedDept, setSelectedDept] = useState('All')
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)

  // Quick cell editor state
  const [editingCell, setEditingCell] = useState<{
    empId: string
    day: number
  } | null>(null)

  // Modal form state
  const [genEmpName, setGenEmpName] = useState('Nimali Fernando')
  const [genEmpId, setGenEmpId] = useState('PS-EMP-0019')
  const [genDept, setGenDept] = useState('Administration')
  const [genPattern, setGenPattern] = useState<'office' | 'morning' | 'night' | 'water'>('office')

  const handleCellChange = (empId: string, dayNum: number, newCode: string) => {
    setRosterData(
      rosterData.map((row) => {
        if (row.employeeId !== empId) return row
        return {
          ...row,
          days: {
            ...row.days,
            [dayNum]: newCode
          }
        }
      })
    )
    setEditingCell(null)
  }

  const handleGenerateMonthlyRoster = (e: React.FormEvent) => {
    e.preventDefault()
    const newRow: MonthlyRosterRow = {
      employeeId: genEmpId,
      employeeName: genEmpName,
      department: genDept,
      avatarInitials: genEmpName
        .split(' ')
        .map((n) => n[0])
        .join(''),
      days: generatePattern(genPattern)
    }
    setRosterData([...rosterData, newRow])
    setIsGenerateModalOpen(false)
  }

  const filteredRoster = rosterData.filter((row) => {
    if (selectedDept === 'All') return true
    return row.department.includes(selectedDept)
  })

  // Days 1 to 31 array
  const monthDays = Array.from({ length: 31 }, (_, i) => i + 1)

  const getShiftDetails = (code: string): ShiftTemplate => {
    return SHIFT_TEMPLATES.find((t) => t.code === code) || SHIFT_TEMPLATES[0]
  }

  return (
    <div className="space-y-6 text-left pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Monthly Duty Rosters & Scheduling</h1>
          <p className="text-sm text-gray-500">
            Plan, publish, and manage 31-day monthly duty rosters for office, field, and emergency staff.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-bold text-gray-800 shadow-xs"
          >
            <option value="July 2026">July 2026 (31 Days)</option>
            <option value="August 2026">August 2026 (31 Days)</option>
            <option value="June 2026">June 2026 (30 Days)</option>
          </select>

          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md transition flex items-center space-x-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Generate Monthly Roster</span>
          </button>
        </div>
      </div>

      {/* Monthly Summary & Shift Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
      </div>

      {/* Filter & Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-gray-500 uppercase">Department:</span>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {['All', 'Revenue', 'Sanitation', 'Security', 'Water Works'].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDept(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedDept === d
                    ? 'bg-white text-gray-900 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {d === 'All' ? 'All Departments' : d}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            {selectedMonth} Roster â€¢ Published âœ…
          </span>
          <span className="text-xs text-gray-500 font-medium hidden md:inline">
            Click any cell to edit shift
          </span>
        </div>
      </div>

      {/* 31-Day Monthly Roster Grid Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold uppercase text-gray-500">
                <th className="py-3.5 px-4 min-w-[210px] sticky left-0 bg-gray-50 z-10 border-r border-gray-200">
                  Officer & Department
                </th>
                {monthDays.map((d) => {
                  const isWeekend = (d % 7 === 4 || d % 7 === 5)
                  return (
                    <th
                      key={d}
                      className={`py-3 px-1.5 text-center min-w-[42px] border-r border-gray-100 ${
                        isWeekend ? 'bg-amber-50/70 text-amber-800' : ''
                      }`}
                    >
                      <div>{d}</div>
                      <div className="text-[9px] font-normal opacity-70">
                        {['W', 'T', 'F', 'S', 'S', 'M', 'T'][(d - 1) % 7]}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs">
              {filteredRoster.map((row) => (
                <tr key={row.employeeId} className="hover:bg-gray-50/60 transition">
                  {/* Sticky Officer Info Column */}
                  <td className="py-3.5 px-4 sticky left-0 bg-white z-10 border-r border-gray-200 shadow-xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs border border-blue-100 shrink-0">
                        {row.avatarInitials}
                      </div>
                      <div className="truncate max-w-[145px]">
                        <div className="font-bold text-gray-900 truncate">{row.employeeName}</div>
                        <div className="text-[10px] text-gray-500 truncate">
                          {row.employeeId} â€¢ {row.department}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 31 Daily Shift Cells */}
                  {monthDays.map((d) => {
                    const shiftCode = row.days[d] || 'OFF'
                    const shiftTpl = getShiftDetails(shiftCode)
                    const isEditing = editingCell?.empId === row.employeeId && editingCell?.day === d
                    const isWeekend = (d % 7 === 4 || d % 7 === 5)

                    return (
                      <td
                        key={d}
                        className={`py-2 px-1 text-center relative border-r border-gray-100 ${
                          isWeekend ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        {isEditing ? (
                          <div className="absolute inset-0 z-20 bg-white border-2 border-blue-600 rounded-lg p-1 shadow-xl flex items-center justify-center">
                            <select
                              autoFocus
                              value={shiftCode}
                              onChange={(e) => handleCellChange(row.employeeId, d, e.target.value)}
                              onBlur={() => setEditingCell(null)}
                              className="text-[10px] font-extrabold bg-blue-50 text-blue-800 rounded px-1 py-0.5 border border-blue-300 outline-none"
                            >
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
                            onClick={() => setEditingCell({ empId: row.employeeId, day: d })}
                            className={`w-full py-1 px-1 rounded-lg border text-[10px] font-extrabold transition hover:scale-110 shadow-2xs ${shiftTpl.colorClass}`}
                            title={`Day ${d} (${selectedMonth}): ${shiftTpl.name}`}
                          >
                            {shiftTpl.code}
                          </button>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Monthly Roster Schedule Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xl max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Monthly Roster Generator
                </span>
                <h2 className="text-lg font-bold text-gray-900 mt-0.5">
                  Generate 31-Day Roster â€¢ {selectedMonth}
                </h2>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition font-bold"
              >
                âœ•
              </button>
            </div>

            <form onSubmit={handleGenerateMonthlyRoster} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                  Employee Name
                </label>
                <input
                  type="text"
                  required
                  value={genEmpName}
                  onChange={(e) => setGenEmpName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    required
                    value={genEmpId}
                    onChange={(e) => setGenEmpId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                    Department
                  </label>
                  <select
                    value={genDept}
                    onChange={(e) => setGenDept(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-bold text-gray-800"
                  >
                    <option value="Administration">Administration</option>
                    <option value="Revenue & Finance">Revenue & Finance</option>
                    <option value="Public Health & Sanitation">Public Health & Sanitation</option>
                    <option value="Water Works & Engineering">Water Works & Engineering</option>
                    <option value="Municipal Security Desk">Municipal Security Desk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                  Monthly Rotation Pattern
                </label>
                <select
                  value={genPattern}
                  onChange={(e) => setGenPattern(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-bold text-gray-800"
                >
                  <option value="office">Standard Office Pattern (Mon-Fri GEN, Weekends OFF)</option>
                  <option value="morning">Sanitation Morning Rotation (MRN Shift + Rotating OFF)</option>
                  <option value="night">24/7 Security Rotation (4 Days NGT + 2 Days OFF)</option>
                  <option value="water">Mixed Utility Rotation (MRN / EVE / GEN / OFF)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md transition"
                >
                  Generate 31-Day Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

