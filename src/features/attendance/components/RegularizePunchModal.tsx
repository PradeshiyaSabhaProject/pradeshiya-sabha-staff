import React, { useState } from 'react'

interface RegularizePunchModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    employeeName: string
    date: string
    reasonType: string
    requestedCheckIn: string
    requestedCheckOut: string
    justification: string
  }) => void
}

export const RegularizePunchModal: React.FC<RegularizePunchModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [employeeName] = useState('Kasun Perera (PS-EMP-0012)')
  const [date, setDate] = useState('2026-07-10')
  const [reasonType, setReasonType] = useState('Forgot to Punch Out')
  const [requestedCheckIn, setRequestedCheckIn] = useState('08:30')
  const [requestedCheckOut, setRequestedCheckOut] = useState('16:30')
  const [justification, setJustification] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      employeeName,
      date,
      reasonType,
      requestedCheckIn,
      requestedCheckOut,
      justification
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path d="M12 2v10l4.5 4.5" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold">Attendance Regularization</h3>
              <p className="text-xs text-amber-100">Correct missed biometric punch or official duty</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
          <div>
            <label htmlFor="emp-name" className="block text-xs font-semibold uppercase text-gray-600 mb-1">Employee</label>
            <input
              type="text"
              id="emp-name"
              readOnly
              value={employeeName}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-100 text-sm font-medium text-gray-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="corr-date" className="block text-xs font-semibold uppercase text-gray-600 mb-1">Correction Date</label>
              <input
                type="date"
                id="corr-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label htmlFor="reason-type" className="block text-xs font-semibold uppercase text-gray-600 mb-1">Reason Type</label>
              <select
                id="reason-type"
                value={reasonType}
                onChange={(e) => setReasonType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Forgot to Punch Out">Forgot to Punch Out</option>
                <option value="Forgot to Punch In">Forgot to Punch In</option>
                <option value="Official Field Duty">Official Field Duty Outside</option>
                <option value="Biometric Machine Fault">Biometric Machine Fault / Offline</option>
                <option value="Weekend Duty Regularization">Weekend Duty Regularization (Sat/Sun Work)</option>
                <option value="Overtime Authorization">Overtime Authorization (&gt;04:30 PM)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="actual-in" className="block text-xs font-semibold uppercase text-gray-600 mb-1">Actual In Time</label>
              <input
                type="time"
                id="actual-in"
                value={requestedCheckIn}
                onChange={(e) => setRequestedCheckIn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label htmlFor="actual-out" className="block text-xs font-semibold uppercase text-gray-600 mb-1">Actual Out Time</label>
              <input
                type="time"
                id="actual-out"
                value={requestedCheckOut}
                onChange={(e) => setRequestedCheckOut(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="justification" className="block text-xs font-semibold uppercase text-gray-600 mb-1">Justification / Memo Reference</label>
            <textarea
              id="justification"
              rows={3}
              required
              placeholder="State official duty purpose or explanation for missed scan..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0 text-amber-600 mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <strong>Audit Notice:</strong> Regularized punches are tagged with an audit badge on the employee timecard after supervisor approval.
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-sm font-semibold shadow-md transition"
            >
              Request Regularization
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

