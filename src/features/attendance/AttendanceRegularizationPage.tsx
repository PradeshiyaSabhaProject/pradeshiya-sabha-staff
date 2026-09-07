import React, { useState } from 'react'
import { MOCK_REGULARIZATIONS, type RegularizationRequest } from './data/mockAttendanceData'
import { RegularizePunchModal } from './components/RegularizePunchModal'

export const AttendanceRegularizationPage: React.FC = () => {
  const [items, setItems] = useState<RegularizationRequest[]>(MOCK_REGULARIZATIONS)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleApprove = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, supervisorStatus: 'Approved' } : item))
    )
  }

  const handleReject = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, supervisorStatus: 'Rejected' } : item))
    )
  }

  return (
    <div className="space-y-6 text-left pb-8 animate-fade-in">
      {/* ── 1. Top Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Attendance Regularization &amp; Manual Corrections
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Handle missed biometric scans, official municipal field duties outside office, and hardware offline corrections.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer flex items-center gap-1.5 self-start md:self-auto"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Submit Regularization Request</span>
        </button>
      </div>

      {/* ── 2. Info Notice (Overview Style) ───────────────────────────── */}
      <div className="bg-amber-50 border border-amber-200 rounded p-4 flex items-start space-x-3 text-amber-900 text-xs">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-amber-700 shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          <strong className="uppercase font-bold tracking-wider">Why is Regularization required?</strong> Without an approved correction, an employee who attended an official road survey or forgot to scan their finger on exit would automatically lose half-day or full-day attendance. Approved regularizations sync immediately to the employee timecard.
        </div>
      </div>

      {/* ── 3. List of Requests (Overview Card System) ────────────────── */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2.5">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${
                    item.reasonType === 'Official Field Duty'
                      ? 'bg-purple-100 text-purple-800 border-purple-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {item.reasonType}
                </span>
                <span className="text-xs font-mono font-bold text-gray-500">{item.id}</span>
                <span className="text-xs font-bold text-gray-700">Date: {item.date}</span>
              </div>

              <h3 className="text-sm font-bold text-gray-900 uppercase">
                {item.employeeName} <span className="text-xs font-normal text-gray-500 lowercase font-mono">({item.department})</span>
              </h3>

              <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded border border-gray-200">
                <strong className="text-gray-900">Justification / Memo:</strong> "{item.justification}"
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-0.5">
                <div>
                  Requested In: <span className="text-gray-900 font-bold">{item.requestedCheckIn}</span>
                </div>
                <div>
                  Requested Out: <span className="text-gray-900 font-bold">{item.requestedCheckOut}</span>
                </div>
                <div>
                  Supervisor: <span className="text-gray-900 font-bold">{item.supervisorName}</span>
                </div>
              </div>
            </div>

            {/* Status & Actions */}
            <div className="flex flex-col items-start md:items-end justify-between gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-200">
              <div>
                {item.supervisorStatus === 'Approved' && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded uppercase tracking-wide border bg-emerald-100 text-emerald-800 border-emerald-300">
                    Approved &amp; Synced
                  </span>
                )}
                {item.supervisorStatus === 'Pending' && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded uppercase tracking-wide border bg-amber-100 text-amber-800 border-amber-300">
                    Pending Action
                  </span>
                )}
                {item.supervisorStatus === 'Rejected' && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded uppercase tracking-wide border bg-red-100 text-red-700 border-red-300">
                    Rejected
                  </span>
                )}
              </div>

              {item.supervisorStatus === 'Pending' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleReject(item.id)}
                    className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all text-xs font-semibold px-3 py-1 rounded bg-white shadow-xs cursor-pointer uppercase tracking-wider"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(item.id)}
                    className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-3.5 py-1 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer"
                  >
                    Approve &amp; Sync
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <RegularizePunchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={() => {}}
      />
    </div>
  )
}

export default AttendanceRegularizationPage
