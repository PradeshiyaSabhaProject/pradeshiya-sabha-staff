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
    <div className="space-y-6 text-left pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Attendance Regularization & Manual Corrections
          </h1>
          <p className="text-sm text-gray-500">
            Handle missed biometric scans, official municipal field duties outside office, and hardware offline corrections.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-sm font-semibold shadow-md transition"
        >
          <span>+ Submit Regularization Request</span>
        </button>
      </div>

      {/* Info Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-amber-900 text-xs">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-amber-600 shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          <strong>Why is Regularization required?</strong> Without an approved correction, an employee who attended an official road survey or forgot to scan their finger on exit would automatically lose half-day or full-day attendance. Approved regularizations sync immediately to the employee timecard.
        </div>
      </div>

      {/* List of Requests */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    item.reasonType === 'Official Field Duty'
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {item.reasonType}
                </span>
                <span className="text-xs font-semibold text-gray-400">ID: {item.id}</span>
                <span className="text-xs font-bold text-gray-700">Date: {item.date}</span>
              </div>

              <h3 className="text-base font-bold text-gray-900">
                {item.employeeName} <span className="text-xs font-normal text-gray-500">({item.department})</span>
              </h3>

              <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <strong>Justification / Field Memo:</strong> "{item.justification}"
              </p>

              <div className="flex items-center space-x-4 text-xs font-semibold text-gray-600 pt-1">
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
            <div className="flex flex-col items-end justify-between space-y-3 shrink-0">
              <div>
                {item.supervisorStatus === 'Approved' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Approved & Synced to Timecard âœ…
                  </span>
                )}
                {item.supervisorStatus === 'Pending' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Pending Supervisor Action â³
                  </span>
                )}
                {item.supervisorStatus === 'Rejected' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    Rejected âŒ
                  </span>
                )}
              </div>

              {item.supervisorStatus === 'Pending' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleReject(item.id)}
                    className="px-3.5 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                  >
                    Approve & Sync
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

