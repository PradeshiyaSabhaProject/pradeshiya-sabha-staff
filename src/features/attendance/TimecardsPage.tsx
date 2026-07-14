import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const TimecardsPage: React.FC = () => {
  const navigate = useNavigate()
  const [selectedEmp, setSelectedEmp] = useState('PS-EMP-0012')
  const [selectedMonth, setSelectedMonth] = useState('2026-07')

  const timecardEntries = [
    {
      date: '2026-07-10 (Fri)',
      shift: '08:30 AM - 04:30 PM',
      checkIn: '08:22 AM',
      checkOut: '04:35 PM',
      workedHours: '8h 13m',
      otHours: '0h 05m',
      status: 'Present - Full Day',
      device: 'ZKTeco F18 #1'
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
      checkOut: '04:45 PM',
      workedHours: '8h 27m',
      otHours: '0h 15m',
      status: 'Present - Full Day',
      device: 'ZKTeco F18 #1'
    },
    {
      date: '2026-07-05 (Sun)',
      shift: 'Weekend Off',
      checkIn: '--:--',
      checkOut: '--:--',
      workedHours: '--',
      otHours: '--',
      status: 'Weekend',
      device: 'N/A'
    },
    {
      date: '2026-07-04 (Sat)',
      shift: 'Weekend Off',
      checkIn: '--:--',
      checkOut: '--:--',
      workedHours: '--',
      otHours: '--',
      status: 'Weekend',
      device: 'N/A'
    }
  ]

  return (
    <div className="space-y-6 text-left pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Employee Monthly Timecards</h1>
          <p className="text-sm text-gray-500">
            Audit daily biometric scan pairs, shift punctuality, half-day calculations, and regularization events.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedEmp}
            onChange={(e) => setSelectedEmp(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-800 shadow-2xs"
          >
            <option value="PS-EMP-0012">Kasun Perera - Senior Revenue Inspector</option>
            <option value="PS-EMP-0019">Nimali Fernando - Subject Clerk</option>
            <option value="PS-EMP-0034">Eng. Samantha Bandara - Technical Officer</option>
            <option value="PS-EMP-0041">Chaminda Rathnayake - Public Health Inspector</option>
          </select>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-800"
          />

        </div>
      </div>

      {/* Employee KPI Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl font-bold border border-blue-100">
              KP
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-gray-900">Kasun Perera</h2>
                <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                  Active Officer
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                PS-EMP-0012 • Revenue & Finance Department • Shift: Council Standard (08:30 AM - 04:30 PM)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6 text-center md:text-right">
            <div>
              <div className="text-xs text-gray-500 uppercase font-semibold">Working Days</div>
              <div className="text-xl font-extrabold text-gray-900 mt-0.5">22</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase font-semibold">Present</div>
              <div className="text-xl font-extrabold text-emerald-600 mt-0.5">19</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase font-semibold">Late Entries</div>
              <div className="text-xl font-extrabold text-amber-600 mt-0.5">1</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase font-semibold">Approved Leave</div>
              <div className="text-xl font-extrabold text-blue-600 mt-0.5">2 Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Timecard Log Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">July 2026 Daily Punch Log</h3>
            <p className="text-xs text-gray-500">Biometric scanner paired timecards and shift audits</p>
          </div>
          <button className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition">
            Export Timecard PDF
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-4">Shift Schedule</th>
                <th className="py-3.5 px-4">First In (Biometric)</th>
                <th className="py-3.5 px-4">Last Out</th>
                <th className="py-3.5 px-4">Worked Hours</th>
                <th className="py-3.5 px-4">Status & Classification</th>
                <th className="py-3.5 px-4">Source Device</th>
                <th className="py-3.5 px-5 text-right">Correction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {timecardEntries.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/60 transition">
                  <td className="py-4 px-5 font-bold text-gray-900">{row.date}</td>
                  <td className="py-4 px-4 text-xs text-gray-600">{row.shift}</td>
                  <td className="py-4 px-4 font-bold text-gray-900">{row.checkIn}</td>
                  <td className="py-4 px-4 font-bold text-gray-900">{row.checkOut}</td>
                  <td className="py-4 px-4 font-semibold text-gray-800">{row.workedHours}</td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs text-gray-500">{row.device}</td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => navigate('/attendance/request-regularization')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800"
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

